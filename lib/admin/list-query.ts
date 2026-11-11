import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchema } from "./errors";
import { PAGE_SIZE, pageWindow, searchFilter, windowStart, type ListParams, type PageWindow } from "./list-params";

/**
 * The filter methods every PostgREST query builder has. Typing a query as this instead of
 * with the library's own builder type keeps the compiler from unrolling that very deep generic
 * type for each call.
 */
type Chain = {
  eq(column: string, value: string): Chain;
  gt(column: string, value: string): Chain;
  gte(column: string, value: string): Chain;
  or(filters: string): Chain;
};

/** What decides which rows a list matches. The count and the rows both use it. */
type FilterConfig = {
  params: ListParams;
  /** Columns the search box looks in. */
  searchColumns: readonly string[];
  /** An extra filter's name → the column it filters, for filters set in `params.extra`. */
  extraColumns?: Record<string, string>;
  /** A "last N days" filter's name → the timestamp column it compares. */
  windowColumns?: Record<string, string>;
};

export type ListQuery = FilterConfig & {
  table: string;
  /** The columns to read for each row (a PostgREST select string). */
  columns: string;
  /** Sort order, first to last. The row's id is always the last tie-breaker. */
  order: readonly { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  /** Rows to a page. Defaults to 20. */
  pageSize?: number;
};

export type ListPage<Row> = {
  rows: Row[];
  window: PageWindow;
  error: PostgrestError | null;
};

/** The same filters for the count and for the rows, so the two always agree. */
function applyFilters<Query>(query: Query, config: FilterConfig, nowMs: number): Query {
  const { params } = config;
  let next = query as unknown as Chain;

  if (params.status === "scheduled") {
    // "Scheduled" is a published row whose publish time has not come yet.
    next = next.eq("status", "published").gt("published_at", new Date(nowMs).toISOString());
  } else if (params.status !== "all") {
    next = next.eq("status", params.status);
  }

  for (const [name, value] of Object.entries(params.extra)) {
    if (!value) continue;

    const windowColumn = config.windowColumns?.[name];
    if (windowColumn) {
      const days = Number(value);
      if (days > 0) next = next.gte(windowColumn, windowStart(nowMs, days));
      continue;
    }

    const column = config.extraColumns?.[name];
    if (column) next = next.eq(column, value);
  }

  // One `.or()` only: it is the single place a free-text search can reach a query.
  const search = searchFilter(config.searchColumns, params.q);
  if (search) next = next.or(search);

  return next as unknown as Query;
}

/**
 * One page of an admin list, read with the signed-in user's own permissions.
 *
 * The count comes first so a page number past the end can be pulled back to the last page
 * before the rows are asked for (PostgREST answers an out-of-range offset with an error).
 *
 * The count is an ordinary GET for one row, not a HEAD request. A HEAD response has no body, so
 * when the table does not exist yet the client sees a bare 404, takes it for "no content" and
 * reports no error: the list would read as empty and never say that the setup script is missing.
 * A GET keeps the error body, and with it the code that says what is wrong.
 */
export async function fetchListPage<Row>(config: ListQuery): Promise<ListPage<Row>> {
  const supabase = await createClient();
  const nowMs = Date.now();
  const size = config.pageSize ?? PAGE_SIZE;

  const counted = await applyFilters(
    supabase.from(config.table).select("id", { count: "exact" }).limit(1),
    config,
    nowMs,
  );
  if (counted.error) return failed(config.table, counted.error);

  const window = pageWindow(counted.count ?? 0, config.params.page, size);
  if (window.total === 0) return { rows: [], window, error: null };

  let query = applyFilters(supabase.from(config.table).select(config.columns), config, nowMs);
  for (const order of config.order) {
    query = query.order(order.column, { ascending: order.ascending ?? true, nullsFirst: order.nullsFirst });
  }
  // Rows that tie on every sort column come back in no fixed order, and a page boundary that
  // falls between them could show one twice and another not at all. The id settles it.
  if (!config.order.some((order) => order.column === "id")) query = query.order("id", { ascending: true });

  const { data, error } = await query.range(window.from, window.from + window.size - 1);
  if (error) return failed(config.table, error);
  return { rows: (data ?? []) as Row[], window, error: null };
}

/**
 * How many rows match, with the same search and filters as a list. For the numbers beside a
 * filter (the Leads screen's status buttons) and for a notice about rows the list does not show.
 * Null when it could not be counted, so a caller can leave the number out.
 */
export async function countListRows(config: FilterConfig & { table: string }): Promise<number | null> {
  const supabase = await createClient();
  const counted = await applyFilters(
    supabase.from(config.table).select("id", { count: "exact" }).limit(1),
    config,
    Date.now(),
  );
  if (counted.error) {
    if (!isMissingSchema(counted.error)) {
      console.error(`[admin] could not count ${config.table}:`, counted.error.code ?? "no code", counted.error.message);
    }
    return null;
  }
  return counted.count ?? 0;
}

/**
 * A missing table is an expected state (the setup script has not been run) and the screen
 * says so. Anything else is logged here, and the screen shows fixed wording instead of the
 * database's own.
 */
function failed<Row>(table: string, error: PostgrestError): ListPage<Row> {
  if (!isMissingSchema(error)) {
    console.error(`[admin] could not read ${table}:`, error.code ?? "no code", error.message);
  }
  return { rows: [], window: pageWindow(0, 1), error };
}

/** True when the table has not been created yet. Lets a "new" screen say so before anyone fills it in. */
export async function tableIsMissing(table: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).select("id").limit(1);
  return isMissingSchema(error);
}
