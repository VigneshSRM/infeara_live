import Link from "next/link";
import { RANGE_OPTIONS, type RangeDays } from "@/lib/analytics/ga4-core";

/** 7 / 30 / 90 days. Plain links: the page re-renders on the server for the chosen period. */
export function RangeTabs({ active }: { active: RangeDays }) {
  return (
    <nav aria-label="Reporting period" className="flex gap-1.5">
      {RANGE_OPTIONS.map((days) => (
        <Link
          key={days}
          href={`/admin?range=${days}#visitors`}
          scroll={false}
          aria-current={days === active ? "page" : undefined}
          className={`rounded-sm border px-3 py-1 font-heading text-[0.74rem] transition-colors ${
            days === active
              ? "border-navy bg-navy text-ivory"
              : "border-navy/15 text-charcoal/75 hover:border-navy/35 hover:text-navy"
          }`}
        >
          {days} days
        </Link>
      ))}
    </nav>
  );
}
