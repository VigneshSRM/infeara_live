import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SubserviceCard } from "@/components/site/SubserviceCard";
import { getService } from "@/lib/content";
import { cybersecuritySubservices } from "@/lib/content/cybersecurity-subservices";
import { figureImage } from "@/lib/site-images";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const serviceSlug = "cybersecurity";

export async function generateMetadata() {
  const service = await getService(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function CybersecurityCorePage() {
  const service = await getService(serviceSlug);
  if (!service) notFound();

  const crumbs = [
    { label: "Services", href: "/services" },
    { label: "Cybersecurity", href: "/services/cybersecurity" },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { "@type": "Organization", name: "Infeara Technologies", url: SITE_URL },
    areaServed: { "@type": "Country", name: "India" },
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageFrame>
        <PageHero
        image={figureImage(1)}
          eyebrow="Core service"
          title="Cybersecurity"
          intro={service.summary}
          crumbs={crumbs}
          primary={{ label: "Talk to a security expert", href: "/contact" }}
          secondary={{ label: "All core services", href: "/services" }}
        />

        <section className="border-b border-navy/10 bg-ivory py-20 md:py-28">
          <div className="shell">
            <SectionHeading
              eyebrow="Cybersecurity sub-services"
              title="Choose the assessment or analysis your environment needs."
              intro="Each service has a defined scope, authorized methods and practical output. Combine them when you need a wider view of risk and resilience."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cybersecuritySubservices.map((subservice, index) => (
                <SubserviceCard
                  key={subservice.slug}
                  href={`/services/cybersecurity/${subservice.slug}`}
                  title={subservice.name}
                  summary={subservice.summary}
                  index={index}
                  image={figureImage(subservice.figure.seed)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Security operations"
                title="Find what matters, then act on it."
                intro={service.intro}
              />
              <div className="mt-10 border-t border-navy/10">
                {service.deliverables.map((item, index) => (
                  <div key={item.title} className="grid gap-3 border-b border-navy/10 py-5 sm:grid-cols-[2rem_1fr] sm:gap-5">
                    <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-heading text-[1rem] font-semibold text-navy">{item.title}</h3>
                      <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/70">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8 lg:sticky lg:top-28">
              <Figure seed={service.figure.seed} label={service.figure.label} caption={service.figure.caption} />
              <div className="border-t border-navy/15 pt-5">
                <p className="eyebrow text-blue">Security outcomes</p>
                <ul className="mt-4 space-y-3">
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
            <SectionHeading
              eyebrow="Questions"
              title="What clients ask first."
              intro="Scope and authorization are agreed before any security testing begins."
            />
            <FaqList items={service.faqs} idPrefix="cybersecurity-faq" />
          </div>
        </section>

        <CtaBand
          title="Make the next security decision with evidence."
          body="Tell us what you need to assess, test or investigate. We will agree the scope and the right next step before any work begins."
          primary={{ label: "Plan a security review", href: "/contact" }}
          secondary={{ label: "View all services", href: "/services" }}
        />
      </PageFrame>
    </>
  );
}
