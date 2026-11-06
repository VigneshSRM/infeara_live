type SupabaseError = { code?: string; message?: string } | null;

const MISSING_SCHEMA = new Set(["42P01", "PGRST205", "PGRST204"]);

export function isMissingSchema(error: SupabaseError) {
  return Boolean(error && error.code && MISSING_SCHEMA.has(error.code));
}

export function friendlyError(error: SupabaseError): string {
  if (!error) return "Something went wrong.";
  if (error.code === "23505") return "That slug is already used by another page.";
  if (error.code === "42501") return "Your role is not allowed to change that field.";
  if (error.code === "23514") return "One of the values is outside the allowed range.";
  if (error.code === "PGRST116") return "That record no longer exists.";
  if (isMissingSchema(error)) return "The database schema has not been applied yet.";
  return error.message ?? "Something went wrong.";
}
