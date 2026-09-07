import sharp from "sharp";
import fs from "fs";

function emblemIconSvg(size, { maskable = false } = {}) {
  // Background premium noir profond
  const bg = "#090A0C";
  const radius = size * 0.22;
  // Gold gradient stops — officiel WUGAMS
  // scale pour emblem (largeur originale 724)
  const emblemWidth = 724;
  const emblemCenterX = 800;
  const emblemCenterY = 494; // (264+724)/2
  // maskable needs smaller emblem to survive masking (safe zone 80%)
  const targetWidthRatio = maskable ? 0.56 : 0.72;
  const scale = (size * targetWidthRatio) / emblemWidth;
  const tx = size / 2 - emblemCenterX * scale;
  const ty = size / 2 - emblemCenterY * scale;

  // stroke widths scaled to keep visual weight ~ size * 0.02
  // original stroke-width 18 at 1600 viewBox => at icon size 512, 18*(512/1600)=5.76 but after scale 0.5 it's 9 etc.
  // We keep original widths scaled by 1/scale? Actually stroke scales with transform, so we set original width divided by scale? 
  // Simpler: set stroke-width proportional to size after transform: we want final visual stroke ~ size*0.018
  // original 18 at scale 0.5 gives final 9 => for size 512, 9 is 512*0.0175 good.
  // So we keep original 18 and let transform handle it — maskable will be slightly thinner but okay.
  const strokeMain = 18;
  const strokeSoft = 8;

  return `<svg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='gold' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#9A671F'/>
      <stop offset='22%' stop-color='#F4CE79'/>
      <stop offset='48%' stop-color='#FFF0B1'/>
      <stop offset='72%' stop-color='#D99A36'/>
      <stop offset='100%' stop-color='#8E5E1D'/>
    </linearGradient>
    <linearGradient id='goldSoft' x1='0%' y1='0%' x2='100%' y2='0%'>
      <stop offset='0%' stop-color='#C78A2D'/>
      <stop offset='50%' stop-color='#FFE6A0'/>
      <stop offset='100%' stop-color='#C78A2D'/>
    </linearGradient>
    <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
      <feGaussianBlur stdDeviation='${size * 0.008}' result='blur'/>
      <feColorMatrix in='blur' type='matrix' values='1 0 0 0 0.55  0 1 0 0 0.32  0 0 1 0 0.05  0 0 0 .32 0' result='glow'/>
      <feMerge><feMergeNode in='glow'/><feMergeNode in='SourceGraphic'/></feMerge>
    </filter>
  </defs>
  <rect width='${size}' height='${size}' rx='${radius}' fill='${bg}'/>
  <!-- fine gold border -->
  <rect x='${size * 0.04}' y='${size * 0.04}' width='${size * 0.92}' height='${size * 0.92}' rx='${radius * 0.85}' fill='none' stroke='#8A5A18' stroke-opacity='0.35' stroke-width='${size * 0.006}'/>
  <g transform='translate(${tx} ${ty}) scale(${scale})' fill='none' stroke='url(#gold)' stroke-linecap='round' stroke-linejoin='round' filter='url(#glow)'>
    <path d='M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z' stroke-width='${strokeMain}'/>
    <path d='M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z' stroke-width='${strokeMain}'/>
    <path d='M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426' stroke-width='${strokeMain}'/>
    <path d='M454 600 C548 620 638 662 708 724' stroke='url(#goldSoft)' stroke-width='${strokeSoft}' opacity='.95'/>
    <path d='M1146 600 C1052 620 962 662 892 724' stroke='url(#goldSoft)' stroke-width='${strokeSoft}' opacity='.95'/>
  </g>
</svg>`;
}

async function gen(size, out, opts = {}) {
  const svg = emblemIconSvg(size, opts);
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log('generated', out, '('+size+'x'+size+ (opts.maskable?' maskable':'')+')');
}

async function genIco() {
  // favicon 32x32 from 512 then convert to ico via png (next will use favicon.svg pref but also provide ico)
  const svg32 = emblemIconSvg(32);
  await sharp(Buffer.from(svg32)).png().toFile('public/favicon-32.png');
  console.log('generated public/favicon-32.png');
  // Also generate app/favicon.ico equivalent via 32 png copied to app/favicon.ico and public/favicon.ico
  // Use sharp to generate ico? sharp can't write ico, we copy png as ico fallback (browsers handle png ico) or use png
  // We'll generate a true ico by converting png buffer via sharp to png and rename to ico — many browsers accept png as ico
  // Instead create 48x48 png for favicon.ico
  const svg48 = emblemIconSvg(48);
  const buf = await sharp(Buffer.from(svg48)).png().toBuffer();
  // write as ico (actually png data but named .ico still works) — better write png and copy
  fs.writeFileSync('public/favicon.ico', buf);
  fs.writeFileSync('app/favicon.ico', buf);
  console.log('generated favicon.ico (48x48 png as ico)');
  // apple touch 180
  await gen(180, 'public/apple-touch-icon.png');
  // also write public/icon.svg already exists as favicon.svg, ensure
  if (!fs.existsSync('public/icon.svg')) {
    fs.copyFileSync('public/favicon.svg', 'public/icon.svg');
  }
}

await Promise.all([
  gen(192, 'public/icon-192.png'),
  gen(512, 'public/icon-512.png'),
  gen(512, 'public/icon-512-maskable.png', { maskable: true })
]);
await genIco();
console.log('done');
