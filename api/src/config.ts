/**
 * Configurazione letta dalle variabili d'ambiente.
 * Nessun segreto nel codice: su Cloud Run le credenziali di Firestore arrivano
 * dal service account del servizio (Application Default Credentials).
 */
export type MessageStore = 'firestore' | 'memory';

export interface Config {
  host: string;
  port: number;
  logLevel: string;
  logPretty: boolean;
  messageStore: MessageStore;
  firestoreCollection: string;
  /** Numero di proxy fidati davanti all'API (Firebase Hosting + front end Google). */
  trustProxyHops: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  /** Versione dell'informativa privacy accettata dall'utente, salvata con il messaggio. */
  privacyVersion: string;
}

function readInt(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Variabile ${name} non valida: "${raw}" (serve un intero >= 0)`);
  }
  return value;
}

function readStore(env: NodeJS.ProcessEnv): MessageStore {
  const raw = env.MESSAGE_STORE ?? 'firestore';
  if (raw !== 'firestore' && raw !== 'memory') {
    throw new Error(`Variabile MESSAGE_STORE non valida: "${raw}" (firestore | memory)`);
  }
  return raw;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    host: env.HOST ?? '0.0.0.0',
    port: readInt(env, 'PORT', 8080),
    logLevel: env.LOG_LEVEL ?? 'info',
    logPretty: env.LOG_PRETTY === 'true',
    messageStore: readStore(env),
    firestoreCollection: env.FIRESTORE_COLLECTION ?? 'contactMessages',
    trustProxyHops: readInt(env, 'TRUST_PROXY_HOPS', 1),
    rateLimitMax: readInt(env, 'RATE_LIMIT_MAX', 5),
    rateLimitWindowMs: readInt(env, 'RATE_LIMIT_WINDOW_MS', 10 * 60 * 1000),
    privacyVersion: env.PRIVACY_VERSION ?? '2026-09-30',
  };
}
