/** Messaggio del form contatti, già validato e normalizzato. */
export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** Momento in cui l'utente ha dato il consenso al trattamento dei dati. */
  consentAt: Date;
  /** Versione dell'informativa privacy accettata. */
  privacyVersion: string;
}

/**
 * Porta verso lo storage dei messaggi. Le route dipendono da questa interfaccia,
 * non da Firestore: nei test si usa l'implementazione in memoria.
 */
export interface MessageRepository {
  /** Salva il messaggio e restituisce l'id assegnato. */
  save(message: ContactMessage): Promise<string>;
}
