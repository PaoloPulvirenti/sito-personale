// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const apiTarget = process.env.API_URL ?? 'http://localhost:8080';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://paolo.presidium-app.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // Predisposizione per l'inglese: basterà aggiungere 'en' e i testi in src/content/en.ts.
  i18n: {
    defaultLocale: 'it',
    locales: ['it'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
    // Script sempre in file esterni: la CSP (firebase.json) consente solo script-src 'self'.
    build: { assetsInlineLimit: 0 },
    // In sviluppo /api va all'API Fastify locale, come fa Firebase Hosting in produzione.
    server: { proxy: { '/api': { target: apiTarget, changeOrigin: true } } },
  },
});
