// Unit tests for the Overview analytics and the lead notes chat.
//
//   npm run test:unit
//
// Covers the pure modules only: lib/analytics/ga4-core.ts, lib/analytics/format.ts,
// lib/admin/lead-stats.ts and lib/admin/lead-chat.ts. Each is plain TypeScript with no
// app imports, so it is compiled in memory with the project's own TypeScript and loaded
// from a data: URL. No build, no server, no Supabase, no Google.

import assert from "node:assert/strict";
import { createPublicKey, createVerify, generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

async function load(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const ga = await load("../lib/analytics/ga4-core.ts");
const fmt = await load("../lib/analytics/format.ts");
const stats = await load("../lib/admin/lead-stats.ts");
const chat = await load("../lib/admin/lead-chat.ts");

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const keyFile = {
  type: "service_account",
  project_id: "demo",
  client_email: "reports@demo.iam.gserviceaccount.com",
  private_key: privateKey,
};

/* ── Range ─────────────────────────────────────────────────────────────────── */

test("range: only 7, 30 and 90 are accepted, 30 otherwise", () => {
  assert.equal(ga.parseRange("7"), 7);
  assert.equal(ga.parseRange("90"), 90);
  assert.equal(ga.parseRange(["7", "90"]), 7);
  for (const bad of [undefined, "", "14", "abc", "-7", "30; drop"]) assert.equal(ga.parseRange(bad), 30);
});

test("range: the previous window is the same length and directly before the current one", () => {
  const { current, previous } = ga.dateRangesFor(30);
  assert.deepEqual(current, { name: "current", startDate: "29daysAgo", endDate: "today" });
  assert.deepEqual(previous, { name: "previous", startDate: "59daysAgo", endDate: "30daysAgo" });
  const seven = ga.dateRangesFor(7);
  assert.equal(seven.current.startDate, "6daysAgo");
  assert.equal(seven.previous.startDate, "13daysAgo");
  assert.equal(seven.previous.endDate, "7daysAgo");
});

/* ── Settings ──────────────────────────────────────────────────────────────── */

test("property id: digits only, and the G- measurement id is called out", () => {
  assert.deepEqual(ga.parsePropertyId("123456789"), { ok: true, id: "123456789" });
  assert.deepEqual(ga.parsePropertyId(" properties/123456789 "), { ok: true, id: "123456789" });
  assert.deepEqual(ga.parsePropertyId('"123456789"'), { ok: true, id: "123456789" });
  assert.deepEqual(ga.parsePropertyId(undefined), { ok: false, reason: "missing" });
  assert.deepEqual(ga.parsePropertyId("   "), { ok: false, reason: "missing" });
  assert.deepEqual(ga.parsePropertyId("G-RCNB7MXXCQ"), { ok: false, reason: "measurement_id" });
  assert.deepEqual(ga.parsePropertyId("12ab"), { ok: false, reason: "invalid" });
  assert.deepEqual(ga.parsePropertyId("12"), { ok: false, reason: "invalid" });
});

test("service account: the file as downloaded, quoted, or base64", () => {
  const json = JSON.stringify(keyFile);
  for (const raw of [json, `'${json}'`, Buffer.from(json).toString("base64")]) {
    const result = ga.parseServiceAccount(raw);
    assert.equal(result.ok, true);
    assert.equal(result.account.email, keyFile.client_email);
    assert.match(result.account.privateKey, /BEGIN PRIVATE KEY/);
  }
});

test("service account: a key whose newlines arrived as literal \\n text is repaired", () => {
  const flattened = { ...keyFile, private_key: privateKey.replace(/\n/g, "\\n") };
  const result = ga.parseServiceAccount(JSON.stringify(flattened));
  assert.equal(result.ok, true);
  assert.ok(result.account.privateKey.includes("\n"));
  // And the repaired key really signs.
  assert.doesNotThrow(() => ga.signServiceAccountJwt(result.account, 1_700_000_000));
});

test("service account: each wrong paste says what is wrong", () => {
  assert.deepEqual(ga.parseServiceAccount(undefined), { ok: false, reason: "missing" });
  assert.deepEqual(ga.parseServiceAccount(""), { ok: false, reason: "missing" });
  assert.deepEqual(ga.parseServiceAccount("{not json"), { ok: false, reason: "invalid_json" });
  assert.deepEqual(ga.parseServiceAccount("hello world"), { ok: false, reason: "invalid_json" });
  assert.deepEqual(ga.parseServiceAccount(JSON.stringify({ installed: { client_id: "x" } })), { ok: false, reason: "wrong_type" });
  assert.deepEqual(ga.parseServiceAccount(JSON.stringify({ ...keyFile, type: "authorized_user" })), { ok: false, reason: "wrong_type" });
  assert.deepEqual(ga.parseServiceAccount(JSON.stringify({ client_email: "a@b.c" })), { ok: false, reason: "missing_fields" });
  assert.deepEqual(ga.parseServiceAccount(JSON.stringify({ ...keyFile, private_key: "not a key" })), { ok: false, reason: "missing_fields" });
  assert.deepEqual(ga.parseServiceAccount(JSON.stringify({ ...keyFile, client_email: "nobody" })), { ok: false, reason: "missing_fields" });
});

/* ── Token request ─────────────────────────────────────────────────────────── */

test("jwt: three parts, the right claims, and a signature Google's side could verify", () => {
  const now = 1_800_000_000;
  const jwt = ga.signServiceAccountJwt({ email: keyFile.client_email, privateKey }, now);
  const [header, claims, signature] = jwt.split(".");
  assert.ok(!/[+/=]/.test(jwt), "base64url has no +, / or = padding");

  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url").toString()), { alg: "RS256", typ: "JWT" });
  assert.deepEqual(JSON.parse(Buffer.from(claims, "base64url").toString()), {
    iss: keyFile.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  });

  const verifier = createVerify("RSA-SHA256").update(`${header}.${claims}`);
  assert.equal(verifier.verify(createPublicKey(publicKey), Buffer.from(signature, "base64url")), true);
});

test("jwt: a private key that cannot sign throws instead of returning a bad token", () => {
  const broken = "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n";
  assert.throws(() => ga.signServiceAccountJwt({ email: "a@b.c", privateKey: broken }, 1));
});

/* ── Requests ──────────────────────────────────────────────────────────────── */

test("requests: both batches respect Google's five-report limit and use the real field names", () => {
  const main = ga.buildMainBatch(30);
  const extras = ga.buildExtrasBatch(30);
  assert.equal(main.requests.length, ga.MAIN_KEYS.length);
  assert.equal(extras.requests.length, ga.EXTRA_KEYS.length);
  assert.ok(main.requests.length <= 5 && extras.requests.length <= 5);

  const [totals, daily, pages, channels, countries] = main.requests;
  assert.deepEqual(totals.dateRanges.map((range) => range.name), ["current", "previous"]);
  assert.deepEqual(totals.metrics.map((metric) => metric.name), [...ga.TOTAL_METRICS]);
  assert.equal(daily.dimensions[0].name, "date");
  assert.equal(daily.keepEmptyRows, true);
  assert.equal(pages.dimensions[0].name, "pagePath");
  assert.equal(channels.dimensions[0].name, "sessionDefaultChannelGroup");
  assert.equal(countries.dimensions[0].name, "country");
  assert.deepEqual(extras.requests.map((request) => request.dimensions[0].name), ["city", "deviceCategory", "sessionSourceMedium"]);
  assert.deepEqual(ga.REALTIME_REQUEST, { metrics: [{ name: "activeUsers" }] });
});

/* ── Reading the answer ────────────────────────────────────────────────────── */

const report = (dimensionNames, metricNames, rows) => ({
  dimensionHeaders: dimensionNames.map((name) => ({ name })),
  metricHeaders: metricNames.map((name) => ({ name })),
  rows: rows.map(([dims, metrics]) => ({
    dimensionValues: dims.map((value) => ({ value })),
    metricValues: metrics.map((value) => ({ value: String(value) })),
  })),
});

test("table: values are matched by header name, not by position", () => {
  const table = ga.toTable(report(["country"], ["activeUsers", "sessions"], [[["India"], [12, 30]]]));
  assert.deepEqual(table.rows, [{ dims: { country: "India" }, metrics: { activeUsers: 12, sessions: 30 } }]);
  assert.deepEqual(ga.toTable(undefined).rows, []);
  assert.deepEqual(ga.toTable({}).rows, []);
  assert.equal(ga.toTable(report([], ["activeUsers"], [[[], ["not a number"]]])).rows[0].metrics.activeUsers, 0);
});

const totalsReport = (labels) =>
  report(
    ["dateRange"],
    [...ga.TOTAL_METRICS],
    labels.map(([label, users]) => [[label], [users, users / 2, users * 2, users * 5, 0.6, users * 90]]),
  );

test("totals: current and previous come from the named ranges", () => {
  const { current, previous } = ga.toTotals(ga.toTable(totalsReport([["previous", 100], ["current", 150]])));
  assert.equal(current.activeUsers, 150);
  assert.equal(previous.activeUsers, 100);
  assert.equal(current.screenPageViews, 750);
  assert.equal(current.engagementRate, 0.6);
});

test("totals: Google's date_range_N labels work too", () => {
  const { current, previous } = ga.toTotals(ga.toTable(totalsReport([["date_range_0", 8], ["date_range_1", 4]])));
  assert.equal(current.activeUsers, 8);
  assert.equal(previous.activeUsers, 4);
});

test("totals: a window with no traffic has no row and reads as zeros", () => {
  const { current, previous } = ga.toTotals(ga.toTable(totalsReport([["current", 40]])));
  assert.equal(current.activeUsers, 40);
  assert.deepEqual(previous, { activeUsers: 0, newUsers: 0, sessions: 0, screenPageViews: 0, engagementRate: 0, userEngagementDuration: 0 });
  const none = ga.toTotals(ga.toTable({}));
  assert.equal(none.current.activeUsers, 0);
});

test("daily: GA dates are parsed, sorted, and quiet days are filled with zeros", () => {
  const table = ga.toTable(
    report(["date"], ["activeUsers", "sessions", "screenPageViews"], [
      [["20261105"], [7, 9, 20]],
      [["20261103"], [3, 4, 8]],
      [["garbage"], [99, 99, 99]],
    ]),
  );
  const daily = ga.toDaily(table);
  assert.deepEqual(daily.map((day) => day.date), ["2026-11-03", "2026-11-04", "2026-11-05"]);
  assert.deepEqual(daily.map((day) => day.users), [3, 0, 7]);
  assert.deepEqual(daily[2], { date: "2026-11-05", users: 7, sessions: 9, views: 20 });
  assert.deepEqual(ga.toDaily(ga.toTable({})), []);
});

test("daily: filling gaps survives a month boundary", () => {
  const daily = ga.toDaily(ga.toTable(report(["date"], ["activeUsers"], [[["20261030"], [1]], [["20261102"], [2]]])));
  assert.deepEqual(daily.map((day) => day.date), ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
});

test("ranked: unknowns are dropped, duplicates merged, biggest first, trimmed to the limit", () => {
  const table = ga.toTable(
    report(["country"], ["activeUsers", "sessions"], [
      [["India"], [10, 20]],
      [["(not set)"], [50, 50]],
      [["United States"], [30, 31]],
      [["India"], [5, 6]],
      [[""], [9, 9]],
      [["Japan"], [0, 0]],
      [["Germany"], [2, 2]],
    ]),
  );
  const ranked = ga.toRanked(table, "country", "activeUsers", { secondary: "sessions", limit: 3 });
  assert.deepEqual(ranked, [
    { label: "United States", value: 30, secondary: 31 },
    { label: "India", value: 15, secondary: 26 },
    { label: "Germany", value: 2, secondary: 2 },
  ]);
});

test("realtime: no rows means nobody is on the site, not a failure", () => {
  assert.equal(ga.toRealtime({}), 0);
  assert.equal(ga.toRealtime({ rows: [] }), 0);
  assert.equal(ga.toRealtime(report([], ["activeUsers"], [[[], [7]]])), 7);
  assert.equal(ga.toRealtime(null), 0);
});

test("change and averages", () => {
  assert.equal(ga.pctChange(150, 100), 0.5);
  assert.equal(ga.pctChange(50, 100), -0.5);
  assert.equal(ga.pctChange(10, 0), null);
  assert.equal(ga.avgEngagementSeconds({ activeUsers: 4, userEngagementDuration: 300 }), 75);
  assert.equal(ga.avgEngagementSeconds({ activeUsers: 0, userEngagementDuration: 300 }), 0);
});

/* ── When Google says no ───────────────────────────────────────────────────── */

test("google errors: both response shapes are understood", () => {
  assert.deepEqual(ga.parseGoogleError({ error: "invalid_grant", error_description: "Invalid JWT Signature." }), {
    status: "invalid_grant",
    message: "Invalid JWT Signature.",
  });
  assert.deepEqual(
    ga.parseGoogleError({
      error: { code: 403, status: "PERMISSION_DENIED", message: "API disabled", details: [{ "@type": "x" }, { reason: "SERVICE_DISABLED" }] },
    }),
    { status: "PERMISSION_DENIED", reason: "SERVICE_DISABLED", message: "API disabled" },
  );
  assert.deepEqual(ga.parseGoogleError(null), {});
  assert.deepEqual(ga.parseGoogleError("oops"), {});
  assert.deepEqual(ga.parseGoogleError({ error: 5 }), {});
});

test("problems: each failure tells staff what to do, in fixed wording", () => {
  const email = "reports@demo.iam.gserviceaccount.com";
  const disabled = ga.describeProblem({ stage: "report", httpStatus: 403, fault: { status: "PERMISSION_DENIED", reason: "SERVICE_DISABLED" }, serviceEmail: email });
  assert.equal(disabled.code, "api_disabled");
  assert.match(disabled.detail, /Google Analytics Data API/);

  const noAccess = ga.describeProblem({ stage: "report", httpStatus: 403, fault: { status: "PERMISSION_DENIED" }, serviceEmail: email });
  assert.equal(noAccess.code, "no_access");
  assert.ok(noAccess.detail.includes(email), "names the account to add as a Viewer");
  assert.equal(noAccess.reference, "HTTP 403 · PERMISSION_DENIED");

  assert.equal(ga.describeProblem({ stage: "report", httpStatus: 429 }).code, "quota");
  assert.equal(ga.describeProblem({ stage: "report", httpStatus: 503 }).code, "unavailable");
  assert.equal(ga.describeProblem({ stage: "report", httpStatus: 400 }).code, "bad_request");
  assert.equal(ga.describeProblem({ stage: "report", httpStatus: 418 }).code, "unknown");
  assert.equal(ga.describeProblem({ stage: "token", httpStatus: 400, fault: { status: "invalid_grant" } }).code, "rejected_key");
  assert.equal(ga.describeProblem({ stage: "token", httpStatus: 502 }).code, "unavailable");
  assert.equal(ga.describeProblem({ stage: "network" }).code, "unreachable");
  assert.equal(ga.describeProblem({ stage: "key" }).code, "invalid_key");

  // Google's own message text never reaches the page.
  const leaky = ga.describeProblem({
    stage: "report",
    httpStatus: 403,
    fault: { status: "PERMISSION_DENIED", message: "User does not have sufficient permissions for properties/999" },
  });
  assert.ok(!JSON.stringify(leaky).includes("sufficient permissions"));
});

/* ── Wording ───────────────────────────────────────────────────────────────── */

test("format: Indian digit grouping, rates, durations", () => {
  assert.equal(fmt.formatCount(1234567), "12,34,567");
  assert.equal(fmt.formatCount(0), "0");
  assert.equal(fmt.formatCount(12.6), "13");
  assert.equal(fmt.formatCount(Number.NaN), "0");
  assert.equal(fmt.formatRate(0.6351), "63.5%");
  assert.equal(fmt.formatRate(0), "0.0%");
  assert.equal(fmt.formatDuration(0), "0s");
  assert.equal(fmt.formatDuration(45), "45s");
  assert.equal(fmt.formatDuration(185), "3m 05s");
  assert.equal(fmt.formatDuration(4320), "1h 12m");
  assert.equal(fmt.formatDuration(-5), "0s");
});

test("format: change is shown as a dash when there is nothing to compare with", () => {
  assert.deepEqual(fmt.describeDelta(null, "the previous 30 days").tone, "none");
  assert.equal(fmt.describeDelta(null, "x").text, "—");
  assert.deepEqual(fmt.describeDelta(0.125, "x"), { text: "+13%", tone: "up", label: "Up 12.5% against x" });
  assert.equal(fmt.describeDelta(0.0625, "x").text, "+6.3%");
  assert.equal(fmt.describeDelta(-0.5, "x").text, "−50%");
  assert.equal(fmt.describeDelta(-0.5, "x").tone, "down");
  assert.equal(fmt.describeDelta(0, "x").tone, "flat");
  assert.equal(fmt.describePointsDelta(0.62, 0.58, true, "x").text, "+4.0 pts");
  assert.equal(fmt.describePointsDelta(0.5, 0.58, true, "x").tone, "down");
  assert.equal(fmt.describePointsDelta(0.5, 0, false, "x").tone, "none");
});

test("format: how long ago, in the largest sensible unit", () => {
  const base = Date.parse("2026-11-09T10:00:00Z");
  assert.equal(fmt.formatAge(base - 20_000, base), "under a minute");
  assert.equal(fmt.formatAge(base - 12 * 60_000, base), "12 min");
  assert.equal(fmt.formatAge(base - 60 * 60_000, base), "1 hour");
  assert.equal(fmt.formatAge(base - 5 * 3_600_000, base), "5 hours");
  assert.equal(fmt.formatAge(base - 47 * 3_600_000, base), "47 hours");
  assert.equal(fmt.formatAge(base - 72 * 3_600_000, base), "3 days");
  assert.equal(fmt.formatAge(base + 5000, base), "under a minute", "a clock slightly ahead never shows a negative age");
});

test("format: ago", () => {
  const base = Date.parse("2026-11-09T10:00:00Z");
  assert.equal(fmt.formatAgo(base - 10_000, base), "just now");
  assert.equal(fmt.formatAgo(base - 3 * 3_600_000, base), "3 hours ago");
  assert.equal(fmt.formatAgo(base - 5 * 86_400_000, base), "5 days ago");
});

test("format: calendar days are not shifted by the server's time zone", () => {
  assert.equal(fmt.shortDate("2026-11-03"), "3 Nov");
  assert.equal(fmt.weekdayDate("2026-11-03"), "Tue, 3 Nov");
  assert.equal(fmt.shortDate("2026-12-31"), "31 Dec");
  assert.equal(fmt.weekdayDate("2027-01-01"), "Fri, 1 Jan");
  assert.equal(fmt.shareOf(25, 100), 0.25);
  assert.equal(fmt.shareOf(1, 0), 0);
});

/* ── Lead statistics ───────────────────────────────────────────────────────── */

test("lead days: the day rolls over at midnight IST, not midnight UTC", () => {
  assert.equal(stats.istDay("2026-11-03T18:29:59Z"), "2026-11-03");
  assert.equal(stats.istDay("2026-11-03T18:30:00Z"), "2026-11-04");
  assert.equal(stats.istDay(Date.parse("2026-11-03T00:00:00Z")), "2026-11-03");
  assert.equal(new Date(stats.istDayStart(Date.parse("2026-11-03T20:00:00Z"))).toISOString(), "2026-11-03T18:30:00.000Z");
});

const now = Date.parse("2026-11-09T10:00:00Z"); // 15:30 IST on 9 Nov

test("lead days: a zero-filled daily series, oldest first, ending today", () => {
  const series = stats.dailyCounts(
    ["2026-11-09T01:00:00Z", "2026-11-09T09:00:00Z", "2026-11-07T10:00:00Z", "2026-10-01T00:00:00Z", "not a date"],
    5,
    now,
  );
  assert.deepEqual(series, [
    { date: "2026-11-05", count: 0 },
    { date: "2026-11-06", count: 0 },
    { date: "2026-11-07", count: 1 },
    { date: "2026-11-08", count: 0 },
    { date: "2026-11-09", count: 2 },
  ]);
});

test("lead windows: this period against the one before it", () => {
  const stamps = [
    "2026-11-09T05:00:00Z", // today
    "2026-11-03T05:00:00Z", // 6 days ago: last day of a 7-day window
    "2026-11-02T05:00:00Z", // 7 days ago: first day of the previous window
    "2026-10-27T05:00:00Z", // 13 days ago: last of the previous window
    "2026-10-26T05:00:00Z", // 14 days ago: outside both
    "2026-11-09T19:00:00Z", // 00:30 IST on 10 Nov: tomorrow, counted in neither
  ];
  assert.deepEqual(stats.windowCounts(stamps, 7, now), { current: 2, previous: 2 });
  assert.equal(stats.countBetween(stamps, stats.istDayStart(now), stats.istDayStartDaysAgo(now, -1)), 1);
});

test("lead breakdowns: most common first, blanks ignored, ties keep first-seen order", () => {
  const rows = [{ t: "Managed IT" }, { t: "Cloud" }, { t: " Managed IT " }, { t: null }, { t: "" }, { t: "Security" }, { t: "Cloud" }];
  assert.deepEqual(stats.topBy(rows, (row) => row.t, 2), [
    { label: "Managed IT", count: 2 },
    { label: "Cloud", count: 2 },
  ]);
  assert.deepEqual(stats.topBy([], () => "x", 5), []);
  assert.equal(stats.per100(5, 200), 2.5);
  assert.equal(stats.per100(5, 0), null);
});

/* ── Notes chat ────────────────────────────────────────────────────────────── */

test("note draft: trimmed, line endings normalised, empty and over-long refused", () => {
  assert.deepEqual(chat.cleanNoteBody("  hello\r\nworld \n"), { ok: true, body: "hello\nworld" });
  assert.deepEqual(chat.cleanNoteBody("   \n "), { ok: false, error: "empty" });
  assert.deepEqual(chat.cleanNoteBody(undefined), { ok: false, error: "empty" });
  assert.deepEqual(chat.cleanNoteBody(42), { ok: false, error: "empty" });
  assert.equal(chat.cleanNoteBody("a".repeat(chat.NOTE_MAX_LENGTH)).ok, true);
  assert.deepEqual(chat.cleanNoteBody("a".repeat(chat.NOTE_MAX_LENGTH + 1)), { ok: false, error: "too_long" });
});

test("note ids are validated as uuids before they reach a query", () => {
  assert.equal(chat.isUuid("3f2b8c1e-5a4d-4c7e-9b1a-0d2e6f7a8b9c"), true);
  for (const bad of ["", "abc", "3f2b8c1e-5a4d-4c7e-9b1a-0d2e6f7a8b9c; drop table", undefined, 5, null]) {
    assert.equal(chat.isUuid(bad), false);
  }
});

test("note rows: a missing author name falls back, nothing else is exposed", () => {
  const note = chat.rowToNote({ id: "n1", author_id: "u1", author_name: "  ", body: "hi", created_at: "2026-11-09T05:00:00Z", author_email: "secret@x.com" });
  assert.deepEqual(note, { id: "n1", authorId: "u1", authorName: "Staff member", body: "hi", createdAt: "2026-11-09T05:00:00Z" });
});

const note = (id, createdAt, extra = {}) => ({ id, authorId: "u1", authorName: "Asha", body: `note ${id}`, createdAt, ...extra });

test("chat layout: oldest first, one heading per IST day, with Today and Yesterday", () => {
  const groups = chat.groupByDay(
    [
      note("c", "2026-11-09T05:00:00Z"), // 10:30 IST, 9 Nov
      note("a", "2026-11-07T05:00:00Z"),
      note("b", "2026-11-08T18:29:00Z"), // 23:59 IST, 8 Nov
      note("d", "2026-11-08T18:31:00Z"), // 00:01 IST, 9 Nov: next day by the IST clock
    ],
    now,
  );
  assert.deepEqual(groups.map((group) => group.label).slice(1), ["Yesterday", "Today"]);
  assert.equal(groups[0].label, "Sat, 7 Nov 2026");
  assert.deepEqual(groups.map((group) => group.notes.map((n) => n.id)), [["a"], ["b"], ["d", "c"]]);
});

test("chat layout: same-instant messages keep a stable order", () => {
  const sorted = chat.sortNotes([note("b", "2026-11-09T05:00:00Z"), note("a", "2026-11-09T05:00:00Z")]);
  assert.deepEqual(sorted.map((n) => n.id), ["a", "b"]);
});

test("chat time is shown in IST, lower-case am/pm", () => {
  assert.equal(chat.timeLabel("2026-11-09T04:11:00Z"), "9:41 am");
  assert.equal(chat.timeLabel("2026-11-09T18:29:00Z"), "11:59 pm");
  assert.equal(chat.noteDay("2026-11-09T18:31:00Z"), "2026-11-10");
});

test("chat refresh: identical threads are recognised, a saved message is added once", () => {
  const a = [note("1", "2026-11-09T05:00:00Z"), note("2", "2026-11-09T05:01:00Z")];
  assert.equal(chat.sameThread(a, [...a]), true);
  assert.equal(chat.sameThread(a, a.slice(0, 1)), false);
  assert.equal(chat.sameThread(a, [a[0], { ...a[1], body: "edited" }]), false);

  const saved = note("3", "2026-11-09T05:02:00Z");
  assert.deepEqual(chat.withSaved(a, saved).map((n) => n.id), ["1", "2", "3"]);
  assert.equal(chat.withSaved([...a, saved], saved).length, 3, "a refresh that already has it does not duplicate it");
});

/* ── The migration and its committed paste-ready copy ─────────────────────── */

const migrationSql = readFileSync(new URL("../supabase/migrations/20261109210000_lead_notes.sql", import.meta.url), "utf8");

test("the paste-ready notes file is exactly the migration, wrapped as one statement", () => {
  // Regenerate with `node scripts/make-apply-blobs.mjs` after any change to the migration.
  const wrapper = readFileSync(new URL("../supabase/apply/03-lead-notes.sql", import.meta.url), "utf8");
  const payload = wrapper.match(/decode\('([A-Za-z0-9+/=]+)', 'base64'\)/);
  assert.ok(payload, "the wrapper holds the migration as base64");
  assert.equal(Buffer.from(payload[1], "base64").toString("utf8"), migrationSql, "wrapper and migration have drifted apart");
  assert.equal((wrapper.match(/^do \$\$$/gm) ?? []).length, 1, "one do-block, so the SQL editor cannot split it");
  assert.equal((wrapper.match(/;/g) ?? []).length, 2, "two semicolons only: the execute and the end of the block");
});

test("the migration keeps the rules the screen relies on", () => {
  const sql = migrationSql.replace(/--.*$/gm, "");
  // Immutable: no update policy and no update grant for signed-in users.
  assert.doesNotMatch(sql, /create policy[^;]*for update/i);
  assert.match(sql, /grant select, insert, delete on public\.lead_notes to authenticated;/);
  assert.doesNotMatch(sql, /grant[^;]*update[^;]*to authenticated/i);
  // Only a super admin deletes; any staff member reads and sends as themselves.
  assert.match(sql, /for delete to authenticated using \(public\.is_super_admin\(\)\)/);
  assert.match(sql, /for select to authenticated using \(public\.is_staff\(\)\)/);
  assert.match(sql, /with check \(public\.is_staff\(\) and author_id = auth\.uid\(\)\)/);
  // Nothing is open to visitors, and the table is protected by row level security.
  assert.doesNotMatch(sql, /\bto\s+(anon|public)\b/i);
  assert.match(sql, /alter table public\.lead_notes enable row level security;/);
  // Safe to run twice.
  assert.doesNotMatch(sql, /create table public\./, "tables are created with if not exists");
  assert.match(sql, /on conflict \(id\) do nothing/);
});
