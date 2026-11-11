import Link from "next/link";
import { listHref, type ListParams, type PageWindow } from "@/lib/admin/list-params";

const buttonClass = "admin-btn admin-btn-ghost !px-3 !py-1 !text-[0.74rem]";

/**
 * "Showing 21–40 of 53" with Previous and Next. Renders nothing for an empty list. The links keep
 * the search and filters, and change only the page.
 */
export function Pager({
  basePath,
  params,
  window,
  noun,
  previousLabel = "Previous",
  nextLabel = "Next",
}: {
  basePath: string;
  params: ListParams;
  window: PageWindow;
  /** Plural, lower case: "blog posts". */
  noun: string;
  /** For a list with a direction in time: "Newer" and "Older". */
  previousLabel?: string;
  nextLabel?: string;
}) {
  if (window.total === 0) return null;

  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.8rem] text-charcoal/70">
      <p>
        Showing {window.first}–{window.last} of {window.total} {noun}
      </p>

      {window.pages > 1 ? (
        <p className="flex items-center gap-3">
          {window.page > 1 ? (
            <Link href={listHref(basePath, params, { page: window.page - 1 })} rel="prev" className={buttonClass}>
              {previousLabel}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${buttonClass} pointer-events-none opacity-45`}>
              {previousLabel}
            </span>
          )}
          <span aria-current="page">
            Page {window.page} of {window.pages}
          </span>
          {window.page < window.pages ? (
            <Link href={listHref(basePath, params, { page: window.page + 1 })} rel="next" className={buttonClass}>
              {nextLabel}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${buttonClass} pointer-events-none opacity-45`}>
              {nextLabel}
            </span>
          )}
        </p>
      ) : null}
    </nav>
  );
}
