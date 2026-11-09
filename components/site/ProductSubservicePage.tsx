import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, faqSchema } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { SectionHeading } from "@/components/site/SectionHeading";
import { productSubservices, type ProductSubservice } from "@/lib/content/product-subservices";
import { SITE_URL } from "@/lib/site";

export function ProductSubservicePage({ service }: { service: ProductSubservice }) {
  const path = `${service.parentHref}/${service.slug}`;
  const related = productSubservices.filter((item) => item.group === service.group && item.slug !== service.slug);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${SITE_URL}${path}`,
    provider: { "@type": "Organization", name: "Infeara Technologies", url: SITE_URL },
    areaServed: { "@type": "Country", name: "India" },
    isPartOf: { "@type": "Service", name: service.parentName, url: `${SITE_URL}${service.parentHref}` },
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={faqSchema(service.faqs)} />
      <JsonLd data={breadcrumbSchema([
        { label: "Services", href: "/services" },
        { label: service.parentName, href: service.parentHref },
        { label: service.name, href: path },
      ])} />
      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="shell relative z-10 py-10 md:py-16">
            <Breadcrumbs items={[
              { label: "Services", href: "/services" },
              { label: service.parentName, href: service.parentHref },
              { label: service.name, href: path },
            ]} />
            <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_0.82fr] lg:gap-14">
              <div className="order-1 lg:order-2">
                <Figure seed={service.figure.seed} layout="wide" label={service.figure.label} caption={service.figure.caption} preload />
              </div>
              <div className="order-2 lg:order-1">
                <p className="eyebrow text-ivory/80">{service.tagline}</p>
                <h1 className="mt-4 max-w-[20ch] font-display text-[clamp(2.1rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ivory">{service.name}</h1>
                <p className="mt-6 max-w-[42rem] text-[1.02rem] leading-relaxed text-ivory/75">{service.summary}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary text-sm">Discuss this service <span aria-hidden="true">→</span></Link>
                  <Link href={service.parentHref} className="btn-ghost text-sm">All {service.parentName}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <SectionHeading eyebrow="Overview" title={`${service.name}, in practice.`} intro={service.intro} />
              <div className="mt-10 border-t border-navy/10">
                {service.deliverables.map((item, index) => (
                  <div key={item.title} className="grid gap-3 border-b border-navy/10 py-6 sm:grid-cols-[2rem_1fr] sm:gap-5">
                    <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                    <div><h2 className="font-heading text-[1rem] font-semibold text-navy">{item.title}</h2><p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/70">{item.body}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-6 md:p-8">
                <p className="eyebrow text-blue">Expected outcomes</p>
                <ul className="mt-5 space-y-3">{service.outcomes.map((outcome) => <li key={outcome} className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-charcoal/75"><span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />{outcome}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-ivory py-16 md:py-24">
          <div className="shell">
            <SectionHeading eyebrow="How it works" title={service.infographic.title} intro="A focused delivery lifecycle with clear checks and ownership at each stage." />
            <figure className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-[#EAE6DE]">
              <img src={`/site/infographics/${service.slug}.svg`} alt={`${service.infographic.title}: ${service.infographic.steps.map((step) => `${step.title}, ${step.description}`).join("; ")}`} width="1400" height="780" loading="lazy" className="h-auto w-full" />
              <figcaption className="border-t border-navy/10 px-5 py-3 text-[0.8rem] leading-relaxed text-charcoal/65 md:px-7">A four-stage delivery infographic for {service.name}, from definition through operation or review.</figcaption>
            </figure>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading eyebrow="Questions" title="What teams ask before we start." intro="Scope, access, responsibilities and expected outputs are agreed before work begins." />
            <FaqList items={service.faqs} idPrefix={`${service.slug}-faq`} />
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-24">
          <div className="shell">
            <SectionHeading eyebrow={`More ${service.parentName}`} title="Explore the related capabilities." intro="Choose a focused service or combine capabilities around your product and operating needs." />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Link key={item.slug} href={`${item.parentHref}/${item.slug}`} className="group flex h-full flex-col border-t border-navy/20 py-5 transition-colors hover:border-blue">
                  <span className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="mt-4 font-heading text-[1rem] font-semibold leading-snug text-navy">{item.name}</h2>
                  <p className="mt-2 flex-1 text-[0.88rem] leading-relaxed text-charcoal/75">{item.summary}</p>
                  <span aria-hidden="true" className="mt-4 text-blue transition-colors group-hover:text-coral">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CtaBand title={`Plan your ${service.name.toLowerCase()} engagement.`} body="Tell us about the users, systems and outcomes you need. We will agree a practical scope and next step." primary={{ label: "Talk to our team", href: "/contact" }} secondary={{ label: `Back to ${service.parentName}`, href: service.parentHref }} />
      </PageFrame>
    </>
  );
}
