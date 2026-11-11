type SupabaseError = { code?: string; message?: string } | null;

const MISSING_SCHEMA = new Set(["42P01", "PGRST205", "PGRST204"]);

export function isMissingSchema(error: SupabaseError) {
  return Boolean(error && error.code && MISSING_SCHEMA.has(error.code));
}

/** Plain wording for the errors an editor can cause or meet, or null for any other. */
export function knownError(error: NonNullable<SupabaseError>): string | null {
  if (error.code === "23505") return "That slug is already used by another page.";
  if (error.code === "42501") return "Your role is not allowed to change that field.";
  if (error.code === "23514") return checkViolation(error.message);
  if (error.code === "PGRST116") return "That record no longer exists.";
  if (isMissingSchema(error)) return "The database schema has not been applied yet.";
  return null;
}

export function friendlyError(error: SupabaseError): string {
  if (!error) return "Something went wrong.";
  return knownError(error) ?? error.message ?? "Something went wrong.";
}

/** For the screens that never show the database's own wording: anything not known reads like this. */
export const SAVE_FAILED = "The change could not be saved. Check the values and try again.";

/**
 * The database repeats a few of the form's rules as constraints. The screens check them first and
 * say what to fix; this is the same wording for the rare case where a change gets past the screen.
 */
function checkViolation(message: string | undefined): string {
  const text = message ?? "";
  if (text.includes("case_studies_client_needs_approval_to_publish")) {
    return "A client case study can be published only after the client's approval is recorded.";
  }
  if (text.includes("case_studies_representative_is_unnamed")) return "A representative case study cannot name a client.";
  if (text.includes("case_studies_client_is_named")) return "Name the client for a client case study.";
  if (text.includes("white_papers_published_needs_a_file")) return "Add the PDF, or a link to it, before publishing this paper.";
  return "One of the values is outside the allowed range.";
}
