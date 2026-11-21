/**
 * Copies the latin variable webfonts out of the @fontsource-variable packages
 * into app/fonts, where next/font/local reads them.
 *
 * The site used next/font/google, which downloads the same three faces from
 * fonts.googleapis.com at build time. Self-hosting keeps the build working
 * offline and removes the request from every build; the faces are the same
 * variable fonts, so the rendered typography is unchanged.
 *
 * It also copies three static Manrope weights (.woff) into assets/og, for the pictures drawn for
 * shared links (app/og/[...path]/route.tsx). That renderer reads ttf, otf and woff, not woff2, so
 * it cannot use the variable files above.
 *
 * Run with: node scripts/sync-fonts.mjs
 */

import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "app", "fonts");

const faces = [
  ["@fontsource-variable/inter", "inter-latin-wght-normal.woff2"],
  ["@fontsource-variable/manrope", "manrope-latin-wght-normal.woff2"],
  ["@fontsource-variable/space-grotesk", "space-grotesk-latin-wght-normal.woff2"],
];

mkdirSync(target, { recursive: true });

for (const [pkg, file] of faces) {
  const dir = dirname(require.resolve(join(pkg, "package.json")));
  const source = join(dir, "files", file);
  copyFileSync(source, join(target, file));
  console.log(`copied ${pkg}/files/${file}`);
}

console.log(`\napp/fonts now holds:\n  ${readdirSync(target).join("\n  ")}`);

// Manrope is licensed under the SIL Open Font License 1.1, which asks that the notice travels with
// the font files, so the licence text is copied next to them.
const cardTarget = join(root, "assets", "og");
const cardFaces = ["manrope-latin-500-normal.woff", "manrope-latin-700-normal.woff", "manrope-latin-800-normal.woff"];
const manropeDir = dirname(require.resolve("@fontsource/manrope/package.json"));

mkdirSync(cardTarget, { recursive: true });
for (const file of cardFaces) {
  copyFileSync(join(manropeDir, "files", file), join(cardTarget, file));
  console.log(`copied @fontsource/manrope/files/${file}`);
}
copyFileSync(join(manropeDir, "LICENSE"), join(cardTarget, "Manrope-OFL.txt"));

console.log(`\nassets/og now holds:\n  ${readdirSync(cardTarget).join("\n  ")}`);
