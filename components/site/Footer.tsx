import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { company, footerColumns } from "@/lib/content/site";

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-ivory">
      <div className="shell py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr] md:gap-16">
          <div>
            <Logo variant="light" />
            <p className="mt-5 max-w-[22rem] text-[0.92rem] leading-relaxed text-ivory/60">
              Managed IT, cybersecurity and infrastructure operations for
              businesses that cannot afford unplanned downtime.
            </p>
            <p className="mt-6 font-display text-lg tracking-[-0.02em] text-ivory/85">
              {company.tagline}.
            </p>
            <div className="mt-6 space-y-1 text-[0.86rem] text-ivory/70">
              <p>
                {company.city}, {company.region}, {company.country}
              </p>
              <p>
                <a href={`mailto:${company.email}`} className="underline decoration-ivory/25 underline-offset-4 hover:text-ivory">
                  {company.email}
                </a>
              </p>
              <p>{company.hours}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-ivory/65">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[0.84rem] text-ivory/65 transition-colors hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/10 pt-7 text-[0.78rem] text-ivory/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p>
            Content managed through the Infeara dashboard. Report an issue:{" "}
            <a href={`mailto:${company.email}`} className="underline underline-offset-4 hover:text-ivory/70">
              {company.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
