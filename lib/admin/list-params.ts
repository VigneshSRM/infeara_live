// What an admin list's search box, filters and page number mean, in one place.
//
// Every list in the admin keeps its state in the address (?q=…&status=…&page=…), so a filtered
// view can be bookmarked, shared and reached with the browser's back button. The values come
// from a URL anyone can edit, so each is cleaned here before it reaches a query: the search
// text is cut down to letters, digits, spaces, hyphens and dots (which also removes the LIKE
// wildcards % and _ and the characters that mean something in a PostgREST filter), the status
// must be one of a fixed list, and the page must be a whole number of at least 1.
//
// No imports, so tests can load this file as it is.

export const PAGE_SIZE = 20;

export const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const STATUS_VALUES: readonly string[] = STATUS_FILTERS.map((filter) => filter.value);

/** An extra dropdown filter, e.g. which parent service a sub-service belongs to. */
export type ExtraFilterSpec = { name: string; label: string; options: readonly { value: string; label: string }[] };

export type ListParams = {
  q: string;
  status: StatusFilter;
  page: number;
  /** Only the extra filters that are set, by name. */
  extra: Record<string, string>;
};

export type RawParams = Record<string, string | string[] | undefined>;

const MAX_SEARCH_LENGTH = 80;
const MAX_PAGE = 100_000;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Letters, digits, spaces, hyphens and dots only; everything else becomes a space. */
export function cleanSearch(value: string | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N} .-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .trim();
}

export function parseListParams(raw: RawParams, extras: readonly ExtraFilterSpec[] = []): ListParams {
  const status = first(raw.status) ?? "";
  const pageNumber = Number.parseInt(first(raw.page) ?? "", 10);

  const extra: Record<string, string> = {};
  for (const spec of extras) {
    const value = first(raw[spec.name]) ?? "";
    if (value && spec.options.some((option) => option.value === value)) extra[spec.name] = value;
  }

  return {
    q: cleanSearch(first(raw.q)),
    status: STATUS_VALUES.includes(status) ? (status as StatusFilter) : "all",
    page: Number.isInteger(pageNumber) && pageNumber >= 1 ? Math.min(pageNumber, MAX_PAGE) : 1,
    extra,
  };
}

/** True when anything narrows the list, so an empty result can say "no matches" rather than "none yet". */
export function isFiltered(params: ListParams): boolean {
  return Boolean(params.q) || params.status !== "all" || Object.keys(params.extra).length > 0;
}

/**
 * Where a request for `requestedPage` actually lands. A page past the end becomes the last page
 * and a page before the start becomes the first, so a stale link or an edited address shows
 * results instead of an error. `from` is the zero-based offset of the first row.
 */
export function pageWindow(total: number, requestedPage: number, size: number = PAGE_SIZE) {
  const rows = Math.max(0, Math.floor(total) || 0);
  const pages = Math.max(1, Math.ceil(rows / size));
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), pages);
  const from = (page - 1) * size;
  const last = Math.min(from + size, rows);

  return { total: rows, size, pages, page, from, first: rows ? from + 1 : 0, last };
}

export type PageWindow = ReturnType<typeof pageWindow>;

/** The address of a list view: defaults (all statuses, page 1, no search) are left out. */
export function listHref(base: string, params: ListParams, patch: Partial<ListParams> = {}): string {
  const next = { ...params, ...patch };
  const query = new URLSearchParams();

  if (next.q) query.set("q", next.q);
  if (next.status !== "all") query.set("status", next.status);
  for (const [name, value] of Object.entries(next.extra)) if (value) query.set(name, value);
  if (next.page > 1) query.set("page", String(next.page));

  const text = query.toString();
  return text ? `${base}?${text}` : base;
}

/**
 * The value for one PostgREST `.or()`: a case-insensitive "contains" on each column. The text
 * has been through {@link cleanSearch}, so it holds no comma, bracket, quote or wildcard.
 */
export function searchFilter(columns: readonly string[], q: string): string | null {
  const text = cleanSearch(q);
  if (!text || columns.length === 0) return null;
  return columns.map((column) => `${column}.ilike.%${text}%`).join(",");
}
