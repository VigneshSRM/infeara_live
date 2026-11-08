import Link from "next/link";
import type { Insight } from "@/lib/content/types";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Link
      href={`/insights/${insight.slug}`}
      className="group flex h-full flex-col border-t border-navy/20 py-5 transition-colors hover:border-blue"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-heading text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-blue">
          {insight.category}
        </span>
        <span aria-hidden="true" className="text-blue group-hover:text-coral">→</span>
      </div>
      <h3 className="mt-4 font-heading text-[1.05rem] font-semibold leading-[1.3] text-navy">
        {insight.title}
      </h3>
      <p className="mt-2 flex-1 text-[0.88rem] leading-relaxed text-charcoal/75">{insight.excerpt}</p>
      <span className="mt-5 font-heading text-[0.8rem] font-semibold text-navy">View guide</span>
    </Link>
  );
}
