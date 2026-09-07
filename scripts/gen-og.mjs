import sharp from "sharp";
import fs from "fs";

const W = 1200;
const H = 630;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A671F"/>
      <stop offset="22%" stop-color="#F4CE79"/>
      <stop offset="48%" stop-color="#FFF0B1"/>
      <stop offset="72%" stop-color="#D99A36"/>
      <stop offset="100%" stop-color="#8E5E1D"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C78A2D"/>
      <stop offset="50%" stop-color="#FFE6A0"/>
      <stop offset="100%" stop-color="#C78A2D"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.55  0 1 0 0 0.32  0 0 1 0 0.05  0 0 0 .22 0" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" rx="18" fill="#090A0C"/>
  <!-- subtle gold border -->
  <rect x="10" y="10" width="${W-20}" height="${H-20}" rx="14" fill="none" stroke="#8A5A18" stroke-opacity="0.25" stroke-width="1.5"/>
  <!-- Emblem centered: original 724x460 at scale ~0.42 to fit 1200 width ~ 300px emblem width -->
  <g transform="translate(${W/2 - 800*0.38}, ${H/2 - 494*0.38 - 42}) scale(0.38)" fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round" filter="url(#softGlow)">
    <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="22"/>
    <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="22"/>
    <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="22"/>
    <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="10" opacity=".95"/>
    <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="10" opacity=".95"/>
  </g>
  <g text-anchor="middle">
    <text x="${W/2}" y="${H/2 + 132}" fill="#FFF0C2" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-size="72" font-weight="600" letter-spacing="8">WUGAMS</text>
    <text x="${W/2}" y="${H/2 + 166}" fill="#F0D99C" font-family="Montserrat, Arial, Helvetica, sans-serif" font-size="22" font-weight="500" letter-spacing="10">HOLDING INC</text>
    <text x="${W/2}" y="${H/2 + 198}" fill="#8A7A52" font-family="Montserrat, Arial, Helvetica, sans-serif" font-size="13" font-weight="400" letter-spacing="3">Bâtir, rénover, entreprendre.</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
console.log('generated public/og-image.png', W, H);
await sharp(Buffer.from(svg)).png().toFile('public/opengraph-image.png');
console.log('generated public/opengraph-image.png');
// also copy to app opengraph if needed
if (!fs.existsSync('app/opengraph-image.png')) {
  fs.copyFileSync('public/og-image.png', 'app/opengraph-image.png');
  console.log('copied to app/opengraph-image.png');
}
