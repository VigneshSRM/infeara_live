import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { figureImage } from "@/lib/site-images";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { pageMetadata } from "@/lib/metadata";
import { company } from "@/lib/content/site";

export const metadata = pageMetadata({
  title: "IT Support Model & Service Levels",
  description:
    "Learn how Infeara defines support hours, incident severity, escalation, reporting and client responsibilities. Specific response targets are agreed in each service schedule.",
  path: "/sla",
});

const severities = [
  {
    level: "Priority 1",
    label: "Critical",
    definition: "A business-critical system is unavailable, or an active security incident is affecting operations.",
    response: "Immediate triage during contracted hours, with all available resource assigned and updates at agreed intervals until service is restored.",
  },
  {
    level: "Priority 2",
    label: "Major",
    definition: "A critical system is severely degraded, or a group of users cannot perform essential work.",
    response: "Triage at notification, workaround pursued first, resolution target agreed and recorded in the ticket.",
  },
  {
    level: "Priority 3",
    label: "Standard",
    definition: "An individual user or non-critical system is affected, with a reasonable workaround available.",
    response: "Handled in severity order during contracted hours, with the target stated in the service schedule.",
  },
  {
    level: "Priority 4",
    label: "Request",
    definition: "A change, advisory question, procurement request or scheduled task.",
    response: "Planned and scheduled, with an owner and a date agreed before work starts.",
  },
];

// The header menu lists the sub-services published in the admin, so refresh it like the other public pages.
export const revalidate = 300;

export default function SlaPage() {
  return (
    <PageFrame>
      <PageHero
        image={figureImage(5)}
        eyebrow="SLA & support model"
        title="A service level you can read."
        intro="Response targets, escalation, reporting and responsibilities are written into the service schedule for each client. This page explains the model; the signed schedule contains the specific commitments."
        crumbs={[{ label: "SLA & support model", href: "/sla" }]}
        primary={{ label: "Discuss support cover", href: "/contact" }}
        secondary={{ label: "See managed IT", href: "/services/managed-it" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="The principle"
              title="Targets are agreed, not implied."
              intro="A support contract without stated response and resolution targets is an arrangement, not a service level. We set them per client because the right target depends on the systems, the hours and the impact of failure."
            />
          </div>

          <div className="space-y-5 text-[1rem] leading-relaxed text-charcoal/80 lg:pt-3">
            <p>
              The schedule names the systems covered, the supported hours, the severity definitions, the
              response target per severity, the escalation contacts and the reporting cadence. It also names
              what is excluded, so that neither side is guessing at the boundary.
            </p>
            <p>
              Where a client needs cover outside standard hours, that is stated explicitly rather than
              assumed. Where a system cannot be supported to the standard — because it is out of vendor
              support, for example — that is recorded as a risk with a remediation plan.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Severity"
            title="How an incident is classified."
            intro="Severity is set at triage against impact and urgency, not against how the request was phrased. The client can escalate a classification, and the reason is recorded."
          />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <thead>
                <tr className="border-y border-navy/15">
                  {["Level", "Definition", "Response"].map((heading) => (
                    <th
                      key={heading}
                      className="py-4 pr-6 font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {severities.map((row) => (
                  <tr key={row.level} className="border-b border-navy/10 align-top">
                    <td className="py-6 pr-6">
                      <p className="font-heading text-[0.92rem] font-semibold text-navy">{row.level}</p>
                      <p className="mt-1 text-[0.8rem] text-blue">{row.label}</p>
                    </td>
                    <td className="py-6 pr-6 text-[0.88rem] leading-relaxed text-charcoal/75">{row.definition}</td>
                    <td className="py-6 text-[0.88rem] leading-relaxed text-charcoal/75">{row.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-[52rem] text-[0.82rem] leading-relaxed text-charcoal/75">
            The numbers behind each response — minutes to acknowledge, hours to resolve, update frequency —
            are set in the signed service schedule. They are not published here because they differ by
            contract and would be misleading out of context.
          </p>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Schematic
            variant="loop"
            label="Incident flow"
            caption="Incident flow: detection or report, triage, assignment, resolution, verification, closure note and recurring-cause review."
          />
          <div>
            <SectionHeading
              eyebrow="Escalation"
              title="A path with names on it."
              intro="Escalation is not a complaint process. It is how an incident gets more attention when the current path is not resolving it."
            />

            <ol className="mt-9 space-y-5">
              {[
                { title: "First-line engineer", detail: "Acknowledges, classifies and starts diagnosis." },
                { title: "Service owner", detail: "Informed on Priority 1 and on any incident breaching its target." },
                { title: "Engineering lead", detail: "Engaged when the fix needs design or cross-discipline work." },
                { title: "Management review", detail: "A joint review with the client when a target is missed or a risk changes." },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-4 border-t border-navy/10 pt-5">
                  <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-heading text-[0.96rem] font-semibold text-navy">{item.title}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-charcoal/70">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={111}
            label="Service evidence"
            caption="Service evidence produced each month: incidents by severity, response against target, patch state, backup tests and open risk."
          />
          <div>
            <SectionHeading
              eyebrow="Reporting"
              title="What the monthly report contains."
              intro="The report is written for the person who signs the contract, not only for the engineer who reads the ticket queue."
            />

            <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                "Incidents by severity and status",
                "Response and resolution against target",
                "Patch compliance and exceptions",
                "Backup completion and restore tests",
                "Changes completed and planned",
                "Open risks and recommended sequence",
              ].map((item) => (
                <p key={item} className="border-t border-navy/10 pt-3 text-[0.88rem] leading-relaxed text-charcoal/75">
                  {item}
                </p>
              ))}
            </div>

            <p className="mt-7 text-[0.88rem] leading-relaxed text-charcoal/75">
              Reporting cadence is monthly by default. A quarterly service review covers trends, risks and
              the improvement plan.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Responsibilities" title="What we need from the client." />
            <ul className="mt-8 space-y-3">
              {[
                "A named contact who can approve changes.",
                "Accurate information about systems, users and dependencies.",
                "Access required to administer the covered estate.",
                "Timely approval of changes and maintenance windows.",
                "A decision-maker available for risk acceptance.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading eyebrow="Exclusions" title="What sits outside the standard scope." />
            <ul className="mt-8 space-y-3">
              {[
                "New project work, which is scoped and approved separately.",
                "Hardware and licence procurement, unless included in the schedule.",
                "Work on systems the client has designated unsupported.",
                "Third-party application support owned by another vendor.",
                "Statutory audit, legal or regulatory advice.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal/25" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-navy/10 bg-ivory py-16 md:py-20">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-blue">Raise an issue</p>
            <p className="mt-3 max-w-[38rem] text-[0.95rem] leading-relaxed text-charcoal/75">
              Existing clients should use the agreed support channel. For a new enquiry, use the contact form.
            </p>
          </div>
          <Link href="/contact" className="btn-solid shrink-0 text-sm">
            Contact Infeara
          </Link>
        </div>
      </section>

      <CtaBand
        title="Need support cover defined?"
        body="We will map the estate, agree severity and response targets, and put the schedule in writing before support begins."
        primary={{ label: "Discuss support cover", href: "/contact" }}
        secondary={{ label: "Explore managed IT", href: "/services/managed-it" }}
      />
    </PageFrame>
  );
}
