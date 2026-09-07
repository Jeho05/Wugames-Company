import sharp from "sharp";
import fs from "fs";

// Utilise EXACTEMENT les 2 logos fournis à la racine, sans retouche
const whiteLogoPath = "e59161f0-a089-11f1-a57b-6de6f5e58fbd.svg"; // fond blanc #FFFFFF / texte #15191E
const blackLogoPath = "e5c654a0-a089-11f1-a57b-6de6f5e58fbd.svg"; // fond noir #090A0C / texte #FFF0C2

const whiteSvg = fs.readFileSync(whiteLogoPath, "utf8");
const blackSvg = fs.readFileSync(blackLogoPath, "utf8");

// Pour les icônes PWA on utilise la version noire (fond #090A0C) — thème sombre officiel
const iconSvg = blackSvg;

async function genFromExact(svgContent, size, out) {
  await sharp(Buffer.from(svgContent)).resize(size, size, { fit: "contain", background: "#090A0C" }).png().toFile(out);
  console.log("generated", out, `(${size}x${size} depuis exact)`);
}

async function genMaskable(svgContent, size, out) {
  // maskable : ajoute un padding 12% pour la safe zone 80% (sinon texte coupé)
  const paddedSize = Math.round(size * 0.82);
  // Crée un fond #090A0C taille size, et place le logo exact centré en 82%
  const bg = `<svg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'><rect width='${size}' height='${size}' fill='#090A0C'/></svg>`;
  const bgBuf = await sharp(Buffer.from(bg)).png().toBuffer();
  const logoBuf = await sharp(Buffer.from(svgContent)).resize(paddedSize, paddedSize, { fit: "contain", background: { r: 9, g: 10, b: 12, alpha: 1 } }).png().toBuffer();
  await sharp(bgBuf)
    .composite([{ input: logoBuf, left: Math.round((size - paddedSize) / 2), top: Math.round((size - paddedSize) / 2) }])
    .png()
    .toFile(out);
  console.log("generated", out, `(${size}x${size} maskable depuis exact)`);
}

async function genIco() {
  // favicon.svg = copie exacte du logo noir (fond #090A0C) — exactement le fichier racine
  fs.copyFileSync(blackLogoPath, "public/favicon.svg");
  fs.copyFileSync(blackLogoPath, "public/icon.svg");
  console.log("copied exact black logo -> public/favicon.svg + public/icon.svg");

  // favicon-32.png depuis exact
  await sharp(Buffer.from(iconSvg)).resize(32, 32).png().toFile("public/favicon-32.png");
  console.log("generated public/favicon-32.png (exact)");

  // favicon.ico 48x48 depuis exact (png renommé .ico — navigateurs l'acceptent, Next le sert)
  const buf48 = await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toBuffer();
  fs.writeFileSync("public/favicon.ico", buf48);
  fs.writeFileSync("app/favicon.ico", buf48);
  console.log("generated favicon.ico 48x48 (exact)");

  // apple-touch 180
  await genFromExact(iconSvg, 180, "public/apple-touch-icon.png");
}

await Promise.all([
  genFromExact(iconSvg, 192, "public/icon-192.png"),
  genFromExact(iconSvg, 512, "public/icon-512.png"),
  genMaskable(iconSvg, 512, "public/icon-512-maskable.png"),
]);
await genIco();
console.log("done — tous les PNG générés depuis les 2 SVGs exacts de la racine");
