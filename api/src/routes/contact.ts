import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { isSpam, toContactMessage, tooShortFields } from '../contact.js';
import type { Notifier } from '../notifiers/notifier.js';
import type { MessageRepository } from '../repositories/message-repository.js';
import { ContactAccepted, ContactBody, ErrorResponse } from '../schemas/contact.js';

export interface ContactRoutesOptions {
  repository: MessageRepository;
  notifier: Notifier;
  privacyVersion: string;
  rateLimit: { max: number; timeWindowMs: number };
}

export const contactRoutes: FastifyPluginAsyncTypebox<ContactRoutesOptions> = async (
  app,
  { repository, notifier, privacyVersion, rateLimit },
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

      // L'avviso si attende prima di rispondere (su Cloud Run la CPU si ferma dopo la
      // risposta), ma un suo errore non fa fallire l'invio: il messaggio è già salvato.
      try {
        await notifier.notify(message, id);
      } catch (err) {
        request.log.error({ err, messageId: id }, 'avviso email non inviato');
      }

      return reply.code(201).send({ status: 'received' });
    },
  );
};
