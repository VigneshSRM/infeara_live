import { istLabel } from "@/lib/admin/forms";
import { countLeadsSince } from "@/lib/admin/lead-overview";
import { per100 } from "@/lib/admin/lead-stats";
import { loadAnalytics } from "@/lib/analytics/ga4";
import {
  avgEngagementSeconds,
  pctChange,
  type DailyPoint,
  type RangeDays,
} from "@/lib/analytics/ga4-core";
import {
  describeDelta,
  describePointsDelta,
  formatCount,
  formatDuration,
  formatRate,
  shortDate,
  weekdayDate,
} from "@/lib/analytics/format";
import type { createClient } from "@/lib/supabase/server";
import { AnalyticsProblem, AnalyticsSetup } from "./AnalyticsSetup";
import { BarChart, Kpi, RankedList, SectionHeading } from "./blocks";
import { RangeTabs } from "./RangeTabs";

type Client = Awaited<ReturnType<typeof createClient>>;

function dailySummary(daily: DailyPoint[]) {
  if (!daily.length) return null;
  const last = daily[daily.length - 1];
  const before = daily.length > 1 ? daily[daily.length - 2] : null;
  const best = daily.reduce((top, day) => (day.users > top.users ? day : top), daily[0]);
  const average = daily.reduce((sum, day) => sum + day.users, 0) / daily.length;
  return { last, before, best, average };
}

/**
 * "Website visitors": the Google Analytics half of the Overview. It streams in on
 * its own, so a slow reply from Google never holds up the rest of the page, and it
 * always ends in something readable: the numbers, a setup guide, or a plain
 * explanation of what Google refused.
 */
export async function VisitorsSection({ days, supabase }: { days: RangeDays; supabase: Client }) {
  const state = await loadAnalytics(days);

  if (state.status !== "ready") {
    return (
      <section id="visitors" aria-labelledby="visitors-heading" className="scroll-mt-6 space-y-4">
        <SectionHeading
          id="visitors-heading"
          title="Website visitors"
          note="Daily visitors and the key Google Analytics numbers."
          actions={state.status === "error" ? <RangeTabs active={days} /> : undefined}
        />
        {state.status === "not_configured" ? (
          <AnalyticsSetup checklist={state.checklist} />
        ) : (
          <AnalyticsProblem problem={state.problem} checklist={state.checklist} />
        )}
      </section>
    );
  }

  const { report, propertyId } = state;
  const { totals, previous } = report;
  const comparedWith = `the previous ${report.days} days`;
  const hasPrevious = previous.activeUsers > 0 || previous.sessions > 0 || previous.screenPageViews > 0;

  const avgNow = avgEngagementSeconds(totals);
  const avgBefore = avgEngagementSeconds(previous);

  const enquiries = await countLeadsSince(supabase, report.days);
  const ratio = enquiries === null ? null : per100(enquiries, totals.activeUsers);

  const summary = dailySummary(report.daily);
  const edge: [string, string, string] = report.daily.length
    ? [
        shortDate(report.daily[0].date),
        shortDate(report.daily[Math.floor(report.daily.length / 2)].date),
        shortDate(report.daily[report.daily.length - 1].date),
      ]
    : ["", "", ""];

  return (
    <section id="visitors" aria-labelledby="visitors-heading" className="scroll-mt-6 space-y-5">
      <SectionHeading
        id="visitors-heading"
        title="Website visitors"
        note={
          <>
            Google Analytics · property {propertyId} · updated {istLabel(report.fetchedAt)} IST
            {report.timeZone ? ` · days follow ${report.timeZone}` : ""}
          </>
        }
        actions={<RangeTabs active={days} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Active now"
          value={report.activeNow === null ? "—" : formatCount(report.activeNow)}
          hint={report.activeNow === null ? "Live count unavailable" : "on the site in the last 30 min"}
          accent
          live
        />
        <Kpi
          label="Visitors"
          value={formatCount(totals.activeUsers)}
          delta={describeDelta(hasPrevious ? pctChange(totals.activeUsers, previous.activeUsers) : null, comparedWith)}
          hint={`last ${report.days} days`}
        />
        <Kpi
          label="New visitors"
          value={formatCount(totals.newUsers)}
          delta={describeDelta(hasPrevious ? pctChange(totals.newUsers, previous.newUsers) : null, comparedWith)}
          hint="first time on the site"
        />
        <Kpi
          label="Sessions"
          value={formatCount(totals.sessions)}
          delta={describeDelta(hasPrevious ? pctChange(totals.sessions, previous.sessions) : null, comparedWith)}
          hint="visits"
        />
        <Kpi
          label="Page views"
          value={formatCount(totals.screenPageViews)}
          delta={describeDelta(hasPrevious ? pctChange(totals.screenPageViews, previous.screenPageViews) : null, comparedWith)}
          hint={
            totals.activeUsers ? `${(totals.screenPageViews / totals.activeUsers).toFixed(1)} per visitor` : undefined
          }
        />
        <Kpi
          label="Avg. engagement time"
          value={formatDuration(avgNow)}
          delta={describeDelta(hasPrevious ? pctChange(avgNow, avgBefore) : null, comparedWith)}
          hint="per visitor"
        />
        <Kpi
          label="Engagement rate"
          value={formatRate(totals.engagementRate)}
          delta={describePointsDelta(totals.engagementRate, previous.engagementRate, hasPrevious, comparedWith)}
          hint="sessions that stayed or converted"
        />
        <Kpi
          label="Enquiries per 100 visitors"
          value={ratio === null ? "—" : ratio.toFixed(1)}
          hint={
            enquiries === null
              ? "Enquiry count unavailable"
              : `${formatCount(enquiries)} ${enquiries === 1 ? "enquiry" : "enquiries"} · ${formatCount(totals.activeUsers)} visitors`
          }
        />
      </div>

      <section className="admin-card p-4 md:p-5" aria-labelledby="daily-visitors-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 id="daily-visitors-heading" className="font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">
            Visitors per day
          </h3>
          {summary ? (
            <p className="text-[0.78rem] tabular-nums text-charcoal/75">
              <span className="font-heading text-navy">Today</span> {formatCount(summary.last.users)}
              {summary.before ? (
                <>
                  {" · "}
                  <span className="font-heading text-navy">Yesterday</span> {formatCount(summary.before.users)}
                </>
              ) : null}
              {" · "}
              <span className="font-heading text-navy">Average</span> {formatCount(summary.average)}
              {" · "}
              <span className="font-heading text-navy">Best</span> {formatCount(summary.best.users)} on {shortDate(summary.best.date)}
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          {report.daily.length ? (
            <BarChart
              ariaLabel={`Visitors per day over the last ${report.days} days`}
              caption={`Visitors per day, ${shortDate(report.daily[0].date)} to ${shortDate(report.daily[report.daily.length - 1].date)}`}
              edgeLabels={edge}
              points={report.daily.map((day, index) => ({
                key: weekdayDate(day.date),
                value: day.users,
                tooltip: `${weekdayDate(day.date)}: ${formatCount(day.users)} ${day.users === 1 ? "visitor" : "visitors"}, ${formatCount(day.views)} page views`,
                emphasis: index === report.daily.length - 1,
              }))}
            />
          ) : (
            <p className="py-10 text-center text-[0.84rem] leading-relaxed text-charcoal/70">
              Google has not recorded any visits in this period yet. Open the site in a private window, press “Allow
              analytics”, and check back in a minute.
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RankedList
          title="Top pages"
          unit="views"
          items={report.pages.map((row) => ({ label: row.label, value: row.value }))}
          total={totals.screenPageViews}
          empty="No page views recorded in this period."
        />
        <RankedList
          title="Where visitors come from"
          unit="sessions"
          items={report.channels.map((row) => ({ label: row.label, value: row.value }))}
          total={totals.sessions}
          empty="No sessions recorded in this period."
        />
        <RankedList
          title="Sources"
          unit="sessions"
          items={(report.sources ?? []).map((row) => ({ label: row.label, value: row.value }))}
          total={totals.sessions}
          empty={report.sources === null ? "This breakdown could not be loaded. Reload to try again." : "No sources recorded in this period."}
        />
        <RankedList
          title="Countries"
          unit="visitors"
          items={report.countries.map((row) => ({ label: row.label, value: row.value }))}
          total={totals.activeUsers}
          empty="No locations recorded in this period."
        />
        <RankedList
          title="Cities"
          unit="visitors"
          items={(report.cities ?? []).map((row) => ({ label: row.label, value: row.value }))}
          total={totals.activeUsers}
          empty={report.cities === null ? "This breakdown could not be loaded. Reload to try again." : "No cities recorded in this period."}
        />
        <RankedList
          title="Devices"
          unit="visitors"
          items={(report.devices ?? []).map((row) => ({ label: row.label.charAt(0).toUpperCase() + row.label.slice(1), value: row.value }))}
          total={totals.activeUsers}
          empty={report.devices === null ? "This breakdown could not be loaded. Reload to try again." : "No devices recorded in this period."}
        />
      </div>

      <p className="text-[0.74rem] leading-relaxed text-charcoal/60">
        Only visitors who press “Allow analytics” on the cookie banner are counted, so these figures are lower than real
        traffic. Today’s numbers can lag by a few hours. Reports are cached for about ten minutes.
      </p>
    </section>
  );
}
