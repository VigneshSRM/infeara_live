import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { figureImage } from "@/lib/site-images";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { getService, listServices } from "@/lib/content";
import { infrastructureSubserviceSlugs } from "@/lib/content/service-taxonomy";
import type { Service } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const serviceSlug = "it-infrastructure";

export async function generateMetadata() {
  const service = await getService(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ItInfrastructureCorePage() {
  const [service, allServices] = await Promise.all([getService(serviceSlug), listServices()]);
  if (!service) notFound();

  const servicesBySlug = new Map(allServices.map((item) => [item.slug, item]));
  const subservices = infrastructureSubserviceSlugs
    .map((slug) => servicesBySlug.get(slug))
    .filter((item): item is Service => Boolean(item));
  const crumbs = [
    { label: "Services", href: "/services" },
    { label: "IT Infrastructure", href: "/services/it-infrastructure" },
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
        image={figureImage(6)}
          eyebrow="Core service"
          title="IT Infrastructure"
          intro={service.summary}
          crumbs={crumbs}
          primary={{ label: "Talk to an infrastructure expert", href: "/contact" }}
          secondary={{ label: "All core services", href: "/services" }}
        />

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="The core practice"
                title="A stable operating foundation, ready to change."
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
                <p className="eyebrow text-blue">The operating standard</p>
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
          <div className="shell">
            <SectionHeading
              eyebrow="Sub-services"
              title="Choose the service that fits the operational need."
              intro="These services sit within the IT Infrastructure practice and can be taken individually or combined under one operating plan. Remote IT also includes dedicated engineer capacity when required."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {subservices.map((subservice, index) => (
                <ServiceCard key={subservice.slug} service={subservice} index={index} />
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Bring your infrastructure under one plan."
          body="We will map the systems, support model and next changes, then recommend the right combination of services."
          primary={{ label: "Plan an infrastructure review", href: "/contact" }}
          secondary={{ label: "View service levels", href: "/sla" }}
        />
      </PageFrame>
    </>
  );
}
