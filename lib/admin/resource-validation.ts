// The rules the sub-service, blog, case-study and white-paper forms enforce before anything
// reaches the database. Each returns a plain-English problem (or null), so the admin can say
// what to fix instead of showing a database error. The database repeats the important ones as
// constraints (see supabase/migrations/20261110200000_resource_modules.sql); these exist so the
// message is kind and arrives first.
//
// No imports, so tests can load this file as it is.

export type Problem = string | null;

/** A path on this site: starts with one slash, never two (that would be another site). */
export function isInternalPath(value: string): boolean {
  return /^\/(?!\/)[^\s"'<>\\]*$/.test(value);
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s"'<>\\]+$/i.test(value) && value.length <= 500;
}

/** Empty means "work it out from the text"; otherwise a whole number of minutes from 1 to 60. */
export function parseReadingMinutes(raw: string): { ok: true; value: number | null } | { ok: false; error: string } {
  const text = raw.trim();
  if (!text) return { ok: true, value: null };
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1 || value > 60) {
    return { ok: false, error: "Reading minutes must be a whole number from 1 to 60, or empty to work it out from the text." };
  }
  return { ok: true, value };
}

/** Whole numbers only, kept inside what a database integer column holds. */
export function cleanSortOrder(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-100000, Math.min(100000, Math.trunc(value)));
}

export function cleanPictureNumber(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(-1000000, Math.min(1000000, Math.trunc(value)));
}

export function parseRelatedLinks(
  rows: { label?: string; href?: string }[],
): { ok: true; value: { label: string; href: string }[] } | { ok: false; error: string } {
  const value: { label: string; href: string }[] = [];

  for (const row of rows) {
    const label = String(row.label ?? "").trim();
    const href = String(row.href ?? "").trim();
    if (!label && !href) continue;
    if (!label || !href) return { ok: false, error: "Each related service needs both a label and a link." };
    if (!isInternalPath(href)) {
      return {
        ok: false,
        error: `“${href}” is not a link on this site. Use a path that starts with a single slash, such as /services/managed-it.`,
      };
    }
    value.push({ label, href });
  }

  return { ok: true, value };
}

/** The built-in diagrams that ship with the site. Nothing else can be named as a sub-service picture. */
const BUILTIN_DIAGRAM = /^\/site\/infographics\/[a-z0-9]+(-[a-z0-9]+)*\.svg$/;

/** The picture to keep when the "use the built-in diagram" box is ticked, or null. */
export function diagramImage(keep: boolean, value: string): string | null {
  return keep && BUILTIN_DIAGRAM.test(value) ? value : null;
}

/** null when there is nothing to show (no steps and no picture); otherwise what is stored. */
export function buildInfographic(input: {
  title: string;
  steps: { title?: string; description?: string }[];
  image: string | null;
}): { title: string; steps: { title: string; description: string }[]; image?: string } | null {
  const steps = input.steps
    .map((step) => ({ title: String(step.title ?? "").trim(), description: String(step.description ?? "").trim() }))
    .filter((step) => step.title);

  if (steps.length === 0 && !input.image) return null;
  return { title: input.title.trim(), steps, ...(input.image ? { image: input.image } : {}) };
}

/** The rules that tie a case study's kind to its client name and approval. */
export function caseStudyProblem(input: {
  kind: string;
  clientName: string;
  approved: boolean;
  status: string;
}): Problem {
  if (input.kind !== "representative" && input.kind !== "client") return "Choose whether this is a representative or a client case study.";
  if (input.kind === "client") {
    if (!input.clientName.trim()) return "Name the client for a client case study.";
    if (input.status === "published" && !input.approved) {
      return "A client case study can be published only after the client's approval is recorded. Tick the approval box once you have it in writing, or leave this as a draft.";
    }
  }
  return null;
}

/** A published white paper has to open something. */
export function paperProblem(input: { status: string; filePath: string | null; externalUrl: string | null }): Problem {
  if (input.externalUrl && !isHttpUrl(input.externalUrl)) {
    return "The link must start with http:// or https:// and have no spaces.";
  }
  if (input.status === "published" && !input.filePath && !input.externalUrl) {
    return "Add the PDF, or a link to it, before publishing this paper.";
  }
  return null;
}

/** A post with no sections would publish as a headline and nothing else. */
export function blogProblem(input: { status: string; sections: number }): Problem {
  if (input.status === "published" && input.sections === 0) return "Add at least one section to the body before publishing.";
  return null;
}

/**
 * Links typed in a post as [text](address) whose address is not allowed (the list comes from
 * unsafeBlogLinks in lib/content/blogs.ts, which decides what is). Empty list: nothing to say.
 */
export function blogLinkProblem(badAddresses: readonly string[]): Problem {
  if (badAddresses.length === 0) return null;
  const first = badAddresses[0];
  const shown = first.length > 60 ? `${first.slice(0, 57)}...` : first;
  return `“${shown}” cannot be used as a link. A link starts with https:// or http://, or with a single / for a page on this site, for example [Contact us](/contact).`;
}
