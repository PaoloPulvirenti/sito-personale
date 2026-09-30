import type { ImageMetadata } from 'astro';

/**
 * Immagini opzionali in src/assets: se il file non c'è la build non fallisce,
 * il componente mostra un TODO. Astro le ottimizza (dimensioni, formato, lazy load).
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/** `file` relativo a src/assets, es. "foto.jpg" o "progetti/presidium-1.png". */
export function findImage(file: string): ImageMetadata | undefined {
  return images[`../assets/${file}`]?.default;
}
