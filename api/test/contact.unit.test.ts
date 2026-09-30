import { describe, expect, it } from 'vitest';
import { isSpam, toContactMessage, tooShortFields } from '../src/contact.js';
import { validBody } from './helpers.js';

describe('isSpam', () => {
  it('è falso se il campo trappola manca o è vuoto', () => {
    expect(isSpam({ ...validBody })).toBe(false);
    expect(isSpam({ ...validBody, website: '   ' })).toBe(false);
  });

  it('è vero se il campo trappola è compilato', () => {
    expect(isSpam({ ...validBody, website: 'https://spam.example' })).toBe(true);
  });
});

describe('toContactMessage', () => {
  const now = new Date('2026-09-30T10:00:00Z');

  it('normalizza email e spazi e registra il consenso', () => {
    const message = toContactMessage(
      { ...validBody, name: '  Mario \t  Rossi ', message: '  Riga uno\r\nRiga due  ' },
      '2026-09-30',
      now,
    );

    expect(message).toEqual({
      name: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      message: 'Riga uno\nRiga due',
      consentAt: now,
      privacyVersion: '2026-09-30',
    });
  });

  it('toglie i caratteri di controllo ma tiene gli a capo del messaggio', () => {
    const message = toContactMessage(
      { ...validBody, name: 'Mario\u0000Rossi', message: 'Prima riga\u0007\nSeconda riga' },
      'v1',
      now,
    );

    expect(message.name).toBe('Mario Rossi');
    expect(message.message).toBe('Prima riga\nSeconda riga');
  });

  it('non conserva il campo trappola', () => {
    const message = toContactMessage({ ...validBody, website: '' }, 'v1', now);
    expect(message).not.toHaveProperty('website');
  });
});

describe('tooShortFields', () => {
  it('segnala nome e messaggio troppo corti dopo la pulizia', () => {
    const message = toContactMessage(
      { ...validBody, name: '  a  ', message: '    ciao      ' },
      'v1',
    );
    expect(tooShortFields(message)).toEqual(['name', 'message']);
  });

  it('è vuoto per un messaggio valido', () => {
    expect(tooShortFields(toContactMessage({ ...validBody }, 'v1'))).toEqual([]);
  });
});
