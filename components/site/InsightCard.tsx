import Link from "next/link";
import type { Insight } from "@/lib/content/types";

function formatDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Link
      href={`/insights/${insight.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue/40 hover:shadow-lift"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-heading text-[10px] uppercase tracking-[0.16em] text-charcoal/75">
        <span className="text-blue">{insight.category}</span>
        <span aria-hidden="true">·</span>
        <span>{insight.readingMinutes} min read</span>
      </div>

      <h3 className="mt-4 font-display text-[1.28rem] font-medium leading-[1.2] tracking-[-0.02em] text-navy">
        {insight.title}
      </h3>

      <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-charcoal/70">{insight.excerpt}</p>

      <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-4 text-[0.78rem] text-charcoal/75">
        <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
        <span
          aria-hidden="true"
          className="text-blue transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </Link>
  );
}
