import type { FastifyServerOptions } from 'fastify';
import type { Config } from './config.js';

/**
 * Log JSON con il campo `severity` che Cloud Logging riconosce: così in console
 * GCP i livelli escono giusti senza agent o librerie in più.
 * In locale, con LOG_PRETTY=true, si usa pino-pretty.
 */
export function loggerOptions(config: Config): FastifyServerOptions['logger'] {
  if (config.logPretty) {
    return {
      level: config.logLevel,
      transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } },
    };
  }

  return {
    level: config.logLevel,
    messageKey: 'message',
    formatters: {
      level: (label) => ({ severity: label === 'fatal' ? 'CRITICAL' : label.toUpperCase() }),
    },
    // Il body del form non viene mai loggato; per sicurezza togliamo anche gli header sensibili.
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  };
}
