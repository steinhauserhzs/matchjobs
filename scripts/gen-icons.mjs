// Gera os ícones PNG do PWA a partir dos SVGs. Uso: node scripts/gen-icons.mjs
import sharp from "sharp";

const jobs = [
  ["public/icon.svg", "public/icon-192.png", 192],
  ["public/icon.svg", "public/icon-512.png", 512],
  ["public/icon-maskable.svg", "public/icon-maskable-512.png", 512],
  ["public/icon-maskable.svg", "public/apple-touch-icon.png", 180],
];

for (const [src, out, size] of jobs) {
  await sharp(src, { density: 300 }).resize(size, size).png().toFile(out);
  console.log("✓", out);
}
