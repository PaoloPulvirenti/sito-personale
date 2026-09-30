import rateLimit from '@fastify/rate-limit';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyError, type FastifyServerOptions } from 'fastify';
import type { Config } from './config.js';
import type { MessageRepository } from './repositories/message-repository.js';
import { contactRoutes } from './routes/contact.js';
import { healthRoutes } from './routes/health.js';

export interface AppDependencies {
  config: Config;
  repository: MessageRepository;
  logger?: FastifyServerOptions['logger'];
}

/**
 * Costruisce l'app senza metterla in ascolto: i test la usano con `app.inject()`,
 * `server.ts` la avvia davvero.
 */
export async function buildApp({ config, repository, logger = false }: AppDependencies) {
  const hops = config.trustProxyHops;
  const app = Fastify({
    logger,
    // Dietro Firebase Hosting e il front end di Cloud Run l'IP del client sta in X-Forwarded-For.
    // Si fidano solo i primi `hops` salti: su Cloud Run il container è raggiungibile solo
    // attraverso il front end Google, quindi il conteggio dei salti non è falsificabile.
    trustProxy: hops > 0 ? (_address: string, hop: number) => hop < hops : false,
    bodyLimit: 16 * 1024,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Rate limit solo sulle route che lo chiedono (il form), non su /health.
  await app.register(rateLimit, { global: false });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      const fields = [
        ...new Set(
          error.validation.map((issue) => {
            const path = issue.instancePath.replace(/^\//, '');
            const missing = (issue.params as { missingProperty?: string }).missingProperty;
            return path || missing || 'body';
          }),
        ),
      ];
      return reply
        .code(400)
        .send({ error: 'Bad Request', message: 'Alcuni campi non sono validi.', fields });
    }

    const statusCode = error.statusCode ?? 500;
    if (statusCode === 429) {
      // Gli header Retry-After e x-ratelimit-* li ha già messi @fastify/rate-limit.
      return reply.code(429).send({
        error: 'Too Many Requests',
        message: 'Troppi messaggi in poco tempo. Riprova più tardi.',
      });
    }
    if (statusCode >= 500) {
      request.log.error({ err: error }, 'errore non gestito');
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Si è verificato un errore. Riprova più tardi.',
      });
    }

    return reply.code(statusCode).send({ error: error.name, message: error.message });
  });

  await app.register(healthRoutes);
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(contactRoutes, {
    prefix: '/api',
    repository,
    privacyVersion: config.privacyVersion,
    rateLimit: { max: config.rateLimitMax, timeWindowMs: config.rateLimitWindowMs },
  });

  return app;
}
