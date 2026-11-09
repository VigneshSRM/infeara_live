"use server";

import { requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchema } from "./errors";
import { cleanNoteBody, isUuid, rowToNote, NOTE_MAX_LENGTH, type ChatNote, type NoteRow } from "./lead-chat";
import { NOTE_COLUMNS } from "./lead-notes";

/**
 * Sending and deleting messages. These return a result instead of redirecting:
 * the chat stays on screen, shows what went wrong, and gives the text back.
 * Everything the user can do here is also enforced by the database (see
 * supabase/migrations/20261109210000_lead_notes.sql); these checks are for clear
 * wording, not for safety.
 */

export type SendResult = { ok: true; note: ChatNote } | { ok: false; error: string };
export type DeleteResult = { ok: true } | { ok: false; error: string };

const NOT_SET_UP = "Internal notes are not switched on yet. A super admin needs to run the lead notes migration in Supabase.";

export async function addLeadNote(leadId: string, body: string): Promise<SendResult> {
  const user = await requireStaff();

  if (!isUuid(leadId)) return { ok: false, error: "That enquiry could not be found." };
  const draft = cleanNoteBody(body);
  if (!draft.ok) {
    return {
      ok: false,
      error: draft.error === "empty" ? "Write something before sending." : `Notes can be up to ${NOTE_MAX_LENGTH.toLocaleString("en-IN")} characters.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    // Name, email and time are set by the database from the signed-in account.
    .insert({ lead_id: leadId, author_id: user.id, body: draft.body })
    .select(NOTE_COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingSchema(error)) return { ok: false, error: NOT_SET_UP };
    console.error("[lead-notes] send failed:", error?.code ?? "no code");
    if (error?.code === "23503") return { ok: false, error: "That enquiry no longer exists." };
    if (error?.code === "42501") return { ok: false, error: "Your account is not allowed to add notes." };
    if (error?.code === "23514") return { ok: false, error: "That message is empty or too long." };
    return { ok: false, error: "The note could not be sent. Your text is still in the box; try again." };
  }

  return { ok: true, note: rowToNote(data as NoteRow) };
}

export async function deleteLeadNote(noteId: string): Promise<DeleteResult> {
  const user = await requireStaff();
  if (user.role !== "super_admin") return { ok: false, error: "Only a super admin can delete messages." };
  if (!isUuid(noteId)) return { ok: false, error: "That message could not be found." };

  const supabase = await createClient();
  // A delete that row-level security refuses removes nothing and raises no error,
  // so ask for the deleted row back and check one came.
  const { data, error } = await supabase.from("lead_notes").delete().eq("id", noteId).select("id");

  if (error) {
    if (isMissingSchema(error)) return { ok: false, error: NOT_SET_UP };
    console.error("[lead-notes] delete failed:", error.code ?? "no code");
    return { ok: false, error: "The message could not be deleted. Try again." };
  }
  if (!data?.length) return { ok: false, error: "That message is already gone, or you are not allowed to delete it." };
  return { ok: true };
}
