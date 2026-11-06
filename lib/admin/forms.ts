// Admin form helpers. IST is the operating timezone, so a datetime-local value
// is interpreted as Asia/Kolkata rather than the server's timezone (UTC on
// Vercel). Stored values are always timestamptz.

const IST_OFFSET = "+05:30";

export function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function optional(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value ? value : null;
}

export function num(formData: FormData, key: string, fallback = 0): number {
  const value = Number(str(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function linesField(formData: FormData, key: string): string[] {
  return lines(str(formData, key));
}

export function rows<T>(formData: FormData, key: string): T[] {
  try {
    const parsed = JSON.parse(str(formData, key) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function publishState(formData: FormData) {
  const status = str(formData, "status");
  const allowed = status === "published" || status === "archived" ? status : "draft";
  const publishedAt = str(formData, "published_at");
  return {
    status: allowed,
    published_at: publishedAt ? new Date(`${publishedAt}:00${IST_OFFSET}`).toISOString() : null,
  };
}

/** ISO timestamp → value for <input type="datetime-local"> in IST. */
export function toIstInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

/** ISO timestamp → readable IST label for lists. */
export function istLabel(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
