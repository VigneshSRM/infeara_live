// Unit tests for the Blogs page content and the "Technical resources" menu.
//
//   npm run test:unit
//
// No build, no server, no Supabase. lib/content/blogs.ts and lib/content/site.ts are plain
// TypeScript with no app imports, so they are compiled in memory with the project's own
// TypeScript and loaded from a data: URL (the same approach as tests/core-services.test.mjs).

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const here = (path) => new URL(path, import.meta.url);
const text = (path) => readFileSync(here(path), "utf8");

async function load(path) {
  const { outputText } = ts.transpileModule(text(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const blogs = await load("../lib/content/blogs.ts");
const site = await load("../lib/content/site.ts");

const post = (extra = {}) => ({
  slug: "a-post",
  title: "A post",
  excerpt: "An excerpt.",
  category: "Testing",
  publishedAt: "2026-01-01",
  figureSeed: 1,
  body: [{ heading: "Heading", paragraphs: ["One paragraph."] }],
  relatedServices: [],
  seo: { title: "A post", description: "Description." },
  ...extra,
});

/** Every href that appears anywhere in the primary navigation, children included. */
function navHrefs(items = site.nav) {
  return items.flatMap((item) => [item.href, ...(item.children ? navHrefs(item.children) : [])]);
}

/* ── The posts ─────────────────────────────────────────────────────────────── */

test("the blog has posts, and every slug is unique and safe to use in a URL", () => {
  assert.ok(blogs.blogPosts.length > 0);
  const slugs = blogs.blogPosts.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `unsafe slug: ${slug}`);
});

test("every post has the text the page needs", () => {
  for (const p of blogs.blogPosts) {
    for (const field of ["title", "excerpt", "category"]) {
      assert.ok(p[field].trim(), `${p.slug}: ${field} is empty`);
    }
    assert.ok(p.body.length > 0, `${p.slug}: no sections`);
    for (const section of p.body) {
      assert.ok(section.heading.trim(), `${p.slug}: a section has no heading`);
      assert.ok(section.paragraphs.length > 0, `${p.slug}: "${section.heading}" has no paragraphs`);
      for (const paragraph of section.paragraphs) assert.ok(paragraph.trim(), `${p.slug}: empty paragraph`);
    }
    assert.ok(Number.isInteger(p.figureSeed), `${p.slug}: figureSeed must be a number`);
  }
});

test("headings and paragraphs are unique within a post, because the page uses them as React keys", () => {
  for (const p of blogs.blogPosts) {
    const headings = p.body.map((section) => section.heading);
    assert.equal(new Set(headings).size, headings.length, `${p.slug}: repeated heading`);
    const paragraphs = p.body.flatMap((section) => section.paragraphs);
    assert.equal(new Set(paragraphs).size, paragraphs.length, `${p.slug}: repeated paragraph`);
  }
});

test("dates are real calendar days", () => {
  for (const p of blogs.blogPosts) {
    assert.match(p.publishedAt, /^\d{4}-\d{2}-\d{2}$/, `${p.slug}: ${p.publishedAt}`);
    const parsed = new Date(`${p.publishedAt}T00:00:00Z`);
    assert.ok(!Number.isNaN(parsed.getTime()), `${p.slug}: not a date`);
    assert.equal(parsed.toISOString().slice(0, 10), p.publishedAt, `${p.slug}: ${p.publishedAt} rolls over`);
  }
});

test("search titles and descriptions are present and a sensible length", () => {
  for (const p of blogs.blogPosts) {
    assert.ok(p.seo.title.length > 0 && p.seo.title.length <= 70, `${p.slug}: seo.title is ${p.seo.title.length} characters`);
    assert.ok(
      p.seo.description.length >= 50 && p.seo.description.length <= 160,
      `${p.slug}: seo.description is ${p.seo.description.length} characters`,
    );
  }
});

test("related-service buttons point at pages that exist in the site navigation", () => {
  const known = new Set(navHrefs());
  for (const p of blogs.blogPosts) {
    assert.ok(p.relatedServices.length > 0, `${p.slug}: no related service`);
    for (const service of p.relatedServices) {
      assert.ok(service.label.trim(), `${p.slug}: related service without a label`);
      assert.ok(known.has(service.href), `${p.slug}: ${service.href} is not in the navigation`);
    }
  }
});

test("the shipped posts make no claims about clients, results or figures", () => {
  // The site's rule (see app/case-studies/page.tsx): nothing is published that a client has
  // not approved or that cannot be evidenced. A new post can break that by accident, so the
  // obvious shapes are checked: percentages, money, multipliers and named-client wording.
  // This covers the later posts too, including the list of other companies.
  const patterns = [
    [/\d+\s?%|\bper cent\b|\bpercent\b/i, "a percentage"],
    [/[₹$€£]\s?\d|\b(rs\.?|inr)\s?\d/i, "an amount of money"],
    [/\b\d+(\.\d+)?\s?x\b|\b\d+\s?times (faster|cheaper|more)\b/i, "a multiplier"],
    [/\b(our|one of our|a recent) (client|customer)s?\b/i, "a client reference"],
    [/\b(case study|we helped|we reduced|we saved|we cut)\b/i, "an outcome claim"],
  ];
  for (const p of blogs.blogPosts) {
    const all = [p.title, p.excerpt, p.seo.description, ...p.body.flatMap((s) => [s.heading, ...s.paragraphs])].join("\n");
    for (const [pattern, what] of patterns) assert.doesNotMatch(all, pattern, `${p.slug} contains ${what}`);
  }
});

/* ── The two lists, and the text inside a paragraph ──────────────────────────── */

test("blogPosts is the starter posts followed by the later ones, and no slug appears twice", () => {
  assert.deepEqual(blogs.blogPosts, [...blogs.starterBlogPosts, ...blogs.laterBlogPosts]);
  assert.equal(blogs.starterBlogPosts.length, 3, "the starter set is what the database was seeded with: do not add to it");
  assert.ok(blogs.laterBlogPosts.length >= 1);
  const slugs = blogs.blogPosts.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "a slug is used twice across the two lists");
});

test("a link is allowed only to http(s) addresses and to a path on this site", () => {
  const kind = blogs.blogLinkKind;
  assert.equal(kind("https://example.com/"), "external");
  assert.equal(kind("http://example.com/a?b=c#d"), "external");
  assert.equal(kind("HTTPS://EXAMPLE.COM"), "external");
  assert.equal(kind("/contact"), "internal");
  assert.equal(kind("/services/managed-it"), "internal");
  for (const bad of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html;base64,AAAA",
    "vbscript:x",
    "//evil.example/steal", // protocol-relative: another site
    "ftp://example.com",
    "mailto:someone@example.com",
    "example.com",
    "www.example.com",
    "https://",
    "https://exa mple.com",
    'https://example.com/"onmouseover="x',
    "https://example.com/<script>",
    "/path with space",
    "",
    `https://example.com/${"a".repeat(500)}`,
  ]) {
    assert.equal(kind(bad), null, `should be refused: ${bad.slice(0, 50)}`);
  }
});

test("a paragraph can hold a link, bold text and plain text, in order", () => {
  const nodes = blogs.parseBlogInline("Read **this** on [our site](/contact) or at [Acme](https://acme.example/x) now.");
  assert.deepEqual(nodes, [
    { type: "text", text: "Read " },
    { type: "bold", text: "this" },
    { type: "text", text: " on " },
    { type: "link", text: "our site", href: "/contact", external: false },
    { type: "text", text: " or at " },
    { type: "link", text: "Acme", href: "https://acme.example/x", external: true },
    { type: "text", text: " now." },
  ]);
  assert.deepEqual(blogs.parseBlogInline("nothing special"), [{ type: "text", text: "nothing special" }]);
  assert.deepEqual(blogs.parseBlogInline(""), []);
});

test("a link to a disallowed address is shown as the text it was typed as, never as a link", () => {
  for (const bad of ["javascript:alert(1)", "//evil.example", "data:text/html,x", "www.example.com", "ftp://x.example"]) {
    const typed = `[click here](${bad})`;
    const nodes = blogs.parseBlogInline(`before ${typed} after`);
    assert.ok(!nodes.some((n) => n.type === "link"), `${bad} became a link`);
    assert.equal(nodes.map((n) => n.text).join(""), `before ${typed} after`, "the text must come out unchanged");
  }
});

test("link text and address cannot break out of each other or swallow the rest of the line", () => {
  // Two links on a line stay two links.
  const two = blogs.parseBlogInline("[a](/one) and [b](/two)").filter((n) => n.type === "link");
  assert.deepEqual(two.map((n) => [n.text, n.href]), [["a", "/one"], ["b", "/two"]]);
  // One level of brackets inside an address (as in a Wikipedia address) is kept whole.
  const wiki = blogs.parseBlogInline("[Foo](https://en.wikipedia.org/wiki/Foo_(bar)) end").find((n) => n.type === "link");
  assert.equal(wiki.href, "https://en.wikipedia.org/wiki/Foo_(bar)");
  // Unbalanced markers are plain text.
  assert.deepEqual(blogs.parseBlogInline("**not closed and [not a link]"), [{ type: "text", text: "**not closed and [not a link]" }]);
  // A bracket and a bracket with a space between them is not a link.
  assert.ok(!blogs.parseBlogInline("see [1] (below)").some((n) => n.type === "link"));
});

test("lines starting with ### become sub-headings, and neighbouring bullets become one list", () => {
  const blocks = blogs.parseBlogBlocks([
    "Intro line.",
    "### A company",
    "About it.",
    "- **Services:** many",
    "- **Site:** [x.example](https://x.example/)",
    "Middle line.",
    "- another list",
    "",
    "   ",
  ]);
  assert.deepEqual(blocks.map((b) => b.type), ["paragraph", "subheading", "paragraph", "list", "paragraph", "list"]);
  assert.equal(blocks[1].text, "A company");
  assert.equal(blocks[3].items.length, 2);
  assert.equal(blocks[3].items[0][0].type, "bold");
  assert.equal(blocks[3].items[1].find((n) => n.type === "link").href, "https://x.example/");
  assert.equal(blocks[5].items.length, 1);
});

test("markers that are not followed by a space are ordinary text", () => {
  const blocks = blogs.parseBlogBlocks(["-5 degrees is cold", "###no space", "- ", "###"]);
  assert.equal(blocks[0].type, "paragraph");
  assert.equal(blocks[1].type, "paragraph");
  assert.ok(blocks.every((b) => b.type === "paragraph"), JSON.stringify(blocks.map((b) => b.type)));
});

test("plainBlogText gives what a reader reads, with no markers, and unsafeBlogLinks lists what is refused", () => {
  assert.equal(blogs.plainBlogText("### **A** [b](/c) d"), "A b d");
  assert.equal(blogs.plainBlogText("- **Services:** [x](https://x.example/) and more"), "Services: x and more");
  assert.equal(blogs.plainBlogText("  plain  "), "plain");
  assert.deepEqual(blogs.unsafeBlogLinks(["[ok](/contact) [no](javascript:alert(1)) **b**", "[fine](https://a.example)", "[bad](www.a.example)"]), [
    "javascript:alert(1)",
    "www.a.example",
  ]);
  assert.deepEqual(blogs.unsafeBlogLinks(["nothing to see", "[a](/b)"]), []);
});

test("markers are not counted as words, so the reading time describes what is read", () => {
  const plain = post({ title: "T", excerpt: "E", body: [{ heading: "H", paragraphs: ["one two three"] }] });
  const marked = post({
    title: "T",
    excerpt: "E",
    body: [{ heading: "H", paragraphs: ["### one", "- **two** [three](https://example.com/a-long-address-without-spaces)"] }],
  });
  assert.equal(blogs.wordCount(marked), blogs.wordCount(plain));
});

/* ── Helpers ───────────────────────────────────────────────────────────────── */

test("listBlogPosts is newest first, keeps the written order on a tie, and leaves the source alone", () => {
  const original = [...blogs.blogPosts];
  const listed = blogs.listBlogPosts();
  for (let i = 1; i < listed.length; i += 1) {
    assert.ok(listed[i - 1].publishedAt >= listed[i].publishedAt, "not newest first");
  }
  assert.deepEqual(blogs.blogPosts, original, "the list was reordered in place");
  assert.notEqual(listed, blogs.blogPosts);
});

test("getBlogPost finds a post by slug and returns nothing for anything else", () => {
  const first = blogs.blogPosts[0];
  assert.equal(blogs.getBlogPost(first.slug), first);
  assert.equal(blogs.getBlogPost("no-such-post"), undefined);
  assert.equal(blogs.getBlogPost(""), undefined);
});

test("formatPostDate writes the day, the month in full and the year, without using the clock or locale", () => {
  assert.equal(blogs.formatPostDate("2026-11-09"), "9 November 2026");
  assert.equal(blogs.formatPostDate("2027-01-05"), "5 January 2027");
  assert.equal(blogs.formatPostDate("2026-12-31"), "31 December 2026");
});

test("readingMinutes rounds at about 200 words a minute and never reports zero", () => {
  const words = (n) => Array.from({ length: n }, () => "word").join(" ");
  const withWords = (n) =>
    post({ title: "T", excerpt: "E", body: [{ heading: "H", paragraphs: [words(n)] }] });
  assert.equal(blogs.readingMinutes(post()), 1, "a very short post still takes a minute");
  assert.equal(blogs.readingMinutes(withWords(98)), 1); // 98 + 3 = 101 words
  assert.equal(blogs.readingMinutes(withWords(397)), 2); // 400 words
  assert.equal(blogs.readingMinutes(withWords(997)), 5); // 1000 words
  for (const p of blogs.blogPosts) assert.ok(blogs.readingMinutes(p) >= 1);
});

/* ── The "Technical resources" menu ────────────────────────────────────────── */

const resources = site.nav.find((item) => item.label === "Technical resources");

test("Technical resources is a dropdown of Insights, Blogs, Case Studies and White Papers, in that order", () => {
  assert.ok(resources, "the nav item is missing");
  assert.deepEqual(
    resources.children.map((child) => [child.label, child.href]),
    [
      ["Insights", "/insights"],
      ["Blogs", "/blogs"],
      ["Case Studies", "/case-studies"],
      ["White Papers", "/white-papers"],
    ],
  );
});

test("every entry in the dropdown has a page behind it, so no menu link can 404", () => {
  for (const child of resources.children) {
    assert.ok(existsSync(here(`../app${child.href}/page.tsx`)), `${child.href} has no app${child.href}/page.tsx`);
  }
  assert.ok(existsSync(here("../app/blogs/[slug]/page.tsx")), "blog posts have no page template");
});

test("menus with a hub page keep their closing link; the resources menu has none, so none is invented", () => {
  const labels = Object.fromEntries(site.nav.filter((item) => item.children).map((item) => [item.label, item.overviewLabel]));
  assert.deepEqual(labels, {
    About: "About Infeara",
    Services: "All services",
    Industries: "All industries",
    "Technical resources": undefined,
  });
});

test("the footer's Resources column links to the same new pages", () => {
  const column = site.footerColumns.find((c) => c.title === "Resources");
  const hrefs = column.links.map((link) => link.href);
  for (const href of ["/insights", "/blogs", "/white-papers"]) assert.ok(hrefs.includes(href), `footer is missing ${href}`);
  assert.equal(new Set(hrefs).size, hrefs.length, "a footer link is listed twice");
});
