import { breadcrumbListSchema, type Crumb } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const list = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[0.72rem] tracking-wide text-ivory/70">
        {list.map((item, index) => {
          const last = index === list.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-ivory/75">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="hover:text-ivory">
                  {item.label}
                </a>
              )}
              {!last ? (
                <span aria-hidden="true" className="text-ivory/25">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** BreadcrumbList data for the same trail. The addresses are absolute: see lib/seo/schema.ts. */
export function breadcrumbSchema(items: Crumb[]) {
  return breadcrumbListSchema(SITE_URL, items);
}
