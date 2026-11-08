import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, faqSchema } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { IndustryCard } from "@/components/site/IndustryCard";
import { coreServiceImages } from "@/lib/site-images";
import { InsightCard } from "@/components/site/InsightCard";
import { JourneyStory } from "@/components/site/JourneyStory";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { getInsight, listFaqGroups, listIndustries, listInsights, listServices } from "@/lib/content";
import { serviceBySlug as seededServiceBySlug } from "@/lib/content/services";
import { cybersecuritySubservices } from "@/lib/content/cybersecurity-subservices";
import { coreServiceSlugs, infrastructureSubserviceSlugs } from "@/lib/content/service-taxonomy";
import type { Service } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

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
  { label: "Availability", value: "24/7 monitoring options" },
  { label: "Accountability", value: "SLA-based support" },
  { label: "Method", value: "Security-first delivery" },
  { label: "Base", value: "Chennai, India" },
];

const phases = [
  {
    step: "01",
    title: "Assess",
    body: "Record the estate, the dependencies and the exposure. Nothing is changed in this phase.",
    imageSeed: 4,
    imageLabel: "Initial assessment",
  },
  {
    step: "02",
    title: "Stabilise",
    body: "Address the risks that can actually cause an outage, with a rollback position for every change.",
    imageSeed: 3,
    imageLabel: "Stabilisation plan",
  },
  {
    step: "03",
    title: "Operate",
    body: "Run the environment to an agreed service level, with a named owner and monthly evidence.",
    imageSeed: 1,
    imageLabel: "Managed operations",
  },
  {
    step: "04",
    title: "Improve",
    body: "Turn incidents and open risk into a rolling change plan with owners and dates.",
    imageSeed: 7,
    imageLabel: "Improvement review",
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

export default async function HomePage() {
  const [services, industries, insights, managedIt, groups] = await Promise.all([
    listServices(),
    listIndustries(),
    listInsights(),
    getInsight("what-managed-it-actually-covers"),
    listFaqGroups(),
  ]);

  const servicesBySlug = new Map(services.map((service) => [service.slug, service]));
  const selectServices = (slugs: readonly string[]) =>
    slugs
      .map((slug) => servicesBySlug.get(slug))
      .filter((service): service is Service => Boolean(service));
  const coreServices = selectServices(coreServiceSlugs);
  const infrastructureServices = infrastructureSubserviceSlugs
    .map((slug) => servicesBySlug.get(slug) ?? seededServiceBySlug(slug))
    .filter((service): service is Service => Boolean(service));

  const pick = (group: number, item: number) => groups[group]?.items[item];
  const selectedFaqs = [
    pick(0, 0),
    pick(0, 3),
    pick(1, 0),
    pick(1, 1),
    pick(2, 0),
    pick(3, 0),
  ].filter((faq): faq is { question: string; answer: string } => Boolean(faq));

  return (
    <>
      <JsonLd data={faqSchema(selectedFaqs)} />

      <Header />

      <main id="main">
        {/* 1 — Hero */}
        <section className="hero-surface">

          <div className="shell relative z-10 flex min-h-[calc(86svh-4.75rem)] flex-col justify-center py-14 sm:py-18 lg:py-24">
            <div className="grid items-end gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-coral" aria-hidden="true" />
                  <span className="font-heading text-[11px] uppercase tracking-[0.24em] text-ivory/65">
                    The way to lead · Chennai, India
                  </span>
                </div>

                <h1
                  aria-label="Managed IT. Clear accountability."
                  className="mt-6 max-w-[16ch] font-display text-[clamp(2.7rem,5.4vw,4.65rem)] font-bold leading-[0.98] tracking-[-0.04em] text-ivory"
                >
                  Managed IT.<br />
                  <span className="text-coral">Clear accountability.</span>
                </h1>

                <p
                  className="mt-8 max-w-[33rem] text-[1rem] leading-relaxed text-ivory/75 sm:text-[1.0625rem]"
                >
                  Managed IT, cybersecurity and infrastructure support for organisations across India, with clear service scope, named ownership and recovery planning.
                </p>

                <div
                  className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
                >
                  <Link href="/services" className="btn-primary text-sm">
                    Explore our services
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/contact" className="btn-ghost text-sm">
                    Talk to our experts
                  </Link>
                </div>
              </div>

              <div className="lg:pb-1">
                <Figure
                  seed={10}
                  layout="portrait"
                  preload
                  label="IT operations · security · infrastructure"
                  caption="A clear operating standard for the systems your business depends on."
                  className="home-hero-figure"
                />
              </div>
            </div>

            <div
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ivory/20 pt-6 sm:mt-16 sm:gap-x-8 md:grid-cols-4"
            >
              {capabilities.map((item) => (
                <div key={item.label}>
                  <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-ivory/55">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[0.9rem] text-ivory/85">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 — Story-driven operating journey */}
        <section className="border-y border-navy/10 bg-white py-16 md:py-20">
          <JourneyStory steps={phases} />
        </section>


        {/* 3 — Services grid */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Core services"
                title="Managed IT, cybersecurity and infrastructure services."
                intro="Choose managed operations, security assessment, cloud infrastructure, project delivery or automation. Explore focused sub-services for IT operations and cybersecurity."
              />
              <Link href="/services" className="btn-outline text-sm">
                View all services
              </Link>
            </div>

            <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
              {coreServices.map((service, index) => (
                <div
                  key={service.slug}
                  className={
                    index === 3
                      ? "lg:col-start-2 lg:col-span-2"
                      : index === 4
                        ? "lg:col-start-4 lg:col-span-2"
                        : "lg:col-span-2"
                  }
                >
                  <ServiceCard
                    service={service}
                    index={index}
                    image={coreServiceImages[service.slug as keyof typeof coreServiceImages]}
                    imageShape="wide"
                  />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Specialist sub-services — distinct, high-contrast section */}
        <section className="bg-navy py-16 text-ivory md:py-20">
          <div className="shell grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <p className="eyebrow text-coral">Specialist sub-services</p>
              <h2 className="mt-3 max-w-[17ch] font-display text-[clamp(1.65rem,3vw,2.35rem)] font-medium leading-tight tracking-[-0.025em] text-ivory">
                Focused expertise when you need it.
              </h2>
              <p className="mt-4 max-w-[25rem] text-[0.94rem] leading-relaxed text-ivory/70">
                Explore individual capabilities within Infrastructure and Cybersecurity.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
              <div>
                <h3 className="border-b border-ivory/30 pb-3 font-heading text-[0.9rem] font-semibold text-ivory">
                  IT Infrastructure
                </h3>
                <ul className="mt-1">
                  {infrastructureServices.map((service, index) => (
                    <li key={service.slug} className="border-b border-ivory/15">
                      <Link
                        href={`/services/${service.slug}`}
                        className="group flex items-center justify-between gap-4 py-3.5 text-[0.96rem] text-ivory/80 hover:text-ivory"
                      >
                        <span><span className="mr-3 text-[0.68rem] font-semibold text-coral">{String(index + 1).padStart(2, "0")}</span>{service.name}</span>
                        <span aria-hidden="true" className="text-coral">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="border-b border-ivory/30 pb-3 font-heading text-[0.9rem] font-semibold text-ivory">
                  Cybersecurity
                </h3>
                <ul className="mt-1">
                  {cybersecuritySubservices.map((service, index) => (
                    <li key={service.slug} className="border-b border-ivory/15">
                      <Link
                        href={`/services/cybersecurity/${service.slug}`}
                        className="group flex items-center justify-between gap-4 py-3.5 text-[0.96rem] text-ivory/80 hover:text-ivory"
                      >
                        <span><span className="mr-3 text-[0.68rem] font-semibold text-coral">{String(index + 1).padStart(2, "0")}</span>{service.name}</span>
                        <span aria-hidden="true" className="text-coral">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4 — Why Infeara */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell">
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:min-h-[34rem] lg:grid-cols-3 lg:grid-rows-3 lg:gap-y-4">
              <div className="flex flex-col items-center justify-center text-center sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2">
                <p className="eyebrow text-blue">Why Infeara</p>
                <span className="mt-4 h-px w-9 bg-coral" aria-hidden="true" />
                <h2 className="mt-4 max-w-[13ch] font-display text-[clamp(1.9rem,3.3vw,2.8rem)] font-medium leading-[1.03] tracking-[-0.03em] text-navy">
                  Accountable by design.
                </h2>
                <p className="mt-4 max-w-[23rem] text-[0.9rem] leading-relaxed text-charcoal/70">
                  Named ownership, documented changes and tested recovery make service quality visible and verifiable.
                </p>
                <Link href="/why-infeara" className="link-arrow mt-5">
                  What working with us looks like <span aria-hidden="true">→</span>
                </Link>
              </div>

              {commitments.map((item, index) => {
                const positions = [
                  "lg:col-start-1 lg:row-start-1",
                  "lg:col-start-3 lg:row-start-1",
                  "lg:col-start-1 lg:row-start-2",
                  "lg:col-start-3 lg:row-start-2",
                  "lg:col-start-1 lg:row-start-3",
                  "lg:col-start-3 lg:row-start-3",
                ];
                return (
                  <div
                    key={item.title}
                    className={`self-center border-t border-navy/20 pt-4 ${index % 2 === 1 ? "sm:text-right" : ""} ${positions[index]}`}
                  >
                    <div className={`flex items-baseline gap-3 ${index % 2 === 1 ? "sm:justify-end" : ""}`}>
                      <span className="font-display text-[0.72rem] text-blue">{String(index + 1).padStart(2, "0")}</span>
                      <h3 className="font-heading text-[0.98rem] font-semibold text-navy">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-[0.87rem] leading-relaxed text-charcoal/70">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5 — Industries */}
        <section className="border-b border-navy/10 bg-white py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Industries"
                title="Built for critical environments."
                intro="We support organisations where availability, security and recovery matter."
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

        {/* 6 — Representative engagement */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <Figure
              seed={13}
              layout="caption-side"
              label="Segmented plant"
              caption="Documented network segmentation, delivered in controlled phases."
            />
            <div>
              <p className="eyebrow text-blue">Representative engagement</p>
              <h2 className="mt-4 max-w-[22ch] font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-medium leading-[1.06] tracking-[-0.025em] text-navy">
                Separating plant and office networks.
              </h2>
              <p className="mt-5 max-w-[34rem] text-[0.96rem] leading-relaxed text-charcoal/75">
                We mapped traffic, set clear segmentation rules and delivered a phased cutover with rollback at every stage.
              </p>
              <p className="mt-4 max-w-[34rem] text-[0.85rem] leading-relaxed text-charcoal/75">
                Representative delivery pattern; no client or performance claims.
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

        {/* 7 — Technical resources */}
        <section className="border-y border-navy/10 bg-white py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Technical resources"
                title="Practical IT guides."
                intro="Clear guidance for secure, reliable IT."
              />
              <Link href="/insights" className="link-arrow">
                All guides <span aria-hidden="true">→</span>
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
                  Start with this guide: {managedIt.title} <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* 8 — FAQ */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="FAQ"
                title="Questions worth asking."
                intro="Direct answers to common questions."
              />
              <Link href="/faq" className="link-arrow mt-8">
                All questions <span aria-hidden="true">→</span>
              </Link>
            </div>

            <FaqList items={selectedFaqs} idPrefix="home-faq" />
          </div>
        </section>

        {/* 9 — Next step */}
        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
