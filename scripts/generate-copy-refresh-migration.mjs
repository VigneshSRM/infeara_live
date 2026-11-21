// Generates the additive migration for the wording changes in lib/content/copy-refresh.ts:
//
//   node scripts/generate-copy-refresh-migration.mjs          writes the migration
//   node scripts/generate-copy-refresh-migration.mjs --check  exits 1 if the file on disk is out of date
//
// What it changes, and why it is a new migration rather than an edit of the seed:
//
//   The live pages read their text from the database, and the database was filled by seed files
//   that have already run (supabase/seed.sql, 20261110200100_resource_modules_seed.sql). Those
//   files, and the lists in code they were made from, must not change. So the audit's changes (a
//   search title with a place in it on 28 pages, fuller text on 4, one blog title a character
//   shorter) go in as UPDATEs, each one guarded by the seeded value:
//
//     update … set seo_title = <new> where <page> and seo_title = <the seeded title>;
//
//   A page whose title (or, for the four expanded pages, whose intro, deliverables, outcomes and
//   FAQs) an editor has changed in the admin no longer matches its guard, so it is left exactly as
//   the editor wrote it. Running the script twice changes nothing the second time.
//
//   The audit trigger is switched off while the rows change, as the seed and the blog migration
//   do: a one-time import is not an edit by a person. It is switched on again before the block
//   ends, and only if it was on when the block began.
//
// supabase/apply/07-… is the same SQL wrapped as one statement for the dashboard SQL editor
// (scripts/make-apply-blobs.mjs). Exports `buildCopyRefreshMigration()` so
// tests/seo-audit-fixes.test.mjs can check the files on disk still match the content.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { json, load, loadSubservices, q, textArray } from "./generate-resource-seed.mjs";

const root = new URL("../", import.meta.url);

export const REFRESH_MIGRATION = "supabase/migrations/20261121120000_seo_audit_copy.sql";
export const REFRESH_APPLY = "supabase/apply/07-seo-audit-copy.sql";

/** Where a page's row is found, as SQL, and the table it is in. */
function rowOf(page) {
  if (page.kind === "service") return { table: "services", where: `slug = ${q(page.page)}`, path: `/services/${page.page}` };
  if (page.kind === "blog") return { table: "blog_posts", where: `slug = ${q(page.page)}`, path: `/blogs/${page.page}` };
  const [parent, slug] = page.page.split("/");
  return {
    table: "sub_services",
    where: `parent_slug = ${q(parent)} and slug = ${q(slug)}`,
    path: `/services/${page.page}`,
  };
}

// The tables the migration changes. Each has an audit trigger that is switched off for the run.
const TABLES = ["services", "sub_services", "blog_posts"];

function titleUpdate(page, seeded) {
  const { table, where, path } = rowOf(page);
  return `  -- ${path}: "${seeded.seo.title}" -> "${page.seoTitle}"
  update public.${table}
    set seo_title = ${q(page.seoTitle)}
    where ${where} and seo_title = ${q(seeded.seo.title)};
  get diagnostics changed = row_count;
  if changed = 0 then skipped := array_append(skipped, ${q(`${path} (title)`)}); end if;`;
}

function bodyUpdate(page, seeded) {
  const { table, where, path } = rowOf(page);
  const next = page.body;
  return `  -- ${path}: fuller text (${next.deliverables.length} deliverables, ${next.outcomes.length} outcomes, ${next.faqs.length} questions)
  update public.${table}
    set intro = ${q(next.intro)},
        deliverables = ${json(next.deliverables)},
        outcomes = ${textArray(next.outcomes)},
        faqs = ${json(next.faqs)}
    where ${where}
      and intro = ${q(seeded.intro)}
      and deliverables = ${json(seeded.deliverables)}
      and outcomes = ${textArray(seeded.outcomes)}
      and faqs = ${json(seeded.faqs)};
  get diagnostics changed = row_count;
  if changed = 0 then skipped := array_append(skipped, ${q(`${path} (text)`)}); end if;`;
}

function auditTriggerCheck(table) {
  return `to_regclass('public.${table}') is not null and exists (
    select 1 from pg_trigger
    where tgrelid = 'public.${table}'::regclass and tgname = 'c_audit' and not tgisinternal and tgenabled = 'O'
  )`;
}

export async function buildCopyRefreshMigration() {
  const [refresh, servicesModule, subservices, blogs] = await Promise.all([
    load("lib/content/copy-refresh.ts"),
    load("lib/content/services.ts"),
    loadSubservices(),
    load("lib/content/blogs.ts"),
  ]);

  const seededFor = (page) => {
    const found =
      page.kind === "service"
        ? servicesModule.services.find((service) => service.slug === page.page)
        : page.kind === "blog"
          ? blogs.starterBlogPosts.find((post) => post.slug === page.page)
          : subservices.find((item) => `${item.parentSlug}/${item.slug}` === page.page);
    if (!found) throw new Error(`copy-refresh.ts names a page that is not in the seeded lists: ${page.page}`);
    return found;
  };

  const titles = refresh.refreshedPages.map((page) => titleUpdate(page, seededFor(page)));
  const bodies = refresh.refreshedPages.filter((page) => page.body).map((page) => bodyUpdate(page, seededFor(page)));
  const expanded = refresh.refreshedPages.filter((page) => page.body).map((page) => rowOf(page).path);

  const pageCount = refresh.refreshedPages.filter((page) => page.kind !== "blog").length;
  const blogCount = refresh.refreshedPages.length - pageCount;

  const sql = `-- Generated by scripts/generate-copy-refresh-migration.mjs — do not edit by hand.
-- From the SEO audit of 21 November 2026: ${pageCount} service and focused-service pages get a search title that says
-- where the company is, ${expanded.length} thin pages get fuller text (${expanded.join(", ")}),
-- and ${blogCount} blog post title is shortened to fit a search result.
--
-- Safe to run again. A page is changed only while it still holds the wording it was seeded with,
-- so a title or text an editor has changed in the admin is never overwritten, and a second run
-- changes nothing. Run it after supabase/apply/05-resource-modules.sql. The audit trigger is off
-- while the rows change, because this is a one-time update and not an edit by a person.
-- ${REFRESH_APPLY} is the same SQL as one statement for the dashboard SQL editor.

do $$
declare
${TABLES.map((table) => `  audit_${table} boolean;`).join("\n")}
  changed integer;
  skipped text[] := '{}';
begin
  if to_regclass('public.services') is null then
    raise exception 'The services table does not exist yet. Run supabase/apply/01-schema.sql first, then run this again.';
  end if;
  if to_regclass('public.sub_services') is null or to_regclass('public.blog_posts') is null then
    raise exception 'The sub_services and blog_posts tables do not exist yet. Run supabase/apply/05-resource-modules.sql first, then run this again.';
  end if;

${TABLES.map((table) => `  audit_${table} := ${auditTriggerCheck(table)};`).join("\n")}

${TABLES.map((table) => `  if audit_${table} then alter table public.${table} disable trigger c_audit; end if;`).join("\n")}

${titles.join("\n\n")}

${bodies.join("\n\n")}

${TABLES.map((table) => `  if audit_${table} then alter table public.${table} enable trigger c_audit; end if;`).join("\n")}

  if cardinality(skipped) > 0 then
    raise notice 'Left as they were (changed in the admin, or already updated): %', array_to_string(skipped, ', ');
  end if;
end $$;
`;

  return { path: REFRESH_MIGRATION, sql, counts: { titles: titles.length, bodies: bodies.length } };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const { path, sql, counts } = await buildCopyRefreshMigration();
  const target = new URL(path, root);

  if (process.argv.includes("--check")) {
    let current = "";
    try {
      current = readFileSync(target, "utf8");
    } catch {
      /* missing counts as out of date */
    }
    if (current !== sql) {
      console.error(`${path} is out of date. Run: node scripts/generate-copy-refresh-migration.mjs`);
      process.exit(1);
    }
    console.log(`${path} is up to date.`);
  } else {
    writeFileSync(target, sql);
    console.log(`Wrote ${path} (${counts.titles} titles, ${counts.bodies} pages of fuller text)`);
  }
}

