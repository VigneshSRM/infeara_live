// Unit tests for the sub-service, blog, case-study and white-paper modules: the database script
// (what it creates, who may do what, that it cannot overwrite anything), the content that is
// copied in so nothing disappears, the paste-ready file that carries both, the PDF helpers, and
// the wiring of the admin screens.
//
//   npm run test:unit
//
// No build, no server, no Supabase. The TypeScript modules under test are plain files with no
// app imports, so they are compiled in memory with the project's own TypeScript and loaded
// from a data: URL (the same approach as tests/core-services.test.mjs). The behaviour of the
// SQL itself was exercised against a real Postgres engine (PGlite) when it was written; these
// tests keep it from drifting afterwards.

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { SEED_PATH, buildResourceSeed } from "../scripts/generate-resource-seed.mjs";

const here = (path) => new URL(path, import.meta.url);
const text = (path) => readFileSync(here(path), "utf8");

async function load(path) {
  const { outputText } = ts.transpileModule(text(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const model = await load("../lib/content/subservice-model.ts");
const papers = await load("../lib/content/white-papers.ts");
const studies = await load("../lib/content/case-studies.ts");
const blogs = await load("../lib/content/blogs.ts");
const servicesModule = await load("../lib/content/services.ts");
const [cyber, cloud, product] = await Promise.all([
  load("../lib/content/cybersecurity-subservices.ts"),
  load("../lib/content/cloud-subservices.ts"),
  load("../lib/content/product-subservices.ts"),
]);

const subservices = model.normalizeSubservices({
  cybersecurity: cyber.cybersecuritySubservices,
  cloud: cloud.cloudSubservices,
  product: product.productSubservices,
});

const MIGRATION = "../supabase/migrations/20261110200000_resource_modules.sql";
const SEED = `../${SEED_PATH}`;
const APPLY = "../supabase/apply/05-resource-modules.sql";

const TABLES = ["sub_services", "blog_posts", "case_studies", "white_papers"];

/** The SQL with its comments removed, so a comment cannot satisfy or break a check. */
const code = (sql) => sql.replace(/--.*$/gm, "");
const migration = code(text(MIGRATION));
// Same rule as scripts/make-apply-blobs.mjs: whole-line `begin;` and `commit;` only.
const withoutTransactionLines = (sql) => sql.replace(/^[ \t]*(?:begin|commit)[ \t]*;[ \t]*(?:\r?\n|$)/gim, "");

/* ── The code that is copied in ────────────────────────────────────────────── */

test("the 18 sub-services that shipped in code are all there, in their four groups", () => {
  assert.equal(subservices.length, 18);
  const count = (parent) => subservices.filter((s) => s.parentSlug === parent).length;
  assert.equal(count("cybersecurity"), 4);
  assert.equal(count("cloud-datacenter"), 7);
  assert.equal(count("ai-automations"), 4);
  assert.equal(count("application-development"), 3);
});

test("every sub-service has an address of its own, a safe slug and the text its page needs", () => {
  const paths = subservices.map((s) => model.subservicePath(s.parentSlug, s.slug));
  assert.equal(new Set(paths).size, paths.length, "two sub-services share an address");
  for (const s of subservices) {
    assert.match(s.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, s.slug);
    for (const field of ["name", "summary", "intro", "tagline"]) assert.ok(s[field].trim(), `${s.slug}: ${field} is empty`);
    assert.ok(s.deliverables.length > 0, `${s.slug}: no deliverables`);
    assert.ok(s.outcomes.length > 0, `${s.slug}: no outcomes`);
    for (const faq of s.faqs) assert.ok(faq.question.trim() && faq.answer.trim(), `${s.slug}: blank FAQ`);
    assert.ok(Number.isInteger(s.figure.seed), `${s.slug}: picture number`);
    assert.ok(s.seo.title.trim() && s.seo.description.trim(), `${s.slug}: SEO`);
  }
});

test("the existing addresses did not move", () => {
  const paths = new Set(subservices.map((s) => model.subservicePath(s.parentSlug, s.slug)));
  for (const path of [
    "/services/cybersecurity/penetration-testing",
    "/services/cloud-datacenter/cloud-cost-optimization",
    "/services/ai-automations/llm-development",
    "/services/application-development/website-development",
  ]) {
    assert.ok(paths.has(path), `${path} is missing`);
  }
});

test("within a group the order is the order of the old lists, with no gaps and no repeats", () => {
  for (const parent of model.subserviceParents) {
    const orders = model.inParent(subservices, parent.slug).map((s) => s.order);
    assert.deepEqual(orders, orders.map((_, index) => index + 1), parent.slug);
  }
});

test("each cloud, AI and application sub-service points at a drawn diagram that exists on disk", () => {
  for (const s of subservices) {
    if (s.parentSlug === "cybersecurity") {
      assert.equal(s.infographic, null, `${s.slug}: cybersecurity pages have no diagram`);
      continue;
    }
    assert.ok(s.infographic, `${s.slug}: no diagram`);
    assert.equal(s.infographic.image, model.infographicImagePath(s.slug));
    assert.ok(existsSync(here(`../public${s.infographic.image}`)), `${s.infographic.image} is missing`);
    assert.ok(s.infographic.steps.length > 0, `${s.slug}: no steps`);
  }
});

test("related cards come from the same group and never include the page itself", () => {
  for (const s of subservices) {
    const related = model.siblingsOf(subservices, s);
    assert.ok(related.every((r) => r.parentSlug === s.parentSlug && r.slug !== s.slug), s.slug);
    assert.equal(related.length, model.inParent(subservices, s.parentSlug).length - 1);
  }
  const cloudPage = subservices.find((s) => s.parentSlug === "cloud-datacenter");
  assert.equal(model.siblingsOf(subservices, cloudPage, 3).length, 3);
});

test("the parents are the four core services that have a hub page", () => {
  assert.deepEqual(
    model.subserviceParents.map((p) => p.slug),
    ["cybersecurity", "cloud-datacenter", "ai-automations", "application-development"],
  );
  for (const parent of model.subserviceParents) {
    assert.ok(existsSync(here(`../app/services${parent.href.replace("/services", "")}/page.tsx`)), `${parent.href} has no hub page`);
    assert.equal(model.isSubserviceParent(parent.slug), true);
  }
  assert.equal(model.isSubserviceParent("it-infrastructure"), false);
  assert.equal(model.isSubserviceParent(""), false);
});

test("the three case studies are representative: no client, no figures", () => {
  assert.equal(studies.caseStudies.length, 3);
  const slugs = studies.caseStudies.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const known = new Set(servicesModule.services.map((s) => s.slug));

  for (const c of studies.caseStudies) {
    assert.equal(c.kind, "representative", c.slug);
    assert.equal(c.clientName, null, `${c.slug} names a client`);
    assert.doesNotMatch([c.situation, ...c.work, c.result].join(" "), /%|\d+\s?(x|times)\b/i, `${c.slug} carries a figure`);
    for (const slug of c.services) assert.ok(known.has(slug), `${c.slug} links to a service that does not exist: ${slug}`);
  }
  assert.equal(studies.caseStudyLabel(studies.caseStudies[0]), "Representative engagement");
  assert.equal(studies.caseStudyLabel({ kind: "client", clientName: "Acme" }), "Client: Acme");
});

test("the three starter blog posts are dated the day they were published, in India time", () => {
  // Posts added later (laterBlogPosts) have their own dates and their own migrations: tests/blog-directory.test.mjs.
  assert.equal(blogs.starterBlogPosts.length, 3);
  for (const post of blogs.starterBlogPosts) assert.equal(post.publishedAt, "2026-11-10", post.slug);
});

test("there are no white papers in code: none are published yet", () => {
  assert.deepEqual(papers.whitePapers, []);
});

/* ── The database script ───────────────────────────────────────────────────── */

test("it creates the four tables, only if they are missing, and switches row-level security on for each", () => {
  const created = [...migration.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(created.sort(), [...TABLES].sort());
  assert.doesNotMatch(migration, /create table (?!if not exists)/i, "every table is created with if not exists");
  for (const table of TABLES) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`), table);
  }
});

test("visitors read a row only when it is published and its publish time has arrived", () => {
  assert.match(migration, /for select to anon, authenticated using \(status = ''published'' and \(published_at is null or published_at <= now\(\)\)\)/);
  // The policy names are built per table inside one loop over all four.
  assert.match(migration, /foreach t in array array\['sub_services', 'blog_posts', 'case_studies', 'white_papers'\]/);
});

test("staff policies: any staff member reads and updates, only editors create and delete", () => {
  assert.match(migration, /for select to authenticated using \(public\.is_staff\(\)\)/);
  assert.match(migration, /for insert to authenticated with check \(public\.can_edit\(\)\)/);
  assert.match(migration, /for update to authenticated using \(public\.is_staff\(\)\) with check \(public\.is_staff\(\)\)/);
  assert.match(migration, /for delete to authenticated using \(public\.can_edit\(\)\)/);
});

test("visitors are granted read access and nothing else; staff and the service key can write", () => {
  for (const table of TABLES) {
    assert.match(migration, new RegExp(`grant select on public\\.${table} to anon;`), `${table}: anon read`);
    assert.match(migration, new RegExp(`grant select, insert, update, delete on public\\.${table} to authenticated;`), `${table}: staff`);
    assert.match(migration, new RegExp(`grant select, insert, update, delete on public\\.${table} to service_role;`), `${table}: service`);
  }
  assert.doesNotMatch(migration, /grant[^;]*\b(insert|update|delete|all)\b[^;]*to anon/i);
});

test("an SEO manager may change the SEO title and description on all four tables, and nothing else", () => {
  for (const table of TABLES) {
    assert.match(
      migration,
      new RegExp(`when '${table}' then array\\['seo_title', 'seo_description', 'updated_at', 'updated_by'\\]`),
      `${table} is missing from the SEO guard`,
    );
    assert.match(migration, new RegExp(`select public\\.attach_content_triggers\\('${table}'\\);`), `${table}: triggers`);
  }
  // The original tables must keep their lines: the function is replaced as a whole.
  for (const table of ["services", "industries", "insights", "legal_documents", "faq_groups"]) {
    assert.match(migration, new RegExp(`when '${table}' then`), `${table} was dropped from the SEO guard`);
  }
});

test("the data rules are enforced by the database as well as by the screens", () => {
  for (const name of [
    "case_studies_representative_is_unnamed",
    "case_studies_client_is_named",
    "case_studies_client_needs_approval_to_publish",
    "white_papers_published_needs_a_file",
  ]) {
    assert.match(migration, new RegExp(`constraint ${name}`), name);
  }
  assert.equal((migration.match(/check \(slug ~ '\^\[a-z0-9\]\+\(-\[a-z0-9\]\+\)\*\$'\)/g) ?? []).length, 4, "a slug check on every table");
  assert.match(migration, /external_url ~ '\^https\?:\/\/'/);
});

test("the parents the database allows are exactly the parents the code knows", () => {
  const allowed = migration.match(/parent_slug in \(([^)]*)\)/)[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(allowed, model.subserviceParents.map((p) => p.slug));
});

test("PDFs only, up to the same limit the screens enforce, and nobody can list the bucket", () => {
  assert.match(migration, /values \('documents', 'documents', true, 26214400, array\['application\/pdf'\]\)/);
  assert.equal(papers.MAX_PAPER_BYTES, 26214400, "the bucket limit and the upload limit must agree");

  const storage = migration.slice(migration.indexOf("insert into storage.buckets"), migration.indexOf("alter table public.sub_services enable"));
  assert.ok(storage.length > 200 && storage.includes("storage.objects"), "found the storage section");
  for (const action of ["read", "insert", "update", "delete"]) {
    assert.match(storage, new RegExp(`create policy documents_objects_staff_${action} on storage\\.objects`), action);
  }
  assert.doesNotMatch(storage, /\bto\s+(anon|public)\b/i, "an anonymous policy would let anyone list draft files");
  assert.match(storage, /for insert to authenticated with check \(bucket_id = 'documents' and public\.can_edit\(\)\)/);
});

test("it never deletes, truncates or alters anything that already exists", () => {
  assert.doesNotMatch(migration, /\bdrop\s+(table|column|function|trigger|schema)\b/i);
  assert.doesNotMatch(migration, /\btruncate\b|\bdelete\s+from\b/i);
  assert.doesNotMatch(
    migration,
    /alter table public\.(services|industries|insights|legal_documents|faq_groups|leads|profiles|media|audit_log)\b/i,
    "it must not touch an existing table",
  );
  // Only its own policies are dropped before being recreated.
  for (const match of migration.matchAll(/drop policy if exists (\S+) on (\S+)/g)) {
    assert.match(match[1], /^(documents_objects_staff_(read|insert|update|delete)|%I)$/, `drops a policy it does not own: ${match[1]}`);
  }
});

/* ── The copy of today's content ───────────────────────────────────────────── */

test("the seed on disk is exactly what the generator makes from the code content", async () => {
  const { sql, counts } = await buildResourceSeed();
  assert.equal(text(SEED), sql, "run: node scripts/generate-resource-seed.mjs");
  assert.deepEqual(counts, { subServices: 18, blogPosts: 3, caseStudies: 3 });
});

test("the seed adds rows only to a table that is empty, so it cannot overwrite or bring back anything", () => {
  // The seeded text is ordinary prose ("update budgets"), so look at the SQL around it, not inside it.
  const seed = code(text(SEED)).replace(/'(?:[^']|'')*'/g, "''");
  for (const table of ["sub_services", "blog_posts", "case_studies"]) {
    assert.match(seed, new RegExp(`if not exists \\(select 1 from public\\.${table}\\)`), `${table} is not guarded`);
  }
  assert.doesNotMatch(seed, /white_papers/, "white papers start empty");
  assert.doesNotMatch(seed, /\b(delete|truncate|drop|update)\b/i);
  assert.doesNotMatch(seed, /on conflict/i, "it must not overwrite on conflict either");
  // The audit trigger is off while the import runs and back on straight after.
  assert.equal((seed.match(/disable trigger c_audit/g) ?? []).length, 3);
  assert.equal((seed.match(/\benable trigger c_audit/g) ?? []).length, 3);
});

test("the blog posts go in dated the 10th of November, midnight India time, and published", () => {
  const seed = text(SEED);
  assert.equal((seed.match(/'2026-11-10T00:00:00\+05:30'/g) ?? []).length, 3);
  assert.doesNotMatch(seed, /'2026-11-09/);
});

/* ── The paste-ready file ──────────────────────────────────────────────────── */

test("the paste-ready file is exactly the script and the seed, wrapped as one statement", () => {
  // Regenerate with `node scripts/make-apply-blobs.mjs` after any change to either file.
  const wrapper = text(APPLY);
  const payload = wrapper.match(/decode\('([A-Za-z0-9+/=]+)', 'base64'\)/);
  assert.ok(payload, "the wrapper holds the SQL as base64");
  const decoded = Buffer.from(payload[1], "base64").toString("utf8");
  assert.equal(decoded, [text(MIGRATION), text(SEED)].map(withoutTransactionLines).join("\n"), "wrapper and sources have drifted apart");
  assert.equal((wrapper.match(/^do \$\$$/gm) ?? []).length, 1, "one do-block, so the SQL editor cannot split it");
  assert.equal((wrapper.match(/;/g) ?? []).length, 2, "two semicolons only: the execute and the end of the block");
});

test("the paste-ready file is committed, not ignored, and the generator produces it", () => {
  assert.match(text("../.gitignore"), /^!supabase\/apply\/05-resource-modules\.sql$/m);
  assert.match(text("../scripts/make-apply-blobs.mjs"), /supabase\/apply\/05-resource-modules\.sql/);
});

/* ── PDF helpers ───────────────────────────────────────────────────────────── */

test("a file name is made safe for storage, and always ends in .pdf", () => {
  assert.equal(papers.safePdfName("Recovery Testing (final v2).PDF"), "Recovery-Testing-final-v2.pdf");
  assert.equal(papers.safePdfName("résumé.pdf"), "resume.pdf");
  assert.equal(papers.safePdfName("../../etc/passwd.pdf"), "etc-passwd.pdf");
  assert.equal(papers.safePdfName(".pdf"), "white-paper.pdf");
  assert.equal(papers.safePdfName("日本語.pdf"), "white-paper.pdf");
  assert.equal(papers.safePdfName("a..b.pdf"), "a.b.pdf");
});

test("whatever is uploaded, the name that results is accepted by the path check", () => {
  const uuid = "123e4567-e89b-42d3-a456-426614174000";
  for (const name of ["x.pdf", "A B C.PDF", "résumé.pdf", "../../etc/passwd.pdf", "日本語.pdf", "a".repeat(500) + ".pdf", "----.pdf", "..pdf", "tab\tname.pdf", "ünïcödé & symbols!!.pdf"]) {
    const path = `papers/${uuid}/${papers.safePdfName(name)}`;
    assert.match(path, papers.PAPER_PATH_PATTERN, name.slice(0, 30));
  }
});

test("the path check refuses anything the server did not mint", () => {
  const uuid = "123e4567-e89b-42d3-a456-426614174000";
  for (const bad of [
    "",
    "x.pdf",
    `papers/${uuid}/x.txt`,
    `papers/${uuid}/../x.pdf`,
    `papers/${uuid}/sub/x.pdf`,
    `media/${uuid}/x.pdf`,
    `papers/not-a-uuid/x.pdf`,
    `papers/${uuid.toUpperCase()}/x.pdf`,
    `/papers/${uuid}/x.pdf`,
    `papers/${uuid}/.pdf`,
    `papers/${uuid}/x.pdf/`,
    `papers/${uuid}/x y.pdf`,
  ]) {
    assert.doesNotMatch(bad, papers.PAPER_PATH_PATTERN, bad);
  }
});

test("a file's public address is in the documents bucket, with each part of the path encoded", () => {
  assert.equal(
    papers.documentUrl("https://abc.supabase.co/", "papers/u/a b.pdf"),
    "https://abc.supabase.co/storage/v1/object/public/documents/papers/u/a%20b.pdf",
  );
  assert.equal(papers.documentUrl("https://abc.supabase.co", "papers/u/x.pdf"), "https://abc.supabase.co/storage/v1/object/public/documents/papers/u/x.pdf");
});

test("file sizes read the way a person says them", () => {
  assert.equal(papers.formatFileSize(340 * 1024), "340 KB");
  assert.equal(papers.formatFileSize(Math.round(1.4 * 1024 * 1024)), "1.4 MB");
  assert.equal(papers.formatFileSize(25 * 1024 * 1024), "25.0 MB");
  for (const bad of [null, undefined, -1, Number.NaN, Number.POSITIVE_INFINITY]) assert.equal(papers.formatFileSize(bad), "", String(bad));
});

/* ── The admin screens ─────────────────────────────────────────────────────── */

const MODULES = [
  { dir: "subservices", table: "sub_services", save: "saveSubservice", remove: "deleteSubservice", label: "Sub-services" },
  { dir: "blogs", table: "blog_posts", save: "saveBlog", remove: "deleteBlog", label: "Blogs" },
  { dir: "case-studies", table: "case_studies", save: "saveCaseStudy", remove: "deleteCaseStudy", label: "Case studies" },
  { dir: "white-papers", table: "white_papers", save: "saveWhitePaper", remove: "deleteWhitePaper", label: "White papers" },
];

test("each module has a list and an editor, and a way into both from the side menu", () => {
  const nav = text("../components/admin/AdminNav.tsx");
  for (const m of MODULES) {
    assert.ok(existsSync(here(`../app/admin/(dashboard)/${m.dir}/page.tsx`)), `${m.dir}: list`);
    assert.ok(existsSync(here(`../app/admin/(dashboard)/${m.dir}/[id]/page.tsx`)), `${m.dir}: editor`);
    assert.match(nav, new RegExp(`href: "/admin/${m.dir}", label: "${m.label}"`), `${m.dir}: menu`);
  }
  assert.match(nav, /href: "\/admin\/insights", label: "Insights"/, "insights stays in the menu");
});

test("each list searches, filters by status and pages, through the shared helpers", () => {
  for (const m of [...MODULES, { dir: "insights", table: "insights" }]) {
    const page = text(`../app/admin/(dashboard)/${m.dir}/page.tsx`);
    assert.match(page, /fetchListPage/, `${m.dir}: paged on the database side`);
    assert.match(page, /<ListToolbar/, `${m.dir}: search and filters`);
    assert.match(page, /<Pager/, `${m.dir}: pagination`);
    assert.match(page, /searchColumns: \[/, `${m.dir}: search columns`);
    assert.match(page, new RegExp(`table: "${m.table}"`), `${m.dir}: table`);
    assert.match(page, /await requireStaff\(\)/, `${m.dir}: signed in`);
    assert.doesNotMatch(page, /error\.message/, `${m.dir}: never shows database wording`);
  }
});

test("the shared query builds one search condition, counts first, and then asks for a window of rows", () => {
  // Comments describe the code; only the code is counted.
  const query = text("../lib/admin/list-query.ts").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.equal((query.match(/\.or\(/g) ?? []).length, 1, "one .or() only");
  assert.match(query, /searchFilter\(config\.searchColumns, params\.q\)/);
  // A GET, not a HEAD: a HEAD response has no body, so a missing table would come back as a bare
  // 404 that the client reads as "no content", and the list would look empty instead of saying
  // that the setup script has not been run.
  assert.doesNotMatch(query, /head: true/, "the count is a GET, so an error keeps its body");
  assert.match(query, /\.select\("id", \{ count: "exact" \}\)\.limit\(1\)/);
  assert.match(query, /\.range\(window\.from, window\.from \+ window\.size - 1\)/);
  assert.ok(query.indexOf("count: \"exact\"") < query.indexOf(".range("), "the count comes before the rows, so an out-of-range page can be clamped");
});

test("the shared query pages by the list's own size, breaks ties by id, and filters by time window", () => {
  const query = text("../lib/admin/list-query.ts").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  // 20 a page unless a list says otherwise (the audit log says 40).
  assert.match(query, /const size = config\.pageSize \?\? PAGE_SIZE/);
  assert.match(query, /pageWindow\(counted\.count \?\? 0, config\.params\.page, size\)/);
  // Rows that tie on every sort column are put in a fixed order, or a page boundary between them
  // could show one twice and skip another. A list that already sorts by id keeps its own direction.
  assert.match(query, /config\.order\.some\(\(order\) => order\.column === "id"\)/);
  assert.match(query, /query\.order\("id", \{ ascending: true \}\)/);
  // A "last N days" filter compares a timestamp column with the start of the window.
  assert.match(query, /gte\(column: string, value: string\): Chain/);
  assert.match(query, /next\.gte\(windowColumn, windowStart\(nowMs, days\)\)/);
  assert.match(query, /if \(days > 0\)/, "a window that is not a positive number filters nothing instead of throwing");
  // The numbers beside a filter and the notice about waiting accounts count with the same filters.
  assert.match(query, /export async function countListRows\(/);
});

test("the audit log can be filtered to the four new tables", () => {
  const audit = text("../app/admin/(dashboard)/audit/page.tsx");
  for (const table of TABLES) assert.match(audit, new RegExp(`"${table}"`), table);
});

test("every server action signs the person in and checks their role before it reads the form", () => {
  const source = text("../lib/admin/resource-actions.ts");
  assert.match(source, /^"use server";/);
  assert.doesNotMatch(source, /^export (const|let|var|class|function)\b/m, "a use-server file may export async functions only");

  const bodies = source.split(/^export async function /m).slice(1);
  assert.equal(bodies.length, 9, "four saves, four deletes and the upload preparation");
  for (const body of bodies) {
    const name = body.match(/^(\w+)/)[1];
    const guard = body.search(/await require(Staff|Editor)\(\)/);
    assert.ok(guard >= 0, `${name} never checks who is asking`);
    for (const touch of ["formData.get", "formData.getAll", "str(formData", "createClient()", "optional(formData", "input?."]) {
      const at = body.indexOf(touch);
      if (at >= 0) assert.ok(guard < at, `${name} reads ${touch} before the guard`);
    }
  }
  for (const m of MODULES) {
    const remove = bodies.find((b) => b.startsWith(m.remove));
    assert.ok(remove, m.remove);
    assert.match(remove, /await requireEditor\(\)/, `${m.remove}: only editors delete`);
  }
});

test("an SEO manager's save touches the SEO fields only, and cannot create", () => {
  const source = text("../lib/admin/resource-actions.ts");
  for (const m of MODULES) {
    const body = source.split(/^export async function /m).find((b) => b.startsWith(m.save));
    assert.ok(body, m.save);
    assert.match(body, /if \(!id && seoOnly\) return \{ error: "Your role cannot create/, `${m.save}: no creating`);
    assert.match(body, new RegExp(`if \\(seoOnly\\) \\{\\n    const result = await commit\\("${m.table}", id, seoFields\\(formData\\)`), `${m.save}: SEO fields only`);
    // ...and it confirms like every other save: a redirect to the list with "Saved."
    assert.match(body, new RegExp(`redirect\\("/admin/${m.dir}\\?saved=updated"\\);\\n  \\}`), `${m.save}: the SEO save confirms`);
    const seoAt = body.indexOf("if (seoOnly) {");
    assert.ok(seoAt < body.indexOf("await requireEditor()"), `${m.save}: the SEO branch returns before the editor-only code`);
  }
});

test("saves refuse a bad slug before any write, and a slug is never changed once the row exists", () => {
  const source = text("../lib/admin/resource-actions.ts");
  assert.match(source, /id \? payload : \{ \.\.\.payload, slug \}/, "the slug is written on create only (blogs, case studies, papers)");
  assert.match(source, /id \? payload : \{ \.\.\.payload, parent_slug: parent, slug \}/, "so are the parent and slug of a sub-service");
  assert.equal((source.match(/badSlug\(slug\)/g) ?? []).length, 4, "every save validates the slug");
});

test("white-paper saves check the stored path and that the file arrived, and clean up replaced files", () => {
  const source = text("../lib/admin/resource-actions.ts");
  assert.match(source, /PAPER_PATH_PATTERN\.test\(filePath\)/);
  assert.match(source, /fileArrived\(filePath\)/);
  assert.match(source, /removeStoredFile\(previousPath\)/);
  assert.match(source, /removeStoredFile\(current\?\.file_path/, "deleting a paper deletes its file");
  // Upload preparation: editor only, validated before a signed address is made.
  const prepare = source.split(/^export async function /m).find((b) => b.startsWith("prepareWhitePaperUpload"));
  assert.ok(prepare.indexOf("MAX_PAPER_BYTES") < prepare.indexOf("createSignedUploadUrl"), "size is checked first");
  assert.match(prepare, /\.pdf\$/i);
});

test("the PDF goes from the browser to storage, never through a server action's 1 MB body", () => {
  const uploader = text("../components/admin/PdfUploader.tsx");
  assert.match(uploader, /uploadToSignedUrl/);
  assert.doesNotMatch(uploader, /FormData/, "the file itself is not posted to an action");
  assert.match(uploader, /name="file_path"/);
  assert.match(uploader, /name="file_name"/);
  assert.match(uploader, /name="file_size_bytes"/);
});

test("a table that does not exist yet gets one clear notice that names the script to run", () => {
  const notice = text("../components/admin/ResourceSchemaNotice.tsx");
  assert.match(notice, /supabase\/apply\/05-resource-modules\.sql/);
  assert.match(notice, /Role<\/strong> is/);
  assert.ok(existsSync(here("../supabase/apply/05-resource-modules.sql")));
  for (const m of MODULES) {
    for (const file of [`../app/admin/(dashboard)/${m.dir}/page.tsx`, `../app/admin/(dashboard)/${m.dir}/[id]/page.tsx`]) {
      assert.match(text(file), /<ResourceSchemaNotice module=/, `${file}: notice`);
    }
  }
});

/* ── What the editors see when something goes wrong or goes right ───────────── */

test("a failed save shows plain wording or one fixed sentence, never the database's own message", () => {
  const source = text("../lib/admin/resource-actions.ts");
  assert.doesNotMatch(source, /friendlyError/, "friendlyError falls back to the database's message");
  assert.match(source, /SAVE_FAILED/);
  assert.equal((source.match(/saveError\(/g) ?? []).length, 6, "the one definition, the shared write, and the four deletes");
  // The real message goes to the server log, with the table it came from.
  assert.match(source, /console\.error\(`\[admin\] \$\{table\} change failed:`/);
});

test("the list toolbar is keyed by the applied filters, so Clear and table links reset its controls", () => {
  const toolbar = text("../components/admin/ListToolbar.tsx");
  assert.match(toolbar, /const formKey = JSON\.stringify\(\[params\.q, params\.status, params\.extra\]\)/);
  assert.match(toolbar, /<form\s+key=\{formKey\}/);
});

test("a failed save puts back what was typed, and leaves a successful save to reset as before", () => {
  const form = text("../components/admin/EntityForm.tsx");
  assert.match(form, /useLayoutEffect\(\(\) => \{\s*if \(state\?\.error && form\.current && submitted\.current\) restoreFields/);
  assert.match(form, /submitted\.current = formData/);
  // Fields React controls keep their own values through a reset; these are not touched.
  for (const type of ["hidden", "file", "password"]) assert.match(form, new RegExp(`"${type}"`), type);
});

/* ── The header menu and the contact form follow the sub-services ───────────── */

test("the header reads its menu from the database-backed list, not from the static one", () => {
  const header = text("../components/site/Header.tsx");
  assert.match(header, /export async function Header\(/);
  assert.match(header, /const nav = await getNav\(\)/);
  assert.doesNotMatch(header, /import \{[^}]*\bnav\b[^}]*\} from "@\/lib\/content\/site"/);
  const nav = text("../lib/content/nav.ts");
  assert.match(nav, /buildNav\(nav, await listSubservices\(\)\)/);
});

test("the contact form lists the published sub-services, and no longer carries the code copies", () => {
  const form = text("../components/site/ContactForm.tsx");
  for (const file of ["cybersecurity-subservices", "cloud-subservices", "product-subservices"]) {
    assert.doesNotMatch(form, new RegExp(file), `${file} would ship the full text of every sub-service to the browser`);
  }
  assert.match(form, /subserviceGroups\.map\(/);
  const page = text("../app/contact/page.tsx");
  assert.match(page, /subserviceOptionGroups\(await listSubservices\(\)\)/);
  assert.match(page, /<ContactForm subserviceGroups=\{subserviceGroups\} \/>/);
  assert.match(page, /export const revalidate = 300/);
});

test("every public page refreshes on a timer, so the menu in its header cannot go stale", () => {
  // Every page outside the admin and the API. A page that reaches the header through a wrapper
  // component would not show up in a search for "<Header", so the rule covers them all.
  const pages = [];
  const walk = (dir) => {
    for (const entry of readdirSync(here(dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!(dir === "../app" && (entry.name === "admin" || entry.name === "api"))) walk(path);
      } else if (entry.name === "page.tsx") pages.push(path);
    }
  };
  walk("../app");
  assert.ok(pages.length >= 25, `found only ${pages.length} public pages: is the search broken?`);
  for (const path of pages) {
    assert.match(
      text(path),
      /export const revalidate = \d+|export const dynamic = "force-dynamic"/,
      `${path} would be built once and keep that menu until the next deploy`,
    );
  }
});

test("saving or deleting a sub-service refreshes every page, because each one carries it in its menu", () => {
  const source = text("../lib/admin/resource-actions.ts");
  assert.match(source, /if \(path === "\/"\) revalidatePath\("\/", "layout"\)/);
  assert.match(source, /const paths = \["\/", "\/services", "\/sitemap\.xml"\]/);
});

/* ── The header menu and the contact options, as behaviour ─────────────────── */

const navModel = await load("../lib/content/nav-model.ts");
const site = await load("../lib/content/site.ts");
const errorsModule = await load("../lib/admin/errors.ts");

// The published sub-services in the order the site shows them (what listSubservices() returns).
const inSiteOrder = (list) => model.subserviceParents.flatMap((parent) => model.inParent(list, parent.slug));
const servicesMenu = (menu) => menu.find((item) => item.href === "/services");
const hubMenu = (menu, hubHref) => servicesMenu(menu).children.find((child) => child.href === hubHref);

test("with today's 18 sub-services the header menu is exactly the one it has always been", () => {
  const built = navModel.buildNav(site.nav, inSiteOrder(subservices));
  assert.deepEqual(JSON.parse(JSON.stringify(built)), JSON.parse(JSON.stringify(site.nav)));
});

test("a new sub-service appears under its own service, in its saved place, with its own address", () => {
  const added = [
    ...subservices,
    { ...subservices[0], parentSlug: "ai-automations", slug: "voice-agents", name: "Voice Agents", order: 0 },
  ];
  const built = navModel.buildNav(site.nav, inSiteOrder(added));
  const ai = hubMenu(built, "/services/ai-automations").children;
  assert.equal(ai.length, 5);
  assert.deepEqual(ai[0], { label: "Voice Agents", href: "/services/ai-automations/voice-agents" });
  assert.equal(ai[0].href, model.subservicePath("ai-automations", "voice-agents"));
  // Nothing leaks into the other services.
  assert.equal(hubMenu(built, "/services/cybersecurity").children.length, 4);
  assert.equal(hubMenu(built, "/services/cloud-datacenter").children.length, 7);
});

test("a sub-service that is unpublished or deleted leaves the menu, and a hub with none keeps only its link", () => {
  const withoutCyber = subservices.filter((item) => item.parentSlug !== "cybersecurity");
  const built = navModel.buildNav(site.nav, inSiteOrder(withoutCyber));
  const cyber = hubMenu(built, "/services/cybersecurity");
  assert.equal(cyber.label, "Cybersecurity");
  assert.equal(cyber.children, undefined, "no empty dropdown");

  const one = subservices.filter((item) => item.parentSlug !== "cloud-datacenter" || item.slug === "cloud-cost-optimization");
  const cloud = hubMenu(navModel.buildNav(site.nav, inSiteOrder(one)), "/services/cloud-datacenter");
  assert.deepEqual(cloud.children.map((child) => child.label), ["Cloud Cost Optimization & Consulting"]);
});

test("a renamed sub-service shows under its new name, and an empty database list empties the four dropdowns only", () => {
  const renamed = subservices.map((item) => (item.slug === "penetration-testing" ? { ...item, name: "Pen Testing" } : item));
  const labels = hubMenu(navModel.buildNav(site.nav, inSiteOrder(renamed)), "/services/cybersecurity").children.map((c) => c.label);
  assert.ok(labels.includes("Pen Testing") && !labels.includes("Penetration Testing"));

  const built = navModel.buildNav(site.nav, []);
  for (const href of Object.keys(navModel.NAV_HUB_PARENTS)) assert.equal(hubMenu(built, href).children, undefined, href);
  // IT Infrastructure and Turnkey are not database-driven, and keep what they had.
  assert.equal(hubMenu(built, "/services/it-infrastructure").children.length, 4);
  assert.equal(hubMenu(built, "/services/turnkey-projects").href, "/services/turnkey-projects");
});

test("building the menu changes nothing outside the four services, and never edits the static menu", () => {
  const before = JSON.stringify(site.nav);
  const built = navModel.buildNav(site.nav, []);
  assert.equal(JSON.stringify(site.nav), before, "the static menu was edited in place");
  for (const item of site.nav) {
    if (item.href === "/services") continue;
    assert.deepEqual(built.find((b) => b.label === item.label), item, `${item.label} changed`);
  }
  assert.equal(servicesMenu(built).overviewLabel, "All services");
});

test("the contact form's groups follow the same list, in the same order, and skip an empty group", () => {
  const groups = navModel.subserviceOptionGroups(inSiteOrder(subservices));
  assert.deepEqual(groups.map((g) => g.label), [
    "Cybersecurity sub-services",
    "Cloud & Datacenter sub-services",
    "AI Automation sub-services",
    "Application Development sub-services",
  ]);
  assert.deepEqual(groups.map((g) => g.names.length), [4, 7, 4, 3]);
  assert.equal(groups[0].names[0], "Vulnerability Assessment");

  const noAi = navModel.subserviceOptionGroups(inSiteOrder(subservices.filter((s) => s.parentSlug !== "ai-automations")));
  assert.equal(noAi.length, 3);
  assert.ok(!noAi.some((g) => g.label.startsWith("AI")));
  assert.deepEqual(navModel.subserviceOptionGroups([]), []);
});

/* ── The words an editor reads when a save fails ───────────────────────────── */

test("each error an editor can cause is explained in plain words, and nothing else is passed through", () => {
  const { knownError, friendlyError, isMissingSchema, SAVE_FAILED } = errorsModule;

  assert.equal(knownError({ code: "23505", message: 'duplicate key value violates unique constraint "blog_posts_slug_key"' }), "That slug is already used by another page.");
  assert.match(knownError({ code: "42501", message: "new row violates row-level security policy" }), /role is not allowed/);
  assert.equal(knownError({ code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" }), "That record no longer exists.");
  for (const code of ["42P01", "PGRST205", "PGRST204"]) {
    assert.equal(isMissingSchema({ code }), true, code);
    assert.match(knownError({ code, message: "x" }), /schema has not been applied/);
  }

  const check = (constraint) => knownError({ code: "23514", message: `new row for relation "x" violates check constraint "${constraint}"` });
  assert.match(check("case_studies_client_needs_approval_to_publish"), /approval is recorded/);
  assert.match(check("case_studies_representative_is_unnamed"), /cannot name a client/);
  assert.match(check("case_studies_client_is_named"), /Name the client/);
  assert.match(check("white_papers_published_needs_a_file"), /Add the PDF, or a link to it/);
  assert.match(check("blog_posts_reading_minutes_check"), /outside the allowed range/);

  // Anything else is not explained here, so the new screens show one fixed sentence instead.
  const odd = { code: "XX000", message: "relation oid 16403 exploded" };
  assert.equal(knownError(odd), null);
  assert.doesNotMatch(SAVE_FAILED, /oid|exploded|relation/);
  assert.match(SAVE_FAILED, /could not be saved/);
  // The five older editors still use friendlyError, which keeps passing the message through.
  assert.equal(friendlyError(odd), "relation oid 16403 exploded");
  assert.equal(friendlyError(null), "Something went wrong.");
});
