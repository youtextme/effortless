/**
 * Generate Effortless snack PWA icons from the book-plain favicon motif.
 * Run: node scripts/generate-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "icons");

const PAPER = "#fafaf8";
const INK = "#1a1a1a";

function iconSvg(size, { maskable = false } = {}) {
  const pad = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - pad * 2;
  const lineY = Math.round(size * 0.6875);
  const lineX1 = Math.round(size * 0.21875);
  const lineX2 = size - lineX1;
  const stroke = Math.max(2, Math.round(size * 0.046875));

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" fill="${PAPER}"/>
  <path d="M${lineX1} ${lineY}h${lineX2 - lineX1}" stroke="${INK}" stroke-width="${stroke}" fill="none" stroke-linecap="round"/>
</svg>`);
}

async function writePng(name, size, options) {
  const svg = iconSvg(size, options);
  await writeFile(join(iconsDir, name), await sharp(svg).png().toBuffer());
}

await mkdir(iconsDir, { recursive: true });
await writePng("icon-192.png", 192);
await writePng("icon-512.png", 512);
await writePng("icon-192-maskable.png", 192, { maskable: true });
await writePng("icon-512-maskable.png", 512, { maskable: true });
await writePng("apple-touch-icon.png", 180);

console.log("Wrote icons to", iconsDir);
