import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, faqSchema } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { IndustryCard } from "@/components/site/IndustryCard";
import { InsightCard } from "@/components/site/InsightCard";
import { OperationsDiagram } from "@/components/site/OperationsDiagram";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { faqGroups } from "@/lib/content/faqs";
import { getInsight, listIndustries, listInsights, listServices } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Managed IT, Cybersecurity & Cloud Infrastructure",
    description:
      "Infeara Technologies operates, secures and modernises business-critical IT from Chennai: managed IT, cybersecurity, infrastructure, cloud and network engineering.",
    path: "/",
  }),
  title: {
    absolute: "Infeara Technologies — Managed IT, Cybersecurity and Cloud",
  },
};

const capabilities = [
  { label: "Operations", value: "24/7 monitoring options" },
  { label: "Accountability", value: "SLA-based support" },
  { label: "Method", value: "Security-first delivery" },
  { label: "Base", value: "Chennai, India" },
];

const pillars = [
  {
    title: "Managed IT",
    href: "/services/managed-it",
    body: "Monitoring, patching, backup verification, incident response and reporting under an agreed service level.",
  },
  {
    title: "Cybersecurity",
    href: "/services/cybersecurity",
    body: "Assessment, hardening, vulnerability management and a response path that has been thought through.",
  },
  {
    title: "Infrastructure & cloud",
    href: "/services/it-infrastructure",
    body: "Servers, virtualisation, storage, directory services and migrations planned around a way back.",
  },
  {
    title: "Projects & automation",
    href: "/services/turnkey-projects",
    body: "Site builds, structured cabling, commissioned handovers and the automation that removes repeat work.",
  },
];

const phases = [
  {
    step: "01",
    title: "Assess",
    body: "Record the estate, the dependencies and the exposure. Nothing is changed in this phase.",
  },
  {
    step: "02",
    title: "Stabilise",
    body: "Address the risks that can actually cause an outage, with a rollback position for every change.",
  },
  {
    step: "03",
    title: "Operate",
    body: "Run the environment to an agreed service level, with a named owner and monthly evidence.",
  },
  {
    step: "04",
    title: "Improve",
    body: "Turn incidents and open risk into a rolling change plan with owners and dates.",
  },
];

const commitments = [
  {
    title: "A named owner",
    body: "Someone who knows the estate and the agreement, not a queue with a ticket number.",
  },
  {
    title: "Written scope",
    body: "Systems covered, exclusions and response targets agreed before support begins.",
  },
  {
    title: "Change control",
    body: "Every change has an approval, a window, a rollback position and a record.",
  },
  {
    title: "Tested recovery",
    body: "Backups are verified by restoring them. Recovery time is measured, not assumed.",
  },
  {
    title: "Monthly evidence",
    body: "Availability, incidents, patching, backup state and open risk in one report.",
  },
  {
    title: "Honest limits",
    body: "Where a requirement sits outside our competence, we say so and work with the adviser who owns it.",
  },
];

const severityPreview = [
  {
    level: "Priority 1",
    definition: "Business-critical system unavailable or an active security incident.",
    response: "Immediate triage, all available resource, updates at agreed intervals.",
  },
  {
    level: "Priority 2",
    definition: "Critical system severely degraded or essential work blocked for a group.",
    response: "Triage at notification, workaround first, agreed resolution target.",
  },
  {
    level: "Priority 3",
    definition: "Individual user or non-critical system affected.",
    response: "Handled in severity order during contracted hours.",
  },
  {
    level: "Priority 4",
    definition: "Change, advisory, procurement or scheduled task.",
    response: "Planned and scheduled with an owner and a date.",
  },
];

const ecosystems = [
  "Windows Server",
  "Linux",
  "Active Directory",
  "Microsoft 365",
  "Azure",
  "AWS",
  "VMware",
  "Hyper-V",
  "Fortinet",
  "Cisco",
  "Veeam",
  "Sophos",
];

export default async function HomePage() {
  const [services, industries, insights, managedIt] = await Promise.all([
    listServices(),
    listIndustries(),
    listInsights(),
    getInsight("what-managed-it-actually-covers"),
  ]);

  const selectedFaqs = [
    faqGroups[0].items[0],
    faqGroups[0].items[3],
    faqGroups[1].items[0],
    faqGroups[1].items[1],
    faqGroups[2].items[0],
    faqGroups[3].items[0],
  ];

  return (
    <>
      <JsonLd data={faqSchema(selectedFaqs)} />

      <Header variant="overlay" />

      <main id="main">
        {/* 1 — Hero */}
        <section className="hero-surface min-h-[100svh]">
          <div className="hero-grid" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] items-center opacity-[0.62] lg:flex">
            <OperationsDiagram />
          </div>
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-scan" aria-hidden="true" />

          <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-center pb-16 pt-28 sm:pb-20 sm:pt-36 lg:pt-40">
            <div className="max-w-[54rem]">
              <div className="reveal flex items-center gap-3" style={{ animationDelay: "0.15s" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />
                <span className="font-heading text-[11px] uppercase tracking-[0.24em] text-ivory/70">
                  Managed IT · Cybersecurity · Cloud
                </span>
              </div>

              <h1
                aria-label="Engineering the infrastructure behind business growth."
                className="lift mt-7 font-display text-[clamp(2.35rem,4.6vw,4.15rem)] font-medium leading-[0.99] tracking-[-0.032em] text-ivory"
              >
                Engineering the
                <br />
                infrastructure behind
                <br />
                <span className="relative inline-block">
                  business growth.
                  <span
                    className="grow-x absolute -bottom-2 left-0 h-[3px] w-full bg-coral"
                    style={{ animationDelay: "0.9s" }}
                    aria-hidden="true"
                  />
                </span>
              </h1>

              <p
                className="reveal mt-6 max-w-[36rem] text-[1rem] leading-relaxed text-ivory/70 sm:mt-8 sm:text-[1.0625rem]"
                style={{ animationDelay: "0.55s" }}
              >
                From managed IT operations and cybersecurity to cloud infrastructure and enterprise
                technology, Infeara Technologies helps businesses build, secure and operate technology with
                confidence.
              </p>

              <div
                className="reveal mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4"
                style={{ animationDelay: "0.75s" }}
              >
                <Link href="/services" className="btn-primary">
                  Explore our services
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Talk to our experts
                </Link>
              </div>
            </div>

            <div
              className="reveal mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ivory/10 pt-6 sm:mt-16 sm:gap-x-8 sm:gap-y-6 sm:pt-7 md:grid-cols-4"
              style={{ animationDelay: "0.95s" }}
            >
              {capabilities.map((item) => (
                <div key={item.label}>
                  <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-ivory/65">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[0.9rem] text-ivory/80">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 — Positioning */}
        <section className="bg-ivory py-24 md:py-32">
          <div className="shell grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
            <div>
              <p className="eyebrow text-blue">The way to lead</p>
              <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.06] tracking-[-0.025em] text-navy">
                A technology partner, not a support desk.
              </h2>
            </div>
            <div className="max-w-[38rem]">
              <p className="text-[1.0625rem] leading-relaxed text-charcoal/80">
                Infeara Technologies manages, secures, modernises and operates business-critical IT
                environments. Our work starts with the infrastructure a business already depends on and ends
                with an operation that is documented, monitored and accountable.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                <Link href="/about" className="link-arrow">
                  Read our approach <span aria-hidden="true">→</span>
                </Link>
                <Link href="/why-infeara" className="link-arrow">
                  Why Infeara <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — Capability pillars */}
        <section className="border-y border-navy/10 bg-white py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Capabilities"
                title="The run and the change, under one agreement."
                intro="Most providers are strong in one direction. We keep operations and project delivery together so that what is built is supportable and what is supported can be changed."
              />
              <Link href="/services" className="link-arrow">
                All nine services <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar, index) => (
                <Link
                  key={pillar.href}
                  href={pillar.href}
                  className="group bg-white p-7 transition-colors hover:bg-ivory"
                >
                  <span className="font-display text-sm text-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-heading text-[1.02rem] font-semibold text-navy">{pillar.title}</h3>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-charcoal/70">{pillar.body}</p>
                  <span
                    aria-hidden="true"
                    className="mt-6 inline-block text-blue transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Managed IT spotlight */}
        <section className="relative overflow-hidden bg-navy py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_88%_0%,rgb(34_97_146/0.35)_0%,transparent_60%)]" aria-hidden="true" />
          <div className="shell relative grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <div>
              <p className="eyebrow text-coral/90">Primary practice</p>
              <h2 className="mt-4 max-w-[20ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.025em] text-ivory">
                Managed IT is how most relationships begin.
              </h2>
              <p className="mt-6 max-w-[36rem] text-[1rem] leading-relaxed text-ivory/65">
                We take responsibility for the health of the servers, endpoints, network and backups a
                business already depends on, and report against that responsibility every month. Support is
                a monitored operation with a named owner, not a queue that starts when someone complains.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Named owner for the estate",
                  "Defined response targets",
                  "Patch and backup evidence",
                  "Monthly business reporting",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 border-t border-ivory/10 pt-3 text-[0.88rem] text-ivory/70">
                    <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/services/managed-it" className="btn-primary mt-9 text-sm">
                Explore managed IT
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <Figure
              seed={1}
              label="Managed operations"
              caption="A monitoring loop: signals from servers, endpoints and network devices are triaged, assigned and closed, with each closure recorded against a service level."
            />
          </div>
        </section>

        {/* 5 — Services grid */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Services"
                title="Find the practice that fits the problem."
                intro="Each service page describes the scope, the deliverables and the questions we are asked most often."
              />
              <Link href="/services" className="btn-outline text-sm">
                View all services
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* 6 — Engagement model */}
        <section className="border-y border-navy/10 bg-white py-20 md:py-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="How we work"
                title="Assess. Stabilise. Operate. Improve."
                intro="A method built for environments that already exist. We do not begin with a redesign; we begin with an accurate record of what is running."
              />

              <ol className="mt-10 grid gap-6 sm:grid-cols-2">
                {phases.map((phase) => (
                  <li key={phase.step} className="border-t border-navy/10 pt-4">
                    <span className="font-display text-[0.78rem] tracking-[0.08em] text-coral-ink">{phase.step}</span>
                    <h3 className="mt-2 font-heading text-[0.98rem] font-semibold text-navy">{phase.title}</h3>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-charcoal/70">{phase.body}</p>
                  </li>
                ))}
              </ol>

              <Link href="/approach" className="link-arrow mt-8">
                Read the full method <span aria-hidden="true">→</span>
              </Link>
            </div>

            <Schematic
              variant="timeline"
              label="Engagement sequence"
              caption="The engagement sequence: assessment, stabilisation, operation and improvement, with operating service continuing while improvement work runs."
            />
          </div>
        </section>

        {/* 7 — Why Infeara */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell">
            <SectionHeading
              eyebrow="Why Infeara"
              title="The difference is what gets recorded."
              intro="Most providers can install, monitor and fix. The distinction is whether the environment remains understandable, recoverable and accountable after the work is done."
            />

            <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              {commitments.map((item, index) => (
                <div key={item.title} className="border-t border-navy/15 pt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-[0.75rem] text-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-heading text-[1rem] font-semibold text-navy">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal/70">{item.body}</p>
                </div>
              ))}
            </div>

            <Link href="/why-infeara" className="link-arrow mt-10">
              What working with us looks like <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* 8 — Operating principles */}
        <section className="bg-blue py-16 md:py-20">
          <div className="shell grid gap-10 md:grid-cols-[0.9fr_1.6fr] md:items-center md:gap-16">
            <div>
              <p className="eyebrow text-ivory">Operating principles</p>
              <p className="mt-4 font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-medium leading-[1.15] tracking-[-0.02em] text-ivory">
                The unglamorous things that keep an estate supportable.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-ivory/20 pt-6 sm:grid-cols-4">
              {["Named owner", "Recorded change", "Tested recovery", "Monthly evidence"].map((item) => (
                <div key={item}>
                  <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-coral" />
                  <p className="mt-3 font-heading text-[0.9rem] text-ivory">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9 — Industries */}
        <section className="border-b border-navy/10 bg-white py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Industries"
                title="Sector context changes the answer."
                intro="The same technology decision carries different risk in a hospital, a plant and a trading floor. These are the environments where our operating model is most often applied."
              />
              <Link href="/industries" className="link-arrow">
                All industries <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {industries.map((industry) => (
                <IndustryCard key={industry.slug} industry={industry} />
              ))}
            </div>
          </div>
        </section>

        {/* 10 — Representative engagement */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <Figure
              seed={13}
              label="Segmented plant"
              caption="Plant and office networks separated with documented rules, a phased cutover and a rollback position for each phase."
            />
            <div>
              <p className="eyebrow text-blue">Representative engagement</p>
              <h2 className="mt-4 max-w-[22ch] font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-medium leading-[1.06] tracking-[-0.025em] text-navy">
                Separating plant and office networks.
              </h2>
              <p className="mt-5 max-w-[34rem] text-[0.96rem] leading-relaxed text-charcoal/75">
                Production equipment and corporate systems shared a flat network. We mapped the traffic
                paths, designed segmentation with documented rules, and cut over in phases with a rollback
                position at each stage.
              </p>
              <p className="mt-4 max-w-[34rem] text-[0.85rem] leading-relaxed text-charcoal/75">
                A representative pattern, not an attributed client story. No performance figures are claimed.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/case-studies" className="link-arrow">
                  How we document engagements <span aria-hidden="true">→</span>
                </Link>
                <Link href="/services/network-engineering" className="link-arrow">
                  Network engineering <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 11 — SLA preview */}
        <section className="border-y border-navy/10 bg-white py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Support model"
                title="A service level you can read."
                intro="Response targets are written into the service schedule per client, because the right target depends on the systems and the impact of failure."
              />
              <Link href="/sla" className="btn-outline mt-8 text-sm">
                Read the SLA model
              </Link>
            </div>

            <div className="divide-y divide-navy/10 border-y border-navy/10">
              {severityPreview.map((row) => (
                <div key={row.level} className="grid gap-2 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
                  <p className="font-heading text-[0.85rem] font-semibold text-navy">{row.level}</p>
                  <div>
                    <p className="text-[0.88rem] leading-relaxed text-charcoal/75">{row.definition}</p>
                    <p className="mt-1 text-[0.8rem] leading-relaxed text-charcoal/75">{row.response}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12 — Technology ecosystems */}
        <section className="bg-ivory py-16 md:py-20">
          <div className="shell grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16">
            <div>
              <p className="eyebrow text-blue">Technology</p>
              <p className="mt-4 max-w-[24ch] font-display text-[1.5rem] font-medium leading-[1.15] tracking-[-0.02em] text-navy">
                Platforms chosen for the estate, not the logo.
              </p>
              <Link href="/partners" className="link-arrow mt-4">
                How we select platforms <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                {ecosystems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-navy/15 bg-white px-4 py-2 font-heading text-[0.78rem] text-charcoal/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[0.78rem] leading-relaxed text-charcoal/75">
                A capability list, not a claim of partner status or certification. Vendor names belong to
                their respective owners.
              </p>
            </div>
          </div>
        </section>

        {/* 13 — Insights */}
        <section className="border-y border-navy/10 bg-white py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Insights"
                title="Notes from operating the estate."
                intro="Practical writing about the decisions that keep infrastructure supportable."
              />
              <Link href="/insights" className="link-arrow">
                All insights <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {insights.map((insight) => (
                <InsightCard key={insight.slug} insight={insight} />
              ))}
            </div>

            {managedIt ? (
              <div className="mt-10 border-t border-navy/10 pt-6">
                <Link href={`/insights/${managedIt.slug}`} className="link-arrow">
                  Start with: {managedIt.title} <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* 14 — FAQ */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="FAQ"
                title="Questions worth asking."
                intro="The answers that do not depend on your estate. Where they do, we say so."
              />
              <Link href="/faq" className="link-arrow mt-8">
                All questions <span aria-hidden="true">→</span>
              </Link>
            </div>

            <FaqList items={selectedFaqs} idPrefix="home-faq" />
          </div>
        </section>

        {/* 15 — Careers */}
        <section className="border-t border-navy/10 bg-white py-16 md:py-20">
          <div className="shell grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
            <div>
              <p className="eyebrow text-blue">Careers</p>
              <p className="mt-3 max-w-[36rem] font-display text-[clamp(1.4rem,2.6vw,2rem)] font-medium leading-[1.15] tracking-[-0.02em] text-navy">
                We hire engineers who write things down.
              </p>
              <p className="mt-3 max-w-[38rem] text-[0.92rem] leading-relaxed text-charcoal/70">
                Service operations, infrastructure, network and security engineers. No ticket theatre, no
                pretending to know something you do not.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/careers" className="btn-solid text-sm">
                Careers at Infeara
              </Link>
              <Link href="/about" className="btn-outline text-sm">
                About us
              </Link>
            </div>
          </div>
        </section>

        {/* 16 — Next step */}
        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
