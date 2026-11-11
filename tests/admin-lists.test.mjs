// Unit tests for what an admin list's search, filters and page number mean
// (lib/admin/list-params.ts) and for the checks the resource forms make before saving
// (lib/admin/resource-validation.ts).
//
//   npm run test:unit
//
// No build, no server, no Supabase. Both files are plain TypeScript with no imports, so they
// are compiled in memory with the project's own TypeScript and loaded from a data: URL (the
// same approach as tests/blogs.test.mjs).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const lp = await load("../lib/admin/list-params.ts");
const rv = await load("../lib/admin/resource-validation.ts");

/* ── The search text ───────────────────────────────────────────────────────── */

test("search text keeps letters, digits, spaces, hyphens and dots, and nothing else", () => {
  assert.equal(lp.cleanSearch("  zero-trust  "), "zero-trust");
  assert.equal(lp.cleanSearch("step 1.2"), "step 1.2");
  assert.equal(lp.cleanSearch("café"), "café");
  assert.equal(lp.cleanSearch("日本語"), "日本語");
  assert.equal(lp.cleanSearch(undefined), "");
  assert.equal(lp.cleanSearch(""), "");
});

test("the LIKE wildcards and every character that means something in a filter are removed", () => {
  for (const hostile of ["100%", "a_b", "a,b", "(x)", "a'b", 'a"b', "a\\b", "a*b", "a=b", "a&b", "a;b", "<script>", "a:b", "a/b"]) {
    const cleaned = lp.cleanSearch(hostile);
    assert.doesNotMatch(cleaned, /[%_,()'"\\*=&;<>:/]/, `${hostile} -> ${cleaned}`);
  }
  assert.equal(lp.cleanSearch("a,,,b"), "a b");
  assert.equal(lp.cleanSearch("%%%"), "");
});

test("search text is capped at 80 characters", () => {
  assert.equal(lp.cleanSearch("x".repeat(500)).length, 80);
  assert.equal(lp.cleanSearch(`${"x".repeat(79)} y`).length, 79, "no trailing space is left after the cut");
});

/* ── The address's parameters ──────────────────────────────────────────────── */

test("an address with nothing in it means: no search, all statuses, page 1", () => {
  assert.deepEqual(lp.parseListParams({}), { q: "", status: "all", page: 1, extra: {} });
});

test("the page is a whole number from 1 up, and anything else becomes page 1", () => {
  const page = (value) => lp.parseListParams({ page: value }).page;
  assert.equal(page("3"), 3);
  assert.equal(page("1"), 1);
  for (const bad of ["0", "-2", "abc", "", " ", "NaN", "Infinity", "-0", undefined]) assert.equal(page(bad), 1, String(bad));
  assert.equal(page("2.9"), 2);
  assert.equal(page("99999999999999"), 100000, "a huge page cannot ask the database for an absurd offset");
});

test("only a known status is accepted", () => {
  const status = (value) => lp.parseListParams({ status: value }).status;
  for (const good of ["all", "published", "scheduled", "draft", "archived"]) assert.equal(status(good), good);
  for (const bad of ["Published", "deleted", "' or 1=1 --", "", undefined]) assert.equal(status(bad), "all", String(bad));
});

test("a repeated parameter uses its first value", () => {
  const params = lp.parseListParams({ q: ["first", "second"], page: ["4", "9"], status: ["draft", "published"] });
  assert.equal(params.q, "first");
  assert.equal(params.page, 4);
  assert.equal(params.status, "draft");
});

test("an extra filter is kept only when its value is one of the listed options", () => {
  const extras = [{ name: "parent", label: "Service", options: [{ value: "cybersecurity", label: "Cybersecurity" }] }];
  assert.deepEqual(lp.parseListParams({ parent: "cybersecurity" }, extras).extra, { parent: "cybersecurity" });
  assert.deepEqual(lp.parseListParams({ parent: "other" }, extras).extra, {});
  assert.deepEqual(lp.parseListParams({ parent: "" }, extras).extra, {});
  assert.deepEqual(lp.parseListParams({ colour: "red" }, extras).extra, {}, "an unlisted filter name is ignored");
});

test("a list counts as filtered when anything narrows it", () => {
  const extras = [{ name: "kind", label: "Kind", options: [{ value: "client", label: "Client" }] }];
  assert.equal(lp.isFiltered(lp.parseListParams({})), false);
  assert.equal(lp.isFiltered(lp.parseListParams({ page: "5" })), false, "a page number alone is not a filter");
  assert.equal(lp.isFiltered(lp.parseListParams({ q: "x" })), true);
  assert.equal(lp.isFiltered(lp.parseListParams({ status: "draft" })), true);
  assert.equal(lp.isFiltered(lp.parseListParams({ kind: "client" }, extras)), true);
  assert.equal(lp.isFiltered(lp.parseListParams({ q: "%%%" })), false, "a search that cleans to nothing filters nothing");
});

/* ── Which page a request lands on ─────────────────────────────────────────── */

test("an empty list is one page of nothing", () => {
  assert.deepEqual(lp.pageWindow(0, 1), { total: 0, size: 20, pages: 1, page: 1, from: 0, first: 0, last: 0 });
  assert.equal(lp.pageWindow(0, 7).page, 1);
});

test("the window says which rows are shown, in human numbers", () => {
  assert.deepEqual(lp.pageWindow(53, 1), { total: 53, size: 20, pages: 3, page: 1, from: 0, first: 1, last: 20 });
  assert.deepEqual(lp.pageWindow(53, 2), { total: 53, size: 20, pages: 3, page: 2, from: 20, first: 21, last: 40 });
  assert.deepEqual(lp.pageWindow(53, 3), { total: 53, size: 20, pages: 3, page: 3, from: 40, first: 41, last: 53 });
});

test("an exact multiple of the page size has no empty last page", () => {
  assert.equal(lp.pageWindow(40, 1).pages, 2);
  assert.equal(lp.pageWindow(20, 1).pages, 1);
  assert.equal(lp.pageWindow(21, 1).pages, 2);
  assert.equal(lp.pageWindow(21, 2).last, 21);
});

test("a page past the end is pulled back to the last page, never an error", () => {
  assert.equal(lp.pageWindow(53, 9).page, 3);
  assert.equal(lp.pageWindow(53, 9).from, 40);
  assert.equal(lp.pageWindow(5, 100000).page, 1);
});

test("a page before the start, or one that is not a number, becomes page 1", () => {
  assert.equal(lp.pageWindow(53, 0).page, 1);
  assert.equal(lp.pageWindow(53, -4).page, 1);
  assert.equal(lp.pageWindow(53, Number.NaN).page, 1);
});

test("a different page size works the same way", () => {
  const window = lp.pageWindow(100, 3, 40);
  assert.equal(window.pages, 3);
  assert.equal(window.from, 80);
  assert.equal(window.last, 100);
});

test("twenty rows a page, as everywhere else in the admin", () => {
  assert.equal(lp.PAGE_SIZE, 20);
});

/* ── Addresses of a list view ──────────────────────────────────────────────── */

test("a list address leaves out everything that is a default", () => {
  assert.equal(lp.listHref("/admin/blogs", lp.parseListParams({})), "/admin/blogs");
  assert.equal(lp.listHref("/admin/blogs", lp.parseListParams({ page: "1", status: "all" })), "/admin/blogs");
});

test("a list address carries the search, the filters and the page", () => {
  const params = lp.parseListParams({ q: "zero trust", status: "draft", page: "3" });
  assert.equal(lp.listHref("/admin/blogs", params), "/admin/blogs?q=zero+trust&status=draft&page=3");
});

test("moving to another page keeps the search and the filters", () => {
  const params = lp.parseListParams({ q: "cloud", status: "published", page: "2" });
  assert.equal(lp.listHref("/admin/blogs", params, { page: 3 }), "/admin/blogs?q=cloud&status=published&page=3");
  assert.equal(lp.listHref("/admin/blogs", params, { page: 1 }), "/admin/blogs?q=cloud&status=published");
});

test("an extra filter is part of the address", () => {
  const extras = [{ name: "parent", label: "Service", options: [{ value: "ai-automations", label: "AI" }] }];
  const params = lp.parseListParams({ parent: "ai-automations", page: "2" }, extras);
  assert.equal(lp.listHref("/admin/subservices", params), "/admin/subservices?parent=ai-automations&page=2");
  assert.equal(lp.listHref("/admin/subservices", params, { page: 1, extra: {} }), "/admin/subservices");
});

/* ── The one filter a search can reach ─────────────────────────────────────── */

test("a search becomes one case-insensitive contains-filter per column", () => {
  assert.equal(lp.searchFilter(["title", "slug"], "zero trust"), "title.ilike.%zero trust%,slug.ilike.%zero trust%");
  assert.equal(lp.searchFilter(["name"], "AI"), "name.ilike.%AI%");
});

test("no search text, or no columns, means no filter at all", () => {
  assert.equal(lp.searchFilter(["title"], ""), null);
  assert.equal(lp.searchFilter(["title"], "   "), null);
  assert.equal(lp.searchFilter(["title"], "%%%"), null);
  assert.equal(lp.searchFilter([], "cloud"), null);
});

test("a hostile search cannot add a condition, close a group or reach another column", () => {
  const columns = ["title", "slug", "category"];
  for (const attack of ["x),status.eq.draft,(y", "x,or(title.eq.1)", "%' or '1'='1", "a%,id.gt.0,b%", "\\,slug.eq.x"]) {
    const filter = lp.searchFilter(columns, attack);
    if (filter === null) continue;
    const parts = filter.split(",");
    assert.equal(parts.length, columns.length, `${attack} -> ${filter}`);
    parts.forEach((part, index) => {
      assert.match(part, new RegExp(`^${columns[index]}\\.ilike\\.%[\\p{L}\\p{N} .-]+%$`, "u"), part);
    });
    assert.doesNotMatch(filter, /[()'"\\*]/);
  }
});

/* ── Links and addresses typed into a form ─────────────────────────────────── */

test("an internal path starts with one slash and carries no whitespace or quotes", () => {
  for (const good of ["/", "/services", "/services/cloud-datacenter/cloud-cost-optimization", "/blogs?x=1", "/a#b"]) {
    assert.equal(rv.isInternalPath(good), true, good);
  }
  for (const bad of ["", "services", "//evil.example", "https://x.example", "/a b", '/a"b', "/a'b", "/a<b", "/a\\b", "javascript:alert(1)"]) {
    assert.equal(rv.isInternalPath(bad), false, bad);
  }
});

test("an external link is http or https, with no spaces, and not absurdly long", () => {
  for (const good of ["https://example.com/paper.pdf", "http://example.com", "HTTPS://EXAMPLE.COM/A"]) {
    assert.equal(rv.isHttpUrl(good), true, good);
  }
  for (const bad of ["", "ftp://x.example", "javascript:alert(1)", "https://", "example.com", "https://a b.example", `https://x.example/${"a".repeat(600)}`]) {
    assert.equal(rv.isHttpUrl(bad), false, bad.slice(0, 40));
  }
});

/* ── Reading minutes ───────────────────────────────────────────────────────── */

test("reading minutes: empty means automatic, otherwise a whole number from 1 to 60", () => {
  assert.deepEqual(rv.parseReadingMinutes(""), { ok: true, value: null });
  assert.deepEqual(rv.parseReadingMinutes("  "), { ok: true, value: null });
  assert.deepEqual(rv.parseReadingMinutes("7"), { ok: true, value: 7 });
  assert.deepEqual(rv.parseReadingMinutes("1"), { ok: true, value: 1 });
  assert.deepEqual(rv.parseReadingMinutes("60"), { ok: true, value: 60 });
  for (const bad of ["0", "61", "-3", "2.5", "abc", "1e1x", "Infinity"]) {
    assert.equal(rv.parseReadingMinutes(bad).ok, false, bad);
  }
});

/* ── Numbers typed into a form ─────────────────────────────────────────────── */

test("sort order and picture number are whole numbers inside what a database column holds", () => {
  assert.equal(rv.cleanSortOrder(3.9), 3);
  assert.equal(rv.cleanSortOrder(-3.9), -3);
  assert.equal(rv.cleanSortOrder(Number.NaN), 0);
  assert.equal(rv.cleanSortOrder(Number.POSITIVE_INFINITY), 0);
  assert.equal(rv.cleanSortOrder(1e12), 100000);
  assert.equal(rv.cleanSortOrder(-1e12), -100000);
  assert.equal(rv.cleanPictureNumber(Number.NaN), 1);
  assert.equal(rv.cleanPictureNumber(7.2), 7);
  assert.equal(rv.cleanPictureNumber(1e12), 1000000);
});

/* ── Related-service links on a blog post ──────────────────────────────────── */

test("related links: blank rows are dropped and good rows are trimmed", () => {
  const result = rv.parseRelatedLinks([
    { label: "  Managed IT ", href: " /services/managed-it " },
    { label: "", href: "" },
    {},
  ]);
  assert.deepEqual(result, { ok: true, value: [{ label: "Managed IT", href: "/services/managed-it" }] });
});

test("related links: a half-filled row, or a link that leaves the site, is refused with a reason", () => {
  assert.equal(rv.parseRelatedLinks([{ label: "Only a label", href: "" }]).ok, false);
  assert.equal(rv.parseRelatedLinks([{ label: "", href: "/services" }]).ok, false);
  const external = rv.parseRelatedLinks([{ label: "Elsewhere", href: "https://example.com" }]);
  assert.equal(external.ok, false);
  assert.match(external.error, /single slash/);
  assert.equal(rv.parseRelatedLinks([{ label: "Sneaky", href: "//example.com" }]).ok, false);
});

/* ── The picture and steps of a sub-service ────────────────────────────────── */

test("only the built-in diagrams can be kept as a sub-service picture, and only when the box is ticked", () => {
  const good = "/site/infographics/cloud-cost-optimization.svg";
  assert.equal(rv.diagramImage(true, good), good);
  assert.equal(rv.diagramImage(false, good), null);
  for (const bad of ["", "/site/other.svg", "/site/infographics/../secret.svg", "https://evil.example/x.svg", "/site/infographics/a.svg?x=1", "/site/infographics/A.svg"]) {
    assert.equal(rv.diagramImage(true, bad), null, bad);
  }
});

test("a sub-service with no steps and no picture has no diagram section", () => {
  assert.equal(rv.buildInfographic({ title: "How", steps: [], image: null }), null);
  assert.equal(rv.buildInfographic({ title: "How", steps: [{ title: "  ", description: "x" }], image: null }), null);
});

test("steps are trimmed, steps without a title are dropped, and the picture is kept when there is one", () => {
  const withSteps = rv.buildInfographic({
    title: " How it works ",
    steps: [{ title: " Plan ", description: " first " }, { title: "", description: "orphan" }, { title: "Do" }],
    image: null,
  });
  assert.deepEqual(withSteps, {
    title: "How it works",
    steps: [
      { title: "Plan", description: "first" },
      { title: "Do", description: "" },
    ],
  });
  const withImage = rv.buildInfographic({ title: "T", steps: [], image: "/site/infographics/a.svg" });
  assert.deepEqual(withImage, { title: "T", steps: [], image: "/site/infographics/a.svg" });
});

/* ── Case studies: kind, client and approval ───────────────────────────────── */

test("a representative case study can be published without a client", () => {
  assert.equal(rv.caseStudyProblem({ kind: "representative", clientName: "", approved: false, status: "published" }), null);
});

test("a client case study needs a name, and cannot be published until the approval is recorded", () => {
  assert.match(rv.caseStudyProblem({ kind: "client", clientName: "  ", approved: false, status: "draft" }), /Name the client/);
  assert.match(rv.caseStudyProblem({ kind: "client", clientName: "Acme", approved: false, status: "published" }), /approval/i);
  assert.equal(rv.caseStudyProblem({ kind: "client", clientName: "Acme", approved: false, status: "draft" }), null, "a draft needs no approval yet");
  assert.equal(rv.caseStudyProblem({ kind: "client", clientName: "Acme", approved: true, status: "published" }), null);
});

test("an unknown kind is refused", () => {
  assert.ok(rv.caseStudyProblem({ kind: "", clientName: "", approved: false, status: "draft" }));
  assert.ok(rv.caseStudyProblem({ kind: "testimonial", clientName: "", approved: false, status: "draft" }));
});

/* ── White papers: a published paper has to open something ─────────────────── */

test("a published paper needs a file or a link, a draft does not", () => {
  assert.match(rv.paperProblem({ status: "published", filePath: null, externalUrl: null }), /PDF/);
  assert.equal(rv.paperProblem({ status: "draft", filePath: null, externalUrl: null }), null);
  assert.equal(rv.paperProblem({ status: "published", filePath: "papers/x/y.pdf", externalUrl: null }), null);
  assert.equal(rv.paperProblem({ status: "published", filePath: null, externalUrl: "https://example.com/p.pdf" }), null);
});

test("a paper's outside link must be http or https, whatever its status", () => {
  assert.ok(rv.paperProblem({ status: "draft", filePath: null, externalUrl: "javascript:alert(1)" }));
  assert.ok(rv.paperProblem({ status: "published", filePath: "papers/x/y.pdf", externalUrl: "ftp://x.example" }));
});

/* ── Blog posts ────────────────────────────────────────────────────────────── */

test("a blog post with no sections cannot be published, but can be saved as a draft", () => {
  assert.match(rv.blogProblem({ status: "published", sections: 0 }), /section/);
  assert.equal(rv.blogProblem({ status: "draft", sections: 0 }), null);
  assert.equal(rv.blogProblem({ status: "published", sections: 2 }), null);
});
