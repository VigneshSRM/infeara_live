import "server-only";

import {
  DATA_API,
  EXTRA_KEYS,
  MAIN_KEYS,
  REALTIME_REQUEST,
  TOKEN_URL,
  buildExtrasBatch,
  buildMainBatch,
  describeProblem,
  parseGoogleError,
  parsePropertyId,
  parseServiceAccount,
  signServiceAccountJwt,
  toDaily,
  toRanked,
  toRealtime,
  toTable,
  toTotals,
  type DailyPoint,
  type GaReport,
  type Problem,
  type PropertyIdResult,
  type RangeDays,
  type RankedRow,
  type ServiceAccount,
  type ServiceAccountResult,
  type Totals,
} from "./ga4-core";

/**
 * Reads the site's Google Analytics 4 numbers for the Overview.
 *
 * Tracking (the `G-…` id in `NEXT_PUBLIC_GA4_ID`) and reporting are separate: the
 * first sends visits to Google, the second asks Google for the totals. Reporting
 * needs the property's numeric id and a service account that has been given Viewer
 * access to it. Both are server-only settings; nothing here reaches the browser.
 *
 * Reports are cached in memory (they change slowly and the API has quotas), so a
 * burst of staff opening the Overview costs one set of requests, not one each.
 */

/* ── Settings ──────────────────────────────────────────────────────────────── */

export type AnalyticsConfig = {
  /** The `G-…` id the public site loads after consent, if the build has one. */
  trackingId: string | null;
  propertyId: PropertyIdResult;
  account: ServiceAccountResult;
};

export function readAnalyticsConfig(): AnalyticsConfig {
  const tracking = (process.env.NEXT_PUBLIC_GA4_ID ?? "").trim();
  return {
    trackingId: tracking || null,
    propertyId: parsePropertyId(process.env.GA4_PROPERTY_ID),
    account: parseServiceAccount(process.env.GA4_SERVICE_ACCOUNT_JSON),
  };
}

/** What is and is not in place, safe to show: no values, only what is wrong. */
export type Checklist = {
  trackingId: string | null;
  propertyId: "ok" | "missing" | "measurement_id" | "invalid";
  key: "ok" | "missing" | "invalid_json" | "wrong_type" | "missing_fields";
  /** Not a secret: it is the address to add as a Viewer in Google Analytics. */
  serviceEmail: string | null;
};

export function checklistOf(config: AnalyticsConfig): Checklist {
  return {
    trackingId: config.trackingId,
    propertyId: config.propertyId.ok ? "ok" : config.propertyId.reason,
    key: config.account.ok ? "ok" : config.account.reason,
    serviceEmail: config.account.ok ? config.account.account.email : null,
  };
}

/* ── What the Overview receives ────────────────────────────────────────────── */

export type VisitorReport = {
  days: RangeDays;
  /** ISO time the numbers were fetched from Google (cached reports keep their time). */
  fetchedAt: string;
  /** The property's own time zone, as Google reports it. */
  timeZone: string | null;
  totals: Totals;
  previous: Totals;
  daily: DailyPoint[];
  pages: RankedRow[];
  channels: RankedRow[];
  countries: RankedRow[];
  /** `null` when that part could not be loaded; the rest still shows. */
  cities: RankedRow[] | null;
  devices: RankedRow[] | null;
  sources: RankedRow[] | null;
  /** People on the site in the last 30 minutes, or null if unavailable. */
  activeNow: number | null;
};

export type AnalyticsState =
  | { status: "not_configured"; checklist: Checklist }
  | { status: "error"; problem: Problem; checklist: Checklist }
  | { status: "ready"; checklist: Checklist; propertyId: string; report: VisitorReport };

/* ── Cache ─────────────────────────────────────────────────────────────────── */

const REPORT_TTL_MS = 10 * 60_000;
const REALTIME_TTL_MS = 60_000;
/** A failure is remembered briefly, so a bad setting does not hit Google on every page view. */
const FAILURE_TTL_MS = 30_000;

type Outcome<T> = { ok: true; value: T } | { ok: false; problem: Problem };

const store = new Map<string, { at: number; outcome: Outcome<unknown> }>();
const flights = new Map<string, Promise<Outcome<unknown>>>();

async function remember<T>(key: string, ttlMs: number, load: () => Promise<Outcome<T>>): Promise<Outcome<T>> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < (hit.outcome.ok ? ttlMs : FAILURE_TTL_MS)) return hit.outcome as Outcome<T>;

  const running = flights.get(key);
  if (running) return running as Promise<Outcome<T>>;

  const flight = load()
    .then((outcome) => {
      store.set(key, { at: Date.now(), outcome });
      return outcome;
    })
    .finally(() => flights.delete(key));
  flights.set(key, flight);
  return flight;
}

/* ── Talking to Google ─────────────────────────────────────────────────────── */

const TIMEOUT_MS = 8_000;

class GoogleFailure extends Error {
  constructor(readonly problem: Problem) {
    super(problem.title);
  }
}

async function post(
  url: string,
  init: { headers: Record<string, string>; body: string },
  stage: "token" | "report",
  serviceEmail: string,
): Promise<{ status: number; body: unknown }> {
  let response: Response;
  try {
    response = await fetch(url, { method: "POST", ...init, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new GoogleFailure(describeProblem({ stage: "network" }));
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new GoogleFailure(
      describeProblem({ stage, httpStatus: response.status, fault: parseGoogleError(body), serviceEmail }),
    );
  }
  return { status: response.status, body };
}

let tokenCache: { email: string; token: string; expiresAt: number } | null = null;
let tokenFlight: { email: string; promise: Promise<string> } | null = null;

async function requestToken(account: ServiceAccount): Promise<string> {
  const now = Date.now();

  let assertion: string;
  try {
    assertion = signServiceAccountJwt(account, Math.floor(now / 1000));
  } catch {
    throw new GoogleFailure(describeProblem({ stage: "key" }));
  }

  const { body } = await post(
    TOKEN_URL,
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(),
    },
    "token",
    account.email,
  );

  const record = (body ?? {}) as { access_token?: unknown; expires_in?: unknown };
  if (typeof record.access_token !== "string") {
    throw new GoogleFailure(describeProblem({ stage: "token", fault: { status: "no_token" } }));
  }
  const lifetime = typeof record.expires_in === "number" ? record.expires_in : 3600;
  tokenCache = { email: account.email, token: record.access_token, expiresAt: now + lifetime * 1000 };
  return record.access_token;
}

/** A token good for at least another minute. The report calls run side by side and share one request. */
async function accessToken(account: ServiceAccount): Promise<string> {
  if (tokenCache && tokenCache.email === account.email && tokenCache.expiresAt - Date.now() > 60_000) {
    return tokenCache.token;
  }
  if (tokenFlight && tokenFlight.email === account.email) return tokenFlight.promise;

  const promise = requestToken(account).finally(() => {
    tokenFlight = null;
  });
  tokenFlight = { email: account.email, promise };
  return promise;
}

/** One authorised call to the Data API; a revoked token is replaced once. */
async function callDataApi(account: ServiceAccount, path: string, payload: unknown): Promise<unknown> {
  const attempt = async () =>
    post(
      `${DATA_API}/${path}`,
      {
        headers: { authorization: `Bearer ${await accessToken(account)}`, "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
      "report",
      account.email,
    );

  try {
    return (await attempt()).body;
  } catch (error) {
    if (error instanceof GoogleFailure && error.problem.reference.startsWith("HTTP 401")) {
      tokenCache = null;
      return (await attempt()).body;
    }
    throw error;
  }
}

function problemOf(error: unknown): Problem {
  return error instanceof GoogleFailure ? error.problem : describeProblem({ stage: "network" });
}

/* ── The reports ───────────────────────────────────────────────────────────── */

type Batch = { reports?: GaReport[] };

async function runBatch(account: ServiceAccount, propertyId: string, batch: { requests: unknown[] }): Promise<GaReport[]> {
  const body = (await callDataApi(account, `properties/${propertyId}:batchRunReports`, batch)) as Batch | null;
  if (!body || !Array.isArray(body.reports)) {
    throw new GoogleFailure(describeProblem({ stage: "report" }));
  }
  return body.reports;
}

async function loadReport(
  account: ServiceAccount,
  propertyId: string,
  days: RangeDays,
): Promise<Outcome<Omit<VisitorReport, "activeNow">>> {
  const [main, extras] = await Promise.allSettled([
    runBatch(account, propertyId, buildMainBatch(days)),
    runBatch(account, propertyId, buildExtrasBatch(days)),
  ]);

  // The headline numbers are the point of the page; without them there is no report.
  if (main.status === "rejected") return { ok: false, problem: problemOf(main.reason) };
  const tables = Object.fromEntries(MAIN_KEYS.map((key, index) => [key, toTable(main.value[index])])) as Record<
    (typeof MAIN_KEYS)[number],
    ReturnType<typeof toTable>
  >;

  let extraTables: Record<(typeof EXTRA_KEYS)[number], ReturnType<typeof toTable>> | null = null;
  if (extras.status === "fulfilled") {
    extraTables = Object.fromEntries(EXTRA_KEYS.map((key, index) => [key, toTable(extras.value[index])])) as Record<
      (typeof EXTRA_KEYS)[number],
      ReturnType<typeof toTable>
    >;
  } else {
    console.error("[analytics] secondary reports failed:", problemOf(extras.reason).reference);
  }

  const { current, previous } = toTotals(tables.totals);
  return {
    ok: true,
    value: {
      days,
      fetchedAt: new Date().toISOString(),
      timeZone: tables.totals.timeZone ?? tables.daily.timeZone,
      totals: current,
      previous,
      daily: toDaily(tables.daily),
      pages: toRanked(tables.pages, "pagePath", "screenPageViews", { secondary: "activeUsers", limit: 8 }),
      channels: toRanked(tables.channels, "sessionDefaultChannelGroup", "sessions", { secondary: "activeUsers", limit: 8 }),
      countries: toRanked(tables.countries, "country", "activeUsers", { limit: 6 }),
      cities: extraTables ? toRanked(extraTables.cities, "city", "activeUsers", { limit: 6 }) : null,
      devices: extraTables ? toRanked(extraTables.devices, "deviceCategory", "activeUsers", { limit: 4 }) : null,
      sources: extraTables ? toRanked(extraTables.sources, "sessionSourceMedium", "sessions", { secondary: "activeUsers", limit: 8 }) : null,
    },
  };
}

async function loadRealtime(account: ServiceAccount, propertyId: string): Promise<Outcome<number>> {
  try {
    const body = (await callDataApi(account, `properties/${propertyId}:runRealtimeReport`, REALTIME_REQUEST)) as GaReport | null;
    return { ok: true, value: toRealtime(body) };
  } catch (error) {
    return { ok: false, problem: problemOf(error) };
  }
}

/**
 * Everything the Overview's visitors section needs, for the last `days` days.
 * Never throws: a missing setting or a refusal from Google comes back as a state
 * the page can explain, so the rest of the Overview always renders.
 */
export async function loadAnalytics(days: RangeDays): Promise<AnalyticsState> {
  const config = readAnalyticsConfig();
  const checklist = checklistOf(config);

  if (!config.propertyId.ok || !config.account.ok) {
    return { status: "not_configured", checklist };
  }
  const propertyId = config.propertyId.id;
  const account = config.account.account;

  const scope = `${propertyId}:${account.email}`;
  const [report, realtime] = await Promise.all([
    remember(`report:${scope}:${days}`, REPORT_TTL_MS, () => loadReport(account, propertyId, days)),
    remember(`realtime:${scope}`, REALTIME_TTL_MS, () => loadRealtime(account, propertyId)),
  ]);

  if (!report.ok) {
    console.error("[analytics] report failed:", report.problem.code, report.problem.reference);
    return { status: "error", problem: report.problem, checklist };
  }

  return {
    status: "ready",
    checklist,
    propertyId,
    report: { ...report.value, activeNow: realtime.ok ? realtime.value : null },
  };
}
