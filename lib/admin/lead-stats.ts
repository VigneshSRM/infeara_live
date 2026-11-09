/**
 * Counting enquiries for the Overview and the Leads page. Pure and dependency-free
 * so the unit tests can load it alone.
 *
 * "A day" here is an Indian calendar day. The team works in IST and the rest of
 * the CMS labels times in IST, so "today" has to roll over at midnight there, not
 * at midnight UTC on the Vercel server.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export const LEAD_STATUSES = ["new", "contacted", "qualified", "closed", "spam"] as const;
export type LeadStatusKey = (typeof LEAD_STATUSES)[number];

/** `2026-11-03` for the IST day an instant falls in. */
export function istDay(value: number | string | Date): string {
  const ms = value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);
  return new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The instant (epoch ms) at which the IST day containing `ms` began. */
export function istDayStart(ms: number): number {
  return Date.parse(`${istDay(ms)}T00:00:00Z`) - IST_OFFSET_MS;
}

/** Start of the IST day `daysBack` days before the day containing `nowMs`. */
export function istDayStartDaysAgo(nowMs: number, daysBack: number): number {
  return istDayStart(nowMs) - daysBack * DAY_MS;
}

export type DayCount = { date: string; count: number };

/** One entry per IST day for the last `days` days, oldest first, today included. */
export function dailyCounts(createdAt: string[], days: number, nowMs: number): DayCount[] {
  const tally = new Map<string, number>();
  for (const stamp of createdAt) {
    const ms = Date.parse(stamp);
    if (Number.isNaN(ms)) continue;
    const key = istDay(ms);
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  const series: DayCount[] = [];
  for (let back = days - 1; back >= 0; back -= 1) {
    const date = istDay(istDayStartDaysAgo(nowMs, back));
    series.push({ date, count: tally.get(date) ?? 0 });
  }
  return series;
}

/** Enquiries received in `[fromMs, toMs)`. */
export function countBetween(createdAt: string[], fromMs: number, toMs: number): number {
  let total = 0;
  for (const stamp of createdAt) {
    const ms = Date.parse(stamp);
    if (!Number.isNaN(ms) && ms >= fromMs && ms < toMs) total += 1;
  }
  return total;
}

/**
 * Enquiries in the last `days` IST days (today included) and in the `days` before
 * that, for "up or down against the previous period".
 */
export function windowCounts(createdAt: string[], days: number, nowMs: number): { current: number; previous: number } {
  const start = istDayStartDaysAgo(nowMs, days - 1);
  const previousStart = istDayStartDaysAgo(nowMs, days * 2 - 1);
  const end = istDayStartDaysAgo(nowMs, -1);
  return {
    current: countBetween(createdAt, start, end),
    previous: countBetween(createdAt, previousStart, start),
  };
}

export type Ranked = { label: string; count: number };

/** The most common non-empty values, biggest first; ties keep first-seen order. */
export function topBy<T>(rows: T[], pick: (row: T) => string | null | undefined, limit: number): Ranked[] {
  const tally = new Map<string, number>();
  for (const row of rows) {
    const label = (pick(row) ?? "").trim();
    if (!label) continue;
    tally.set(label, (tally.get(label) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Enquiries per 100 tracked visitors, or null when there are no visitors to divide by. */
export function per100(enquiries: number, visitors: number): number | null {
  return visitors > 0 ? (enquiries / visitors) * 100 : null;
}
