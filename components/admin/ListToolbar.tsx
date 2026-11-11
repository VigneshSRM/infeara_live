import Link from "next/link";
import { STATUS_FILTERS, isFiltered, type ExtraFilterSpec, type ListParams } from "@/lib/admin/list-params";

/**
 * Search box and filters for an admin list.
 *
 * A plain GET form: submitting it loads the same page with ?q=…&status=… in the address, and
 * because the form carries no page number a changed filter always starts again at page 1. It
 * works without JavaScript and the result can be bookmarked.
 */
export function ListToolbar({
  action,
  params,
  label,
  placeholder,
  extras = [],
  showStatus = true,
}: {
  /** The page's own path, e.g. /admin/blogs. */
  action: string;
  params: ListParams;
  /** Names the search landmark for screen readers, e.g. "Search blog posts". */
  label: string;
  placeholder?: string;
  extras?: readonly ExtraFilterSpec[];
  showStatus?: boolean;
}) {
  const active = isFiltered(params);

  // Keyed by the filters the list is showing. A link that changes them (Clear, or a service name in
  // a table) is a soft navigation that keeps this form's DOM, and a <select> does not follow a new
  // defaultValue, so without the key it would go on showing the old choice over an unfiltered list.
  const formKey = JSON.stringify([params.q, params.status, params.extra]);

  return (
    <form
      key={formKey}
      method="get"
      action={action}
      role="search"
      aria-label={label}
      className="mt-6 flex flex-wrap items-end gap-3"
    >
      <div className="min-w-[14rem] flex-1">
        <label className="admin-label" htmlFor="list-q">
          Search
        </label>
        <input
          id="list-q"
          name="q"
          type="search"
          defaultValue={params.q}
          placeholder={placeholder}
          maxLength={80}
          autoComplete="off"
          className="admin-input"
        />
      </div>

      {showStatus ? (
        <div>
          <label className="admin-label" htmlFor="list-status">
            Status
          </label>
          <select id="list-status" name="status" defaultValue={params.status} className="admin-select">
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {extras.map((extra) => (
        <div key={extra.name}>
          <label className="admin-label" htmlFor={`list-${extra.name}`}>
            {extra.label}
          </label>
          <select
            id={`list-${extra.name}`}
            name={extra.name}
            defaultValue={params.extra[extra.name] ?? ""}
            className="admin-select"
          >
            <option value="">All</option>
            {extra.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button type="submit" className="admin-btn admin-btn-primary">
        Apply
      </button>
      {active ? (
        <Link href={action} className="admin-btn admin-btn-ghost">
          Clear
        </Link>
      ) : null}
    </form>
  );
}
