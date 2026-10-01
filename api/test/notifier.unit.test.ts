import nodemailer from 'nodemailer';
import { describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config.js';
import { buildNotification, EmailNotifier } from '../src/notifiers/email-notifier.js';
import type { ContactMessage } from '../src/repositories/message-repository.js';

const message: ContactMessage = {
  name: 'Mario Rossi',
  email: 'mario.rossi@example.com',
  message: 'Ciao Paolo,\nvorrei parlarti di una posizione.',
  consentAt: new Date('2026-10-01T09:00:00Z'),
  privacyVersion: 'v1',
};

const settings = {
  host: 'smtp.example.com',
  port: 465,
  user: 'sito@example.com',
  password: 'non-usata-nei-test',
  to: 'paolo@example.com',
};

describe('buildNotification', () => {
  it('mette mittente, data, testo e id del messaggio', () => {
    const { subject, text } = buildNotification(message, 'abc123');

    expect(subject).toBe('Nuovo messaggio dal sito: Mario Rossi');
    expect(text).toContain('Da: Mario Rossi <mario.rossi@example.com>');
    expect(text).toContain('2026-10-01T09:00:00.000Z');
    expect(text).toContain('Ciao Paolo,\nvorrei parlarti di una posizione.');
    expect(text).toContain('abc123');
  });
});

describe('EmailNotifier', () => {
  it('invia a Paolo con Reply-To di chi ha scritto', async () => {
    // jsonTransport non spedisce nulla: serve solo a non aprire connessioni.
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    const sendMail = vi.spyOn(transporter, 'sendMail');

    await new EmailNotifier(settings, transporter).notify(message, 'abc123');

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'paolo@example.com',
      from: { address: 'sito@example.com' },
      replyTo: { name: 'Mario Rossi', address: 'mario.rossi@example.com' },
      subject: 'Nuovo messaggio dal sito: Mario Rossi',
    });
  });
});

describe('configurazione SMTP', () => {
  it('è spenta senza password o senza destinatario', () => {
    expect(loadConfig({}).smtp).toBeUndefined();
    expect(loadConfig({ NOTIFY_EMAIL_TO: 'paolo@example.com' }).smtp).toBeUndefined();
    expect(loadConfig({ SMTP_PASSWORD: 'x' }).smtp).toBeUndefined();
  });

  it('con password e destinatario usa Gmail e lo stesso indirizzo come mittente', () => {
    expect(loadConfig({ NOTIFY_EMAIL_TO: 'paolo@example.com', SMTP_PASSWORD: 'x' }).smtp).toEqual({
      host: 'smtp.gmail.com',
      port: 465,
      user: 'paolo@example.com',
      password: 'x',
      to: 'paolo@example.com',
    });
  });
});
