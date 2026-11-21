// Unit tests for the rule that lets search engines in (the "launch gate"):
//
//   npm run test:unit
//
//   * the site is open unless SITE_INDEXABLE closes it, and a Vercel preview stays closed;
//   * robots.txt, the sitemap and every page's robots tag read one value, so they cannot disagree;
//   * the sitemap is rebuilt on a timer and never invents a "modified" date;
//   * the pages that must stay out of search results still do when the site is open;
//   * a copied .env.example cannot close the site by accident.
//
// No build, no server. indexing.ts imports nothing, so it is compiled in memory with the project's
// own TypeScript and loaded from a data: URL. The other checks read source text.

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const { outputText } = ts.transpileModule(read("lib/seo/indexing.ts"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { isIndexable } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

function sourceFiles(dir) {
  const files = [];
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(name)) files.push(path);
  }
  return files;
}

test("a site with no setting is open, so a crawler can read it", () => {
  assert.equal(isIndexable({}), true);
  assert.equal(isIndexable({ SITE_INDEXABLE: undefined, VERCEL_ENV: undefined }), true);
  assert.equal(isIndexable({ VERCEL_ENV: "production" }), true);
  assert.equal(isIndexable({ VERCEL_ENV: "development" }), true);
  // An empty variable (Vercel keeps one when its value is cleared) is the same as none.
  assert.equal(isIndexable({ SITE_INDEXABLE: "" }), true);
  assert.equal(isIndexable({ SITE_INDEXABLE: "   " }), true);
});

test("true opens the site everywhere, whatever its case or spacing", () => {
  for (const value of ["true", "TRUE", "True", " true "]) {
    assert.equal(isIndexable({ SITE_INDEXABLE: value }), true, JSON.stringify(value));
    assert.equal(isIndexable({ SITE_INDEXABLE: value, VERCEL_ENV: "production" }), true, JSON.stringify(value));
    assert.equal(isIndexable({ SITE_INDEXABLE: value, VERCEL_ENV: "preview" }), true, `${JSON.stringify(value)} on a preview`);
  }
});

test("a value that was typed in and is not true closes the site", () => {
  // Only "true" opens it, as it always has: "false", "0", "no" and a typo all mean closed, on every host.
  for (const value of ["false", "FALSE", " False ", "0", "no", "off", "closed", "ture", "1", "yes"]) {
    assert.equal(isIndexable({ SITE_INDEXABLE: value }), false, JSON.stringify(value));
    assert.equal(isIndexable({ SITE_INDEXABLE: value, VERCEL_ENV: "production" }), false, `${JSON.stringify(value)} in production`);
  }
});

test("a Vercel preview deployment stays closed unless SITE_INDEXABLE is true", () => {
  assert.equal(isIndexable({ VERCEL_ENV: "preview" }), false);
  assert.equal(isIndexable({ SITE_INDEXABLE: "", VERCEL_ENV: "preview" }), false);
  assert.equal(isIndexable({ SITE_INDEXABLE: "true", VERCEL_ENV: "preview" }), true);
});

test("robots.txt, the sitemap and every page read the one value from lib/site.ts", () => {
  const site = read("lib/site.ts");
  assert.ok(site.includes('import { isIndexable } from "@/lib/seo/indexing";'));
  // Both variables are named, so the rule never sees the whole environment.
  assert.ok(site.includes("SITE_INDEXABLE: process.env.SITE_INDEXABLE,"));
  assert.ok(site.includes("VERCEL_ENV: process.env.VERCEL_ENV,"));
  assert.ok(site.includes("export const SITE_INDEXABLE = isIndexable({"));

  // Nothing else reads the variables, or two parts of the site could disagree about being open.
  const readers = [...sourceFiles("app"), ...sourceFiles("lib"), ...sourceFiles("components"), "proxy.ts", "next.config.ts"].filter(
    (file) => /process\.env\.(SITE_INDEXABLE|VERCEL_ENV)\b/.test(read(file)),
  );
  assert.deepEqual(readers, ["lib/site.ts"]);

  for (const file of ["app/layout.tsx", "app/robots.ts", "app/sitemap.ts"]) {
    assert.ok(read(file).includes('SITE_INDEXABLE'), `${file} no longer reads SITE_INDEXABLE`);
    assert.ok(/from "@\/lib\/site"/.test(read(file)), `${file} should read it from @/lib/site`);
  }
});

test("a closed site is closed everywhere: robots.txt, every page and the sitemap", () => {
  assert.ok(read("app/robots.ts").includes('rules: [{ userAgent: "*", disallow: "/" }]'));
  assert.ok(read("app/layout.tsx").includes(": { index: false, follow: false }"));
  assert.ok(read("app/sitemap.ts").includes("if (!SITE_INDEXABLE) return [];"));
});

test("an open site lets crawlers in, keeps them out of the staff area and names the sitemap", () => {
  const robots = read("app/robots.ts");
  assert.ok(robots.includes('rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }]'));
  assert.ok(robots.includes("sitemap: `${SITE_URL}/sitemap.xml`"));
  assert.ok(read("app/layout.tsx").includes("? { index: true, follow: true }"));
});

test("the sitemap is rebuilt every five minutes and never invents a modified date", () => {
  const sitemap = read("app/sitemap.ts");
  // The pages are rebuilt every five minutes (and on every save), so the sitemap keeps pace:
  // a scheduled post or a new insight is listed without a deployment.
  assert.match(sitemap, /^export const revalidate = 300;$/m);
  for (const page of ["app/blogs/page.tsx", "app/insights/page.tsx", "app/services/page.tsx"]) {
    assert.match(read(page), /^export const revalidate = 300;$/m, `${page} should refresh on the same clock as the sitemap`);
  }

  // `new Date()` is "now", which moves each time the sitemap is rebuilt and teaches crawlers to
  // distrust the real dates. A date is given only from a published day, through one helper that
  // leaves a bad value out instead of failing the whole sitemap.
  assert.doesNotMatch(sitemap, /new Date\(\s*\)/);
  assert.equal((sitemap.match(/new Date\(/g) ?? []).length, 1, "a date is built in one place only: publishedDay");
  assert.ok(sitemap.includes("Number.isNaN(at.getTime()) ? {} : { lastModified: at }"), "a bad day must be left out");
  assert.doesNotMatch(sitemap, /^\s*lastModified[:,]/m, "an entry sets a modified date by hand");
  const dates = sitemap.match(/\.\.\.publishedDay\([^)]*\)/g) ?? [];
  assert.equal(dates.length, 3, "the dated entries are insights, blog posts and white papers");
  for (const use of dates) assert.match(use, /publishedAt/, `a modified date that is not a published day: ${use}`);
});

test("the pages that must stay out of search results still do when the site is open", () => {
  // The staff area, every admin page that sets its own tags, the 404 page, the thank-you page, the
  // retired login routes (410) and an empty white-paper list all say noindex themselves, so opening
  // the site for everything else opens none of them.
  assert.match(read("app/admin/layout.tsx"), /robots: \{ index: false, follow: false, nocache: true \}/);
  assert.match(read("app/admin/(auth)/reset-password/page.tsx"), /robots: \{ index: false, follow: false \}/);
  assert.match(read("app/admin/(auth)/accept-invite/page.tsx"), /robots: \{ index: false, follow: false \}/);
  assert.match(read("app/not-found.tsx"), /robots: \{ index: false, follow: false \}/);
  assert.match(read("app/thank-you/page.tsx"), /noIndex: true,/);
  assert.match(read("app/white-papers/page.tsx"), /noIndex: true,/);
  assert.match(read("lib/gone.ts"), /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(read("lib/gone.ts"), /"x-robots-tag": "noindex, nofollow"/);
});

test(".env.example does not close the site, so copying it into Vercel cannot hide the site from search", () => {
  const live = read(".env.example")
    .split("\n")
    .filter((line) => /^\s*SITE_INDEXABLE\s*=/.test(line));
  assert.deepEqual(live, [], "SITE_INDEXABLE must stay commented out in .env.example");
  assert.match(read(".env.example"), /^# SITE_INDEXABLE=false$/m);
});

test("the README says the site is open and how to close it", () => {
  const readme = read("README.md");
  assert.doesNotMatch(readme, /`SITE_INDEXABLE=false` is the default/);
  assert.doesNotMatch(readme, /still intentionally non-indexable/);
  assert.match(readme, /\*\*open\*\* to search engines/);
  assert.match(readme, /`SITE_INDEXABLE=false`/);
  assert.match(readme, /Vercel preview deployment/);
});
