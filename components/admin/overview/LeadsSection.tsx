import Link from "next/link";
import { loadLeadOverview } from "@/lib/admin/lead-overview";
import { LEAD_STATUSES } from "@/lib/admin/lead-stats";
import { describeDelta, formatAge, formatCount, shortDate, weekdayDate } from "@/lib/analytics/format";
import { pctChange } from "@/lib/analytics/ga4-core";
import type { createClient } from "@/lib/supabase/server";
import { BarChart, Kpi, RankedList, SectionHeading } from "./blocks";

type Client = Awaited<ReturnType<typeof createClient>>;

const STATUS_LABEL: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  spam: "Spam",
};

/**
 * "Leads overview": enquiries from the contact form, counted straight from the
 * database. It does not depend on Google Analytics, so it works the day the CMS
 * goes live. Days roll over at midnight IST.
 */
export async function LeadsSection({ supabase }: { supabase: Client }) {
  const nowMs = Date.now();
  const result = await loadLeadOverview(supabase, nowMs);

  if (!result.ok) {
    return (
      <section id="leads-overview" aria-labelledby="leads-overview-heading" className="scroll-mt-6 space-y-4">
        <SectionHeading id="leads-overview-heading" title="Leads overview" note="Enquiries from the contact form." />
        <div role="alert" className="admin-card border-coral/50 p-5">
          <p className="font-heading text-[0.95rem] text-navy">Enquiry numbers could not be loaded</p>
          <p className="mt-1 text-[0.84rem] leading-relaxed text-charcoal/80">
            {result.reason === "missing_schema"
              ? "The leads table is not in the database yet. Apply the schema migration first."
              : "The database did not answer. Reload in a minute; the Leads page may still work."}
          </p>
        </div>
      </section>
    );
  }

  const lead = result.value;
  const seven = describeDelta(pctChange(lead.last7.current, lead.last7.previous), "the previous 7 days");
  const thirty = describeDelta(pctChange(lead.last30.current, lead.last30.previous), "the previous 30 days");
  const oldest = lead.oldestWaitingAt ? Date.parse(lead.oldestWaitingAt) : null;

  const edge: [string, string, string] = [
    shortDate(lead.daily[0].date),
    shortDate(lead.daily[Math.floor(lead.daily.length / 2)].date),
    shortDate(lead.daily[lead.daily.length - 1].date),
  ];

  return (
    <section id="leads-overview" aria-labelledby="leads-overview-heading" className="scroll-mt-6 space-y-5">
      <SectionHeading
        id="leads-overview-heading"
        title="Leads overview"
        note={`${formatCount(lead.total)} ${lead.total === 1 ? "enquiry" : "enquiries"} on record · days roll over at midnight IST`}
        actions={
          <Link href="/admin/leads" className="text-[0.8rem] text-blue underline underline-offset-4">
            Open all leads
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Today" value={formatCount(lead.today)} hint={`${formatCount(lead.yesterday)} yesterday`} />
        <Kpi label="Last 7 days" value={formatCount(lead.last7.current)} delta={seven} />
        <Kpi label="Last 30 days" value={formatCount(lead.last30.current)} delta={thirty} />
        <Kpi
          label="Awaiting reply"
          value={formatCount(lead.awaiting)}
          accent={lead.awaiting > 0}
          hint={
            lead.awaiting > 0 && oldest !== null
              ? `new for over a day · oldest ${formatAge(oldest, nowMs)}`
              : "nothing has waited over a day"
          }
        />
      </div>

      <section className="admin-card p-4 md:p-5" aria-labelledby="daily-leads-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 id="daily-leads-heading" className="font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">
            Enquiries per day · last 30 days
          </h3>
          <p className="text-[0.78rem] tabular-nums text-charcoal/75">
            <span className="font-heading text-navy">{formatCount(lead.last30.current)}</span> in total
          </p>
        </div>
        <div className="mt-4">
          <BarChart
            ariaLabel="Enquiries received per day over the last 30 days"
            caption={`Enquiries per day, ${shortDate(lead.daily[0].date)} to ${shortDate(lead.daily[lead.daily.length - 1].date)}`}
            edgeLabels={edge}
            points={lead.daily.map((day, index) => ({
              key: weekdayDate(day.date),
              value: day.count,
              tooltip: `${weekdayDate(day.date)}: ${formatCount(day.count)} ${day.count === 1 ? "enquiry" : "enquiries"}`,
              emphasis: index === lead.daily.length - 1,
            }))}
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RankedList
          title="By status"
          unit="all time"
          items={LEAD_STATUSES.map((status) => ({ label: STATUS_LABEL[status], value: lead.byStatus[status] }))}
          total={lead.total}
          empty="No enquiries yet."
        />
        <RankedList
          title="What they ask about"
          unit="last 30 days"
          items={lead.topics.map((row) => ({ label: row.label, value: row.count }))}
          total={lead.last30.current}
          empty="No topics recorded in the last 30 days."
        />
        <RankedList
          title="Page they wrote from"
          unit="last 30 days"
          items={lead.sources.map((row) => ({ label: row.label, value: row.count }))}
          total={lead.last30.current}
          empty="No source pages recorded in the last 30 days."
        />
      </div>

      {lead.truncated ? (
        <p className="text-[0.74rem] leading-relaxed text-charcoal/60">
          The charts use the most recent 5,000 enquiries; the totals above are exact.
        </p>
      ) : null}
    </section>
  );
}
