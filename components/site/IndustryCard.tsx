import Link from "next/link";
import type { Industry } from "@/lib/content/types";

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group flex items-start justify-between gap-5 rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue/40 hover:shadow-lift"
    >
      <div>
        <h3 className="font-heading text-[0.98rem] font-semibold leading-snug text-navy">{industry.name}</h3>
        <p className="mt-2 text-[0.84rem] leading-relaxed text-charcoal/75">{industry.tagline}</p>
      </div>
      <span
        aria-hidden="true"
        className="mt-1 shrink-0 text-blue transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
