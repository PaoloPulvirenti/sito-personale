import type { ContactMessage } from '../repositories/message-repository.js';

/**
 * Avviso a Paolo quando arriva un messaggio. È "best effort": se l'avviso
 * fallisce il messaggio resta comunque salvato su Firestore.
 */
export interface Notifier {
  notify(message: ContactMessage, messageId: string): Promise<void>;
}

/** Nessun avviso: in sviluppo, nei test e finché la password SMTP non è configurata. */
export class NoopNotifier implements Notifier {
  notify(): Promise<void> {
    return Promise.resolve();
  }
}
