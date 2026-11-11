// Unit tests for "Top 10 Managed IT Services Companies in Chennai": the one post on the blog
// that is a list of other companies, and so the one held to rules a guide is not.
//
//   npm run test:unit
//
// The rules came with the request, and each is checked here so that a later edit (in code, or
// copied from the admin into code) cannot quietly undo one:
//
//   * ten companies, each with a description, services, a location and an official website link;
//   * chosen by published criteria, listed alphabetically, with no ranking claimed;
//   * Infeara is one of the ten only because it meets the same criteria, and says so;
//   * a separate Infeara service call to action with an enquiry link, apart from the list;
//   * Article and BreadcrumbList structured data;
//   * one page for the keyword, not several near-identical lists;
//   * the SQL that adds the post to a database matches the content, and is safe to run twice.
//
// No build, no server, no Supabase. The TypeScript modules here import nothing, so they are
// compiled in memory with the project's own TypeScript and loaded from data: URLs.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { BLOG_MIGRATIONS, buildBlogMigrations } from "../scripts/generate-blog-migrations.mjs";

const here = (path) => new URL(path, import.meta.url);
const text = (path) => readFileSync(here(path), "utf8");

async function load(path) {
  const { outputText } = ts.transpileModule(text(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const blogs = await load("../lib/content/blogs.ts");
const schema = await load("../lib/seo/schema.ts");
const validation = await load("../lib/admin/resource-validation.ts");
const site = await load("../lib/content/site.ts");

const SLUG = "top-10-managed-it-services-companies-in-chennai";
const post = blogs.laterBlogPosts.find((p) => p.slug === SLUG);
const SITE = "https://www.infeara.com";
const SOURCES = "../notes/chennai-managed-it-sources.md";

/** The ten entries of the list section: a "### Name" line, one description, three labelled bullets. */
function entriesOf(p) {
  const section = p.body.find((s) => /^Ten managed IT services companies/.test(s.heading));
  assert.ok(section, "the list section is missing");
  const entries = [];
  for (const line of section.paragraphs) {
    if (line.startsWith("### ")) {
      entries.push({ name: line.slice(4).trim(), description: [], bullets: {} });
      continue;
    }
    const entry = entries[entries.length - 1];
    if (!entry) continue; // the sentence that introduces the list
    const bullet = line.match(/^- \*\*([^:*]+):\*\* (.+)$/);
    if (bullet) entry.bullets[bullet[1]] = bullet[2];
    else entry.description.push(line);
  }
  return entries;
}

const everyWord = (p) =>
  [p.title, p.excerpt, p.seo.title, p.seo.description, ...p.body.flatMap((s) => [s.heading, ...s.paragraphs.map(blogs.plainBlogText)])].join("\n");

const navHrefs = (items = site.nav) => items.flatMap((item) => [item.href, ...(item.children ? navHrefs(item.children) : [])]);

/* ── The post exists, and is later than the starter posts ──────────────────── */

test("the post is in laterBlogPosts, published on the day it was written, after the starter posts", () => {
  assert.ok(post, `no later post with the slug ${SLUG}`);
  assert.equal(post.title, "Top 10 Managed IT Services Companies in Chennai");
  assert.match(post.publishedAt, /^2026-11-11$/);
  for (const starter of blogs.starterBlogPosts) assert.ok(post.publishedAt > starter.publishedAt, starter.slug);
  assert.equal(blogs.getBlogPost(SLUG), post, "the code fallback must be able to find it");
  assert.equal(blogs.listBlogPosts()[0].slug, SLUG, "newest first: it leads the blog");
});

/* ── Ten companies, each with the four things asked for ────────────────────── */

test("ten companies are listed, each with a description, services, a location and a website", () => {
  const entries = entriesOf(post);
  assert.equal(entries.length, 10);
  for (const entry of entries) {
    assert.equal(entry.description.length, 1, `${entry.name}: exactly one description paragraph`);
    assert.ok(entry.description[0].length >= 120 && entry.description[0].length <= 520, `${entry.name}: description is ${entry.description[0].length} characters`);
    assert.deepEqual(Object.keys(entry.bullets), ["Services", "Location", "Official website"], `${entry.name}: the three labelled lines, in order`);
    assert.ok(entry.bullets.Services.length >= 40, `${entry.name}: services are too thin`);
    assert.match(entry.bullets.Location, /Chennai/, `${entry.name}: the location must name Chennai`);
  }
});

test("each official website is one https address on the company's own domain, with nothing tacked on", () => {
  const seen = new Set();
  for (const entry of entriesOf(post)) {
    const match = entry.bullets["Official website"].match(/^\[([a-z0-9.-]+)\]\((https:\/\/[^)\s]+)\)$/);
    assert.ok(match, `${entry.name}: the website line must be exactly one [domain](https://…) link`);
    const [, label, href] = match;
    const url = new URL(href);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname.replace(/^www\./, ""), label.replace(/^www\./, ""), `${entry.name}: the link text must be the domain it goes to`);
    assert.equal(url.search, "", `${entry.name}: no tracking parameters`);
    assert.equal(url.hash, "");
    assert.equal(url.pathname, "/", `${entry.name}: link to the home page, which is the address that stays put`);
    assert.doesNotMatch(url.hostname, /^(bit\.ly|t\.co|goo\.gl|tinyurl\.com|lnkd\.in)$/, "no link shorteners");
    assert.ok(!seen.has(url.hostname), `${url.hostname} is listed twice`);
    seen.add(url.hostname);
  }
  assert.equal(seen.size, 10);
});

test("the companies are in alphabetical order, so position cannot be read as a rank", () => {
  const names = entriesOf(post).map((e) => e.name);
  const sorted = [...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), "en"));
  assert.deepEqual(names, sorted);
  assert.equal(new Set(names.map((n) => n.toLowerCase())).size, 10, "a company appears twice");
  assert.match(post.body[0].paragraphs.join(" "), /alphabetical order, so position means nothing/);
});

/* ── The criteria are published, and they are the same for everyone ────────── */

test("five criteria are published, and the first one is the one every company is held to: a Chennai head office", () => {
  const section = post.body.find((s) => s.heading === "The criteria we used");
  assert.ok(section);
  const criteria = section.paragraphs.filter((line) => line.startsWith("- "));
  assert.equal(criteria.length, 5);
  assert.match(criteria[0], /^- \*\*Chennai headquarters\.\*\*/);
  assert.match(criteria[1], /^- \*\*Managed IT as a service line\.\*\*/);
  assert.match(section.paragraphs.join(" "), /did not use revenue, staff numbers, awards, reviews or advertising/);
});

test("every entry follows from the criteria: Chennai is where the company is based, and its entry says what it does", () => {
  for (const entry of entriesOf(post)) {
    const written = `${entry.description[0]} ${entry.bullets.Location}`;
    assert.match(written, /Chennai/, `${entry.name} does not say it is in Chennai`);
    assert.match(`${entry.description[0]} ${entry.bullets.Services}`, /managed|infrastructure|support|operation|monitor/i, `${entry.name} does not describe managed IT`);
  }
});

/* ── No claim the page cannot back ─────────────────────────────────────────── */

test("nothing on the page claims a rank, or calls a company the best, the leader or the number one", () => {
  const written = everyWord(post);
  for (const pattern of [/\bbest\b/i, /\bleading\b/i, /\bleader\b/i, /#\s?1\b/, /\bnumber (one|1)\b/i, /\btop[- ]rated\b/i, /\bfinest\b/i, /\bpremier\b/i, /\bunmatched\b/i, /\bworld[- ]class\b/i, /\baward[- ]winning\b/i, /\bmost trusted\b/i]) {
    assert.doesNotMatch(written, pattern, `the page uses ${pattern}`);
  }
  // The words "rank" and "ranking" appear only to say there is none.
  const sentences = written.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences.filter((s) => /\brank(ed|ing|s)?\b/i.test(s))) {
    assert.match(sentence, /\b(not|no|never|without|nor)\b/i, `a sentence talks about ranking without denying it: ${sentence}`);
  }
});

test("the page says it is a shortlist to check, and says which day the facts were checked", () => {
  const first = post.body[0].paragraphs.join(" ");
  assert.match(first, /not a league table/);
  assert.match(first, /shortlist to check for yourself/);
  assert.match(first, /comes from its own website, or from its owner's announcement where the entry says so, and was checked on 11 November 2026/);
  const checked = post.body.find((s) => s.heading === "How this list is kept accurate").paragraphs.join(" ");
  assert.ok(checked.includes(blogs.formatPostDate(post.publishedAt)), "the date the details were checked is the date the post carries");
  assert.match(checked, /not an endorsement/);
});

test("the figures and claims in the entries come from the companies, and the page says so in each one", () => {
  // Each entry attributes what it reports ("says", "describes", "lists", "its website"), so none
  // reads as Infeara's own claim about someone else. Infeara's own entry describes itself.
  for (const entry of entriesOf(post).filter((e) => !/^Infeara/.test(e.name))) {
    assert.match(entry.description[0], /\b(says|describes|describe|lists|its website|its site|gives|announcement|calls itself|headquartered)\b/i, `${entry.name}: the description does not attribute its claims`);
  }
});

/* ── Infeara: in the list only because it qualifies, and it says so ───────── */

test("Infeara is one of the ten, written like the others, with the publisher's interest declared", () => {
  const infeara = entriesOf(post).find((e) => e.name === "Infeara Technologies");
  assert.ok(infeara, "Infeara is not in the list");
  assert.match(infeara.description[0], /publisher of this guide/);
  assert.match(infeara.bullets.Location, /^Chennai/);
  assert.match(infeara.bullets["Official website"], /\(https:\/\/www\.infeara\.com\/\)/);
  assert.match(infeara.bullets.Services, /^Managed IT/);
  const disclosure = post.body[0].paragraphs.join(" ");
  assert.match(disclosure, /Infeara Technologies publishes this guide and is one of the ten, because it meets the same criteria as the others/);
  assert.match(disclosure, /check it against Infeara's own website, not against this page/);
});

test("Infeara's entry says only what Infeara's own pages say: no certification, client or figure it does not show", () => {
  const infeara = entriesOf(post).find((e) => e.name === "Infeara Technologies");
  const written = [infeara.description[0], ...Object.values(infeara.bullets)].join(" ");
  // lib/content/faqs.ts: "We do not display certifications or attestations that are not current and verifiable."
  assert.doesNotMatch(written, /\b(ISO|SOC ?2|certified|accredited|CMMI)\b/i);
  assert.doesNotMatch(written, /\b(clients?|customers?) (include|such as)\b/i);
  assert.doesNotMatch(written, /\d/, "Infeara's entry carries no number");
  const faqs = text("../lib/content/faqs.ts");
  assert.match(faqs, /Managed IT is our primary practice/, "the entry says managed IT is the primary practice, so the site must too");
  assert.match(faqs, /small, technical company|based in Chennai/);
  assert.match(text("../app/careers/page.tsx"), /small, technical company in Chennai/, "the entry calls Infeara small, and its own site does");
});

/* ── A separate Infeara call to action, with an enquiry link ──────────────── */

test("the Infeara service call to action is its own section, after the list, with a service link and an enquiry link", () => {
  const index = post.body.findIndex((s) => /^Talk to Infeara/.test(s.heading));
  assert.equal(index, post.body.length - 1, "it comes last");
  const list = post.body.findIndex((s) => /^Ten managed IT services companies/.test(s.heading));
  assert.ok(index > list, "after the list, not inside it");

  const lines = post.body[index].paragraphs;
  const links = lines.flatMap((line) => blogs.parseBlogInline(line)).filter((node) => node.type === "link");
  assert.deepEqual(links.map((l) => l.href), ["/services/managed-it", "/contact"]);
  assert.ok(links.every((l) => !l.external));
  assert.match(lines.join(" "), /the publisher's own service enquiry\. It is separate from the list above/);

  // The list itself holds no call to action: its only links are the ten official websites.
  const listLinks = post.body[list].paragraphs.flatMap((line) => blogs.parseBlogInline(line)).filter((n) => n.type === "link");
  assert.equal(listLinks.length, 10);
  assert.ok(listLinks.every((l) => l.external), "an internal link inside the list would be a call to action in it");
});

test("the buttons under the post lead with Infeara's managed IT page, and every one is a real page in the menu", () => {
  assert.equal(post.relatedServices[0].href, "/services/managed-it");
  const known = new Set(navHrefs());
  for (const link of post.relatedServices) assert.ok(known.has(link.href), `${link.href} is not in the navigation`);
  // The page's own call to action band (app/blogs/[slug]/page.tsx) sends people to the enquiry form.
  assert.match(text("../app/blogs/[slug]/page.tsx"), /primary=\{\{ label: "Talk to an expert", href: "\/contact" \}\}/);
});

test("the post links to the guide it builds on, which exists", () => {
  const targets = post.body.flatMap((s) => s.paragraphs).flatMap((l) => blogs.parseBlogInline(l)).filter((n) => n.type === "link" && !n.external).map((n) => n.href);
  assert.ok(targets.includes("/insights/what-managed-it-actually-covers"));
  assert.match(text("../lib/content/insights.ts"), /what-managed-it-actually-covers/);
});

/* ── One page for the keyword ─────────────────────────────────────────────── */

const FILLER = new Set("top best leading list guide the a an in of for and to with how what which companies company providers provider services service firms firm vs your you".split(" "));

/** The words that say what a post is about, with the filler that makes one list look different from another taken out. */
function topicWords(title) {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((word) => word && !/^\d+$/.test(word) && !FILLER.has(word)),
  );
}

/** Pairs of posts whose subjects overlap so much that they would compete for the same search. */
function nearDuplicates(posts) {
  const pairs = [];
  for (let i = 0; i < posts.length; i += 1) {
    for (let j = i + 1; j < posts.length; j += 1) {
      const a = topicWords(posts[i].title);
      const b = topicWords(posts[j].title);
      const overlap = [...a].filter((word) => b.has(word)).length;
      if (overlap / Math.max(1, Math.min(a.size, b.size)) >= 0.75) pairs.push([posts[i].slug, posts[j].slug]);
    }
  }
  return pairs;
}

test("there is one list for this keyword, and no two shipped posts compete for the same search", () => {
  const chennaiManagedIt = blogs.blogPosts.filter((p) => /managed-it/.test(p.slug) && /chennai/.test(p.slug));
  assert.deepEqual(chennaiManagedIt.map((p) => p.slug), [SLUG]);
  assert.deepEqual(nearDuplicates(blogs.blogPosts), []);
  // The page is its own canonical address, so a copy at another address would be flagged as one.
  assert.match(text("../lib/metadata.ts"), /alternates: \{ canonical: path \}/);
});

test("the duplicate check itself works: it flags a second list for the same search, and leaves different subjects alone", () => {
  const copy = { slug: "best-managed-it-service-providers-in-chennai", title: "Best Managed IT Service Providers in Chennai" };
  assert.deepEqual(nearDuplicates([post, copy]), [[SLUG, copy.slug]]);
  const reworded = { slug: "x", title: "Chennai's 12 Top IT Managed Services Firms" };
  assert.equal(nearDuplicates([post, reworded]).length, 1);
  const different = { slug: "y", title: "Managed IT or in-house IT? How to decide" };
  assert.deepEqual(nearDuplicates([post, different]), []);
});

test("the blog editor tells an editor to update a post on the same subject instead of adding another", () => {
  assert.match(text("../app/admin/(dashboard)/blogs/[id]/page.tsx"), /One page per topic: if a post on this subject already exists, update it instead of publishing another version of the same list\./);
});

/* ── Structured data: BlogPosting (an Article) and BreadcrumbList ─────────── */

const posting = () =>
  schema.blogPostingSchema({
    siteUrl: SITE,
    slug: post.slug,
    headline: post.title,
    description: post.seo.description,
    category: post.category,
    publishedAt: post.publishedAt,
    imagePath: "/site/noc-monitoring.jpg",
  });

test("the Article data names the post, its dates, author, publisher, picture and address", () => {
  const data = posting();
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "BlogPosting", "BlogPosting is schema.org's Article subtype for blog posts");
  assert.equal(data.headline, "Top 10 Managed IT Services Companies in Chennai");
  assert.ok(data.headline.length <= 110, "search engines show at most 110 characters of a headline");
  assert.equal(data.description, post.seo.description);
  assert.deepEqual(data.image, [`${SITE}/site/noc-monitoring.jpg`]);
  assert.equal(data.articleSection, "Managed IT");
  assert.equal(data.datePublished, "2026-11-11T00:00:00+05:30");
  assert.equal(data.dateModified, data.datePublished);
  assert.deepEqual(data.author, { "@type": "Organization", name: "Infeara Technologies", url: `${SITE}/` });
  assert.equal(data.publisher["@type"], "Organization");
  assert.equal(data.publisher.name, "Infeara Technologies");
  assert.equal(data.publisher.logo.url, `${SITE}/brand/infeara-logo.png`);
  assert.equal(data.mainEntityOfPage["@id"], `${SITE}/blogs/${SLUG}`);
  assert.equal(data.url, `${SITE}/blogs/${SLUG}`);
  assert.equal(data.inLanguage, "en-IN");
  assert.ok(!Number.isNaN(Date.parse(data.datePublished)), "the date must parse");
});

test("the breadcrumb data is Home, Blogs, then the post, numbered from 1, with absolute addresses", () => {
  const data = schema.breadcrumbListSchema(SITE, [
    { label: "Blogs", href: "/blogs" },
    { label: post.title, href: `/blogs/${post.slug}` },
  ]);
  assert.equal(data["@type"], "BreadcrumbList");
  assert.deepEqual(
    data.itemListElement.map((i) => [i.position, i.name, i.item]),
    [
      [1, "Home", `${SITE}/`],
      [2, "Blogs", `${SITE}/blogs`],
      [3, post.title, `${SITE}/blogs/${SLUG}`],
    ],
  );
  for (const item of data.itemListElement) {
    assert.equal(item["@type"], "ListItem");
    assert.match(item.item, /^https:\/\//, "a relative address is rejected by strict validators");
  }
  assert.equal(schema.absoluteUrl(`${SITE}/`, "/blogs"), `${SITE}/blogs`, "a trailing slash on the site address does not double up");
  assert.equal(schema.absoluteUrl(SITE, "https://other.example/x"), "https://other.example/x");
});

test("JSON-LD is written so that text inside it cannot close the script tag", () => {
  const hostile = { headline: 'a </script><img src=x onerror="alert(1)"> b', note: "<!-- -->" };
  const written = schema.serializeJsonLd(hostile);
  assert.ok(!written.includes("<"), "no raw < may reach the page");
  assert.deepEqual(JSON.parse(written), hostile, "a reader of the JSON gets the original text back");
});

test("the post page, the breadcrumb and the script tag all use those builders", () => {
  const page = text("../app/blogs/[slug]/page.tsx");
  assert.match(page, /blogPostingSchema\(\{/);
  assert.match(page, /breadcrumbSchema\(crumbs\)/);
  assert.match(page, /imagePath: figureImage\(post\.figureSeed\)\.src/);
  assert.doesNotMatch(page, /function postSchema/, "the old inline schema, with no image, is gone");
  assert.match(text("../components/site/Breadcrumbs.tsx"), /breadcrumbListSchema\(SITE_URL, items\)/);
  assert.match(text("../components/seo/JsonLd.tsx"), /serializeJsonLd\(data\)/);
});

/* ── Links inside a post: safe to render, safe to save ─────────────────────── */

test("the body is rendered as elements, never inserted as HTML, and outside links open safely", () => {
  const body = text("../components/site/BlogBody.tsx");
  assert.doesNotMatch(body, /dangerouslySetInnerHTML/);
  assert.match(body, /target="_blank" rel="noopener noreferrer"/);
  assert.match(body, /\(opens in a new tab\)/, "a link that opens a new tab says so to a screen reader");
  assert.match(body, /node\.external \?/, "only outside links open a new tab; a page on this site is a normal link");
  assert.match(text("../app/blogs/[slug]/page.tsx"), /<BlogBody paragraphs=\{section\.paragraphs\} \/>/);
});

test("saving a post refuses a link address that is not allowed, with plain wording", () => {
  const actions = text("../lib/admin/resource-actions.ts");
  const save = actions.slice(actions.indexOf("export async function saveBlog"), actions.indexOf("export async function deleteBlog"));
  assert.match(
    save,
    /const linkProblem = blogLinkProblem\(unsafeBlogLinks\(body\.flatMap\(\(section\) => section\.paragraphs\)\)\);\n\s+if \(linkProblem\) return \{ error: linkProblem \};/,
    "the problem must be computed and then returned, not only computed",
  );
  assert.ok(save.indexOf("blogLinkProblem(") < save.indexOf('commit("blog_posts", id, id ? payload'), "a bad link is refused before anything is written");
  assert.equal(validation.blogLinkProblem([]), null);
  const message = validation.blogLinkProblem(["javascript:alert(1)", "www.a.example"]);
  assert.match(message, /javascript:alert\(1\)/);
  assert.match(message, /cannot be used as a link/);
  assert.match(message, /https:\/\/ or http:\/\//);
  assert.ok(validation.blogLinkProblem(["x".repeat(300)]).length < 400, "a long address is cut, not echoed in full");
  // The admin and the page agree on what a link may be.
  for (const address of ["https://a.example/", "/contact", "//evil.example", "javascript:x", "www.a.example"]) {
    const refused = blogs.unsafeBlogLinks([`[t](${address})`]).length === 1;
    assert.equal(refused, !(validation.isHttpUrl(address) || validation.isInternalPath(address)), `the page and the admin disagree about ${address}`);
  }
});

test("the editor explains the four conventions where the body is typed", () => {
  const editor = text("../app/admin/(dashboard)/blogs/[id]/page.tsx");
  for (const phrase of ["“- ” for a bullet", "“### ” for a sub-heading", "[text](https://example.com) for a link", "**text** for bold"]) {
    assert.ok(editor.includes(phrase), `the Body panel does not explain: ${phrase}`);
  }
});

/* ── The SQL that adds the post ───────────────────────────────────────────── */

const withoutTransactionLines = (sql) => sql.replace(/^[ \t]*(?:begin|commit)[ \t]*;[ \t]*(?:\r?\n|$)/gim, "");
/** The statements with comments and quoted text removed, so prose cannot be mistaken for SQL. */
const code = (sql) => sql.replace(/--.*$/gm, "").replace(/'(?:[^']|'')*'/g, "''");

test("every later post has a migration and a paste-ready script, and every entry belongs to a later post", () => {
  assert.deepEqual(
    BLOG_MIGRATIONS.map((entry) => entry.slug).sort(),
    blogs.laterBlogPosts.map((p) => p.slug).sort(),
    "add the post to BLOG_MIGRATIONS in scripts/generate-blog-migrations.mjs",
  );
  for (const entry of BLOG_MIGRATIONS) {
    assert.ok(existsSync(here(`../${entry.migration}`)), entry.migration);
    assert.ok(existsSync(here(`../${entry.apply}`)), entry.apply);
  }
});

test("the migration on disk is exactly what the generator makes from the content", async () => {
  for (const built of await buildBlogMigrations()) {
    assert.equal(text(`../${built.migration}`), built.sql, "run: node scripts/generate-blog-migrations.mjs");
  }
});

test("the paste-ready file is the migration wrapped as one statement, committed, and made by the script", () => {
  const entry = BLOG_MIGRATIONS[0];
  const wrapper = text(`../${entry.apply}`);
  const payload = wrapper.match(/decode\('([A-Za-z0-9+/=]+)', 'base64'\)/);
  assert.ok(payload, "the wrapper holds the SQL as base64");
  assert.equal(Buffer.from(payload[1], "base64").toString("utf8"), withoutTransactionLines(text(`../${entry.migration}`)), "wrapper and migration have drifted apart: node scripts/make-apply-blobs.mjs");
  assert.equal((wrapper.match(/^do \$\$$/gm) ?? []).length, 1, "one do-block, so the SQL editor cannot split it");
  assert.equal((wrapper.match(/;/g) ?? []).length, 2, "two semicolons only: the execute and the end of the block");
  assert.match(text("../.gitignore"), new RegExp(`^!${entry.apply.replaceAll(".", "\\.")}$`, "m"));
  assert.ok(text("../scripts/make-apply-blobs.mjs").includes(entry.apply));
  assert.ok(text("../scripts/make-apply-blobs.mjs").includes(entry.migration));
});

test("the SQL checks the table is there, adds the post only if its slug is free, and never changes anything else", () => {
  const sql = text(`../${BLOG_MIGRATIONS[0].migration}`);
  const statements = code(sql);
  assert.match(sql, /if to_regclass\('public\.blog_posts'\) is null then/, "the table check is the first thing it does");
  assert.ok(sql.indexOf("to_regclass") < sql.indexOf("disable trigger"));
  assert.match(sql, /Run supabase\/apply\/05-resource-modules\.sql first/, "the person is told which script to run first");
  assert.equal((statements.match(/\binsert into public\.blog_posts\b/g) ?? []).length, 1);
  assert.equal((statements.match(/\bon conflict \(slug\) do nothing\b/g) ?? []).length, 1, "a post that exists is left exactly as it is");
  assert.doesNotMatch(statements, /\b(delete|truncate|drop|update|grant|revoke)\b/i);
  assert.doesNotMatch(statements, /\bon conflict \(slug\) do update\b/i);
  assert.equal((statements.match(/disable trigger c_audit/g) ?? []).length, 1);
  assert.equal((statements.match(/\benable trigger c_audit/g) ?? []).length, 1);
  assert.ok(statements.indexOf("disable trigger") < statements.indexOf("insert into") && statements.indexOf("insert into") < statements.indexOf("enable trigger"));
  assert.doesNotMatch(statements, /white_papers|sub_services|case_studies|auth\.|storage\./, "it touches the blog table and nothing else");
});

test("the row it inserts is the post: same text, same sections, published, dated midnight India time", () => {
  const sql = text(`../${BLOG_MIGRATIONS[0].migration}`);
  assert.ok(sql.includes(`'${post.slug}'`));
  assert.match(sql, /'published', '2026-11-11T00:00:00\+05:30'\n  \)/);
  const jsonLiterals = [...sql.matchAll(/'((?:[^']|'')*)'::jsonb/g)].map((match) => JSON.parse(match[1].replaceAll("''", "'")));
  assert.equal(jsonLiterals.length, 2);
  assert.deepEqual(jsonLiterals[0], post.body, "the body in the SQL is the body in the code");
  assert.deepEqual(jsonLiterals[1], post.relatedServices);
  assert.doesNotMatch(sql, /\$\$[^]*\$\$[^]*\$\$[^]*\$\$/, "no text of the post contains a dollar-quote that would end the block early");
});

test("the starter seed is untouched: the migration that production already ran does not mention this post", () => {
  const seed = text("../supabase/migrations/20261110200100_resource_modules_seed.sql");
  assert.ok(!seed.includes(SLUG));
  assert.equal((seed.match(/'2026-11-10T00:00:00\+05:30'/g) ?? []).length, 3);
  assert.ok(!text("../supabase/apply/05-resource-modules.sql").includes(Buffer.from(SLUG).toString("base64").slice(0, 20)));
});

/* ── The evidence, and the docs ───────────────────────────────────────────── */

test("the pages that were read are on record, for every company, with the date they were read", () => {
  assert.ok(existsSync(here(SOURCES)), "notes/chennai-managed-it-sources.md is missing");
  const sources = text(SOURCES);
  assert.match(sources, /11 November 2026/);
  for (const entry of entriesOf(post).filter((e) => e.name !== "Infeara Technologies")) {
    const url = entry.bullets["Official website"].match(/\((https:\/\/[^)]+)\)/)[1];
    const host = new URL(url).hostname.replace(/^www\./, "");
    assert.ok(sources.includes(host), `${entry.name}: ${host} is not in the sources note`);
  }
  assert.match(sources, /Excluded|Left out/i, "the note records who was considered and left out, and why");
});

test("the README documents the new script, the one-page rule and the four text conventions", () => {
  const readme = text("../README.md");
  assert.ok(readme.includes("supabase/apply/06-blog-top-10-managed-it-chennai.sql"));
  assert.match(readme, /One page per keyword/);
  assert.match(readme, /### /);
  assert.ok(readme.includes("tests/blog-directory.test.mjs"));
  assert.ok(readme.includes("notes/chennai-managed-it-sources.md"));
});
