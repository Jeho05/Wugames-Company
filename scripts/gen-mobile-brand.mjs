import sharp from "sharp";
import fs from "fs";

/**
 * WUGAMS — Marque mobile depuis le VRAI logo officiel.
 * Source de vérité : e5c654a0-a089-11f1-a57b-6de6f5e58fbd.svg (fond noir #090A0C)
 *
 * Règle logo :
 * - Launcher / favicon (16→512px) : le mot-symbole "WUGAMS HOLDING INC" devient
 *   illisible < 100px ET dépend des fontes Cormorant/Montserrat (fallback variable
 *   selon l'appareil). On utilise donc la déclinaison EMBLÈME SEUL (livre ouvert + W),
 *   tracésین exacts du vrai logo (mêmes path `d`, mêmes dégradés or, même glow).
 *   Aucune retouche créative : extraction stricte, fond officiel #090A0C.
 * - Splash grand format (1080×1920) : le texte reste lisible → on composite le
 *   FICHIER EXACT 1600×1600 tel quel, centré sur fond #090A0C.
 */

const BLACK_LOGO = "e5c654a0-a089-11f1-a57b-6de6f5e58fbd.svg";
const BG = "#090A0C";

if (!fs.existsSync(BLACK_LOGO)) {
  console.error(`Fichier vrai logo introuvable: ${BLACK_LOGO}`);
  process.exit(1);
}
const fullExact = fs.readFileSync(BLACK_LOGO, "utf8");

// --- Emblème EXACT extrait du vrai logo (mêmes d, mêmes stops, même glow) ---
const GOLD_STOPS = `
      <stop offset="0%" stop-color="#9A671F"/>
      <stop offset="22%" stop-color="#F4CE79"/>
      <stop offset="48%" stop-color="#FFF0B1"/>
      <stop offset="72%" stop-color="#D99A36"/>
      <stop offset="100%" stop-color="#8E5E1D"/>`;
const GOLD_SOFT_STOPS = `
      <stop offset="0%" stop-color="#C78A2D"/>
      <stop offset="50%" stop-color="#FFE6A0"/>
      <stop offset="100%" stop-color="#C78A2D"/>`;
const GLOW = `
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.55  0 1 0 0 0.32  0 0 1 0 0.05  0 0 0 .22 0" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
// Zone serrée de l'emblème dans le 1600 (livre+W, sans le texte) — même cadrage que gen-logos.mjs
const EMBLEM_VB = "430 240 740 520";
const EMBLEM_PATHS = `
    <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round" filter="url(#softGlow)">
      <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="18"/>
      <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="18"/>
      <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="18"/>
      <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
      <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
    </g>`;

function defs() {
  return `<defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">${GOLD_STOPS}
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">${GOLD_SOFT_STOPS}
    </linearGradient>${GLOW}
  </defs>`;
}

/** Icône carrée fond #090A0C + emblème exact centré. widthRatio = largeur emblème / canvas */
function launcherSvg(size, widthRatio) {
  const ew = Math.round(size * widthRatio);
  const eh = Math.round((ew * 520) / 740);
  const x = Math.round((size - ew) / 2);
  const y = Math.round((size - eh) / 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="WUGAMS">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <svg x="${x}" y="${y}" width="${ew}" height="${eh}" viewBox="${EMBLEM_VB}">
    ${defs()}
    ${EMBLEM_PATHS}
  </svg>
</svg>`;
}

/** Emblème seul sur fond transparent (splash icon Android / PWA) */
function splashIconSvg(size, widthRatio) {
  const ew = Math.round(size * widthRatio);
  const eh = Math.round((ew * 520) / 740);
  const x = Math.round((size - ew) / 2);
  const y = Math.round((size - eh) / 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="WUGAMS emblem">
  <svg x="${x}" y="${y}" width="${ew}" height="${eh}" viewBox="${EMBLEM_VB}">
    ${defs()}
    ${EMBLEM_PATHS}
  </svg>
</svg>`;
}

async function pngFromSvg(svg, size, out) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log("generated", out);
}

const BASE = 1024;
const anySvg = launcherSvg(BASE, 0.72); // emblem 72% — lisible, respecte zone de protection
const maskableSvg = launcherSvg(BASE, 0.58); // safe-zone 80% pour adaptive/maskable

// favicon.svg / icon.svg = déclinaison emblème officielle (lisible à 16px, pas de fonte)
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="WUGAMS">
  <rect width="512" height="512" rx="112" fill="${BG}"/>
  <svg x="76" y="128" width="360" height="253" viewBox="${EMBLEM_VB}">
    ${defs()}
    ${EMBLEM_PATHS}
  </svg>
</svg>`;

fs.writeFileSync("public/favicon.svg", faviconSvg);
fs.writeFileSync("public/icon.svg", faviconSvg);
console.log("wrote public/favicon.svg + public/icon.svg (embleme exact, fond #090A0C)");

await pngFromSvg(anySvg, 192, "public/icon-192.png");
await pngFromSvg(anySvg, 512, "public/icon-512.png");
await pngFromSvg(maskableSvg, 512, "public/icon-512-maskable.png");
await pngFromSvg(anySvg, 180, "public/apple-touch-icon.png");
await pngFromSvg(anySvg, 32, "public/favicon-32.png");

const buf48 = await sharp(Buffer.from(anySvg)).resize(48, 48).png().toBuffer();
fs.writeFileSync("public/favicon.ico", buf48);
fs.writeFileSync("app/favicon.ico", buf48);
console.log("wrote public/favicon.ico + app/favicon.ico (48px, embleme exact)");

// --- Splash icon transparent (Android windowSplashScreen / Capacitor) ---
await sharp(Buffer.from(splashIconSvg(512, 0.8)))
  .resize(512, 512)
  .png()
  .toFile("public/splash-icon.png");
console.log("generated public/splash-icon.png (embleme exact transparent 512)");

// --- Splash plein écran portrait 1080×1920 : FICHIER EXACT 1600 centré sur #090A0C ---
{
  const W = 1080;
  const H = 1920;
  const logoSize = 840;
  const bg = await sharp(
    Buffer.from(
      `<svg width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg'><rect width='${W}' height='${H}' fill='${BG}'/></svg>`
    )
  )
    .png()
    .toBuffer();
  const logo = await sharp(Buffer.from(fullExact))
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 9, g: 10, b: 12, alpha: 1 },
    })
    .png()
    .toBuffer();
  await sharp(bg)
    .composite([
      {
        input: logo,
        left: Math.round((W - logoSize) / 2),
        top: Math.round((H - logoSize) / 2) - 60,
      },
    ])
    .png()
    .toFile("public/splash-portrait-1080x1920.png");
  console.log("generated public/splash-portrait-1080x1920.png (vrai logo exact 1600, 840 centre)");
}

console.log("done — launcher + splash alignes sur le vrai logo (embleme exact / fichier exact)");
