import { FieldValue, type Firestore } from '@google-cloud/firestore';
import type { ContactMessage, MessageRepository } from './message-repository.js';

/**
 * Salva i messaggi in una collection Firestore.
 * Con FIRESTORE_EMULATOR_HOST impostata, il client parla con l'emulatore locale.
 */
export class FirestoreMessageRepository implements MessageRepository {
  constructor(
    private readonly db: Firestore,
    private readonly collection: string,
  ) {}

  async save(message: ContactMessage): Promise<string> {
    const ref = await this.db.collection(this.collection).add({
      ...message,
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  }
}
