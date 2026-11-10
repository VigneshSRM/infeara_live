#!/usr/bin/env node
// Build paste-safe copies of the Supabase SQL files for the dashboard SQL editor.
//
// The studio editor splits a pasted script into statements before running it and
// can cut a `create policy … for update …` statement in half. Wrapping a file in
// a single base64 string inside `do $$ … $$` makes it one statement, which no
// splitter can break, while keeping the original files readable and diffable.
//
//   node scripts/make-apply-blobs.mjs
//   → supabase/apply/01-schema.sql, 02-seed.sql, 03-lead-notes.sql, 04-core-services.sql
//
// Run 01 first, then 02, each as a fresh query in the SQL editor. 03 adds the lead
// notes chat and can be run at any time after 01 (it is safe to run again). 04 is for a
// database that was set up before AI Automations and Application Development existed:
// it adds them and publishes them (also safe to run again).
//
// 01 and 02 are large and stay out of git. 03 and 04 are small and ARE committed, so they
// can be copied straight from GitHub; tests check they still match their migrations, so
// run this script again whenever a migration they come from changes.
//
// A migration may open with `begin;` and close with `commit;` so that psql and the CLI
// keep it all-or-nothing. Inside the wrapper those two lines are dropped, because
// Postgres refuses to run them from `execute` ("EXECUTE of transaction commands is not
// implemented") and the single statement is already one transaction.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// [sources, output, label]. Several sources are joined in order into one statement.
const targets = [
  [["supabase/migrations/20261106090000_cms_schema.sql"], "supabase/apply/01-schema.sql", "schema, roles, RLS, audit, storage"],
  [["supabase/seed.sql"], "supabase/apply/02-seed.sql", "content seed"],
  [["supabase/migrations/20261109210000_lead_notes.sql"], "supabase/apply/03-lead-notes.sql", "lead notes chat"],
  [
    [
      "supabase/migrations/20261106150000_split_automation_application_services.sql",
      "supabase/migrations/20261110090000_publish_core_services.sql",
    ],
    "supabase/apply/04-core-services.sql",
    "AI Automations and Application Development services",
  ],
];

// Whole-line `begin;` / `commit;` only. tests/core-services.test.mjs applies the same rule.
const withoutTransactionLines = (sql) => sql.replace(/^[ \t]*(?:begin|commit)[ \t]*;[ \t]*(?:\r?\n|$)/gim, "");

mkdirSync("supabase/apply", { recursive: true });

for (const [sources, output, label] of targets) {
  const sql = sources.map((source) => withoutTransactionLines(readFileSync(source, "utf8"))).join("\n");
  const encoded = Buffer.from(sql, "utf8").toString("base64");
  const wrapper = [
    `-- ${label} - generated from ${sources.join(" + ")} by scripts/make-apply-blobs.mjs.`,
    "-- Do not edit. Paste the whole file into the Supabase SQL editor and press Run.",
    "-- One statement, so the editor cannot split it. Regenerate after changing the source.",
    "",
    "do $$",
    "begin",
    `  execute convert_from(decode('${encoded}', 'base64'), 'UTF8');`,
    "end $$;",
    "",
  ].join("\n");
  writeFileSync(output, wrapper);
  console.log(`${output}  ${Math.round(wrapper.length / 1024)} KB  (from ${sources.join(" + ")})`);
}
