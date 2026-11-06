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
          : "sticky top-0 z-30 border-b border-navy/10 bg-ivory/92 backdrop-blur"
      }
    >
      <div className="shell flex items-center justify-between py-5">
        <Link href="/" aria-label="Infeara Technologies home" className="shrink-0">
          <Logo variant={overlay ? "light" : "dark"} />
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

            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-haspopup="true"
                  className={`${linkClass} inline-flex items-center gap-1.5`}
                >
                  {item.label}
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    className="mt-px transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
                  >
                    <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </Link>

                <div className="invisible absolute left-1/2 top-full z-40 -translate-x-1/2 pt-4 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-2xl border border-navy/10 bg-ivory p-2 shadow-lift">
                    <p className="px-3 pb-1.5 pt-2 font-heading text-[9px] uppercase tracking-[0.2em] text-muted">
                      {item.label}
                    </p>
                    <ul className={`grid gap-x-1 ${wide ? "w-[30rem] grid-cols-2" : "w-[18rem] grid-cols-1"}`}>
                      {children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-lg px-3 py-2 font-heading text-[0.8rem] leading-snug text-charcoal/80 transition-colors hover:bg-navy/5 hover:text-navy"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={item.href}
                      className="mt-1 block rounded-lg border-t border-navy/10 px-3 pt-3 pb-2 font-heading text-[0.72rem] uppercase tracking-[0.12em] text-blue hover:text-navy"
                    >
                      {wide ? "All services" : "All industries"}
                    </Link>
                  </div>
                </div>
              </div>
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
              className={`flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border ${
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

            <div className="absolute right-0 top-12 w-72 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-navy/10 bg-ivory p-5 shadow-lift">
              <ul className="space-y-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-2 font-heading text-sm text-navy hover:bg-navy/5"
                    >
                      {item.label}
                    </Link>
                    {"children" in item && item.children ? (
                      <ul className="mb-2 ml-3 space-y-0.5 border-l border-navy/10 pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-lg px-3 py-1.5 text-[0.8rem] text-charcoal/75 hover:bg-navy/5 hover:text-navy"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
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
