#!/usr/bin/env node
// Build paste-safe copies of the Supabase SQL files for the dashboard SQL editor.
//
// The studio editor splits a pasted script into statements before running it and
// can cut a `create policy … for update …` statement in half. Wrapping a file in
// a single base64 string inside `do $$ … $$` makes it one statement, which no
// splitter can break, while keeping the original files readable and diffable.
//
//   node scripts/make-apply-blobs.mjs
//   → supabase/apply/01-schema.sql, supabase/apply/02-seed.sql
//
// Run 01 first, then 02, each as a fresh query in the SQL editor.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const targets = [
  ["supabase/migrations/20261106090000_cms_schema.sql", "supabase/apply/01-schema.sql", "schema, roles, RLS, audit, storage"],
  ["supabase/seed.sql", "supabase/apply/02-seed.sql", "content seed"],
];

mkdirSync("supabase/apply", { recursive: true });

for (const [source, output, label] of targets) {
  const sql = readFileSync(source, "utf8");
  const encoded = Buffer.from(sql, "utf8").toString("base64");
  const wrapper = [
    `-- ${label} - generated from ${source} by scripts/make-apply-blobs.mjs.`,
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
  console.log(`${output}  ${Math.round(wrapper.length / 1024)} KB  (from ${source})`);
}
