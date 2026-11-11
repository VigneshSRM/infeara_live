// What an admin list's search box, filters and page number mean, in one place.
//
// Every list in the admin keeps its state in the address (?q=…&status=…&page=…), so a filtered
// view can be bookmarked, shared and reached with the browser's back button. The values come
// from a URL anyone can edit, so each is cleaned here before it reaches a query: the search
// text is cut down to letters, digits, spaces, hyphens, dots and @ (which also removes the LIKE
// wildcards % and _ and the characters that mean something in a PostgREST filter), the status
// and every extra filter must be one of a fixed list, and the page must be a whole number of
// at least 1.
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

/** One choice of a status filter. The first choice of a list is always "all". */
export type StatusOption = { value: string; label: string };

/**
 * The statuses of an enquiry. A list takes its own: the Leads screen filters by these, and every
 * content list by {@link STATUS_FILTERS}. tests/admin-lists.test.mjs checks that this list and
 * LEAD_STATUSES in lead-stats.ts name the same five.
 */
export const LEAD_STATUS_FILTERS: readonly StatusOption[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

/** An extra dropdown filter, e.g. which parent service a sub-service belongs to. */
export type ExtraFilterSpec = {
  name: string;
  label: string;
  /** What the blank choice says, e.g. "All roles". Defaults to "All". */
  anyLabel?: string;
  options: readonly { value: string; label: string }[];
};

/**
 * A "received in the last N days" dropdown. The choice's value is the number of days, and the
 * query turns it into a time with {@link windowStart}.
 */
export function windowFilter(
  name: string,
  label: string,
  days: readonly number[],
  anyLabel = "Any time",
): ExtraFilterSpec {
  return {
    name,
    label,
    anyLabel,
    options: days.map((count) => ({ value: String(count), label: count === 1 ? "Last 24 hours" : `Last ${count} days` })),
  };
}

/** The instant a "last N days" window opens, as an ISO time a database can compare. */
export function windowStart(nowMs: number, days: number): string {
  return new Date(nowMs - days * 86_400_000).toISOString();
}

export type ListParams = {
  q: string;
  /** "all", or one of the values of the list's own status choices. */
  status: string;
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

/**
 * Letters, digits, spaces, hyphens, dots and @ only; everything else becomes a space. The @ is
 * kept so an email address can be searched for. It means nothing in a PostgREST filter value.
 */
export function cleanSearch(value: string | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N} .@-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .trim();
}

/**
 * `statuses` is the list's own status choices (default: the content statuses). A list with no
 * status of its own passes an empty list, so `?status=…` is ignored there.
 */
export function parseListParams(
  raw: RawParams,
  extras: readonly ExtraFilterSpec[] = [],
  statuses: readonly StatusOption[] = STATUS_FILTERS,
): ListParams {
  const status = first(raw.status) ?? "";
  const pageNumber = Number.parseInt(first(raw.page) ?? "", 10);

  const extra: Record<string, string> = {};
  for (const spec of extras) {
    const value = first(raw[spec.name]) ?? "";
    if (value && spec.options.some((option) => option.value === value)) extra[spec.name] = value;
  }

  return {
    q: cleanSearch(first(raw.q)),
    status: statuses.some((option) => option.value === status) ? status : "all",
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

/** The query string of a list view, without the "?". Defaults (all statuses, page 1, no search) are left out. */
export function listQueryString(params: ListParams): string {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.status !== "all") query.set("status", params.status);
  for (const [name, value] of Object.entries(params.extra)) if (value) query.set(name, value);
  if (params.page > 1) query.set("page", String(params.page));

  return query.toString();
}

/** The address of a list view: defaults (all statuses, page 1, no search) are left out. */
export function listHref(base: string, params: ListParams, patch: Partial<ListParams> = {}): string {
  const text = listQueryString({ ...params, ...patch });
  return text ? `${base}?${text}` : base;
}

/**
 * Where a form on a list sends the browser back to: the list's address, rebuilt from the query
 * string the form carried. The text comes from a form field a visitor can edit, so it is not
 * used as it is: it is read back through {@link parseListParams}, which keeps only the known
 * names and values, and joined onto `base`. The result is always `base`, or `base?` and a
 * clean query string, and never anywhere else.
 */
export function listHrefFromQuery(
  base: string,
  query: string | null | undefined,
  extras: readonly ExtraFilterSpec[] = [],
  statuses: readonly StatusOption[] = STATUS_FILTERS,
): string {
  const search = new URLSearchParams((query ?? "").replace(/^\?/, ""));
  const raw: RawParams = {};
  for (const name of ["q", "status", "page", ...extras.map((extra) => extra.name)]) {
    const value = search.get(name);
    if (value !== null) raw[name] = value;
  }
  return listHref(base, parseListParams(raw, extras, statuses));
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
