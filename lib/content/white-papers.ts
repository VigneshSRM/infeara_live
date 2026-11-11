// White papers live in the database and are managed in the admin (Admin → Resources → White
// papers). Each is a PDF uploaded to the public "documents" storage bucket, or a link to a file
// kept elsewhere. Nothing is published yet, so `whitePapers` below is empty on purpose: it is
// the seed and the fallback, and an empty seed means "no papers" rather than invented ones.
//
// Readers open a paper straight from its link. There is no name or email form in front of it.
//
// This file deliberately has no imports, so tests and scripts can load it as it is.

export type WhitePaper = {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  /** Where the file opens: the storage URL of an uploaded PDF, or the external link. */
  fileUrl: string | null;
  /** The name shown beside the button, e.g. "recovery-testing.pdf". */
  fileName: string | null;
  fileSizeBytes: number | null;
  /** Calendar date (India time) as YYYY-MM-DD, or null when no date was set. */
  publishedAt: string | null;
  seo: { title: string; description: string };
};

export const whitePapers: WhitePaper[] = [];

/** The biggest PDF the documents bucket accepts. Mirrors the bucket limit in the migration. */
export const MAX_PAPER_BYTES = 25 * 1024 * 1024;

/** The bucket the PDFs are stored in. */
export const DOCUMENTS_BUCKET = "documents";

/**
 * Where an uploaded paper lives inside the bucket: papers/<uuid>/<file name>.pdf. The upload is
 * minted by the server and the save checks the path against this pattern, so a form cannot
 * attach some other object.
 */
export const PAPER_PATH_PATTERN = /^papers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[A-Za-z0-9][A-Za-z0-9._-]{0,119}\.pdf$/;

/** "Recovery Testing (final v2).PDF" becomes "Recovery-Testing-final-v2.pdf". */
export function safePdfName(name: string): string {
  const base = name
    .replace(/\.pdf$/i, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/-{2,}/g, "-")
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
    .slice(0, 100);
  return `${base || "white-paper"}.pdf`;
}

/** 340 KB, 1.4 MB. Whole kilobytes under a megabyte, one decimal above. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(Math.round((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB`;
}

/** The public address of a file in the documents bucket. */
export function documentUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${DOCUMENTS_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
