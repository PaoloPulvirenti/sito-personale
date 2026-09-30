import { Firestore } from '@google-cloud/firestore';
import { afterAll, describe, expect, it } from 'vitest';
import { FirestoreMessageRepository } from '../src/repositories/firestore-message-repository.js';

/**
 * Gira solo con l'emulatore attivo (docker compose up firestore, oppure in CI):
 *   FIRESTORE_EMULATOR_HOST=localhost:8081 npm test
 */
const emulator = process.env.FIRESTORE_EMULATOR_HOST;

describe.skipIf(!emulator)('FirestoreMessageRepository (emulatore)', () => {
  const db = new Firestore({ projectId: 'demo-sito-personale' });
  const collection = `test-${Date.now()}`;

  afterAll(async () => {
    await db.recursiveDelete(db.collection(collection));
    await db.terminate();
  });

  it('salva il messaggio con la data di creazione del server', async () => {
    const repository = new FirestoreMessageRepository(db, collection);
    const consentAt = new Date('2026-09-30T10:00:00Z');

    const id = await repository.save({
      name: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      message: "Messaggio di prova salvato sull'emulatore.",
      consentAt,
      privacyVersion: 'test-v1',
    });

    const snapshot = await db.collection(collection).doc(id).get();
    expect(snapshot.exists).toBe(true);
    const data = snapshot.data();
    expect(data).toMatchObject({ name: 'Mario Rossi', privacyVersion: 'test-v1' });
    expect(data?.createdAt?.toDate()).toBeInstanceOf(Date);
    expect(data?.consentAt?.toDate().toISOString()).toBe(consentAt.toISOString());
  });
});
