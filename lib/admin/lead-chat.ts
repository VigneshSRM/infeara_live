/**
 * The internal notes thread on a lead: what a message is, how a draft is checked,
 * and how a flat list is laid out as a chat. Pure and dependency-free so the unit
 * tests can load it alone, and so the server and the browser agree on every rule.
 */

export const NOTE_MAX_LENGTH = 4000;

/** What the browser is given for one message. No emails, no raw database rows. */
export type ChatNote = {
  id: string;
  authorId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

export type NoteRow = {
  id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  created_at: string;
};

export function rowToNote(row: NoteRow): ChatNote {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: (row.author_name ?? "").trim() || "Staff member",
    body: row.body,
    createdAt: row.created_at,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export type DraftResult = { ok: true; body: string } | { ok: false; error: "empty" | "too_long" };

/** Line endings normalised, ends trimmed, and the length limit for a new message. */
export function cleanNoteBody(raw: unknown): DraftResult {
  const body = (typeof raw === "string" ? raw : "").replace(/\r\n?/g, "\n").trim();
  if (!body) return { ok: false, error: "empty" };
  if (body.length > NOTE_MAX_LENGTH) return { ok: false, error: "too_long" };
  return { ok: true, body };
}

/* ── Layout ────────────────────────────────────────────────────────────────── */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

/** `2026-11-03` for the IST day an instant falls in. */
export function noteDay(iso: string): string {
  return new Date(Date.parse(iso) + IST_OFFSET_MS).toISOString().slice(0, 10);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Built from parts rather than toLocale…String(): the server and the browser must
// print the same characters, and their locale data is not guaranteed to match.

/** "Today", "Yesterday", or "Tue, 3 Nov 2026". */
export function dayLabel(dayKey: string, nowMs: number): string {
  const today = new Date(nowMs + IST_OFFSET_MS).toISOString().slice(0, 10);
  const yesterday = new Date(nowMs + IST_OFFSET_MS - DAY_MS).toISOString().slice(0, 10);
  if (dayKey === today) return "Today";
  if (dayKey === yesterday) return "Yesterday";
  const date = new Date(`${dayKey}T00:00:00Z`);
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "9:41 am" in IST. */
export function timeLabel(iso: string): string {
  const ist = new Date(Date.parse(iso) + IST_OFFSET_MS);
  const hours = ist.getUTCHours();
  return `${hours % 12 || 12}:${String(ist.getUTCMinutes()).padStart(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
}

export type DayGroup = { key: string; label: string; notes: ChatNote[] };

/** Oldest first, split under a heading per IST day, like the date pills in a chat app. */
export function groupByDay(notes: ChatNote[], nowMs: number): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const note of sortNotes(notes)) {
    const key = noteDay(note.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.notes.push(note);
    } else {
      groups.push({ key, label: dayLabel(key, nowMs), notes: [note] });
    }
  }
  return groups;
}

export function sortNotes(notes: ChatNote[]): ChatNote[] {
  return [...notes].sort((a, b) => {
    const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return delta !== 0 ? delta : a.id.localeCompare(b.id);
  });
}

/** True when both lists hold the same messages with the same text, in the same order. */
export function sameThread(a: ChatNote[], b: ChatNote[]): boolean {
  return a.length === b.length && a.every((note, index) => note.id === b[index].id && note.body === b[index].body);
}

/** Adds a just-saved message unless a refresh has already brought it in. */
export function withSaved(notes: ChatNote[], saved: ChatNote): ChatNote[] {
  return notes.some((note) => note.id === saved.id) ? notes : sortNotes([...notes, saved]);
}
