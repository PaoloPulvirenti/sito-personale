import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { isSpam, toContactMessage, tooShortFields } from '../contact.js';
import type { MessageRepository } from '../repositories/message-repository.js';
import { ContactAccepted, ContactBody, ErrorResponse } from '../schemas/contact.js';

export interface ContactRoutesOptions {
  repository: MessageRepository;
  privacyVersion: string;
  rateLimit: { max: number; timeWindowMs: number };
}

export const contactRoutes: FastifyPluginAsyncTypebox<ContactRoutesOptions> = async (
  app,
  { repository, privacyVersion, rateLimit },
) => {
  app.post(
    '/contact',
    {
      config: {
        rateLimit: { max: rateLimit.max, timeWindow: rateLimit.timeWindowMs },
      },
      schema: {
        body: ContactBody,
        response: { 201: ContactAccepted, 400: ErrorResponse },
      },
    },
    async (request, reply) => {
      if (isSpam(request.body)) {
        // Al bot rispondiamo come se fosse andato tutto bene: niente segnali su cosa l'ha fermato.
        request.log.info('messaggio scartato dal honeypot');
        return reply.code(201).send({ status: 'received' });
      }

      const message = toContactMessage(request.body, privacyVersion);
      const invalid = tooShortFields(message);
      if (invalid.length > 0) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Alcuni campi non sono validi.',
          fields: invalid,
        });
      }

      const id = await repository.save(message);
      request.log.info({ messageId: id }, 'messaggio di contatto salvato');
      return reply.code(201).send({ status: 'received' });
    },
  );
};
