import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, faqSchema } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { SectionHeading } from "@/components/site/SectionHeading";
import type { CybersecuritySubservice } from "@/lib/content/cybersecurity-subservices";
import { SITE_URL } from "@/lib/site";

export function CybersecuritySubservicePage({ service }: { service: CybersecuritySubservice }) {
  const path = `/services/cybersecurity/${service.slug}`;
  const crumbs = [
    { label: "Services", href: "/services" },
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: service.name, href: path },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${SITE_URL}${path}`,
    provider: { "@type": "Organization", name: "Infeara Technologies", url: SITE_URL },
    areaServed: { "@type": "Country", name: "India" },
    isPartOf: { "@type": "Service", name: "Cybersecurity", url: `${SITE_URL}/services/cybersecurity` },
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={faqSchema(service.faqs)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />
            <div className="mt-8 max-w-[52rem]">
              <p className="eyebrow text-ivory/80">{service.tagline}</p>
              <h1 className="mt-4 max-w-[20ch] font-display text-[clamp(2.1rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ivory">
                {service.name}
              </h1>
              <p className="mt-6 max-w-[42rem] text-[1.02rem] leading-relaxed text-ivory/68">{service.summary}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary text-sm">
                  Discuss this service <span aria-hidden="true">→</span>
                </Link>
                <Link href="/services/cybersecurity" className="btn-ghost text-sm">All cybersecurity services</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-start gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
            <div>
              <SectionHeading eyebrow="Overview" title={`${service.name}, in practice.`} intro={service.intro} />
              <div className="mt-10 border-t border-navy/10">
                {service.deliverables.map((item, index) => (
                  <div key={item.title} className="grid gap-3 border-b border-navy/10 py-6 sm:grid-cols-[2rem_1fr] sm:gap-5">
                    <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h2 className="font-heading text-[1rem] font-semibold text-navy">{item.title}</h2>
                      <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/70">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8 lg:sticky lg:top-28">
              <Figure seed={service.figure.seed} layout="square" label={service.figure.label} caption={service.figure.caption} />
              <div className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
                <p className="eyebrow text-blue">Expected outcomes</p>
                <ul className="mt-5 space-y-3">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                      <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading eyebrow="Questions" title="What teams ask before we start." intro="Scope, access, authorization and expected outputs are agreed before an engagement begins." />
            <FaqList items={service.faqs} idPrefix={`${service.slug}-faq`} />
          </div>
        </section>

        <CtaBand
          title={`Plan your ${service.name.toLowerCase()} engagement.`}
          body="Share the systems, question or concern you want to address. We will confirm an appropriate scope, approach and next step."
          primary={{ label: "Talk to a security expert", href: "/contact" }}
          secondary={{ label: "Back to Cybersecurity", href: "/services/cybersecurity" }}
        />
      </PageFrame>
    </>
  );
}
