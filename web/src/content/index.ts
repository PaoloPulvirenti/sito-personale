import { it } from './it';
import type { Locale, SiteContent } from './types';

/**
 * Punto unico di accesso ai testi. Per aggiungere l'inglese: creare `en.ts`,
 * aggiungere 'en' a `Locale` e ai `locales` in astro.config.mjs.
 */
const contents: Record<Locale, SiteContent> = { it };

export const defaultLocale: Locale = 'it';

export function getContent(locale: Locale = defaultLocale): SiteContent {
  return contents[locale];
}

export type { SiteContent } from './types';
