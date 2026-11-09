import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isMissingSchema } from "./errors";
import {
  LEAD_STATUSES,
  countBetween,
  dailyCounts,
  istDayStartDaysAgo,
  topBy,
  windowCounts,
  type DayCount,
  type LeadStatusKey,
  type Ranked,
} from "./lead-stats";

type Client = Awaited<ReturnType<typeof createClient>>;

/** One bounded read covers the charts. A B2B contact form is nowhere near this. */
const ROW_CAP = 5000;
const WINDOW_DAYS = 30;
const AWAITING_AFTER_MS = 24 * 60 * 60 * 1000;

export type LeadOverview = {
  total: number;
  byStatus: Record<LeadStatusKey, number>;
  today: number;
  yesterday: number;
  last7: { current: number; previous: number };
  last30: { current: number; previous: number };
  /** One entry per IST day, oldest first, for the last 30 days. */
  daily: DayCount[];
  topics: Ranked[];
  sources: Ranked[];
  /** Still "new" and older than a day. */
  awaiting: number;
  /** When the longest-waiting new enquiry arrived. */
  oldestWaitingAt: string | null;
  /** True if more enquiries exist in the window than the page reads. */
  truncated: boolean;
};

export type LeadOverviewResult =
  | { ok: true; value: LeadOverview }
  | { ok: false; reason: "missing_schema" | "failed" };

type Slim = { created_at: string; topic: string | null; source_page: string | null };

/** "/services/managed-it?utm=x#top" → "/services/managed-it". Keeps the page, drops the tracking noise. */
function cleanSource(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  try {
    const path = new URL(raw, "https://placeholder.invalid").pathname;
    return path.length > 1 ? path.replace(/\/+$/, "") : path;
  } catch {
    return raw.split(/[?#]/)[0];
  }
}

export async function loadLeadOverview(supabase: Client, nowMs: number = Date.now()): Promise<LeadOverviewResult> {
  try {
    // Two 30-day windows (this one and the one before) so every figure has something to compare with.
    const since = new Date(istDayStartDaysAgo(nowMs, WINDOW_DAYS * 2 - 1)).toISOString();
    const awaitingBefore = new Date(nowMs - AWAITING_AFTER_MS).toISOString();

    const statusCounts = LEAD_STATUSES.map((status) =>
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", status),
    );

    const [recent, oldest, awaiting, ...perStatus] = await Promise.all([
      supabase
        .from("leads")
        .select("created_at,topic,source_page")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(ROW_CAP),
      supabase.from("leads").select("created_at").eq("status", "new").order("created_at", { ascending: true }).limit(1),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new").lt("created_at", awaitingBefore),
      ...statusCounts,
    ]);

    const failure = [recent, oldest, awaiting, ...perStatus].find((result) => result.error)?.error ?? null;
    if (failure) {
      if (isMissingSchema(failure)) return { ok: false, reason: "missing_schema" };
      console.error("[overview] lead statistics failed:", failure.code ?? "no code");
      return { ok: false, reason: "failed" };
    }

    const rows = (recent.data ?? []) as Slim[];
    const stamps = rows.map((row) => row.created_at);

    const byStatus = Object.fromEntries(
      LEAD_STATUSES.map((status, index) => [status, perStatus[index].count ?? 0]),
    ) as Record<LeadStatusKey, number>;

    const todayStart = istDayStartDaysAgo(nowMs, 0);
    const yesterdayStart = istDayStartDaysAgo(nowMs, 1);
    const tomorrowStart = istDayStartDaysAgo(nowMs, -1);

    // Topics and pages describe the current 30 days only.
    const windowStart = istDayStartDaysAgo(nowMs, WINDOW_DAYS - 1);
    const inWindow = rows.filter((row) => Date.parse(row.created_at) >= windowStart);

    return {
      ok: true,
      value: {
        total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
        byStatus,
        today: countBetween(stamps, todayStart, tomorrowStart),
        yesterday: countBetween(stamps, yesterdayStart, todayStart),
        last7: windowCounts(stamps, 7, nowMs),
        last30: windowCounts(stamps, WINDOW_DAYS, nowMs),
        daily: dailyCounts(stamps, WINDOW_DAYS, nowMs),
        topics: topBy(inWindow, (row) => row.topic, 5),
        sources: topBy(inWindow, (row) => cleanSource(row.source_page), 5),
        awaiting: awaiting.count ?? 0,
        oldestWaitingAt: (oldest.data?.[0] as { created_at?: string } | undefined)?.created_at ?? null,
        truncated: rows.length >= ROW_CAP,
      },
    };
  } catch (error) {
    console.error("[overview] lead statistics threw:", error instanceof Error ? error.message : "unknown");
    return { ok: false, reason: "failed" };
  }
}

/** Enquiries received in the last `days` IST days, for the visitor-to-enquiry ratio. */
export async function countLeadsSince(supabase: Client, days: number, nowMs: number = Date.now()): Promise<number | null> {
  try {
    const since = new Date(istDayStartDaysAgo(nowMs, days - 1)).toISOString();
    const { count, error } = await supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since);
    return error ? null : (count ?? 0);
  } catch {
    return null;
  }
}
