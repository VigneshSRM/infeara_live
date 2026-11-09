import type { ReactNode } from "react";
import type { Delta } from "@/lib/analytics/format";
import { formatCount, formatRate } from "@/lib/analytics/format";

/**
 * Small presentational pieces shared by the Overview's visitor and lead sections.
 * Server components with no state: a chart here is plain boxes sized in CSS, so it
 * costs no JavaScript and cannot disagree with the table that backs it.
 */

const toneClass: Record<Delta["tone"], string> = {
  up: "text-blue",
  down: "text-coral-ink",
  flat: "text-charcoal/60",
  none: "text-charcoal/50",
};

/**
 * Drawn, not typed: ▲ ▼ ■ are not in the site's fonts, so as text they would depend on
 * whichever symbol font a visitor's device happens to fall back to.
 */
function DeltaMark({ tone }: { tone: Delta["tone"] }) {
  if (tone === "none") return null;
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className="mr-1 inline-block h-[0.55rem] w-[0.55rem] fill-current align-baseline">
      {tone === "up" ? <path d="M5 1 9.5 9h-9z" /> : null}
      {tone === "down" ? <path d="M5 9 .5 1h9z" /> : null}
      {tone === "flat" ? <rect x="1" y="4" width="8" height="2" /> : null}
    </svg>
  );
}

export function SectionHeading({
  id,
  title,
  note,
  actions,
}: {
  /** Id for the heading, so the section can point at it with aria-labelledby. */
  id: string;
  title: string;
  note?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 id={id} className="font-display text-xl tracking-[-0.01em] text-navy">
          {title}
        </h2>
        {note ? <p className="mt-1 text-[0.78rem] leading-relaxed text-charcoal/65">{note}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  delta,
  accent = false,
  live = false,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: Delta;
  accent?: boolean;
  /** A pulsing dot for numbers that describe right now. */
  live?: boolean;
}) {
  return (
    <div className={`admin-card px-4 py-4 ${accent ? "border-coral/40" : ""}`}>
      <p className="flex items-center gap-1.5 font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">
        {live ? (
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
          </span>
        ) : null}
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl leading-none tabular-nums ${accent ? "text-coral-ink" : "text-navy"}`}>
        {value}
      </p>
      <p className="mt-2 min-h-[1.1rem] text-[0.72rem] leading-snug text-charcoal/60">
        {delta ? (
          <span className={`font-heading font-semibold ${toneClass[delta.tone]}`} title={delta.label}>
            <DeltaMark tone={delta.tone} />
            {delta.text}
            <span className="sr-only">. {delta.label}</span>
          </span>
        ) : null}
        {delta && hint ? <span className="text-charcoal/40"> · </span> : null}
        {hint ? <span>{hint}</span> : null}
      </p>
    </div>
  );
}

export type BarPoint = {
  key: string;
  value: number;
  /** Shown when hovering the column, and read out in the hidden table. */
  tooltip: string;
  /** The column for today, drawn in the accent colour. */
  emphasis?: boolean;
};

/**
 * A column chart. The bars are decoration for the eye; the hidden table beside them
 * carries the same numbers for a screen reader, which cannot read a drawing.
 */
export function BarChart({
  points,
  ariaLabel,
  caption,
  edgeLabels,
}: {
  points: BarPoint[];
  ariaLabel: string;
  caption: string;
  edgeLabels: [string, string, string];
}) {
  const max = Math.max(1, ...points.map((point) => point.value));

  return (
    <figure>
      <div role="img" aria-label={ariaLabel} className="flex h-44 items-end gap-[2px] border-b border-navy/20">
        {points.map((point) => (
          <div key={point.key} title={point.tooltip} className="group flex h-full min-w-0 flex-1 items-end">
            <div
              className={`w-full transition-colors ${
                point.emphasis ? "bg-coral group-hover:bg-coral/80" : "bg-blue/60 group-hover:bg-blue"
              }`}
              style={{ height: point.value > 0 ? `${Math.max(2, (point.value / max) * 100)}%` : "1px" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[0.7rem] tabular-nums text-charcoal/60" aria-hidden="true">
        <span>{edgeLabels[0]}</span>
        <span>{edgeLabels[1]}</span>
        <span>{edgeLabels[2]}</span>
      </div>
      {/* The wrapper does the hiding: a <table> on its own ignores sr-only's 1px clip and widens the page. */}
      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.key}>
                <th scope="row">{point.key}</th>
                <td>{point.tooltip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export type RankedItem = { label: string; value: number; display?: string };

/**
 * A short league table with a bar behind each row. `total` turns a count into a
 * share of everything; leave it out where a share would mean nothing.
 */
export function RankedList({
  title,
  unit,
  items,
  total,
  empty,
}: {
  title: string;
  /** What the numbers count, for the column heading: "views", "visitors". */
  unit: string;
  items: RankedItem[];
  total?: number;
  empty: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <section className="admin-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">{title}</h3>
        <span className="text-[0.68rem] text-charcoal/50">{unit}</span>
      </div>

      {items.length ? (
        <ol className="mt-3 space-y-2.5">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-[0.8rem]">
                <span className="min-w-0 truncate text-charcoal" title={item.label}>
                  {item.label}
                </span>
                <span className="shrink-0 tabular-nums text-navy">
                  {item.display ?? formatCount(item.value)}
                  {total && total > 0 ? (
                    <span className="text-charcoal/55"> · {formatRate(Math.min(1, item.value / total)).replace(/\.0%$/, "%")}</span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-navy/10" aria-hidden="true">
                <div className="h-full bg-blue/65" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-[0.8rem] leading-relaxed text-charcoal/65">{empty}</p>
      )}
    </section>
  );
}

export function SkeletonSection({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-navy/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="admin-card h-[6.2rem]" />
        ))}
      </div>
      <div className="admin-card h-60" />
    </div>
  );
}
