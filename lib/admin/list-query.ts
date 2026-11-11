import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchema } from "./errors";
import { PAGE_SIZE, pageWindow, searchFilter, type ListParams, type PageWindow } from "./list-params";

/**
 * The three filter methods every PostgREST query builder has. Typing a query as this instead of
 * with the library's own builder type keeps the compiler from unrolling that very deep generic
 * type for each call.
 */
type Chain = {
  eq(column: string, value: string): Chain;
  gt(column: string, value: string): Chain;
  or(filters: string): Chain;
};

export type ListQuery = {
  table: string;
  /** The columns to read for each row (a PostgREST select string). */
  columns: string;
  params: ListParams;
  /** Columns the search box looks in. */
  searchColumns: readonly string[];
  /** Sort order, first to last. */
  order: readonly { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  /** An extra filter's name → the column it filters, for filters set in `params.extra`. */
  extraColumns?: Record<string, string>;
};

export type ListPage<Row> = {
  rows: Row[];
  window: PageWindow;
  error: PostgrestError | null;
};

/** The same filters for the count and for the rows, so the two always agree. */
function applyFilters<Query>(query: Query, config: ListQuery, nowIso: string): Query {
  const { params } = config;
  let next = query as unknown as Chain;

  if (params.status === "scheduled") {
    // "Scheduled" is a published row whose publish time has not come yet.
    next = next.eq("status", "published").gt("published_at", nowIso);
  } else if (params.status !== "all") {
    next = next.eq("status", params.status);
  }

  for (const [name, value] of Object.entries(params.extra)) {
    const column = config.extraColumns?.[name];
    if (column && value) next = next.eq(column, value);
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
  const nowIso = new Date().toISOString();

  const counted = await applyFilters(
    supabase.from(config.table).select("id", { count: "exact" }).limit(1),
    config,
    nowIso,
  );
  if (counted.error) return failed(config.table, counted.error);

  const window = pageWindow(counted.count ?? 0, config.params.page);
  if (window.total === 0) return { rows: [], window, error: null };

  let query = applyFilters(supabase.from(config.table).select(config.columns), config, nowIso);
  for (const order of config.order) {
    query = query.order(order.column, { ascending: order.ascending ?? true, nullsFirst: order.nullsFirst });
  }

  const { data, error } = await query.range(window.from, window.from + PAGE_SIZE - 1);
  if (error) return failed(config.table, error);
  return { rows: (data ?? []) as Row[], window, error: null };
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
