/**
 * Number and date wording for the Overview. Pure and dependency-free so the unit
 * tests can load it alone. Counts use the Indian digit grouping the rest of the
 * CMS uses (`en-IN`); dates are calendar days with no time zone attached, built
 * from parts in UTC so a server in another zone cannot shift them a day.
 */

const counts = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatCount(value: number): string {
  return counts.format(Math.round(Number.isFinite(value) ? value : 0));
}

/** A 0-1 fraction as a percentage: 0.6345 → "63.5%". */
export function formatRate(fraction: number): string {
  const value = Number.isFinite(fraction) ? fraction * 100 : 0;
  return `${value.toFixed(1)}%`;
}

/** Seconds as "45s", "3m 05s" or "1h 12m". */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (total < 3600) return `${minutes}m ${String(total % 60).padStart(2, "0")}s`;
  return `${Math.floor(total / 3600)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export type Delta = { text: string; tone: "up" | "down" | "flat" | "none"; label: string };

/**
 * How a metric moved against the previous window. `null` means there was nothing
 * to compare with (a new site, or a window with no traffic), which is shown as a
 * dash rather than an invented percentage.
 */
export function describeDelta(change: number | null, previousLabel: string): Delta {
  if (change === null || !Number.isFinite(change)) {
    return { text: "—", tone: "none", label: `No data for ${previousLabel} to compare with` };
  }
  const percent = Math.abs(change * 100);
  if (percent < 0.05) return { text: "0%", tone: "flat", label: `Unchanged against ${previousLabel}` };
  const text = `${change > 0 ? "+" : "−"}${percent.toFixed(percent < 10 ? 1 : 0)}%`;
  return {
    text,
    tone: change > 0 ? "up" : "down",
    label: `${change > 0 ? "Up" : "Down"} ${percent.toFixed(1)}% against ${previousLabel}`,
  };
}

/** Change in a rate, in percentage points: 0.62 vs 0.58 → "+4.0 pts". */
export function describePointsDelta(current: number, previous: number, hasPrevious: boolean, previousLabel: string): Delta {
  if (!hasPrevious) return describeDelta(null, previousLabel);
  const points = (current - previous) * 100;
  if (Math.abs(points) < 0.05) return { text: "0 pts", tone: "flat", label: `Unchanged against ${previousLabel}` };
  return {
    text: `${points > 0 ? "+" : "−"}${Math.abs(points).toFixed(1)} pts`,
    tone: points > 0 ? "up" : "down",
    label: `${points > 0 ? "Up" : "Down"} ${Math.abs(points).toFixed(1)} percentage points against ${previousLabel}`,
  };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** `2026-11-03` → "3 Nov". */
export function shortDate(iso: string): string {
  const date = utc(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** `2026-11-03` → "Tue, 3 Nov". */
export function weekdayDate(iso: string): string {
  const date = utc(iso);
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** An item's share of the whole, 0–1; zero when there is no whole. */
export function shareOf(value: number, total: number): number {
  return total > 0 ? value / total : 0;
}

/** How long ago something happened, in the largest sensible unit: "12 min", "5 hours", "3 days". */
export function formatAge(fromMs: number, nowMs: number): string {
  const seconds = Math.max(0, Math.round((nowMs - fromMs) / 1000));
  if (seconds < 60) return "under a minute";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

/** "5 hours ago", or "just now" inside the first minute. */
export function formatAgo(fromMs: number, nowMs: number): string {
  const age = formatAge(fromMs, nowMs);
  return age === "under a minute" ? "just now" : `${age} ago`;
}
