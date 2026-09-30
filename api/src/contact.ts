import type { ContactMessage } from './repositories/message-repository.js';
import {
  HONEYPOT_FIELD,
  MIN_MESSAGE_LENGTH,
  MIN_NAME_LENGTH,
  type ContactBody,
} from './schemas/contact.js';

/** True se il campo trappola è stato compilato: quasi certamente un bot. */
export function isSpam(body: ContactBody): boolean {
  return (body[HONEYPOT_FIELD] ?? '').trim() !== '';
}

/** Toglie i caratteri di controllo; nel messaggio tiene a capo e tab, nel nome collassa gli spazi. */
function clean(value: string, keepNewlines: boolean): string {
  if (keepNewlines) return value.replace(/[^\P{Cc}\n\t]/gu, '').trim();
  return value
    .replace(/\p{Cc}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Campi troppo corti dopo la pulizia ("   a   " supera lo schema ma non è un nome).
 * Vuoto se il messaggio è accettabile.
 */
export function tooShortFields(message: ContactMessage): string[] {
  const fields: string[] = [];
  if (message.name.length < MIN_NAME_LENGTH) fields.push('name');
  if (message.message.length < MIN_MESSAGE_LENGTH) fields.push('message');
  return fields;
}

/** Trasforma il body validato nel messaggio da salvare. Non conserva IP né user agent. */
export function toContactMessage(
  body: ContactBody,
  privacyVersion: string,
  now: Date = new Date(),
): ContactMessage {
  return {
    name: clean(body.name, false),
    email: body.email.trim().toLowerCase(),
    message: clean(body.message, true),
    consentAt: now,
    privacyVersion,
  };
}
