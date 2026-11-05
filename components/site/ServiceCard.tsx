import Link from "next/link";
import type { Service } from "@/lib/content/types";

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue/40 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-sm tracking-[0.08em] text-blue">
          {typeof index === "number" ? String(index + 1).padStart(2, "0") : null}
        </span>
        <span
          aria-hidden="true"
          className="mt-0.5 text-blue transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </div>

      <h3 className="mt-5 font-heading text-[1.02rem] font-semibold leading-snug tracking-[-0.01em] text-navy">
        {service.name}
      </h3>

      <p className="mt-3 flex-1 text-[0.88rem] leading-relaxed text-charcoal/70">{service.summary}</p>

      <p className="mt-6 border-t border-navy/10 pt-4 font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">
        {service.tagline}
      </p>
    </Link>
  );
}
