import sharp from "sharp";
import fs from "fs";

// OG 1200x630 généré à partir du logo exact noir (fond #090A0C) — sans retouche du logo lui-même
const blackLogoPath = "e5c654a0-a089-11f1-a57b-6de6f5e58fbd.svg";
const blackSvg = fs.readFileSync(blackLogoPath, "utf8");

const W = 1200;
const H = 630;

// On place le logo exact 1600x1600 centré dans 1200x630 sur fond #090A0C, sans altérer le logo
// Le logo est carré, on le scale pour qu'il tienne en hauteur 520 (padding vertical)
const logoSize = 520; // taille du logo carré dans l'OG
const svgWrap = `<svg width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg'>
  <rect width='${W}' height='${H}' fill='#090A0C'/>
  <g transform='translate(${(W - logoSize) / 2}, ${(H - logoSize) / 2})'>
    <!-- logo exact intégré via foreignObject impossible en sharp, on rasterise séparément et composite -->
  </g>
</svg>`;

// Méthode composite : rasterise le logo exact en 520x520 puis composite sur fond 1200x630
const bgBuf = await sharp(Buffer.from(`<svg width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg'><rect width='${W}' height='${H}' fill='#090A0C'/></svg>`)).png().toBuffer();
const logoBuf = await sharp(Buffer.from(blackSvg)).resize(logoSize, logoSize, { fit: "contain", background: { r: 9, g: 10, b: 12, alpha: 1 } }).png().toBuffer();

const ogBuf = await sharp(bgBuf)
  .composite([{ input: logoBuf, left: Math.round((W - logoSize) / 2), top: Math.round((H - logoSize) / 2) }])
  .png()
  .toBuffer();

fs.writeFileSync("public/og-image.png", ogBuf);
fs.writeFileSync("public/opengraph-image.png", ogBuf);
fs.writeFileSync("app/opengraph-image.png", ogBuf);
console.log("generated public/og-image.png + public/opengraph-image.png + app/opengraph-image.png depuis exact noir 1600 (1200x630, logo 520 centré)");
