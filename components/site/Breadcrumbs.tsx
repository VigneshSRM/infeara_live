type Crumb = { label: string; href: string };

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

export function breadcrumbSchema(items: Crumb[]) {
  const list = [{ label: "Home", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };
}
