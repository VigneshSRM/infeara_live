// Unit tests for the fixes that came out of the SEO audit of 21 November 2026:
//
//   npm run test:unit
//
//   * every service page has a search title that says where the company is, and the SQL that puts
//     those titles (and four pages of fuller text) into the database is safe: it never touches a
//     page an editor has changed, and the seed files that already ran are not edited;
//   * the fuller text keeps to the site's voice: no clients, figures or "best" claims, and
//     standards named only as context;
//   * no question is asked on two public pages;
//   * one title per page for the tab, the search result and a shared link; articles say so;
//   * insight dates are India days, and guides and posts carry a date and a byline;
//   * every public page has a skip link;
//   * the picture for a shared link, /llms.txt and the sitemap/robots wiring.
//
// No build, no server, no Supabase. The TypeScript modules loaded here import nothing, so they
// are compiled in memory with the project's own TypeScript; the rest is read as source text.
// The behaviour of the pages themselves is covered by tests/http-smoke.test.mjs against a build.

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { REFRESH_APPLY, REFRESH_MIGRATION, buildCopyRefreshMigration } from "../scripts/generate-copy-refresh-migration.mjs";
import { json, loadSubservices, q } from "../scripts/generate-resource-seed.mjs";

const here = (path) => new URL(path, import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));
const text = (path) => readFileSync(join(root, path), "utf8");

async function load(path) {
  const { outputText } = ts.transpileModule(text(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const [refresh, servicesModule, blogsModule, faqsModule, limits, ogPaths, llms, schema, dates] = await Promise.all([
  load("lib/content/copy-refresh.ts"),
  load("lib/content/services.ts"),
  load("lib/content/blogs.ts"),
  load("lib/content/faqs.ts"),
  load("lib/seo/limits.ts"),
  load("lib/seo/og-paths.ts"),
  load("lib/seo/llms.ts"),
  load("lib/seo/schema.ts"),
  load("lib/content/dates.ts"),
]);
const seededSubservices = await loadSubservices();
const seededServices = servicesModule.services;

const pageKey = (page) => page.page;
const seededKeys = new Set([
  ...seededServices.map((service) => service.slug),
  ...seededSubservices.map((item) => `${item.parentSlug}/${item.slug}`),
]);
const seededOf = (page) =>
  page.kind === "service"
    ? seededServices.find((service) => service.slug === page.page)
    : page.kind === "blog"
      ? blogsModule.starterBlogPosts.find((post) => post.slug === page.page)
      : seededSubservices.find((item) => `${item.parentSlug}/${item.slug}` === page.page);

const words = (value) => value.trim().split(/\s+/).filter(Boolean).length;
const bodyWords = (body) =>
  words(body.intro) +
  body.deliverables.reduce((n, d) => n + words(d.title) + words(d.body), 0) +
  body.outcomes.reduce((n, outcome) => n + words(outcome), 0) +
  body.faqs.reduce((n, faq) => n + words(faq.question) + words(faq.answer), 0);

/** Every string the refresh puts on a page. */
const stringsOf = (page) => [
  page.seoTitle,
  ...(page.body
    ? [
        page.body.intro,
        ...page.body.deliverables.flatMap((d) => [d.title, d.body]),
        ...page.body.outcomes,
        ...page.body.faqs.flatMap((f) => [f.question, f.answer]),
      ]
    : []),
];

/** The SQL with its comments removed, so a comment cannot satisfy or break a check. */
const code = (sql) => sql.replace(/--.*$/gm, "");

/* ── Search titles ───────────────────────────────────────────────────────── */

test("every service and focused service has a search title, and the refresh names no page that does not exist", () => {
  assert.equal(refresh.refreshedPages.length, 29);
  assert.equal(refresh.refreshedPages.filter((p) => p.kind === "service").length, 10);
  assert.equal(refresh.refreshedPages.filter((p) => p.kind === "subservice").length, 18);
  assert.equal(refresh.refreshedPages.filter((p) => p.kind === "blog").length, 1);

  const keys = refresh.refreshedPages.map(pageKey);
  assert.equal(new Set(keys).size, keys.length, "a page is listed twice");
  assert.deepEqual(
    refresh.refreshedPages.filter((p) => p.kind !== "blog").map(pageKey).sort(),
    [...seededKeys].sort(),
    "the refresh and the seeded lists cover different pages",
  );
  for (const page of refresh.refreshedPages) assert.ok(seededOf(page), `${page.page} is not a seeded page`);
});

test("each new title says where the company is and fits the room an editor has", () => {
  const titles = refresh.refreshedPages.map((p) => p.seoTitle);
  assert.equal(new Set(titles).size, titles.length, "two pages share a title");

  for (const page of refresh.refreshedPages) {
    const old = seededOf(page).seo.title;
    assert.notEqual(page.seoTitle, old, `${page.page}: the title did not change`);
    if (page.kind !== "blog") assert.match(page.seoTitle, /Chennai|India/, `${page.page}: no place in "${page.seoTitle}"`);
    assert.ok(
      page.seoTitle.length <= limits.TITLE_ROOM,
      `${page.page}: "${page.seoTitle}" is ${page.seoTitle.length} characters (room ${limits.TITLE_ROOM})`,
    );
    assert.ok(
      (page.seoTitle + limits.SITE_TITLE_SUFFIX).length <= limits.TITLE_MAX,
      `${page.page}: the title with the site name is over ${limits.TITLE_MAX}`,
    );
  }
});

test("the seeded lists and seed files stay exactly as they were seeded: the new wording is not in them", () => {
  const seedSql = text("supabase/seed.sql");
  const subSeedSql = text("supabase/migrations/20261110200100_resource_modules_seed.sql");

  for (const page of refresh.refreshedPages) {
    const old = seededOf(page);
    if (page.kind !== "blog") assert.doesNotMatch(old.seo.title, /Chennai|India/, `${page.page}: the seeded list was edited`);
    const sql = page.kind === "service" ? seedSql : subSeedSql;
    // The values the migration guards on are the values in the committed seed, word for word.
    assert.ok(sql.includes(`${q(old.seo.title)}, ${q(old.seo.description)}`), `${page.page}: the seeded title is not in the seed file`);
    assert.ok(!sql.includes(q(page.seoTitle)), `${page.page}: the new title was written into a seed that already ran`);
    if (page.body) {
      assert.ok(sql.includes(q(old.intro)), `${page.page}: seeded intro`);
      assert.ok(sql.includes(json(old.deliverables)), `${page.page}: seeded deliverables`);
      assert.ok(sql.includes(json(old.faqs)), `${page.page}: seeded FAQs`);
      assert.ok(sql.includes(json(old.outcomes)), `${page.page}: seeded outcomes`);
      assert.ok(!sql.includes(q(page.body.intro)), `${page.page}: the new intro was written into a seed that already ran`);
    }
  }
});

/* ── The four fuller pages ───────────────────────────────────────────────── */

const expanded = refresh.refreshedPages.filter((p) => p.body);

test("four thin pages are now full pages with 8 to 10 questions each", () => {
  assert.deepEqual(
    expanded.map(pageKey).sort(),
    [
      "cloud-datacenter/cloud-disaster-recovery-business-continuity",
      "cybersecurity/penetration-testing",
      "cybersecurity/vulnerability-assessment",
      "managed-it",
    ],
  );
  for (const page of expanded) {
    const { body } = page;
    const old = seededOf(page);
    assert.ok(bodyWords(body) >= 900, `${page.page}: ${bodyWords(body)} words of copy, expected at least 900 (it was ${bodyWords(old)})`);
    assert.ok(words(body.intro) >= 100, `${page.page}: the introduction is ${words(body.intro)} words`);
    assert.ok(body.deliverables.length >= 8, `${page.page}: ${body.deliverables.length} deliverables`);
    assert.ok(body.outcomes.length >= 6, `${page.page}: ${body.outcomes.length} outcomes`);
    assert.ok(body.faqs.length >= 8 && body.faqs.length <= 10, `${page.page}: ${body.faqs.length} questions`);

    const questions = body.faqs.map((faq) => faq.question.toLowerCase());
    assert.equal(new Set(questions).size, questions.length, `${page.page}: a question is asked twice`);
    for (const faq of body.faqs) assert.ok(words(faq.answer) >= 30, `${page.page}: the answer to "${faq.question}" is thin`);
    for (const d of body.deliverables) assert.ok(words(d.body) >= 20, `${page.page}: "${d.title}" is thin`);
  }
});

test("the fuller text keeps to the site's voice: no clients, figures, rankings or promises", () => {
  // Words the About page says the company will not use of itself, and figures that need a source.
  const banned = /\b(best|leading|top|number one|world[- ]class|award[- ]winning|guarantee[sd]?|certified|cutting[- ]edge|state[- ]of[- ]the[- ]art|unrivalled|premier)\b|#1|\d\s?%/i;
  for (const page of refresh.refreshedPages) {
    for (const value of stringsOf(page)) {
      assert.doesNotMatch(value, banned, `${page.page}: "${value.slice(0, 80)}…" makes a claim the site does not make`);
      assert.ok(!value.includes("$$"), `${page.page}: "$$" cannot be written into the SQL`);
    }
  }
});

test("standards are named only as context, at the places they are published", () => {
  const all = expanded.flatMap(stringsOf).join("\n");

  // ISO/IEC 27001:2022 Annex A: 8.8 technical vulnerabilities, 8.29 security testing, 5.30 ICT readiness for continuity.
  const annex = [...all.matchAll(/Annex A (\d+\.\d+)/g)].map((m) => m[1]);
  assert.ok(annex.length >= 3, "the standards were meant to appear, as context");
  for (const control of annex) assert.ok(["8.8", "8.29", "5.30"].includes(control), `Annex A ${control} is not one this copy was checked against`);

  // PCI DSS v4.0.1: 11.3 vulnerability scans (quarterly), 11.4 penetration tests (every 12 months and after significant change).
  const requirements = [...all.matchAll(/requirement (\d+\.\d+)/gi)].map((m) => m[1]);
  assert.ok(requirements.length >= 1 && requirements.every((id) => id === "11.4"), `requirements named: ${requirements}`);
  assert.match(all, /every 12 months/);
  assert.match(all, /every three months/);

  // CERT-In is context for tenders, never a claim: the page says what it will and will not imply.
  const certIn = expanded.flatMap(stringsOf).filter((value) => value.includes("CERT-In"));
  assert.ok(certIn.length >= 1);
  for (const value of certIn) assert.match(value, /We say plainly|do not|not imply|instead of implying/i, "CERT-In is mentioned as if it were a credential");

  // No credential is claimed anywhere in the new copy.
  assert.doesNotMatch(all, /\b(we are|we hold|is|are) (ISO|SOC|PCI|CERT-In)\b/i);
  assert.doesNotMatch(all, /\bRBI\b/, "RBI was not verified, so it is not mentioned");
});

test("no question is asked on two public pages (the FAQ page, which lists them all, aside)", () => {
  const pages = new Map();

  const effectiveServices = refresh.refreshServices(seededServices);
  for (const service of effectiveServices) pages.set(`/services/${service.slug}`, service.faqs);
  for (const item of refresh.refreshSubservices(seededSubservices)) pages.set(`/services/${item.parentSlug}/${item.slug}`, item.faqs);

  // The questions the home page picks out of the FAQ page: read from the page's own source.
  const home = text("app/page.tsx");
  const picks = [...home.slice(home.indexOf("const selectedFaqs = [")).matchAll(/pick\((\d), (\d)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  assert.ok(picks.length >= 6, "could not read the home page's questions");
  pages.set(
    "/",
    picks.map(([group, item]) => {
      const faq = faqsModule.faqGroups[group]?.items[item];
      assert.ok(faq, `the home page picks a question that does not exist: pick(${group}, ${item})`);
      return faq;
    }),
  );

  const seen = new Map();
  for (const [path, faqs] of pages) {
    for (const faq of faqs) {
      const key = faq.question.trim().toLowerCase();
      assert.ok(!seen.has(key), `"${faq.question}" is asked on ${seen.get(key)} and on ${path}`);
      seen.set(key, path);
    }
  }
});

/* ── The wording applied to the seeded lists (the code fallback) ─────────── */

test("refreshServices and refreshSubservices apply the new wording and leave the seeded lists alone", () => {
  const frozenServices = JSON.stringify(seededServices);
  const frozenSubs = JSON.stringify(seededSubservices);

  const services = refresh.refreshServices(seededServices);
  const subs = refresh.refreshSubservices(seededSubservices);
  const frozenPosts = JSON.stringify(blogsModule.starterBlogPosts);
  const posts = refresh.refreshBlogPosts(blogsModule.blogPosts);
  assert.equal(JSON.stringify(blogsModule.starterBlogPosts), frozenPosts, "the seeded posts were changed in place");
  assert.equal(posts.length, blogsModule.blogPosts.length);

  assert.equal(JSON.stringify(seededServices), frozenServices, "the seeded services were changed in place");
  assert.equal(JSON.stringify(seededSubservices), frozenSubs, "the seeded focused services were changed in place");
  assert.equal(services.length, 10);
  assert.equal(subs.length, 18);

  for (const page of refresh.refreshedPages) {
    const result =
      page.kind === "service"
        ? services.find((s) => s.slug === page.page)
        : page.kind === "blog"
          ? posts.find((s) => s.slug === page.page)
          : subs.find((s) => `${s.parentSlug}/${s.slug}` === page.page);
    assert.equal(result.seo.title, page.seoTitle, page.page);
    if (page.kind === "blog") {
      assert.equal(result.title, seededOf(page).title, "the post's own title (its heading) should not change");
      assert.deepEqual(result.body, seededOf(page).body);
      continue;
    }
    assert.equal(result.seo.description, seededOf(page).seo.description, `${page.page}: the description should not change`);
    assert.equal(result.name, seededOf(page).name, `${page.page}: the name (the page heading) should not change`);
    if (page.body) {
      assert.equal(result.intro, page.body.intro);
      assert.deepEqual(result.deliverables, page.body.deliverables);
      assert.deepEqual(result.outcomes, page.body.outcomes);
      assert.deepEqual(result.faqs, page.body.faqs);
    } else {
      assert.equal(result.intro, seededOf(page).intro, `${page.page}: text without a refreshed body should be as seeded`);
      assert.deepEqual(result.faqs, seededOf(page).faqs);
    }
  }

  // Something that is not in the refresh passes through untouched.
  const stranger = { slug: "not-listed", intro: "i", deliverables: [], outcomes: [], faqs: [], seo: { title: "t", description: "d" } };
  assert.deepEqual(refresh.refreshServices([stranger]), [stranger]);
});

test("the code fallback reads through the refresh, and the seeded lists are not edited", () => {
  const index = text("lib/content/index.ts");
  assert.ok(index.includes('import { refreshBlogPosts, refreshServices } from "./copy-refresh";'));
  assert.ok(index.includes("const codeBlogs = refreshBlogPosts(codeBlogPosts);"));
  assert.ok(index.includes("return sortNewestFirst(codeBlogs);"));
  assert.ok(index.includes("return codeBlogs.find((post) => post.slug === slug) ?? null;"));
  assert.ok(index.includes("const codeServices = refreshServices(services);"));
  assert.ok(index.includes("return [...codeServices].sort((a, b) => a.order - b.order);"));
  assert.ok(index.includes("return codeServices.find((service) => service.slug === slug) ?? null;"));

  const subservices = text("lib/content/subservices.ts");
  assert.ok(subservices.includes('import { refreshSubservices } from "./copy-refresh";'));
  assert.match(subservices, /export const codeSubservices: SubService\[\] = refreshSubservices\(\s*normalizeSubservices\(/);

  // The generator for the seed reads the three lists directly, so it never sees the refreshed wording.
  assert.ok(!text("scripts/generate-resource-seed.mjs").includes("copy-refresh"));
});

/* ── The SQL ─────────────────────────────────────────────────────────────── */

test("the migration on disk is exactly what the generator makes from the content", async () => {
  const built = await buildCopyRefreshMigration();
  assert.equal(built.path, REFRESH_MIGRATION);
  assert.equal(text(built.path), built.sql, "run: node scripts/generate-copy-refresh-migration.mjs");
  assert.deepEqual(built.counts, { titles: 29, bodies: 4 });
});

test("the paste-ready script is the migration wrapped as one statement, committed, and made by the script", () => {
  const wrapper = text(REFRESH_APPLY);
  const payload = wrapper.match(/decode\('([A-Za-z0-9+/=]+)', 'base64'\)/);
  assert.ok(payload, "the wrapper has no base64 payload");
  const withoutTransactionLines = (sql) => sql.replace(/^[ \t]*(?:begin|commit)[ \t]*;[ \t]*(?:\r?\n|$)/gim, "");
  assert.equal(
    Buffer.from(payload[1], "base64").toString("utf8"),
    withoutTransactionLines(text(REFRESH_MIGRATION)),
    "wrapper and migration have drifted apart: node scripts/make-apply-blobs.mjs",
  );

  assert.match(text(".gitignore"), new RegExp(`^!${REFRESH_APPLY.replaceAll(".", "\\.")}$`, "m"), "the script must be committed");
  const blobs = text("scripts/make-apply-blobs.mjs");
  assert.ok(blobs.includes(REFRESH_APPLY));
  assert.ok(blobs.includes(REFRESH_MIGRATION));
});

test("the migration changes only wording, only where the seeded wording is still there, and says what to run first", () => {
  const raw = text(REFRESH_MIGRATION);
  const sql = code(raw);

  // It touches one kind of thing: the wording of existing rows.
  assert.doesNotMatch(sql, /\b(delete\s+from|insert\s+into|drop\s+table|truncate|alter\s+table\s+\S+\s+(add|drop)\s)/i);
  assert.equal((sql.match(/\bupdate public\.(services|sub_services|blog_posts)\b/g) ?? []).length, 33, "29 titles and 4 texts");
  const assigned = new Set([...sql.matchAll(/\n\s+(?:set\s+)?(\w+) = /g)].map((m) => m[1]));
  for (const column of ["seo_title", "intro", "deliverables", "outcomes", "faqs"]) assert.ok(assigned.has(column), column);
  for (const forbidden of ["status", "published_at", "name", "slug", "parent_slug", "seo_description", "tagline", "summary", "figure"]) {
    assert.doesNotMatch(sql, new RegExp(`\\bset\\s+${forbidden}\\s*=|,\\s*${forbidden}\\s*=\\s*'`), `the migration must not change ${forbidden}`);
  }

  // Every UPDATE is guarded by the seeded value, so an edit made in the admin is left alone.
  const updates = sql.split(/\bupdate public\./).slice(1);
  assert.equal(updates.length, 33);
  for (const update of updates) {
    // The last "where" on its own line: the text being written can itself contain the word.
    const where = update.slice(update.lastIndexOf("\n    where "), update.indexOf("get diagnostics"));
    if (update.includes("set seo_title")) assert.match(where, /and seo_title = '/, "a title update has no guard");
    else for (const column of ["intro", "deliverables", "outcomes", "faqs"]) assert.match(where, new RegExp(`and ${column} = `), `a text update is not guarded on ${column}`);
    assert.match(update, /get diagnostics changed = row_count;/, "a skipped row is not reported");
  }

  // Missing tables stop the run with the name of the script that creates them.
  assert.match(raw, /to_regclass\('public\.sub_services'\) is null or to_regclass\('public\.blog_posts'\) is null/);
  assert.match(raw, /Run supabase\/apply\/05-resource-modules\.sql first/);
  assert.match(raw, /Run supabase\/apply\/01-schema\.sql first/);

  // The audit trigger is switched off for the run only if it was on, and on again afterwards.
  assert.match(raw, /tgname = 'c_audit' and not tgisinternal and tgenabled = 'O'/);
  assert.equal((raw.match(/disable trigger c_audit/g) ?? []).length, 3);
  assert.equal((raw.match(/enable trigger c_audit/g) ?? []).length, 3, "the audit trigger is switched back on for all three tables");
});

test("the README and notes tell a person to run the script, and say what it changes", () => {
  const readme = text("README.md");
  assert.ok(readme.includes("supabase/apply/07-seo-audit-copy.sql"));
  assert.ok(text("notes/seo-audit.md").includes("07-seo-audit-copy.sql"));
});

/* ── One title per page, and articles that say so ────────────────────────── */

test("a page has one title for the tab, the search result and a shared link", () => {
  const metadata = text("lib/metadata.ts");
  assert.ok(metadata.includes('import { SITE_TITLE_SUFFIX } from "@/lib/seo/limits";'));
  assert.ok(metadata.includes("const fullTitle = absoluteTitle ?? `${title}${SITE_TITLE_SUFFIX}`;"));
  assert.equal((metadata.match(/title: fullTitle,/g) ?? []).length, 2, "og:title and twitter:title both use the one title");
  assert.doesNotMatch(metadata, /title: `\$\{title\} — Infeara Technologies`/, "the old, longer ending for the social title is back");
  assert.ok(metadata.includes("title: absoluteTitle ? { absolute: absoluteTitle } : title,"));

  // The home page sets its own whole title through the same function, and it fits.
  const home = text("app/page.tsx");
  const absolute = home.match(/absoluteTitle: "([^"]+)"/)?.[1];
  assert.ok(absolute, "the home page should name itself through pageMetadata({ absoluteTitle })");
  assert.ok(absolute.length <= limits.TITLE_MAX, `the home title is ${absolute.length} characters`);
  assert.match(absolute, /Chennai/);
  assert.doesNotMatch(home, /title: \{\s*absolute:/, "the home page must not override the title after pageMetadata");
});

test("guides and posts are marked as articles, with a day and an author", () => {
  const metadata = text("lib/metadata.ts");
  assert.ok(metadata.includes('type: "article",'));
  assert.ok(metadata.includes("publishedTime: indiaDateTime(article.publishedDay),"));
  assert.ok(metadata.includes("authors: [`${SITE_URL}/about`],"));
  assert.ok(metadata.includes('{ ...openGraphBase, type: "website" }'));

  for (const [path, day] of [
    ["app/insights/[slug]/page.tsx", "insight.publishedAt"],
    ["app/blogs/[slug]/page.tsx", "post.publishedAt"],
  ]) {
    const page = text(path);
    assert.ok(page.includes(`article: { publishedDay: ${day}, section:`), `${path} should pass article metadata`);
    assert.ok(page.includes("<ArticleByline"), `${path} should show the date and byline`);
  }
  // Nothing else is an article.
  for (const file of sourceFiles("app").filter((f) => f.endsWith("page.tsx") && !/(insights|blogs)\/\[slug\]/.test(f))) {
    assert.ok(!text(file).includes("article: {"), `${file} marks itself as an article`);
  }
});

test("the byline is the company, links to the About page, and shows the day the post was published", () => {
  const byline = text("components/site/ArticleByline.tsx");
  assert.ok(byline.includes("<time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time>"));
  assert.ok(byline.includes('href="/about"'));
  assert.ok(byline.includes('rel="author"'));
  assert.ok(byline.includes("Infeara Technologies"));
  // No invented people: the byline has no personal name in it.
  assert.doesNotMatch(byline, /\bBy\s+[A-Z][a-z]+\s+[A-Z][a-z]+/);
});

test("an insight dated at midnight in India shows that day, not the day before", () => {
  // The seeded insights are 2026-10-12, 2026-09-24 and 2026-08-30 at 00:00 +05:30, which is the evening before in UTC.
  assert.equal(dates.istDate("2026-10-12T00:00:00+05:30"), "2026-10-12");
  assert.equal(dates.istDate("2026-10-11T18:30:00+00:00"), "2026-10-12", "the way Postgres hands the same moment back");
  assert.equal(dates.istDate("2026-10-11T18:29:59Z"), "2026-10-11");
  assert.equal(dates.istDate("2026-12-31T20:00:00Z"), "2027-01-01", "across a year end");
  assert.equal(dates.istDate(null), null);
  assert.equal(dates.istDate("not a date"), null);

  const queries = text("lib/content/queries.ts");
  assert.ok(queries.includes('import { istDate } from "./dates";'));
  assert.ok(queries.includes('publishedAt: istDate(row.published_at) ?? "2026-01-01",'), "toInsight must use the India day");
  assert.doesNotMatch(queries, /dateOnly|\.slice\(0, 10\)\)?\s*:\s*"2026-01-01"/, "the UTC slice is back");
});

test("the Article data for a guide has the same dates and shape as a blog post, with an image", () => {
  const article = schema.articleSchema({
    siteUrl: "https://www.infeara.com",
    path: "/insights/what-managed-it-actually-covers",
    headline: "What managed IT actually covers",
    description: "d",
    category: "Managed services",
    publishedAt: "2026-10-12",
    imagePath: "/site/server-room.jpg",
  });
  assert.equal(article["@type"], "Article");
  assert.equal(article.datePublished, "2026-10-12T00:00:00+05:30");
  assert.equal(article.dateModified, article.datePublished);
  assert.deepEqual(article.image, ["https://www.infeara.com/site/server-room.jpg"]);
  assert.equal(article.url, "https://www.infeara.com/insights/what-managed-it-actually-covers");
  assert.equal(article.mainEntityOfPage["@id"], article.url);
  assert.deepEqual(article.author, { "@type": "Organization", name: "Infeara Technologies", url: "https://www.infeara.com/" });

  const post = schema.blogPostingSchema({
    siteUrl: "https://www.infeara.com",
    slug: "x",
    headline: "h",
    description: "d",
    category: "c",
    publishedAt: "2026-11-11",
    imagePath: "/a.jpg",
  });
  assert.equal(post["@type"], "BlogPosting");
  assert.equal(post.url, "https://www.infeara.com/blogs/x");
  assert.ok(text("app/insights/[slug]/page.tsx").includes("articleSchema({"), "the guide page should use the shared Article data");
  assert.doesNotMatch(text("app/insights/[slug]/page.tsx"), /datePublished: insight\.publishedAt/);
});

/* ── Skip link ───────────────────────────────────────────────────────────── */

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

test("every public page has a skip link ahead of the menu, including the home page and the 404 page", () => {
  const skip = text("components/site/SkipLink.tsx");
  assert.ok(skip.includes('href="#main"'));
  assert.ok(skip.includes("Skip to main content"));

  const frame = text("components/site/PageFrame.tsx");
  assert.ok(frame.indexOf("<SkipLink />") > -1 && frame.indexOf("<SkipLink />") < frame.indexOf("<Header />"));

  // Any public file that builds its own <main id="main"> must place the link itself, before its header.
  const own = [...sourceFiles("app"), ...sourceFiles("components")].filter(
    (file) => !file.startsWith("app/admin") && !file.startsWith("components/admin") && text(file).includes('<main id="main"'),
  );
  assert.deepEqual(own.sort(), ["app/not-found.tsx", "app/page.tsx", "components/site/PageFrame.tsx"].sort());
  for (const file of own) {
    const source = text(file);
    assert.ok(source.includes("<SkipLink />"), `${file} has a main landmark but no skip link`);
    assert.ok(source.indexOf("<SkipLink />") < source.indexOf("<Header"), `${file}: the skip link must come before the header`);
  }
});

/* ── The home page ───────────────────────────────────────────────────────── */

test("the home page's opening says what the company does, where, and for whom", () => {
  const home = text("app/page.tsx");
  const lead = home.match(/Managed IT services from Chennai for organisations across India[^<]+/)?.[0];
  assert.ok(lead, "the line under the heading should say 'Managed IT services from Chennai for organisations across India'");
  assert.match(lead, /cybersecurity/);
  assert.ok(home.includes("<h1"), "the home page keeps its one h1");
});

/* ── The picture for a shared link ───────────────────────────────────────── */

test("the pages that have a card of their own, and the address of each card", () => {
  const target = ogPaths.cardTargetForPath;
  assert.deepEqual(target("/services/managed-it"), { kind: "service", slug: "managed-it" });
  assert.deepEqual(target("/services/cybersecurity"), { kind: "service", slug: "cybersecurity" });
  assert.deepEqual(target("/services/cybersecurity/penetration-testing"), { kind: "subservice", parent: "cybersecurity", slug: "penetration-testing" });
  assert.deepEqual(target("/services/cloud-datacenter/cloud-disaster-recovery-business-continuity"), {
    kind: "subservice",
    parent: "cloud-datacenter",
    slug: "cloud-disaster-recovery-business-continuity",
  });
  assert.deepEqual(target("/insights/a-backup-is-not-a-recovery-plan"), { kind: "insight", slug: "a-backup-is-not-a-recovery-plan" });
  assert.deepEqual(target("/blogs/top-10-managed-it-services-companies-in-chennai"), { kind: "blog", slug: "top-10-managed-it-services-companies-in-chennai" });
  assert.deepEqual(target("/case-studies/taking-over-an-undocumented-server-estate"), { kind: "case-study", slug: "taking-over-an-undocumented-server-estate" });
  assert.deepEqual(target("/industries/healthcare"), { kind: "industry", slug: "healthcare" });

  // Pages without a card keep the shared one; shapes that are not pages have none either.
  for (const path of ["/", "/about", "/services", "/insights", "/blogs", "/contact", "/services/managed-it/x", "/services/not-a-parent/x", "/services/Managed-IT", "/blogs/a/b", "/white-papers/x", "/legal/terms", "//", "", "/services//x", "/services/a_b"]) {
    assert.equal(target(path), null, path);
  }

  assert.equal(ogPaths.ogCardPath("/services/managed-it"), "/og/services/managed-it.png");
  assert.equal(ogPaths.ogCardPath("/services/cybersecurity/penetration-testing"), "/og/services/cybersecurity/penetration-testing.png");
  assert.equal(ogPaths.ogCardPath("/about"), null);
  assert.equal(ogPaths.ogCardPath("/"), null);
});

test("an address in /og leads back to its page, and anything else is refused", () => {
  const seg = ogPaths.cardTargetForSegments;
  assert.deepEqual(seg(["services", "managed-it.png"]), { kind: "service", slug: "managed-it" });
  assert.deepEqual(seg(["services", "cybersecurity", "penetration-testing.png"]), { kind: "subservice", parent: "cybersecurity", slug: "penetration-testing" });

  for (const segments of [[], ["services", "managed-it"], ["services", "managed-it.jpg"], ["..", "x.png"], ["services", "..png"], ["services", "%2e%2e.png"], ["services", "a b.png"], ["about.png"], ["services", "a", "b", "c.png"], ["admin", "x.png"], ["services", "x.png.png"]]) {
    assert.equal(seg(segments), null, JSON.stringify(segments));
  }

  // The address pageMetadata uses is the address the route understands, for every kind of page.
  for (const path of ["/services/managed-it", "/services/ai-automations/llm-development", "/insights/x-y", "/blogs/x", "/case-studies/x", "/industries/education"]) {
    const address = ogPaths.ogCardPath(path);
    assert.ok(address.startsWith("/og/") && address.endsWith(".png"), address);
    assert.deepEqual(seg(address.split("/").slice(2)), ogPaths.cardTargetForPath(path), path);
  }
});

test("a card's title is cut to fit and sized to the room it has", () => {
  const fit = ogPaths.fitCardTitle;
  assert.deepEqual(fit("Penetration Testing"), { text: "Penetration Testing", fontSize: 88 });
  assert.equal(fit("  Managed   IT \n Services ").text, "Managed IT Services", "whitespace collapses");
  assert.equal(fit("x".repeat(30)).fontSize, 76);
  assert.equal(fit("x".repeat(50)).fontSize, 64);
  assert.equal(fit("x".repeat(70)).fontSize, 54);
  assert.equal(fit("word ".repeat(40)).fontSize, 46);

  const long = fit("A very long title that keeps going ".repeat(8));
  assert.ok(long.text.length <= ogPaths.CARD_TITLE_MAX, `${long.text.length} characters`);
  assert.ok(long.text.endsWith("…"));
  assert.ok(!/\s…$/.test(long.text), "no space before the ellipsis");
});

test("every card page asks for its card, and a page's own picture can still be set", () => {
  const metadata = text("lib/metadata.ts");
  assert.ok(metadata.includes('import { ogCardPath } from "@/lib/seo/og-paths";'));
  assert.ok(metadata.includes("const card = ogImage ?? ogCardPath(path);"));
  assert.ok(metadata.includes("const image = card ?? SHARED_OG_IMAGE;"));
  assert.ok(metadata.includes('const SHARED_OG_IMAGE = "/brand/og-image.png";'));
  assert.ok(existsSync(here("../public/brand/og-image.png")), "the shared card must exist for every other page");

  // site and locale are still repeated in the Open Graph block (a page's openGraph replaces the layout's).
  assert.ok(metadata.includes("siteName: site.name,"));
  assert.ok(metadata.includes("locale: site.locale,"));

  // No page names an image of its own by hand: they all go through the one rule.
  for (const file of sourceFiles("app").filter((f) => f.endsWith("page.tsx"))) {
    assert.ok(!/ogImage:/.test(text(file)), `${file} sets its own picture`);
  }
});

test("the card route draws only pages that exist, with the fonts it was given", () => {
  const route = text("app/og/[...path]/route.tsx");
  assert.ok(route.includes("cardTargetForSegments(path)"));
  assert.ok(route.includes("if (!target) return notFound();"));
  assert.ok(route.includes("if (!content) return notFound();"), "an unpublished or unknown page has no picture");
  for (const read of ["getService(", "getSubservice(", "getInsight(", "getBlogPost(", "getCaseStudy(", "getIndustry("]) {
    assert.ok(route.includes(read), `the route should read the page through ${read}…)`);
  }
  assert.doesNotMatch(route, /searchParams|request\.url|\.get\("title"\)/, "the picture must not print text taken from the request");
  assert.match(route, /Cache-Control|CACHE_CONTROL/);

  // /og is outside /api, which answers with a noindex header, and robots.txt blocks nothing on an open
  // site: a crawler that follows robots can fetch the picture.
  assert.ok(!existsSync(here("../app/api/og")));
  assert.ok(text("app/robots.ts").includes('rules: [{ userAgent: "*", allow: "/" }]'));

  // The renderer reads ttf, otf and woff, not woff2, so the faces are woff files, shipped with their licence.
  for (const weight of [500, 700, 800]) assert.ok(existsSync(here(`../assets/og/manrope-latin-${weight}-normal.woff`)), `weight ${weight}`);
  assert.ok(existsSync(here("../assets/og/Manrope-OFL.txt")));
  assert.match(text("assets/og/Manrope-OFL.txt"), /SIL OPEN FONT LICENSE/);
  const card = text("lib/seo/og-card.tsx");
  assert.doesNotMatch(card, /\.woff2/);
  assert.ok(card.includes("export const CARD_SIZE = { width: 1200, height: 630 } as const;"));
  assert.doesNotMatch(card, /display:\s*"grid"/, "the renderer supports flexbox only");

  // The synced copies are the ones the sync script makes.
  const sync = text("scripts/sync-fonts.mjs");
  assert.ok(sync.includes("manrope-latin-500-normal.woff") && sync.includes("manrope-latin-800-normal.woff"));
  assert.match(text("package.json"), /"@fontsource\/manrope": "\^?5\./);
});

/* ── /llms.txt ───────────────────────────────────────────────────────────── */

test("llms.txt is plain text: a name, a summary, the facts, then pages with a line about each", () => {
  const out = llms.buildLlmsTxt({
    name: "Acme",
    summary: "  Does\nthings   well. ",
    details: ["Based in Chennai.", "Ask on the form."],
    sections: [
      { title: "Pages", links: [{ title: "A [x]", url: "https://e.com/a b", description: "one\n  two" }, { title: "B", url: "https://e.com/b" }] },
      { title: "Empty", links: [] },
    ],
  });
  assert.equal(
    out,
    "# Acme\n\n> Does things well.\n\nBased in Chennai.\n\nAsk on the form.\n\n## Pages\n\n- [A x](https://e.com/a%20b): one two\n- [B](https://e.com/b)\n",
  );
  assert.ok(!out.includes("## Empty"), "an empty section is left out");
  assert.ok(out.endsWith("\n") && !out.endsWith("\n\n"));

  const long = llms.oneLine("word ".repeat(100), 50);
  assert.ok(long.length <= 50 && long.endsWith("…"), long);
});

test("the llms.txt route lists what the site publishes, says nothing the pages do not, and follows the launch gate", () => {
  const route = text("app/llms.txt/route.ts");
  assert.ok(route.includes("export const revalidate = 300;"), "a literal, so it can be read at build time");
  assert.ok(route.includes("if (!SITE_INDEXABLE) return new Response(\"Not found\", { status: 404 });"));
  assert.ok(route.includes('"Content-Type": "text/plain; charset=utf-8"'));
  for (const list of ["listServices()", "listSubservices()", "listInsights()", "listBlogPosts()", "listCaseStudies()", "listIndustries()"]) {
    assert.ok(route.includes(list), `llms.txt should list ${list}`);
  }
  // The site publishes no mailbox or phone number, and no social profile, so this file does not either.
  assert.doesNotMatch(route, /mailto:|@infeara|tel:|linkedin|github\.com|\+91/i);
  assert.doesNotMatch(text("lib/seo/llms.ts"), /mailto:|@infeara|tel:|linkedin|\+91/i);
});

/* ── The shared checks that must keep passing ────────────────────────────── */

test("the title budget is unchanged: 60 characters with the site name, 50 for the editor", () => {
  assert.equal(limits.TITLE_MAX, 60);
  assert.equal(limits.TITLE_ROOM, 50);
  assert.equal(limits.SITE_TITLE_SUFFIX, " — Infeara");
});
