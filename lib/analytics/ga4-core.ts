/**
 * Google Analytics 4 reporting, without the network.
 *
 * Everything here is a pure function: how to read the two settings that connect
 * the CMS to a GA4 property, how to sign the service-account token request, what
 * to ask the Data API for, how to turn its answer into numbers, and what to tell
 * staff when it refuses. `lib/analytics/ga4.ts` does the fetching and calls this.
 *
 * It imports nothing from the app (only node:crypto) so the unit tests can load it
 * on its own, the same way they load `lib/auth/access.ts`.
 */

import { createSign } from "node:crypto";

/* ── Range ─────────────────────────────────────────────────────────────────── */

export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];
export const DEFAULT_RANGE: RangeDays = 30;

/** `?range=` from the URL. Anything unexpected falls back to the default. */
export function parseRange(value: string | string[] | undefined): RangeDays {
  const first = Array.isArray(value) ? value[0] : value;
  const days = Number(first);
  return (RANGE_OPTIONS as readonly number[]).includes(days) ? (days as RangeDays) : DEFAULT_RANGE;
}

export type GaDateRange = { name: string; startDate: string; endDate: string };

/**
 * The selected window and the equally long window right before it. GA counts
 * "today" in the property's own time zone, so relative dates keep us from
 * guessing that zone. `29daysAgo` .. `today` is 30 days including today.
 */
export function dateRangesFor(days: RangeDays): { current: GaDateRange; previous: GaDateRange } {
  return {
    current: { name: "current", startDate: `${days - 1}daysAgo`, endDate: "today" },
    previous: { name: "previous", startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` },
  };
}

/* ── Settings ──────────────────────────────────────────────────────────────── */

/** Pasted values often arrive wrapped in one pair of quotes. */
function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && first === last) return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export type PropertyIdResult =
  | { ok: true; id: string }
  | { ok: false; reason: "missing" | "measurement_id" | "invalid" };

/**
 * The numeric Property ID (Admin → Property details). The `G-…` Measurement ID
 * used for tracking is a different thing and is the usual mix-up.
 */
export function parsePropertyId(raw: string | undefined): PropertyIdResult {
  const value = unquote(raw ?? "").replace(/^properties\//i, "");
  if (!value) return { ok: false, reason: "missing" };
  if (/^G-/i.test(value)) return { ok: false, reason: "measurement_id" };
  if (!/^\d{4,20}$/.test(value)) return { ok: false, reason: "invalid" };
  return { ok: true, id: value };
}

export type ServiceAccount = { email: string; privateKey: string };

export type ServiceAccountResult =
  | { ok: true; account: ServiceAccount }
  | { ok: false; reason: "missing" | "invalid_json" | "wrong_type" | "missing_fields" };

/**
 * The service-account key file. Accepts the JSON as downloaded, wrapped in quotes,
 * or base64-encoded (some hosts mangle multi-line values).
 */
export function parseServiceAccount(raw: string | undefined): ServiceAccountResult {
  let text = unquote(raw ?? "");
  if (!text) return { ok: false, reason: "missing" };

  if (!text.startsWith("{")) {
    try {
      text = Buffer.from(text, "base64").toString("utf8").trim();
    } catch {
      return { ok: false, reason: "invalid_json" };
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, reason: "invalid_json" };

  const record = parsed as Record<string, unknown>;
  // An OAuth client file ("installed" / "web") is the common wrong download.
  if ((typeof record.type === "string" && record.type !== "service_account") || record.installed || record.web) {
    return { ok: false, reason: "wrong_type" };
  }

  const email = typeof record.client_email === "string" ? record.client_email.trim() : "";
  let privateKey = typeof record.private_key === "string" ? record.private_key : "";
  // A key pasted through a shell or a form can arrive with literal "\n" text.
  if (privateKey && !privateKey.includes("\n") && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!email.includes("@") || !/-----BEGIN (RSA )?PRIVATE KEY-----/.test(privateKey)) {
    return { ok: false, reason: "missing_fields" };
  }
  return { ok: true, account: { email, privateKey } };
}

/* ── Token request ─────────────────────────────────────────────────────────── */

export const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
export const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const DATA_API = "https://analyticsdata.googleapis.com/v1beta";

export function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * A signed JWT that Google exchanges for a one-hour access token. Throws if the
 * private key cannot sign, which the caller reports as an unusable key.
 */
export function signServiceAccountJwt(account: ServiceAccount, nowSec: number): string {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = { iss: account.email, scope: GA_SCOPE, aud: TOKEN_URL, iat: nowSec, exp: nowSec + 3600 };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign("RSA-SHA256").update(data).sign(account.privateKey);
  return `${data}.${base64url(signature)}`;
}

/* ── What to ask for ───────────────────────────────────────────────────────── */

export const TOTAL_METRICS = [
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "engagementRate",
  "userEngagementDuration",
] as const;
export type TotalMetric = (typeof TOTAL_METRICS)[number];
export type Totals = Record<TotalMetric, number>;

type Json = Record<string, unknown>;

const byMetricDesc = (metric: string) => [{ metric: { metricName: metric }, desc: true }];
const names = (list: readonly string[]) => list.map((name) => ({ name }));

/** Five reports in one HTTP call (the batch limit). Order matches MAIN_KEYS. */
export const MAIN_KEYS = ["totals", "daily", "pages", "channels", "countries"] as const;

export function buildMainBatch(days: RangeDays): { requests: Json[] } {
  const { current, previous } = dateRangesFor(days);
  return {
    requests: [
      // Both windows in one report: the totals and what they are compared with.
      { dateRanges: [current, previous], metrics: names(TOTAL_METRICS) },
      {
        dateRanges: [current],
        dimensions: names(["date"]),
        metrics: names(["activeUsers", "sessions", "screenPageViews"]),
        orderBys: [{ dimension: { dimensionName: "date", orderType: "ALPHANUMERIC" } }],
        keepEmptyRows: true,
        limit: "100",
      },
      {
        dateRanges: [current],
        dimensions: names(["pagePath"]),
        metrics: names(["screenPageViews", "activeUsers"]),
        orderBys: byMetricDesc("screenPageViews"),
        limit: "10",
      },
      {
        dateRanges: [current],
        dimensions: names(["sessionDefaultChannelGroup"]),
        metrics: names(["sessions", "activeUsers"]),
        orderBys: byMetricDesc("sessions"),
        limit: "8",
      },
      {
        dateRanges: [current],
        dimensions: names(["country"]),
        metrics: names(["activeUsers"]),
        orderBys: byMetricDesc("activeUsers"),
        limit: "10",
      },
    ],
  };
}

export const EXTRA_KEYS = ["cities", "devices", "sources"] as const;

export function buildExtrasBatch(days: RangeDays): { requests: Json[] } {
  const { current } = dateRangesFor(days);
  return {
    requests: [
      {
        dateRanges: [current],
        dimensions: names(["city"]),
        metrics: names(["activeUsers"]),
        orderBys: byMetricDesc("activeUsers"),
        limit: "12",
      },
      {
        dateRanges: [current],
        dimensions: names(["deviceCategory"]),
        metrics: names(["activeUsers"]),
        orderBys: byMetricDesc("activeUsers"),
        limit: "5",
      },
      {
        dateRanges: [current],
        dimensions: names(["sessionSourceMedium"]),
        metrics: names(["sessions", "activeUsers"]),
        orderBys: byMetricDesc("sessions"),
        limit: "10",
      },
    ],
  };
}

/** People active on the site in the last 30 minutes (the realtime default window). */
export const REALTIME_REQUEST: Json = { metrics: names(["activeUsers"]) };

/* ── Reading the answer ────────────────────────────────────────────────────── */

export type GaReport = {
  dimensionHeaders?: { name?: string }[];
  metricHeaders?: { name?: string }[];
  rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
  metadata?: { timeZone?: string };
};

export type TableRow = { dims: Record<string, string>; metrics: Record<string, number> };
export type Table = { rows: TableRow[]; timeZone: string | null };

const toNumber = (value: string | undefined) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/** Headers + positional values → named records, so nothing depends on column order. */
export function toTable(report: GaReport | undefined | null): Table {
  const dimNames = (report?.dimensionHeaders ?? []).map((header) => header.name ?? "");
  const metricNames = (report?.metricHeaders ?? []).map((header) => header.name ?? "");

  const rows = (report?.rows ?? []).map((row) => {
    const dims: Record<string, string> = {};
    const metrics: Record<string, number> = {};
    dimNames.forEach((name, index) => {
      dims[name] = row.dimensionValues?.[index]?.value ?? "";
    });
    metricNames.forEach((name, index) => {
      metrics[name] = toNumber(row.metricValues?.[index]?.value);
    });
    return { dims, metrics };
  });

  return { rows, timeZone: report?.metadata?.timeZone ?? null };
}

const emptyTotals = (): Totals => ({
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
  screenPageViews: 0,
  engagementRate: 0,
  userEngagementDuration: 0,
});

function totalsFrom(row: TableRow | undefined): Totals {
  const totals = emptyTotals();
  if (!row) return totals;
  for (const metric of TOTAL_METRICS) totals[metric] = row.metrics[metric] ?? 0;
  return totals;
}

/**
 * Current and previous window from the two-range report. GA labels the rows with
 * the range names we sent; the zero-based `date_range_N` form is accepted too. A
 * window with no traffic has no row at all, which means zeros, not missing data.
 */
export function toTotals(table: Table): { current: Totals; previous: Totals } {
  const pick = (names: string[]) => table.rows.find((row) => names.includes(row.dims.dateRange ?? ""));
  const hasRangeColumn = table.rows.some((row) => "dateRange" in row.dims);
  const current = hasRangeColumn ? pick(["current", "date_range_0"]) : table.rows[0];
  const previous = hasRangeColumn ? pick(["previous", "date_range_1"]) : undefined;
  return { current: totalsFrom(current), previous: totalsFrom(previous) };
}

export type DailyPoint = { date: string; users: number; sessions: number; views: number };

const dayMs = 86_400_000;
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** `20261103` → `2026-11-03`; anything else is ignored. */
function gaDate(value: string | undefined): string | null {
  return value && /^\d{8}$/.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : null;
}

/** One point per day, oldest first, with quiet days filled in as zeros. */
export function toDaily(table: Table): DailyPoint[] {
  const byDate = new Map<string, DailyPoint>();
  for (const row of table.rows) {
    const date = gaDate(row.dims.date);
    if (!date) continue;
    const point = byDate.get(date) ?? { date, users: 0, sessions: 0, views: 0 };
    point.users += row.metrics.activeUsers ?? 0;
    point.sessions += row.metrics.sessions ?? 0;
    point.views += row.metrics.screenPageViews ?? 0;
    byDate.set(date, point);
  }
  const dates = [...byDate.keys()].sort();
  if (!dates.length) return [];

  const points: DailyPoint[] = [];
  const end = Date.parse(`${dates[dates.length - 1]}T00:00:00Z`);
  for (let ms = Date.parse(`${dates[0]}T00:00:00Z`); ms <= end; ms += dayMs) {
    const date = isoDay(ms);
    points.push(byDate.get(date) ?? { date, users: 0, sessions: 0, views: 0 });
  }
  return points;
}

export type RankedRow = { label: string; value: number; secondary: number };

/** "(not set)" is GA's word for unknown; it is not a place or a page. */
const UNKNOWN = new Set(["", "(not set)", "(not provided)"]);

export function toRanked(
  table: Table,
  dimension: string,
  metric: string,
  options: { secondary?: string; limit?: number } = {},
): RankedRow[] {
  const { secondary, limit = 8 } = options;
  const merged = new Map<string, RankedRow>();
  for (const row of table.rows) {
    const label = (row.dims[dimension] ?? "").trim();
    if (UNKNOWN.has(label.toLowerCase())) continue;
    const entry = merged.get(label) ?? { label, value: 0, secondary: 0 };
    entry.value += row.metrics[metric] ?? 0;
    entry.secondary += secondary ? (row.metrics[secondary] ?? 0) : 0;
    merged.set(label, entry);
  }
  return [...merged.values()].filter((entry) => entry.value > 0).sort((a, b) => b.value - a.value).slice(0, limit);
}

/** Active users in the realtime window. No rows means nobody, not an error. */
export function toRealtime(report: GaReport | undefined | null): number {
  return toNumber(report?.rows?.[0]?.metricValues?.[0]?.value);
}

/** Relative change against the previous window; null when there is no baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return (current - previous) / previous;
}

/** Seconds of engagement per active visitor, the way the GA interface derives it. */
export function avgEngagementSeconds(totals: Totals): number {
  return totals.activeUsers ? totals.userEngagementDuration / totals.activeUsers : 0;
}

/* ── When Google says no ───────────────────────────────────────────────────── */

export type GoogleFault = { status?: string; reason?: string; message?: string };

/** Pulls the useful bits out of either shape Google uses for errors. */
export function parseGoogleError(body: unknown): GoogleFault {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;

  // OAuth: { error: "invalid_grant", error_description: "..." }
  if (typeof record.error === "string") {
    return { status: record.error, message: typeof record.error_description === "string" ? record.error_description : undefined };
  }

  // Google APIs: { error: { code, message, status, details: [{ reason }] } }
  const error = record.error as Record<string, unknown> | undefined;
  if (!error || typeof error !== "object") return {};
  const details = Array.isArray(error.details) ? (error.details as Record<string, unknown>[]) : [];
  const reason = details.map((detail) => detail?.reason).find((value): value is string => typeof value === "string");
  return {
    status: typeof error.status === "string" ? error.status : undefined,
    reason,
    message: typeof error.message === "string" ? error.message : undefined,
  };
}

export type Problem = {
  /** Stable code for tests and logs. */
  code:
    | "invalid_key"
    | "rejected_key"
    | "api_disabled"
    | "no_access"
    | "quota"
    | "unavailable"
    | "unreachable"
    | "bad_request"
    | "unknown";
  title: string;
  /** What to do about it. Fixed copy, never Google's own wording. */
  detail: string;
  /** Short technical reference for whoever has to fix it. */
  reference: string;
};

export function describeProblem(input: {
  stage: "key" | "token" | "report" | "network";
  httpStatus?: number;
  fault?: GoogleFault;
  serviceEmail?: string;
}): Problem {
  const { stage, httpStatus, fault, serviceEmail } = input;
  const reference = [httpStatus ? `HTTP ${httpStatus}` : null, fault?.status, fault?.reason].filter(Boolean).join(" · ");

  if (stage === "key") {
    return {
      code: "invalid_key",
      title: "The service account key could not be used",
      detail:
        "GA4_SERVICE_ACCOUNT_JSON is set but its private key cannot sign a request. Download a fresh JSON key for the service account and paste the whole file as the value.",
      reference: reference || "key error",
    };
  }

  if (stage === "network") {
    return {
      code: "unreachable",
      title: "Could not reach Google Analytics",
      detail: "The request timed out or the network failed. This is usually temporary; reload in a minute.",
      reference: reference || "network error",
    };
  }

  if (stage === "token") {
    if (httpStatus && httpStatus >= 500) {
      return {
        code: "unavailable",
        title: "Google sign-in is having trouble",
        detail: "Google's token service returned an error. Try again shortly.",
        reference,
      };
    }
    return {
      code: "rejected_key",
      title: "Google rejected the service account key",
      detail:
        "The key may have been deleted or disabled, or it was copied incompletely. Create a new JSON key for the service account and update GA4_SERVICE_ACCOUNT_JSON in Vercel.",
      reference,
    };
  }

  if (httpStatus === 403 && (fault?.reason === "SERVICE_DISABLED" || /has not been used|is disabled/i.test(fault?.message ?? ""))) {
    return {
      code: "api_disabled",
      title: "The Google Analytics Data API is switched off",
      detail:
        "In Google Cloud, open APIs & Services › Library, search for “Google Analytics Data API” and press Enable. Use the same project as the service account.",
      reference,
    };
  }
  if (httpStatus === 403 || httpStatus === 404) {
    return {
      code: "no_access",
      title: "The service account cannot read this property",
      detail: `In Google Analytics, open Admin › Property access management and add ${serviceEmail ?? "the service account's email"} as a Viewer. Then check that GA4_PROPERTY_ID is the numeric Property ID.`,
      reference,
    };
  }
  if (httpStatus === 429) {
    return {
      code: "quota",
      title: "Google Analytics is limiting requests",
      detail: "The daily or hourly allowance for this property is used up. Reports are cached, so this clears by itself.",
      reference,
    };
  }
  if (httpStatus && httpStatus >= 500) {
    return {
      code: "unavailable",
      title: "Google Analytics is having trouble",
      detail: "The reporting service returned an error. Try again shortly.",
      reference,
    };
  }
  if (httpStatus === 400) {
    return {
      code: "bad_request",
      title: "Google could not run the report",
      detail: "The request was refused as invalid. If the property was only just created, wait a few minutes and reload.",
      reference,
    };
  }
  return {
    code: "unknown",
    title: "Google Analytics returned an unexpected answer",
    detail: "Reload in a minute. If it keeps happening, check the Vercel function logs.",
    reference: reference || "unexpected response",
  };
}
