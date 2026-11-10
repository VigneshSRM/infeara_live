/**
 * Which core services a visitor cannot see, and why.
 *
 * The home page and /services build their "Core services" grid from a fixed list of six
 * slugs and quietly skip any the database does not return, and a service's own page
 * answers 404 when its row is not public. Visitors only ever get published rows, so a
 * core service that was never added, is still a draft, is archived or is dated for later
 * just disappears, and nothing on the public site says so. Staff can read every row, so
 * the CMS uses this to say it out loud.
 *
 * Plain TypeScript with no app imports, so the unit tests can load it directly.
 */

export type CoreServiceRow = {
  id?: string;
  slug: string;
  status: string;
  published_at: string | null;
};

export type CoreServiceGap = {
  slug: string;
  /** The row's id when it exists, so the notice can link to it. */
  id?: string;
  problem: "missing" | "draft" | "archived" | "scheduled";
};

/** The same test the public read policy applies: published, and not dated for later. */
export function isLive(row: CoreServiceRow, now: number = Date.now()): boolean {
  if (row.status !== "published") return false;
  if (!row.published_at) return true;
  const at = new Date(row.published_at).getTime();
  return !(at > now);
}

export function coreServiceGaps(
  coreSlugs: readonly string[],
  rows: readonly CoreServiceRow[],
  now: number = Date.now(),
): CoreServiceGap[] {
  const gaps: CoreServiceGap[] = [];
  for (const slug of coreSlugs) {
    const row = rows.find((candidate) => candidate.slug === slug);
    if (!row) {
      gaps.push({ slug, problem: "missing" });
    } else if (!isLive(row, now)) {
      const problem = row.status === "archived" ? "archived" : row.status === "published" ? "scheduled" : "draft";
      gaps.push({ slug, id: row.id, problem });
    }
  }
  return gaps;
}
