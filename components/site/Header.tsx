import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { nav, primaryCta } from "@/lib/content/site";

type Props = { variant?: "overlay" | "solid" };

export function Header({ variant = "solid" }: Props) {
  const overlay = variant === "overlay";

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-30"
          : "sticky top-0 z-30 border-b border-navy/20 bg-ivory"
      }
    >
      <div className="shell flex items-center justify-between py-5">
        <Link href="/" aria-label="Infeara Technologies home" className="shrink-0">
          <Logo variant={overlay ? "light" : "dark"} preload cropped sizes="176px" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 xl:flex">
          {nav.map((item) => {
            const children = "children" in item && item.children ? item.children : null;
            const linkClass = overlay
              ? "font-heading text-[0.82rem] text-ivory/75 transition-colors hover:text-ivory"
              : "font-heading text-[0.82rem] text-charcoal/75 transition-colors hover:text-navy";

            if (!children) {
              return (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              );
            }

            const wide = children.length > 8;
            // The label of the closing "see everything" link; menus without a hub page omit it.
            const overviewLabel = "overviewLabel" in item ? item.overviewLabel : null;

            return (
              <details key={item.href} className="group relative">
                <summary
                  className={`${linkClass} inline-flex cursor-pointer list-none items-center gap-1.5`}
                >
                  {item.label}
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    className="mt-px"
                  >
                    <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </summary>

                <div className="absolute left-1/2 top-full z-40 hidden -translate-x-1/2 pt-4 group-open:block">
                  <div className="rounded-sm border border-navy/15 bg-ivory p-2">
                    <p className="px-3 pb-1.5 pt-2 font-heading text-[9px] uppercase tracking-[0.2em] text-muted">
                      {item.label}
                    </p>
                    <ul className={`grid gap-x-1 ${wide ? "w-[30rem] grid-cols-2" : "w-[18rem] grid-cols-1"}`}>
                      {children.map((child) => {
                        const subservices = "children" in child && child.children ? child.children : null;
                        return (
                          <li key={child.href}>
                            {subservices ? (
                              <details>
                                <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm px-3 py-2 font-heading text-[0.8rem] font-semibold leading-snug text-navy hover:bg-navy/5">
                                  {child.label}
                                  <span aria-hidden="true" className="text-[0.7rem] text-charcoal/50">+</span>
                                </summary>
                                <ul className="mb-2 ml-4 space-y-0.5 border-l border-navy/10 pl-2">
                                  <li>
                                    <Link
                                      href={child.href}
                                      className="block rounded-sm px-2 py-1.5 font-heading text-[0.75rem] font-medium leading-snug text-blue hover:bg-navy/5"
                                    >
                                      {child.label} overview
                                    </Link>
                                  </li>
                                  {subservices.map((subservice) => (
                                    <li key={subservice.href}>
                                      <Link
                                        href={subservice.href}
                                        className="block rounded-sm px-2 py-1.5 font-heading text-[0.75rem] leading-snug text-charcoal/70 hover:bg-navy/5 hover:text-navy"
                                      >
                                        {subservice.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            ) : (
                              <Link
                                href={child.href}
                                className="block rounded-sm px-3 py-2 font-heading text-[0.8rem] font-semibold leading-snug text-navy transition-colors hover:bg-navy/5"
                              >
                                {child.label}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {overviewLabel ? (
                      <Link
                        href={item.href}
                        className="mt-1 block rounded-sm border-t border-navy/10 px-3 pt-3 pb-2 font-heading text-[0.72rem] uppercase tracking-[0.12em] text-blue hover:text-navy"
                      >
                        {overviewLabel}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </details>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={primaryCta.href}
            className={
              overlay
                ? "btn-primary hidden text-[0.82rem] sm:inline-flex"
                : "btn-solid hidden text-[0.82rem] sm:inline-flex"
            }
          >
            {primaryCta.label}
          </Link>

          <details className="group relative xl:hidden">
            <summary
              className={`flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-sm border ${
                overlay
                  ? "border-ivory/25 text-ivory"
                  : "border-navy/15 text-navy"
              }`}
            >
              <span className="sr-only">Open menu</span>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </summary>

            <div className="absolute right-0 top-12 w-72 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-sm border border-navy/15 bg-ivory p-5">
              <ul className="space-y-1">
                {nav.map((item) => {
                  const children = "children" in item && item.children ? item.children : null;
                  const overviewLabel = "overviewLabel" in item ? item.overviewLabel : null;
                  return (
                    <li key={item.href}>
                      {children ? (
                        <details>
                          <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm px-3 py-2 font-heading text-sm text-navy hover:bg-navy/5">
                            {item.label}
                            <span aria-hidden="true" className="text-xs text-charcoal/50">+</span>
                          </summary>
                          <ul className="mb-2 ml-3 space-y-0.5 border-l border-navy/10 pl-3">
                            {children.map((child) => {
                              const subservices = "children" in child && child.children ? child.children : null;
                              return (
                                <li key={child.href}>
                                  {subservices ? (
                                    <details>
                                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm px-3 py-1.5 text-[0.8rem] font-medium text-navy hover:bg-navy/5">
                                        {child.label}
                                        <span aria-hidden="true" className="text-xs text-charcoal/50">+</span>
                                      </summary>
                                      <ul className="mb-2 ml-4 space-y-0.5 border-l border-navy/10 pl-2">
                                        <li>
                                          <Link
                                            href={child.href}
                                            className="block rounded-sm px-2 py-1.5 text-[0.76rem] font-medium text-blue hover:bg-navy/5"
                                          >
                                            {child.label} overview
                                          </Link>
                                        </li>
                                        {subservices.map((subservice) => (
                                          <li key={subservice.href}>
                                            <Link
                                              href={subservice.href}
                                              className="block rounded-sm px-2 py-1.5 text-[0.76rem] text-charcoal/70 hover:bg-navy/5 hover:text-navy"
                                            >
                                              {subservice.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </details>
                                  ) : (
                                    <Link
                                      href={child.href}
                                      className="block rounded-sm px-3 py-1.5 text-[0.8rem] font-medium text-navy hover:bg-navy/5"
                                    >
                                      {child.label}
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                            {overviewLabel ? (
                              <li>
                                <Link
                                  href={item.href}
                                  className="mt-1 block border-t border-navy/10 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-blue"
                                >
                                  {overviewLabel}
                                </Link>
                              </li>
                            ) : null}
                          </ul>
                        </details>
                      ) : (
                        <Link
                          href={item.href}
                          className="block rounded-sm px-3 py-2 font-heading text-sm text-navy hover:bg-navy/5"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Link href={primaryCta.href} className="btn-primary mt-4 w-full justify-center text-sm">
                {primaryCta.label}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
