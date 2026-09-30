import { FieldValue, type Firestore } from '@google-cloud/firestore';
import type { ContactMessage, MessageRepository } from './message-repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Salva i messaggi in una collection Firestore.
 * `expireAt` serve alla policy TTL di Firestore: passato quel momento il documento
 * viene cancellato in automatico, come dichiarato nell'informativa privacy.
 * Con FIRESTORE_EMULATOR_HOST impostata, il client parla con l'emulatore locale.
 */
export class FirestoreMessageRepository implements MessageRepository {
  constructor(
    private readonly db: Firestore,
    private readonly collection: string,
    private readonly retentionDays: number,
  ) {}

  async save(message: ContactMessage): Promise<string> {
    const ref = await this.db.collection(this.collection).add({
      ...message,
      createdAt: FieldValue.serverTimestamp(),
      expireAt: new Date(message.consentAt.getTime() + this.retentionDays * DAY_MS),
    });
    return ref.id;
  }
}
