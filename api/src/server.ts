import { Firestore } from '@google-cloud/firestore';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { loggerOptions } from './logger.js';
import { FirestoreMessageRepository } from './repositories/firestore-message-repository.js';
import { InMemoryMessageRepository } from './repositories/in-memory-message-repository.js';
import type { MessageRepository } from './repositories/message-repository.js';

const config = loadConfig();

const repository: MessageRepository =
  config.messageStore === 'memory'
    ? new InMemoryMessageRepository()
    : new FirestoreMessageRepository(
        new Firestore(),
        config.firestoreCollection,
        config.retentionDays,
      );

const app = await buildApp({ config, repository, logger: loggerOptions(config) });

// Cloud Run manda SIGTERM prima di spegnere l'istanza: chiudiamo le richieste in corso.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    app.log.info({ signal }, 'arresto in corso');
    app.close().then(
      () => process.exit(0),
      (err: unknown) => {
        app.log.error({ err }, "errore durante l'arresto");
        process.exit(1);
      },
    );
  });
}

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({ store: config.messageStore }, 'api pronta');
} catch (err) {
  app.log.fatal({ err }, 'avvio fallito');
  process.exit(1);
}
