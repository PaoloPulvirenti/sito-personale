/**
 * Configurazione letta dalle variabili d'ambiente.
 * Nessun segreto nel codice: su Cloud Run le credenziali di Firestore arrivano
 * dal service account del servizio (Application Default Credentials).
 */
import type { SmtpSettings } from './notifiers/email-notifier.js';

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
  /** Giorni dopo cui Firestore cancella il messaggio (policy TTL sul campo expireAt). */
  retentionDays: number;
  /** Avviso email a ogni messaggio; assente finché manca la password SMTP. */
  smtp: SmtpSettings | undefined;
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

/**
 * SMTP attivo solo se ci sono destinatario e password. La password su Cloud Run
 * arriva da Secret Manager (--set-secrets), mai da un file del repo.
 */
function readSmtp(env: NodeJS.ProcessEnv): SmtpSettings | undefined {
  const password = env.SMTP_PASSWORD?.trim();
  const to = env.NOTIFY_EMAIL_TO?.trim();
  if (!password || !to) return undefined;
  return {
    host: env.SMTP_HOST ?? 'smtp.gmail.com',
    port: readInt(env, 'SMTP_PORT', 465),
    user: env.SMTP_USER?.trim() || to,
    password,
    to,
  };
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
    privacyVersion: env.PRIVACY_VERSION ?? '2026-10-01',
    retentionDays: readInt(env, 'RETENTION_DAYS', 365),
    smtp: readSmtp(env),
  };
}
