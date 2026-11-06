export function Flash({
  saved,
  deleted,
  error,
}: {
  saved?: string;
  deleted?: string;
  error?: string;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink"
      >
        {error}
      </p>
    );
  }
  if (!saved && !deleted) return null;
  return (
    <p
      role="status"
      className="mt-4 rounded-md border border-blue/25 bg-blue/8 px-4 py-3 text-[0.85rem] text-blue"
    >
      {deleted ? "Deleted." : saved === "created" ? "Created." : "Saved."}
    </p>
  );
}
