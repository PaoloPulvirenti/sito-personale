import { randomUUID } from 'node:crypto';
import type { ContactMessage, MessageRepository } from './message-repository.js';

/** Storage in memoria: per i test e per lo sviluppo locale senza emulatore. */
export class InMemoryMessageRepository implements MessageRepository {
  readonly messages = new Map<string, ContactMessage>();

  save(message: ContactMessage): Promise<string> {
    const id = randomUUID();
    this.messages.set(id, message);
    return Promise.resolve(id);
  }
}
