// Unit tests for the six core services: the CMS notice that says when one is hidden from
// visitors, the paste-ready repair file for the database, and the checks that keep the code,
// the seed and the migrations agreeing about which services exist.
//
//   npm run test:unit
//
// No build, no server, no Supabase. lib/content/core-services.ts is plain TypeScript with no
// app imports, so it is compiled in memory with the project's own TypeScript and loaded from a
// data: URL (the same approach as tests/dashboard.test.mjs).

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

const core = await load("../lib/content/core-services.ts");
const taxonomy = await load("../lib/content/service-taxonomy.ts");
const six = taxonomy.coreServiceSlugs;

const NOW = Date.parse("2026-11-10T09:00:00Z");
const row = (slug, extra = {}) => ({ id: `id-${slug}`, slug, status: "published", published_at: null, ...extra });
const allLive = six.map((slug) => row(slug));

/* ── Which core services a visitor cannot see ─────────────────────────────── */

test("nothing is reported when all six core services are live", () => {
  assert.deepEqual(core.coreServiceGaps(six, allLive, NOW), []);
  // Other services in the table do not matter.
  assert.deepEqual(core.coreServiceGaps(six, [...allLive, row("managed-it", { status: "draft" })], NOW), []);
});

test("a core service with no row is reported as missing, without an id", () => {
  const rows = allLive.filter((r) => r.slug !== "ai-automations" && r.slug !== "application-development");
  assert.deepEqual(core.coreServiceGaps(six, rows, NOW), [
    { slug: "ai-automations", problem: "missing" },
    { slug: "application-development", problem: "missing" },
  ]);
});

test("a row that exists but is hidden says why, and carries its id so the notice can link to it", () => {
  const rows = allLive.map((r) => {
    if (r.slug === "cybersecurity") return { ...r, status: "draft" };
    if (r.slug === "cloud-datacenter") return { ...r, status: "archived" };
    if (r.slug === "turnkey-projects") return { ...r, published_at: "2026-11-11T00:00:00Z" };
    return r;
  });
  assert.deepEqual(core.coreServiceGaps(six, rows, NOW), [
    { slug: "cybersecurity", id: "id-cybersecurity", problem: "draft" },
    { slug: "cloud-datacenter", id: "id-cloud-datacenter", problem: "archived" },
    { slug: "turnkey-projects", id: "id-turnkey-projects", problem: "scheduled" },
  ]);
});

test("gaps keep the order of the core list, and an unknown status counts as hidden", () => {
  const rows = [row("application-development", { status: "pending" }), row("it-infrastructure", { status: "draft" })];
  assert.deepEqual(
    core.coreServiceGaps(six, rows, NOW).map((g) => [g.slug, g.problem]),
    [
      ["it-infrastructure", "draft"],
      ["cybersecurity", "missing"],
      ["cloud-datacenter", "missing"],
      ["turnkey-projects", "missing"],
      ["ai-automations", "missing"],
      ["application-development", "draft"],
    ],
  );
});

test("isLive applies the public read policy: published, and not dated for later", () => {
  assert.equal(core.isLive(row("a"), NOW), true);
  assert.equal(core.isLive(row("a", { published_at: "2026-11-10T09:00:00Z" }), NOW), true, "dated exactly now is live");
  assert.equal(core.isLive(row("a", { published_at: "2026-01-01T00:00:00Z" }), NOW), true);
  assert.equal(core.isLive(row("a", { published_at: "2026-11-10T09:00:01Z" }), NOW), false);
  assert.equal(core.isLive(row("a", { status: "draft" }), NOW), false);
  assert.equal(core.isLive(row("a", { status: "archived", published_at: "2026-01-01T00:00:00Z" }), NOW), false);
});

/* ── The repair file for the database ─────────────────────────────────────── */

const splitPath = "../supabase/migrations/20261106150000_split_automation_application_services.sql";
const publishPath = "../supabase/migrations/20261110090000_publish_core_services.sql";
// The same rule as scripts/make-apply-blobs.mjs: whole-line `begin;` and `commit;` only.
const withoutTransactionLines = (sql) => sql.replace(/^[ \t]*(?:begin|commit)[ \t]*;[ \t]*(?:\r?\n|$)/gim, "");

test("the paste-ready core-services file is exactly the two migrations, wrapped as one statement", () => {
  // Regenerate with `node scripts/make-apply-blobs.mjs` after any change to either migration.
  const wrapper = text("../supabase/apply/04-core-services.sql");
  const payload = wrapper.match(/decode\('([A-Za-z0-9+/=]+)', 'base64'\)/);
  assert.ok(payload, "the wrapper holds the SQL as base64");
  const decoded = Buffer.from(payload[1], "base64").toString("utf8");
  assert.equal(
    decoded,
    [text(splitPath), text(publishPath)].map(withoutTransactionLines).join("\n"),
    "wrapper and migrations have drifted apart",
  );
  assert.equal((wrapper.match(/^do \$\$$/gm) ?? []).length, 1, "one do-block, so the SQL editor cannot split it");
  assert.equal((wrapper.match(/;/g) ?? []).length, 2, "two semicolons only: the execute and the end of the block");
});

test("the wrapped SQL has no begin or commit: Postgres cannot run them from execute", () => {
  const wrapper = text("../supabase/apply/04-core-services.sql");
  const decoded = Buffer.from(wrapper.match(/decode\('([A-Za-z0-9+/=]+)', 'base64'\)/)[1], "base64").toString("utf8");
  assert.doesNotMatch(decoded, /^\s*(begin|commit)\s*;/im);
  // Both migrations stay all-or-nothing when run directly with psql or the CLI.
  for (const path of [splitPath, publishPath]) {
    const sql = text(path);
    assert.match(sql, /^begin;$/m, `${path} opens a transaction`);
    assert.match(sql, /^commit;$/m, `${path} closes it`);
  }
});

test("the publish migration publishes both services, then refuses to report success if either is hidden", () => {
  const sql = text(publishPath).replace(/--.*$/gm, "");
  assert.match(sql, /update public\.services/);
  assert.match(sql, /slug in \('ai-automations', 'application-development'\)/);
  assert.match(sql, /status = 'published'/);
  assert.match(sql, /raise exception/, "a hidden service stops the run");
  // The check mirrors the public read policy, including the publish date.
  assert.match(sql, /s\.status = 'published'/);
  assert.match(sql, /s\.published_at is null or s\.published_at <= now\(\)/);
  // It never deletes anything.
  assert.doesNotMatch(sql, /\bdelete\b|\bdrop\b|\btruncate\b/i);
});

test("the split migration still creates the two services as published, in place of the old combined one", () => {
  const sql = text(splitPath);
  assert.match(sql, /insert into public\.services[^\n]*\n\s*values \('ai-automations', 9,/);
  assert.match(sql, /insert into public\.services[^\n]*\n\s*values \('application-development', 10,/);
  assert.equal((sql.match(/'published', now\(\)\)/g) ?? []).length, 2, "both rows are inserted as published");
  assert.match(sql, /where slug = 'automation-custom-software'/, "the old combined row is renamed, not left behind");
});

/* ── Code, seed and routes agree about the six ────────────────────────────── */

test("there are six core services, as the page copy says", () => {
  assert.equal(six.length, 6);
  for (const path of ["../app/page.tsx", "../app/services/page.tsx"]) {
    assert.match(text(path), /Six core services/, `${path} says six`);
  }
});

test("every core service has a seed row, a card image and its own page", () => {
  const seed = text("../supabase/seed.sql");
  const servicesInsert = seed.slice(seed.indexOf("insert into public.services"), seed.indexOf("end if;", seed.indexOf("insert into public.services")));
  const images = text("../lib/site-images.ts");
  const coreImages = images.slice(images.indexOf("export const coreServiceImages"), images.indexOf("satisfies Record", images.indexOf("export const coreServiceImages")));

  for (const slug of six) {
    assert.match(servicesInsert, new RegExp(`\\(\\s*'${slug}', \\d+,`), `${slug} is in supabase/seed.sql`);
    assert.match(coreImages, new RegExp(`(?:"${slug}"|\\b${slug}):`), `${slug} has a card image in lib/site-images.ts`);
    assert.ok(existsSync(here(`../app/services/${slug}/page.tsx`)), `${slug} has app/services/${slug}/page.tsx`);
  }
});

test("the CMS notice points at a repair file that exists", () => {
  const notice = text("../components/admin/CoreServiceNotice.tsx");
  const named = notice.match(/supabase\/apply\/[\w-]+\.sql/g) ?? [];
  assert.ok(named.length > 0, "the notice names the repair file");
  for (const file of new Set(named)) assert.ok(existsSync(here(`../${file}`)), `${file} exists`);
});
