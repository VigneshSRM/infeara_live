import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const logoSvg = `<image href="data:image/png;base64,${readFileSync(
  resolve(root, "public/brand/infeara-logo-light.png"),
).toString("base64")}" x="96" y="72" width="300" height="100" preserveAspectRatio="xMinYMid meet" />`;

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="0.82" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#226192" stop-opacity="0.55" />
      <stop offset="1" stop-color="#101D2B" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#101D2B" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <g stroke="#EAE6DE" stroke-opacity="0.07">
    <path d="M0 120 H1200 M0 240 H1200 M0 360 H1200 M0 480 H1200" />
  </g>
  ${logoSvg}
  <text x="96" y="330" fill="#EAE6DE" font-family="Segoe UI, Arial, sans-serif" font-size="62" font-weight="600" letter-spacing="-1.8">Engineering the infrastructure</text>
  <text x="96" y="404" fill="#EAE6DE" font-family="Segoe UI, Arial, sans-serif" font-size="62" font-weight="600" letter-spacing="-1.8">behind business growth.</text>
  <text x="96" y="500" fill="#EAE6DE" fill-opacity="0.62" font-family="Segoe UI, Arial, sans-serif" font-size="26">Managed IT · Cybersecurity · Cloud · Chennai, India</text>
  <rect x="96" y="546" width="112" height="4" fill="#EF8557" />
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(resolve(root, "public/brand/og-image.png"));

console.log("Generated public/brand/og-image.png");
