#!/usr/bin/env node
// Apply SQL files to a Supabase project through the Management API.
//
// Requires a *personal access token* (supabase.com/dashboard/account/tokens),
// not the project anon/secret API keys — those cannot run DDL.
//
//   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
//   node scripts/apply-sql.mjs supabase/migrations/20261106090000_cms_schema.sql supabase/seed.sql
//
// The project ref defaults to the one in NEXT_PUBLIC_SUPABASE_URL.

import { readFileSync } from "node:fs";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref =
  process.env.SUPABASE_PROJECT_REF ??
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];

if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is not set. Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}
if (!ref) {
  console.error("Could not determine the project ref. Set SUPABASE_PROJECT_REF.");
  process.exit(1);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/apply-sql.mjs <file.sql> [more.sql ...]");
  process.exit(1);
}

for (const file of files) {
  const sql = readFileSync(file, "utf8");
  process.stdout.write(`Applying ${file} (${Math.round(sql.length / 1024)} KB)… `);

  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`failed (${response.status})\n${text}`);
    process.exit(1);
  }

  console.log("ok");
  if (text && text !== "[]") console.log(text.slice(0, 1000));
}
