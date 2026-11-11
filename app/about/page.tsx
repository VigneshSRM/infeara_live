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
  title: "IT Services Company in Chennai",
  description:
    "Learn about Infeara Technologies, a Chennai-based team providing managed IT, cybersecurity and infrastructure services for organisations across India.",
  path: "/about",
});

const disciplines = [
  {
    title: "Operations",
    body: "Monitoring, patching, backup verification, incident response and reporting for the systems a business already runs.",
  },
  {
    title: "Projects",
    body: "Infrastructure builds, migrations, server rooms, networks and commissioned handovers with acceptance criteria agreed up front.",
  },
  {
    title: "Engineering",
    body: "Security assessment, hardening, automation and the design work that sits between an operational problem and a durable fix.",
  },
];

// The header menu lists the sub-services published in the admin, so refresh it like the other public pages.
export const revalidate = 300;

export default function AboutPage() {
  return (
    <PageFrame>
      <PageHero
        image={figureImage(4)}
        eyebrow="About"
        title="Built in Chennai. Accountable wherever you operate."
        intro="Infeara Technologies is an IT infrastructure, cybersecurity and managed services company. We operate technology for organisations that cannot afford to discover a failure after it has already happened."
        crumbs={[{ label: "About", href: "/about" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "Why Infeara", href: "/why-infeara" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="An operating partner, not a catalogue."
              intro="Our work starts with the infrastructure a business already depends on: the servers, the network, the identities, the backups and the people who use them. We establish what is really there before proposing what should change."
            />
          </div>

          <div className="space-y-5 text-[1rem] leading-relaxed text-charcoal/80 lg:pt-3">
            <p>
              Most of our clients come to us with an estate that has grown over time: systems installed by
              different vendors, documentation that stopped being updated, and a support arrangement that
              responds to problems without owning the environment they occur in.
            </p>
            <p>
              We take operational responsibility for that estate, or deliver the specific project that
              makes it supportable, and we report against the commitment in plain language.
            </p>
            <p>
              The company is based in {company.city}, {company.region}. Delivery is remote by default,
              with onsite attendance where physical work requires it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Three disciplines"
            title="One team across the run and the change."
            intro="Operations, projects and engineering are kept under the same accountability so that a change made in a project does not arrive in production without monitoring, backup and documentation."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {disciplines.map((item, index) => (
              <div key={item.title} className="rounded-[var(--radius-card)] border border-navy/10 p-7">
                <span className="font-display text-sm text-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-heading text-[1.05rem] font-semibold text-navy">{item.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-charcoal/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Figure
            seed={61}
            layout="wide"
            label="Operating discipline"
            caption="The three disciplines connected: project work entering an operating service with monitoring, backup and documentation already in place."
          />
          <div>
            <SectionHeading
              eyebrow="How we work"
              title="Decisions recorded. Work verified."
              intro="Our operating habits are deliberately unglamorous. They are the things that make an environment supportable six months after the person who built it has moved on."
            />

            <ul className="mt-9 divide-y divide-navy/10 border-y border-navy/10">
              {[
                "A named owner for every engagement",
                "Written scope, exclusions and response targets",
                "Change control with a rollback position",
                "Recovery tested, not just scheduled",
                "Monthly reporting against the agreement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 py-4 text-[0.92rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Where we work"
              title="India, delivered from Chennai."
              intro="We serve organisations across India. Remote delivery keeps response fast for most work; onsite attendance is arranged when a task needs physical access."
            />

            <dl className="mt-9 space-y-4">
              {[
                { term: "Base", detail: `${company.city}, ${company.region}, ${company.country}` },
                { term: "Coverage", detail: "Clients across India" },
                { term: "Hours", detail: company.hours },
                { term: "Contact", detail: <Link href="/contact" className="underline decoration-navy/20 underline-offset-4 hover:text-blue">Use our enquiry form</Link> },
              ].map((item) => (
                <div key={item.term} className="grid grid-cols-[7rem_1fr] gap-4 border-t border-navy/10 pt-4">
                  <dt className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">{item.term}</dt>
                  <dd className="text-[0.9rem] leading-relaxed text-charcoal/75">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <SectionHeading
              eyebrow="Credibility"
              title="What we do not claim."
              intro="A website can imply almost anything. These are the limits we hold ourselves to."
            />

            <div className="mt-8 space-y-4">
              {[
                "We do not publish client logos or outcomes without written permission.",
                "We do not quote certifications, partnership tiers or audit attestations we have not been awarded.",
                "We do not present borrowed scale as our own.",
                "We do not claim sector depth we cannot demonstrate in a conversation.",
              ].map((item) => (
                <p key={item} className="border-l-2 border-coral/60 pl-4 text-[0.92rem] leading-relaxed text-charcoal/75">
                  {item}
                </p>
              ))}
            </div>

            <Link href="/case-studies" className="link-arrow mt-8">
              Read our case study policy <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Schematic
            variant="timeline"
            layout="portrait"
            label="Company structure"
            caption="How the company is structured around the client: one accountable owner, with operations, projects and engineering behind them."
          />
          <div>
            <SectionHeading
              eyebrow="Structure"
              title="Small enough to know the estate. Structured enough to support it."
              intro="Each client has an accountable owner who knows the environment and the agreement. Behind that owner sit the engineering disciplines the environment needs, so escalation is a conversation rather than a queue."
            />
            <p className="mt-6 max-w-[34rem] text-[0.95rem] leading-relaxed text-charcoal/70">
              We would rather be explicit about the size and shape of the company than imply a scale we do
              not have. If a requirement is beyond us, we will say so before the contract, not after it.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Start with a conversation about the estate."
        body="Tell us what you run, what is failing and what you need to change. We will tell you honestly whether we are the right fit."
        primary={{ label: "Contact Infeara", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />
    </PageFrame>
  );
}
