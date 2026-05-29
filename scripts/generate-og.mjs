// One-shot OG image generator. Run: npm run gen:og
// Renders an SVG using brand colors + the headline 67% stat, then
// rasterizes it to public/og.png at 1200×630.

import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'public', 'og.png');

// Sans system stack chosen to render reliably under resvg-js without
// shipping font files. Falls back through commonly-available faces.
const SANS = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', Times, serif";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5F1EB"/>
      <stop offset="100%" stop-color="#EBE4D6"/>
    </linearGradient>
    <radialGradient id="violetGlow" cx="0.85" cy="0.15" r="0.55">
      <stop offset="0%" stop-color="#6346E6" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#6346E6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="coralGlow" cx="0.05" cy="0.95" r="0.6">
      <stop offset="0%" stop-color="#E8573D" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#E8573D" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#violetGlow)"/>
  <rect width="1200" height="630" fill="url(#coralGlow)"/>

  <!-- Header row: Wivme wordmark + Pilot pill -->
  <g transform="translate(80, 80)">
    <text x="0" y="0" font-family="${SERIF}" font-style="italic" font-size="42" fill="#1A1A1E">Wivme</text>
  </g>

  <g transform="translate(800, 56)">
    <rect x="0" y="0" width="320" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.6" stroke="#E8573D" stroke-opacity="0.45"/>
    <circle cx="22" cy="22" r="5" fill="#E8573D"/>
    <text x="40" y="29" font-family="${SANS}" font-size="14" font-weight="700" fill="#E8573D" letter-spacing="2">PILOT NOW OPEN  ·  GRADE 8</text>
  </g>

  <!-- Massive central headline -->
  <g transform="translate(80, 280)">
    <text x="0" y="0" font-family="${SERIF}" font-size="200" font-weight="400" fill="#1A1A1E" letter-spacing="-4">67%</text>
  </g>

  <!-- Headline label -->
  <g transform="translate(80, 350)">
    <text x="0" y="0" font-family="${SANS}" font-size="38" font-weight="500" fill="#1A1A1E" letter-spacing="-0.5">of new learning is gone</text>
    <text x="0" y="50" font-family="${SANS}" font-size="38" font-weight="500" fill="#1A1A1E" letter-spacing="-0.5">by tomorrow morning.</text>
  </g>

  <!-- Insight tagline -->
  <g transform="translate(80, 500)">
    <text x="0" y="0" font-family="${SANS}" font-size="22" font-weight="400" fill="#1A1A1E" fill-opacity="0.7">Schools measure what was taught.</text>
    <text x="0" y="32" font-family="${SANS}" font-size="22" font-weight="700" fill="#1A1A1E">Wivme measures what your child remembers.</text>
  </g>

  <!-- Footer pin -->
  <g transform="translate(80, 580)">
    <text x="0" y="0" font-family="${SANS}" font-size="14" font-weight="700" fill="#6b6b70" letter-spacing="2">WIVME.AI  ·  ICSE &amp; CBSE  ·  FREE FOR FOUNDING PARENTS</text>
  </g>

  <!-- Decorative dot grid bottom-right -->
  <g transform="translate(940, 360)">
    ${Array.from({ length: 6 })
      .map((_, row) =>
        Array.from({ length: 6 })
          .map((_, col) => {
            const cx = col * 32;
            const cy = row * 32;
            const fade = (1 - (row + col) / 12) * 0.55;
            return `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#6346E6" opacity="${fade.toFixed(2)}"/>`;
          })
          .join('')
      )
      .join('')}
  </g>
</svg>`;

const resvg = new Resvg(svg, {
  background: '#F5F1EB',
  fitTo: { mode: 'width', value: 1200 },
  font: {
    loadSystemFonts: true,
  },
});

const png = resvg.render().asPng();

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, png);

console.log(`OG image written: ${OUT_PATH} (${png.length} bytes)`);
