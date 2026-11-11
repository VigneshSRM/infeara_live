import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/site/ServiceDetailPage";
import { getService, listSubservices } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { subservicePath } from "@/lib/content/subservice-model";
import { SubserviceCard } from "@/components/site/SubserviceCard";
import { SectionHeading } from "@/components/site/SectionHeading";

export const revalidate = 300;

const serviceSlug = "cloud-datacenter";

export async function generateMetadata() {
  const service = await getService(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function CloudDatacenterServicePage() {
  const service = await getService(serviceSlug);
  if (!service) notFound();
  const subservices = await listSubservices(serviceSlug);

  return (
    <ServiceDetailPage service={service}>
      {subservices.length > 0 ? (
      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Cloud & Datacenter sub-services"
            title="Focused cloud capabilities, connected to the way you operate."
            intro="Explore specialist services for data and AI, managed operations, cost control, continuity, monitoring, application hosting and DevOps automation. Combine the capabilities that fit your environment and priorities."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {subservices.map((subservice, index) => (
              <SubserviceCard
                key={subservice.slug}
                href={subservicePath(subservice.parentSlug, subservice.slug)}
                title={subservice.name}
                summary={subservice.summary}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
      ) : null}
    </ServiceDetailPage>
  );
}
