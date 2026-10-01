import { buildApp } from '../src/app.js';
import { loadConfig, type Config } from '../src/config.js';
import { InMemoryMessageRepository } from '../src/repositories/in-memory-message-repository.js';
import type { MessageRepository } from '../src/repositories/message-repository.js';
import type { Notifier } from '../src/notifiers/notifier.js';

export type App = Awaited<ReturnType<typeof buildApp>>;

export const validBody = {
  name: 'Mario Rossi',
  email: 'Mario.Rossi@Example.com',
  message: 'Ciao Paolo, vorrei parlarti di una posizione da Tech Lead.',
  privacy: true,
} as const;

const openApps: App[] = [];

/** App con config di default (nessuna variabile d'ambiente) più le modifiche del test. */
export async function makeApp(
  overrides: Partial<Config> = {},
  repository: MessageRepository = new InMemoryMessageRepository(),
  notifier?: Notifier,
) {
  const config = { ...loadConfig({}), ...overrides };
  const app = await buildApp({ config, repository, ...(notifier && { notifier }) });
  openApps.push(app);
  return { app, repository, config };
}

/** Da usare in afterEach: chiude tutte le app create da makeApp. */
export async function closeApps() {
  await Promise.all(openApps.splice(0).map((app) => app.close()));
}
