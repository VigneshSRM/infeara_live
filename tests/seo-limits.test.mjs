// Unit tests for the search-listing rules found by the site audit:
//
//   npm run test:unit
//
//   * the title and description budgets live in one module (lib/seo/limits.ts), and the title
//     template, the admin hints and the HTTP smoke test all read it, so the advice an editor sees
//     is the advice the site follows;
//   * every page repeats the site name and locale in its Open Graph block, because a page's own
//     openGraph replaces the layout's instead of adding to it;
//   * robots.txt names no Host directive (Yandex-only, withdrawn in 2018);
//   * the Organization data says where the company is, and publishes no mailbox.
//
// No build, no server. limits.ts imports nothing, so it is compiled in memory with the project's
// own TypeScript and loaded from a data: URL. The other checks read source text.

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const { outputText } = ts.transpileModule(read("lib/seo/limits.ts"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const limits = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

/** Every .ts/.tsx file under `dir`, as repo-relative paths. */
function sourceFiles(dir) {
  const found = [];
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) found.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(name)) found.push(relative("", path));
  }
  return found;
}

test("the budgets are the ones audit tools and search results use", () => {
  assert.equal(limits.TITLE_MAX, 60);
  assert.equal(limits.DESCRIPTION_MAX, 160);
  assert.equal(limits.SITE_TITLE_SUFFIX, " — Infeara");
});

test("an editor's room for a title is what is left once the site name is added", () => {
  assert.equal(limits.TITLE_ROOM, limits.TITLE_MAX - limits.SITE_TITLE_SUFFIX.length);
  assert.equal(limits.TITLE_ROOM, 50);

  // A title that uses all of its room still fits the budget, and one more character does not.
  assert.equal(("x".repeat(limits.TITLE_ROOM) + limits.SITE_TITLE_SUFFIX).length, limits.TITLE_MAX);
  assert.ok(("x".repeat(limits.TITLE_ROOM + 1) + limits.SITE_TITLE_SUFFIX).length > limits.TITLE_MAX);
});

test("the admin hint tells the truth about the room and about the suffix", () => {
  assert.match(limits.SEO_TITLE_HINT, new RegExp(`\\b${limits.TITLE_ROOM}\\b`));
  assert.ok(limits.SEO_TITLE_HINT.includes(limits.SITE_TITLE_SUFFIX.trim()), "the hint should show what is added");
  assert.doesNotMatch(limits.SEO_TITLE_HINT, /\b60\b/, "60 counts the suffix, which the editor does not type");

  // The description advice stays inside the budget.
  const [low, high] = limits.SEO_DESCRIPTION_HINT.match(/\d+/g).map(Number);
  assert.ok(low < high && high <= limits.DESCRIPTION_MAX, limits.SEO_DESCRIPTION_HINT);
});

test("the root layout builds its title template from the shared suffix", () => {
  const layout = read("app/layout.tsx");
  assert.ok(layout.includes('import { SITE_TITLE_SUFFIX } from "@/lib/seo/limits";'));
  assert.ok(layout.includes("template: `%s${SITE_TITLE_SUFFIX}`"), "the template should append the shared suffix");
  assert.doesNotMatch(layout, /template:\s*"/, "a literal template would drift from the hint");
});

test("every SEO title and description field in the admin shows the shared hint", () => {
  const files = [...sourceFiles("app/admin"), ...sourceFiles("components/admin")];
  let titleFields = 0;
  let descriptionFields = 0;

  for (const file of files) {
    const text = read(file);
    for (const field of text.match(/<TextField\b[^>]*name="seo_title"[^>]*\/>/g) ?? []) {
      titleFields += 1;
      assert.ok(field.includes("hint={SEO_TITLE_HINT}"), `${file}: the SEO title field has no shared hint`);
    }
    for (const field of text.match(/<TextareaField\b[^>]*?name="seo_description"[\s\S]*?\/>/g) ?? []) {
      descriptionFields += 1;
      assert.ok(field.includes("hint={SEO_DESCRIPTION_HINT}"), `${file}: the meta description field has no shared hint`);
    }
    if (titleFields + descriptionFields > 0 && /name="seo_(title|description)"/.test(text)) {
      assert.ok(
        text.includes('from "@/lib/seo/limits"'),
        `${file}: shows a hint but does not import it from lib/seo/limits`,
      );
    }
    assert.doesNotMatch(text, /under 60 characters/, `${file}: still says "under 60 characters", which ignores the suffix`);
  }

  // SeoPanel (blogs, case studies, white papers, sub-services) plus the four editors that spell the fields out.
  assert.equal(titleFields, 5, "expected five SEO title fields");
  assert.equal(descriptionFields, 5, "expected five meta description fields");
});

test("pageMetadata repeats the site name and locale, because a page's openGraph replaces the layout's", () => {
  const metadata = read("lib/metadata.ts");
  assert.ok(metadata.includes('import { SITE_URL, site } from "@/lib/site";'));
  const openGraph = metadata.slice(metadata.indexOf("openGraph: {"), metadata.indexOf("twitter: {"));
  assert.ok(openGraph.includes("siteName: site.name,"), "og:site_name is missing from pageMetadata");
  assert.ok(openGraph.includes("locale: site.locale,"), "og:locale is missing from pageMetadata");
});

test("robots.txt names no Host directive", () => {
  const robots = read("app/robots.ts");
  assert.doesNotMatch(robots, /\bhost\s*:/, "Host is Yandex-only and withdrawn; Google and Bing ignore it");
  assert.ok(robots.includes("sitemap: `${SITE_URL}/sitemap.xml`"), "the open gate must still point at the sitemap");
});

test("the launch gate still closes robots.txt, the sitemap and every page", () => {
  assert.ok(read("app/robots.ts").includes('rules: [{ userAgent: "*", disallow: "/" }]'));
  assert.ok(read("app/sitemap.ts").includes("if (!SITE_INDEXABLE) return [];"));
  assert.ok(read("app/layout.tsx").includes(": { index: false, follow: false }"));
  assert.ok(read("lib/site.ts").includes('process.env.SITE_INDEXABLE === "true"'), "the gate opens only on the exact value true");
});

test("the Organization data says where the company is and publishes no mailbox or phone", () => {
  const jsonLd = read("components/seo/JsonLd.tsx");
  const organization = jsonLd.slice(jsonLd.indexOf("export const organizationSchema"), jsonLd.indexOf("export const websiteSchema"));
  for (const line of [
    '"@type": "PostalAddress"',
    'addressLocality: "Chennai"',
    'addressRegion: "Tamil Nadu"',
    'addressCountry: "IN"',
  ]) {
    assert.ok(organization.includes(line), `the Organization data is missing ${line}`);
  }
  // The site publishes no company mailbox or phone number (see the HTTP smoke test), so its data must not either.
  assert.doesNotMatch(organization, /\b(email|telephone|contactPoint)\b/);
});
