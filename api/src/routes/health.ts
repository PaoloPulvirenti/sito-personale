import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';

/** Liveness per Cloud Run e per il monitoraggio: non tocca Firestore. */
export const healthRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    '/health',
    {
      logLevel: 'warn',
      schema: {
        response: {
          200: Type.Object({ status: Type.Literal('ok'), uptimeSeconds: Type.Number() }),
        },
      },
    },
    async () => ({ status: 'ok' as const, uptimeSeconds: Math.round(process.uptime()) }),
  );
};
