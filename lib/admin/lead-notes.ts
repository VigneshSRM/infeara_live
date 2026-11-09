import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isMissingSchema } from "./errors";
import { rowToNote, type ChatNote, type NoteRow } from "./lead-chat";

type Client = Awaited<ReturnType<typeof createClient>>;

/** The thread shows the most recent messages; this is generous for a conversation about one enquiry. */
export const THREAD_LIMIT = 200;

/** Never selects `author_email`: the browser gets names and times, not addresses. */
export const NOTE_COLUMNS = "id,author_id,author_name,body,created_at";

export type ThreadResult =
  | { ok: true; notes: ChatNote[]; truncated: boolean }
  | { ok: false; reason: "missing_schema" | "failed" };

/** The thread for one lead, oldest first. */
export async function loadThread(supabase: Client, leadId: string): Promise<ThreadResult> {
  const { data, error } = await supabase
    .from("lead_notes")
    .select(NOTE_COLUMNS)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(THREAD_LIMIT);

  if (error) {
    if (isMissingSchema(error)) return { ok: false, reason: "missing_schema" };
    console.error("[lead-notes] load failed:", error.code ?? "no code");
    return { ok: false, reason: "failed" };
  }

  const rows = (data ?? []) as NoteRow[];
  return { ok: true, notes: rows.map(rowToNote).reverse(), truncated: rows.length >= THREAD_LIMIT };
}

export type NoteActivity = { count: number; lastAt: string; lastBy: string };

/**
 * How much has been said about each of these leads, for the list page. Anything
 * that goes wrong (including the table not existing yet) returns null: the list
 * works the same without it.
 */
export async function loadNoteActivity(supabase: Client, leadIds: string[]): Promise<Map<string, NoteActivity> | null> {
  if (!leadIds.length) return new Map();
  try {
    const { data, error } = await supabase
      .from("lead_notes")
      .select("lead_id,author_name,created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false })
      .limit(3000);
    if (error) return null;

    const activity = new Map<string, NoteActivity>();
    for (const row of (data ?? []) as { lead_id: string; author_name: string | null; created_at: string }[]) {
      const seen = activity.get(row.lead_id);
      if (seen) {
        seen.count += 1;
      } else {
        activity.set(row.lead_id, { count: 1, lastAt: row.created_at, lastBy: (row.author_name ?? "").trim() || "Staff member" });
      }
    }
    return activity;
  } catch {
    return null;
  }
}
