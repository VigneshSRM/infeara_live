import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Our Approach",
  description:
    "How Infeara assesses, stabilises, operates and improves IT environments: written scope, change control, tested recovery and monthly reporting.",
  path: "/approach",
});

const phases = [
  {
    step: "01",
    title: "Assess",
    body: "We record what exists: servers, endpoints, network, identities, storage, backups and the dependencies between them. Monitoring gaps, undocumented changes and unverified backups are noted before anything is touched.",
    output: "An estate record and a prioritised risk list.",
  },
  {
    step: "02",
    title: "Stabilise",
    body: "The immediate risks are addressed first: exposed services, failing hardware, broken backups, unsupported systems. Each change has a rollback position and a maintenance window agreed with the business.",
    output: "A stable base with evidence of what changed.",
  },
  {
    step: "03",
    title: "Operate",
    body: "The environment moves into a defined service: monitoring, patching, backup checks, incident response and administration, against agreed response targets and a named owner.",
    output: "An operating service with a service level.",
  },
  {
    step: "04",
    title: "Improve",
    body: "Monthly review turns incidents, patching state and open risks into a change plan. Recurring problems become engineering work rather than permanent workarounds.",
    output: "A rolling improvement plan with owners and dates.",
  },
];

export default function ApproachPage() {
  return (
    <PageFrame>
      <PageHero
        eyebrow="Our approach"
        title="Assess. Stabilise. Operate. Improve."
        intro="A method built for environments that already exist. We do not begin with a redesign; we begin with an accurate record of what is running, then make changes that can be reversed."
        crumbs={[{ label: "Our approach", href: "/approach" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "Why Infeara", href: "/why-infeara" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="The method"
              title="No redesign before an assessment."
              intro="A proposal written before the estate has been examined is a guess with a price attached. The assessment is the first deliverable, and it is useful even if the engagement goes no further."
            />
          </div>

          <div className="space-y-5 text-[1rem] leading-relaxed text-charcoal/80 lg:pt-3">
            <p>
              The sequence exists because infrastructure work fails in predictable ways: changes made
              without a rollback, backups assumed to work, documentation written after the fact, and
              support contracts that begin before anyone knows what is covered.
            </p>
            <p>
              Each phase produces something the client keeps. If we stop after the assessment, you still
              have the estate record, the risk list and a clear view of what needs to happen next.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Phases"
            title="Four phases, each with an output."
            intro="The phases are sequential in principle, but the operating service continues while improvement work runs alongside it."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {phases.map((phase) => (
              <div key={phase.step} className="flex flex-col rounded-[var(--radius-card)] border border-navy/10 p-8">
                <span className="font-display text-[0.9rem] tracking-[0.08em] text-coral-ink">{phase.step}</span>
                <h3 className="mt-5 font-display text-[1.5rem] font-medium tracking-[-0.02em] text-navy">
                  {phase.title}
                </h3>
                <p className="mt-4 flex-1 text-[0.94rem] leading-relaxed text-charcoal/75">{phase.body}</p>
                <p className="mt-6 border-t border-navy/10 pt-4 text-[0.82rem] leading-relaxed text-charcoal/75">
                  <span className="font-heading text-[10px] uppercase tracking-[0.18em] text-blue">Output — </span>
                  {phase.output}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Schematic
            variant="timeline"
            label="Delivery sequence"
            caption="Assessment, stabilisation, operation and improvement shown as a sequence, with operating service continuing during improvement work."
          />
          <div>
            <SectionHeading
              eyebrow="Controls"
              title="The rules that do not change."
              intro="Whatever the engagement, these controls apply. They are the difference between managed infrastructure and a series of repairs."
            />

            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              {[
                { term: "Change control", detail: "Request, approval, window, rollback, record." },
                { term: "Recovery testing", detail: "Restores scheduled and measured, not assumed." },
                { term: "Documentation", detail: "As-built records kept current after changes." },
                { term: "Reporting", detail: "Monthly evidence against the service level." },
              ].map((item) => (
                <div key={item.term} className="border-t border-navy/10 pt-4">
                  <h3 className="font-heading text-[0.95rem] font-semibold text-navy">{item.term}</h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-charcoal/70">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={71}
            label="Improvement loop"
            caption="A monthly improvement loop: incidents and risk feed a change plan, which is delivered, verified and reported."
          />
          <div>
            <SectionHeading
              eyebrow="Review"
              title="The report is part of the service."
              intro="Monthly reporting is not an administrative extra. It is how the client judges whether the agreement is being met, and how we decide what to fix next."
            />

            <ul className="mt-8 space-y-3">
              {[
                "Availability and incident volume, by severity",
                "Response and resolution against target",
                "Patch compliance and outstanding exceptions",
                "Backup completion and restore test results",
                "Open risks and the proposed sequence",
                "Changes completed and changes planned",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        title="See the method against your estate."
        body="The assessment is where every engagement starts. We will scope it around what you operate, not a fixed package."
        primary={{ label: "Request an assessment", href: "/contact" }}
        secondary={{ label: "Read the SLA model", href: "/sla" }}
      />
    </PageFrame>
  );
}
