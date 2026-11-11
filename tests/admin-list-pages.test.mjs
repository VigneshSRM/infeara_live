// Wiring checks for the admin lists that did not page before this change (Leads, Users, Practices,
// Sectors, Legal documents, FAQ groups) and the Audit log, which paged but could not search, plus
// a guard that no admin page shows a table without paging it.
//
//   npm run test:unit
//
// These read the source, like the other wiring tests: the screens themselves need a signed-in
// session and a database, so what they do is checked in a browser against a stand-in Supabase
// (see the README) and what they are made of is checked here.

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const here = (path) => new URL(path, import.meta.url);
const text = (path) => readFileSync(here(path), "utf8");
/** Source without comments, so a sentence that explains the code is not mistaken for the code. */
const code = (path) => text(path).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const page = (dir) => `../app/admin/(dashboard)/${dir}/page.tsx`;

async function load(path) {
  const { outputText } = ts.transpileModule(text(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const LISTS = [
  { dir: "leads", table: "leads", guard: "requireStaff" },
  { dir: "users", table: "profiles", guard: "requireSuperAdmin" },
  { dir: "services", table: "services", guard: "requireStaff" },
  { dir: "industries", table: "industries", guard: "requireStaff" },
  { dir: "legal", table: "legal_documents", guard: "requireStaff" },
  { dir: "faqs", table: "faq_groups", guard: "requireStaff" },
  { dir: "audit", table: "audit_log", guard: "requireStaff" },
];

/* ── Every list is searched, filtered and paged in the database ────────────── */

test("each list searches, filters and pages through the shared helpers", () => {
  for (const list of LISTS) {
    const source = code(page(list.dir));
    assert.match(source, /fetchListPage</, `${list.dir}: paged on the database side`);
    assert.match(source, /<ListToolbar/, `${list.dir}: search and filters`);
    assert.match(source, /<Pager/, `${list.dir}: pagination`);
    assert.match(source, /<ResourceTable/, `${list.dir}: the shared table`);
    assert.match(source, /<ListError \/>/, `${list.dir}: a failed read says so in fixed words`);
    assert.match(source, /parseListParams\(raw/, `${list.dir}: the address is cleaned before it reaches a query`);
    assert.match(source, /searchColumns/, `${list.dir}: search columns`);
    assert.match(source, new RegExp(`table: "${list.table}"`), `${list.dir}: table`);
    assert.match(source, new RegExp(`await ${list.guard}\\(\\)`), `${list.dir}: signed in with the right role`);
    assert.match(source, /export const dynamic = "force-dynamic"/, `${list.dir}: never cached`);
  }
});

test("no list reads every row, shows the database's wording or pages by hand", () => {
  for (const list of LISTS) {
    const source = code(page(list.dir));
    assert.doesNotMatch(source, /error\.message/, `${list.dir}: never shows database wording`);
    assert.doesNotMatch(source, /\.limit\(/, `${list.dir}: no fixed row cap standing in for paging`);
    assert.doesNotMatch(source, /\.range\(/, `${list.dir}: paging belongs to the shared query`);
    assert.doesNotMatch(source, /\.order\(/, `${list.dir}: ordering is declared in the query's config`);
  }
});

test("no admin page can show a table without paging it", () => {
  const root = fileURLToPath(here("../app/admin/(dashboard)"));
  const pages = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name === "page.tsx") pages.push(full);
    }
  })(root);

  const withTable = pages.filter((file) => /<table|<ResourceTable/.test(readFileSync(file, "utf8")));
  assert.ok(withTable.length >= 12, `expected the twelve list pages, found ${withTable.length}`);

  for (const file of withTable) {
    const source = readFileSync(file, "utf8");
    const name = file.slice(root.length);
    assert.match(source, /fetchListPage</, `${name}: a table must come from fetchListPage`);
    assert.match(source, /<Pager/, `${name}: a table must have a pager`);
    assert.match(source, /<ListToolbar/, `${name}: a table must have search and filters`);
  }
});

/* ── The shared toolbar ────────────────────────────────────────────────────── */

test("the toolbar takes a list's own statuses, or carries a status the page shows as buttons", () => {
  const toolbar = text("../components/admin/ListToolbar.tsx");
  assert.match(toolbar, /statuses = STATUS_FILTERS/, "the content statuses are the default");
  assert.match(toolbar, /\{statuses\.map\(\(option\) => \(/, "the dropdown lists the given statuses");
  assert.match(
    toolbar,
    /\) : params\.status !== "all" \? \(\s*<input type="hidden" name="status" value=\{params\.status\} \/>/,
    "searching on Leads keeps the status chosen with its buttons",
  );
  assert.match(toolbar, /\{extra\.anyLabel \?\? "All"\}/, "the blank choice of a filter can say what it means");
});

test("a wide table scrolls inside its card and cannot widen the page through a hidden label", () => {
  const table = text("../components/admin/ResourceTable.tsx");
  // A row with a visually hidden label (the Users role forms have one each) is the case: an absolutely
  // positioned label ignores a scroll container that is not positioned itself.
  assert.match(table, /<div className="relative overflow-x-auto">/);
  const users = text(page("users"));
  assert.match(users, /className="sr-only" htmlFor=\{`role-\$\{row\.id\}`\}/, "the case this guards is real: Users rows carry an sr-only label");
});

test("the pager can say Newer and Older", () => {
  const pager = text("../components/admin/Pager.tsx");
  assert.match(pager, /previousLabel = "Previous"/);
  assert.match(pager, /nextLabel = "Next"/);
  assert.equal((pager.match(/\{previousLabel\}/g) ?? []).length, 2, "linked and disabled");
  assert.equal((pager.match(/\{nextLabel\}/g) ?? []).length, 2, "linked and disabled");
});

/* ── Leads ─────────────────────────────────────────────────────────────────── */

test("Leads keeps its status buttons, counts what the search matches, and adds search, a time window and pages", () => {
  const leads = code(page("leads"));
  assert.match(leads, /aria-label="Filter by status"/, "the buttons keep their name");
  assert.match(leads, /LEAD_STATUS_FILTERS\.map\(\(option\) =>\s*countListRows\(\{ table: "leads", params: \{ \.\.\.params, status: option\.value, page: 1 \}/);
  assert.match(leads, /href=\{listHref\(PATH, params, \{ status: item\.value, page: 1 \}\)\}/, "a button keeps the search and starts at page 1");
  assert.match(leads, /parseListParams\(raw, \[RECEIVED\], LEAD_STATUS_FILTERS\)/);
  assert.match(leads, /showStatus=\{false\}/, "the statuses are the buttons, not a dropdown");
  assert.match(leads, /windowFilter\("received", "Received", \[1, 7, 30, 90\]\)/);
  assert.match(leads, /WINDOW_COLUMNS = \{ received: "created_at" \}/);
  for (const column of ["name", "email", "company", "phone", "topic", "message"]) {
    assert.match(leads, new RegExp(`SEARCH_COLUMNS = \\[[^\\]]*"${column}"`), `searches ${column}`);
  }
  assert.match(leads, /order: \[\s*\{ column: "created_at", ascending: false \},\s*\{ column: "id", ascending: false \},?\s*\]/, "newest first");
  // The notes column reads the notes of the rows on this page only.
  assert.match(leads, /loadNoteActivity\(\s*supabase,\s*rows\.map\(\(row\) => row\.id\),?\s*\)/);
  assert.match(leads, /deleted=\{one\(raw\.deleted\)\} error=\{one\(raw\.error\)\}/, "the flash after a delete still shows");
});

/* ── Users ─────────────────────────────────────────────────────────────────── */

test("Users filters by role, says how many are waiting for access, and keeps its place after a role change", async () => {
  const users = code(page("users"));
  assert.match(users, /parseListParams\(raw, \[ROLE_FILTER\], \[\]\)/, "the role is the list's status, so there is no status dropdown");
  assert.match(users, /extraColumns: \{ role: "role" \}/);
  assert.match(users, /searchColumns: \["full_name", "email"\]/);
  assert.match(users, /order: \[\{ column: "role" \}, \{ column: "created_at" \}\]/);
  assert.match(users, /countListRows\(\{\s*table: "profiles",\s*params: \{ q: "", status: "all", page: 1, extra: \{ role: "pending" \} \}/, "counts everyone waiting, whatever the search");
  assert.match(users, /href=\{WAITING_HREF\}/);
  assert.match(users, /<input type="hidden" name="return_query" value=\{returnQuery\} \/>/);
  assert.match(users, /const returnQuery = listQueryString\(params\)/);
  assert.match(users, /Admit/, "a waiting account is admitted from the same table");

  const actions = code("../lib/admin/user-actions.ts");
  const start = actions.indexOf("export async function updateUserRole");
  const body = actions.slice(start, actions.indexOf("export async function", start + 10));
  assert.match(body, /listHrefFromQuery\(USERS_PATH, str\(formData, "return_query"\), \[ROLE_FILTER\], \[\]\)/);
  assert.doesNotMatch(body, /redirect\("\/admin\/users/, "every outcome goes back to the same list");
  assert.ok((body.match(/redirect\(back\(/g) ?? []).length >= 5, "each error and the success go back to the list");

  // The action and the screen name the same four roles.
  const roles = await load("../lib/admin/user-roles.ts");
  const declared = /const ROLES = \[([^\]]+)\] as const/.exec(actions)?.[1].match(/"([a-z_]+)"/g)?.map((value) => value.slice(1, -1));
  assert.deepEqual(declared, roles.USER_ROLES.map((role) => role.value));
});

/* ── Practices ─────────────────────────────────────────────────────────────── */

test("Practices judges the six core services by a read of their own, not by the rows on the page", () => {
  const services = code(page("services"));
  assert.match(services, /async function loadCoreGaps\(\)/);
  assert.match(services, /\.in\("slug", \[\.\.\.coreServiceSlugs\]\)/);
  assert.match(services, /coreServiceGaps\(coreServiceSlugs, \(core\.data \?\? \[\]\) as CoreServiceRow\[\], Date\.now\(\)\)/);
  assert.doesNotMatch(services, /coreServiceGaps\([^)]*\brows\b/, "the page's rows may be a search result: never judge the six by them");
  assert.match(services, /if \(core\.error \|\| !total\) return \[\]/, "an empty or unreadable table flags nothing");
  assert.match(services, /order: \[\{ column: "sort_order" \}, \{ column: "slug" \}\]/);
});

test("a draft that has a date ahead is a draft, not a scheduled page", () => {
  for (const dir of ["services", "industries", "legal", "faqs"]) {
    const source = code(page(dir));
    assert.match(source, /scheduled=\{row\.status === "published" && Boolean\(/, dir);
  }
});

/* ── Audit log ─────────────────────────────────────────────────────────────── */

test("the audit log keeps 40 a page, Newer and Older and its old table links, and gains filters", () => {
  const audit = code(page("audit"));
  assert.match(audit, /const PAGE_SIZE = 40/);
  assert.match(audit, /pageSize: PAGE_SIZE/);
  assert.match(audit, /name: "table"/, "?table=… from an old link still filters");
  assert.match(audit, /extraColumns: \{ table: "table_name", action: "action" \}/);
  assert.match(audit, /windowColumns: \{ when: "created_at" \}/);
  assert.match(audit, /searchColumns: \["actor_email", "row_id"\]/);
  assert.match(audit, /previousLabel="Newer" nextLabel="Older"/);
  assert.match(audit, /parseListParams\(raw, EXTRAS, \[\]\)/, "the log has no status of its own");
  assert.match(audit, /order: \[\s*\{ column: "created_at", ascending: false \},\s*\{ column: "id", ascending: false \},?\s*\]/);
  for (const action of ["insert", "update", "delete"]) assert.match(audit, new RegExp(`value: "${action}"`), action);
});
