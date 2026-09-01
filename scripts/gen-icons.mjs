import sharp from "sharp";
import fs from "fs";

async function gen(size, out) {
  const svg = `<svg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'>
    <rect width='${size}' height='${size}' rx='${size*0.18}' fill='#17294b'/>
    <rect x='${size*0.08}' y='${size*0.08}' width='${size*0.84}' height='${size*0.84}' rx='${size*0.12}' fill='none' stroke='#e3a641' stroke-width='${size*0.015}'/>
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-weight='900' font-size='${size*0.42}' fill='#e3a641'>W</text>
    <text x='50%' y='72%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-weight='700' font-size='${size*0.08}' fill='#f2c56d' letter-spacing='${size*0.01}'>WUGAMS</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log('generated', out);
}

await Promise.all([gen(192, 'public/icon-192.png'), gen(512, 'public/icon-512.png'), gen(512, 'public/icon-512-maskable.png')]);
console.log('done');
