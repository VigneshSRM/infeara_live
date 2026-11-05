import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, faqSchema } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getService, listServices, relatedServices } from "@/lib/content";
import type { Service } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

const schematicVariants = ["loop", "mesh", "layers", "grid", "timeline"] as const;

function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: {
      "@type": "Organization",
      name: "Infeara Technologies",
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "India" },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) notFound();

  const related = await relatedServices(service);
  const variant = schematicVariants[(service.order - 1) % schematicVariants.length];
  const crumbs = [
    { label: "Services", href: "/services" },
    { label: service.shortName, href: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={faqSchema(service.faqs)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-vignette" aria-hidden="true" />

          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="eyebrow text-coral/90">{service.tagline}</p>
                <h1 className="lift mt-4 max-w-[20ch] font-display text-[clamp(2.1rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ivory">
                  {service.name}
                </h1>
                <p className="mt-6 max-w-[42rem] text-[1.02rem] leading-relaxed text-ivory/68">
                  {service.summary}
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary text-sm">
                    Discuss this service
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/services" className="btn-ghost text-sm">
                    All services
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {service.outcomes.map((outcome) => (
                  <span
                    key={outcome}
                    className="rounded-full border border-ivory/20 px-4 py-2 text-[0.76rem] text-ivory/70"
                  >
                    {outcome}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-start gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
            <div>
              <SectionHeading eyebrow="Overview" title={`${service.shortName}, in practice.`} intro={service.intro} />

              <div className="mt-10 border-t border-navy/10">
                {service.deliverables.map((item, index) => (
                  <div key={item.title} className="grid gap-3 border-b border-navy/10 py-6 sm:grid-cols-[2rem_1fr] sm:gap-5">
                    <span className="font-display text-sm text-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-heading text-[1rem] font-semibold text-navy">{item.title}</h3>
                      <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/70">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10 lg:sticky lg:top-28">
              <Figure
                seed={service.figure.seed}
                label={service.figure.label}
                caption={service.figure.caption}
              />
              <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-7">
                <p className="eyebrow text-blue">What changes</p>
                <ul className="mt-5 space-y-3">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                      <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-white py-20 md:py-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <Schematic
              variant={variant}
              label={service.figure.label}
              caption={`How ${service.shortName.toLowerCase()} is structured at Infeara: defined stages, recorded decisions and a clear handover between them.`}
            />
            <div>
              <SectionHeading
                eyebrow="Delivery model"
                title="Agreed before it is built."
                intro="Every engagement has a defined scope, a named owner, a change process and a reporting cadence. The purpose is not ceremony; it is that decisions are recorded and the environment can be supported by someone who was not in the room."
              />

              <dl className="mt-9 grid gap-6 sm:grid-cols-2">
                {[
                  { term: "Owner", detail: "A named engineer and an escalation contact." },
                  { term: "Scope", detail: "Systems covered and exclusions, in writing." },
                  { term: "Change", detail: "A recorded request, approval and rollback position." },
                  { term: "Report", detail: "Monthly evidence against the agreement." },
                ].map((item) => (
                  <div key={item.term} className="border-t border-navy/10 pt-4">
                    <dt className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">{item.term}</dt>
                    <dd className="mt-2 text-[0.9rem] leading-relaxed text-charcoal/75">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading
              eyebrow="Questions"
              title="What clients ask first."
              intro="If your question is not here, ask it directly. We would rather answer before an engagement than after one."
            />
            <FaqList items={service.faqs} idPrefix={`${service.slug}-faq`} />
          </div>
        </section>

        {related.length > 0 ? (
          <section className="border-t border-navy/10 bg-white py-20 md:py-24">
            <div className="shell">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading eyebrow="Related" title="Services that usually run alongside this one." />
                <Link href="/services" className="link-arrow">
                  All services <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/services/${item.slug}`}
                    className="group rounded-[var(--radius-card)] border border-navy/10 p-6 transition-colors hover:border-blue/40"
                  >
                    <h3 className="font-heading text-[0.98rem] font-semibold text-navy">{item.name}</h3>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-charcoal/70">{item.tagline}</p>
                    <span
                      aria-hidden="true"
                      className="mt-5 inline-block text-blue transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <CtaBand
          title={`Talk to us about ${service.shortName.toLowerCase()}.`}
          body="We will ask what you operate today, what is failing and what needs to change, then tell you whether we can help."
          primary={{ label: "Request a consultation", href: "/contact" }}
          secondary={{ label: "See the support model", href: "/sla" }}
        />
      </PageFrame>
    </>
  );
}
