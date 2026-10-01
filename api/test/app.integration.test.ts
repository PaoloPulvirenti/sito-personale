import { afterEach, describe, expect, it } from 'vitest';
import { InMemoryMessageRepository } from '../src/repositories/in-memory-message-repository.js';
import type { Notifier } from '../src/notifiers/notifier.js';
import type { ContactMessage, MessageRepository } from '../src/repositories/message-repository.js';
import { closeApps, makeApp, validBody, type App } from './helpers.js';

afterEach(closeApps);

function postContact(instance: App, payload: unknown, ip = '203.0.113.10') {
  return instance.inject({
    method: 'POST',
    url: '/api/contact',
    payload: payload as Record<string, unknown>,
    remoteAddress: ip,
  });
}

describe('GET /health', () => {
  it.each(['/health', '/api/health'])('%s risponde ok', async (url) => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'GET', url });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok' });
  });
});

describe('POST /api/contact', () => {
  it('salva un messaggio valido e risponde 201', async () => {
    const repository = new InMemoryMessageRepository();
    const { app } = await makeApp({ privacyVersion: 'test-v1' }, repository);

    const res = await postContact(app, validBody);

    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ status: 'received' });
    const saved = [...repository.messages.values()];
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      name: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      privacyVersion: 'test-v1',
    });
  });

  it.each([
    ['email non valida', { ...validBody, email: 'non-una-email' }, 'email'],
    ['consenso privacy mancante', { ...validBody, privacy: undefined }, 'privacy'],
    ['consenso privacy negato', { ...validBody, privacy: false }, 'privacy'],
    ['messaggio troppo corto', { ...validBody, message: 'ciao' }, 'message'],
    ['nome fatto solo di spazi', { ...validBody, name: '     ' }, 'name'],
    ['messaggio troppo lungo', { ...validBody, message: 'x'.repeat(5001) }, 'message'],
  ])('rifiuta con 400: %s', async (_case, payload, field) => {
    const repository = new InMemoryMessageRepository();
    const { app } = await makeApp({}, repository);

    const res = await postContact(app, payload);

    expect(res.statusCode).toBe(400);
    expect(res.json().fields).toContain(field);
    expect(repository.messages.size).toBe(0);
  });

  it('scarta i campi non previsti senza salvarli', async () => {
    const repository = new InMemoryMessageRepository();
    const { app } = await makeApp({}, repository);

    const res = await postContact(app, { ...validBody, admin: true });

    expect(res.statusCode).toBe(201);
    expect([...repository.messages.values()][0]).not.toHaveProperty('admin');
  });

  it('con il honeypot compilato risponde 201 ma non salva nulla', async () => {
    const repository = new InMemoryMessageRepository();
    const { app } = await makeApp({}, repository);

    const res = await postContact(app, { ...validBody, website: 'https://spam.example' });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ status: 'received' });
    expect(repository.messages.size).toBe(0);
  });

  it('limita i messaggi per IP e risponde 429 oltre la soglia', async () => {
    const { app } = await makeApp({ rateLimitMax: 2 });

    expect((await postContact(app, validBody)).statusCode).toBe(201);
    expect((await postContact(app, validBody)).statusCode).toBe(201);
    const blocked = await postContact(app, validBody);

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers['retry-after']).toBeDefined();
    // Un altro IP non è bloccato.
    expect((await postContact(app, validBody, '198.51.100.7')).statusCode).toBe(201);
  });

  it("usa l'IP del client da X-Forwarded-For dietro un proxy fidato", async () => {
    const { app } = await makeApp({ rateLimitMax: 1, trustProxyHops: 1 });
    const fromClient = (client: string) =>
      app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: validBody,
        remoteAddress: '10.0.0.1',
        headers: { 'x-forwarded-for': client },
      });

    expect((await fromClient('203.0.113.1')).statusCode).toBe(201);
    expect((await fromClient('203.0.113.2')).statusCode).toBe(201);
    expect((await fromClient('203.0.113.1')).statusCode).toBe(429);
  });

  it('senza proxy fidati ignora X-Forwarded-For (non si aggira il limite)', async () => {
    const { app } = await makeApp({ rateLimitMax: 1, trustProxyHops: 0 });
    const spoofed = (client: string) =>
      app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: validBody,
        remoteAddress: '203.0.113.50',
        headers: { 'x-forwarded-for': client },
      });

    expect((await spoofed('1.1.1.1')).statusCode).toBe(201);
    expect((await spoofed('2.2.2.2')).statusCode).toBe(429);
  });

  it('se lo storage fallisce risponde 500 senza dettagli interni', async () => {
    const failing: MessageRepository = {
      save: () => Promise.reject(new Error('firestore irraggiungibile: dettaglio interno')),
    };
    const { app } = await makeApp({}, failing);

    const res = await postContact(app, validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('firestore');
  });

  it('rifiuta un body oltre i 16 KB', async () => {
    const { app } = await makeApp();
    const res = await postContact(app, { ...validBody, message: 'x'.repeat(20 * 1024) });
    expect(res.statusCode).toBe(413);
  });
});

describe('avviso email', () => {
  function recordingNotifier() {
    const calls: { message: ContactMessage; id: string }[] = [];
    const notifier: Notifier = {
      notify: (message, id) => {
        calls.push({ message, id });
        return Promise.resolve();
      },
    };
    return { notifier, calls };
  }

  it('avvisa con il messaggio salvato e il suo id', async () => {
    const repository = new InMemoryMessageRepository();
    const { notifier, calls } = recordingNotifier();
    const { app } = await makeApp({}, repository, notifier);

    await postContact(app, validBody);

    const [savedId] = [...repository.messages.keys()];
    expect(calls).toHaveLength(1);
    expect(calls[0]?.id).toBe(savedId);
    expect(calls[0]?.message.email).toBe('mario.rossi@example.com');
  });

  it('non avvisa per i messaggi scartati dal honeypot', async () => {
    const { notifier, calls } = recordingNotifier();
    const { app } = await makeApp({}, undefined, notifier);

    await postContact(app, { ...validBody, website: 'https://spam.example' });

    expect(calls).toHaveLength(0);
  });

  it("se l'avviso fallisce il messaggio è comunque salvato e la risposta è 201", async () => {
    const repository = new InMemoryMessageRepository();
    const failing: Notifier = { notify: () => Promise.reject(new Error('SMTP giù')) };
    const { app } = await makeApp({}, repository, failing);

    const res = await postContact(app, validBody);

    expect(res.statusCode).toBe(201);
    expect(repository.messages.size).toBe(1);
  });
});
