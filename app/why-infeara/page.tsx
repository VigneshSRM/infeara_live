import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Why Infeara",
  description:
    "An accountable operating model: named ownership, documented change, tested recovery and reporting written for the business.",
  path: "/why-infeara",
});

const differences = [
  {
    title: "One accountable owner",
    body: "Every engagement has a named owner who knows the estate and the agreement. Escalation is a conversation with someone who has context, not a queue.",
  },
  {
    title: "Documentation is a deliverable",
    body: "As-built records, access registers and operating notes are part of the work, not an afterthought. An environment nobody can describe is an environment nobody can support.",
  },
  {
    title: "Change with a way back",
    body: "Changes carry a window, an approval and a rollback position. The first unexpected failure should not turn a planned change into an incident.",
  },
  {
    title: "Security inside operations",
    body: "Patching, identity hygiene, firewall review and logging are operating tasks, not an annual project. Security that only appears during an audit is not a control.",
  },
  {
    title: "Reporting a business can use",
    body: "Monthly reporting covers availability, incidents, patching, backup state and open risk in language a decision-maker can act on.",
  },
  {
    title: "Scope stated honestly",
    body: "Exclusions, dependencies and limits are written down before work begins. A surprise after the contract costs more than a difficult conversation before it.",
  },
];

export default function WhyInfearaPage() {
  return (
    <PageFrame>
      <PageHero
        eyebrow="Why Infeara"
        title="The difference is what gets recorded."
        intro="Most providers can install, monitor and fix. The distinction is whether the environment remains understandable, recoverable and accountable after the work is done. That is the standard we hold ourselves to."
        crumbs={[{ label: "Why Infeara", href: "/why-infeara" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "Read our approach", href: "/approach" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="The operating model"
            title="Six commitments, stated plainly."
            intro="None of these is unusual in a proposal. The test is whether they survive contact with a live environment, a maintenance window and a month-end report."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {differences.map((item, index) => (
              <div key={item.title} className="flex flex-col rounded-[var(--radius-card)] border border-navy/10 bg-white p-7">
                <span className="font-display text-sm text-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-heading text-[1.02rem] font-semibold leading-snug text-navy">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-charcoal/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={81}
            label="Accountability"
            caption="The difference in practice: monitoring, change records, backup verification and reporting visible as one operating record."
          />
          <div>
            <SectionHeading
              eyebrow="Comparison"
              title="How the model usually differs."
              intro="This is not a claim about any named competitor. It is the pattern we are asked to replace, described from the engagements we are called into."
            />

            <div className="mt-9 divide-y divide-navy/10 border-y border-navy/10">
              {[
                ["Support starts when someone reports a fault", "Monitoring and checks run before a user notices"],
                ["Only the original installer knows the environment", "Documentation is maintained as part of the service"],
                ["A green backup job is treated as protection", "Restores are tested and recovery time is recorded"],
                ["Security is an annual scan", "Hardening, patching and monitoring are continuous"],
                ["The monthly invoice is the only report", "Monthly evidence is issued against the service level"],
              ].map(([before, after]) => (
                <div key={before} className="grid gap-2 py-5 sm:grid-cols-[1fr_1fr] sm:gap-8">
                  <p className="text-[0.88rem] leading-relaxed text-charcoal/75">{before}</p>
                  <p className="text-[0.88rem] leading-relaxed text-charcoal/80">{after}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Fit"
              title="Who we work best with."
              intro="We are not the right provider for every organisation. Being clear about that saves both sides a difficult engagement."
            />

            <div className="mt-8 space-y-3">
              {[
                "You run business-critical systems and need them supportable.",
                "You want a named owner rather than a ticket queue.",
                "You value documentation and evidence over assurances.",
                "You are prepared to make decisions on a recorded risk list.",
              ].map((item) => (
                <p key={item} className="border-l-2 border-blue/40 pl-4 text-[0.92rem] leading-relaxed text-charcoal/75">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Not a fit"
              title="When to look elsewhere."
              intro="We would rather say this now than discover it during delivery."
            />

            <div className="mt-8 space-y-3">
              {[
                "You need the lowest hourly rate, regardless of scope.",
                "You want a purchase order fulfilled without an operating agreement.",
                "You need a certification or audit attestation we do not hold.",
                "You are looking for a vendor to blame rather than a partner to decide with.",
              ].map((item) => (
                <p key={item} className="border-l-2 border-charcoal/15 pl-4 text-[0.92rem] leading-relaxed text-charcoal/75">
                  {item}
                </p>
              ))}
            </div>

            <Link href="/contact" className="link-arrow mt-8">
              Discuss your situation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Evidence"
              title="Claims should be checkable."
              intro="We publish outcomes only when a client has approved them and the evidence exists. Until then, the site describes method, scope and commitments rather than results we cannot substantiate."
            />

            <ul className="mt-8 divide-y divide-navy/10 border-y border-navy/10">
              {[
                "No borrowed client logos",
                "No invented performance figures",
                "No certification claims without a current certificate",
                "No testimonials without written permission",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 py-4 text-[0.9rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/case-studies" className="link-arrow mt-8">
              Read the case study policy <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Schematic
            variant="layers"
            label="Evidence stack"
            caption="Evidence produced by the operating model: monitoring records, change history, backup tests and monthly reporting."
          />
        </div>
      </section>

      <CtaBand
        title="Test the model against your environment."
        body="A short conversation will establish whether the commitments above fit what you operate and how you need it supported."
        primary={{ label: "Request a consultation", href: "/contact" }}
        secondary={{ label: "See our services", href: "/services" }}
      />
    </PageFrame>
  );
}
