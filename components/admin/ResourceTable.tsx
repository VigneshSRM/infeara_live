import Link from "next/link";
import type { ReactNode } from "react";

/** Shown when a list could not be read. Fixed wording: the database's own message goes to the log. */
export function ListError() {
  return (
    <p
      role="alert"
      className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink"
    >
      The list could not be loaded. Reload the page; if it keeps happening, check the Supabase connection.
    </p>
  );
}

export type Column<Row> = {
  header: string;
  cell: (row: Row) => ReactNode;
  /** Extra classes for the cells in this column, e.g. "whitespace-nowrap". */
  className?: string;
};

/**
 * The table of an admin list, with a different message for "nothing here yet" and "nothing
 * matches the search". Wide tables scroll inside their card instead of breaking the page.
 */
export function ResourceTable<Row extends { id: string | number }>({
  caption,
  rows,
  columns,
  filtered,
  clearHref,
  emptyMessage,
}: {
  caption: string;
  rows: Row[];
  columns: Column<Row>[];
  filtered: boolean;
  clearHref: string;
  emptyMessage: ReactNode;
}) {
  return (
    <div className="admin-card mt-6 overflow-hidden">
      {rows.length ? (
        // `relative`, so the wrapper is the containing block of anything positioned inside a row. A
        // visually hidden label (class sr-only) is positioned absolutely, and without this it ignores
        // the wrapper's scrolling and widens the whole page, even though the table itself scrolls.
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-[0.86rem]">
            <caption className="sr-only">{caption}</caption>
            <thead className="border-b border-navy/10 bg-ivory/50">
              <tr className="font-heading text-[0.68rem] uppercase tracking-[0.14em] text-charcoal/60">
                {columns.map((column) => (
                  <th key={column.header} scope="col" className="px-4 py-3 font-medium">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ivory/40">
                  {columns.map((column) => (
                    <td key={column.header} className={`px-4 py-3 ${column.className ?? "text-charcoal/70"}`}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered ? (
        <p className="px-4 py-10 text-center text-[0.86rem] text-charcoal/70">
          Nothing matches that search.{" "}
          <Link href={clearHref} className="underline underline-offset-4 hover:text-blue">
            Clear the search and filters
          </Link>
          .
        </p>
      ) : (
        <p className="px-4 py-10 text-center text-[0.86rem] text-charcoal/70">{emptyMessage}</p>
      )}
    </div>
  );
}
