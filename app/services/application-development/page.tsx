import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/site/ServiceDetailPage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SubserviceCard } from "@/components/site/SubserviceCard";
import { applicationDevelopmentSubservices } from "@/lib/content/product-subservices";

export const revalidate = 300;

const serviceSlug = "application-development";

export async function generateMetadata() {
  const service = await getService(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ApplicationDevelopmentServicePage() {
  const service = await getService(serviceSlug);
  if (!service) notFound();

  return (
    <ServiceDetailPage service={service}>
      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell">
          <SectionHeading eyebrow="Application Development sub-services" title="Choose the right product surface for your users." intro="Explore web applications, content websites and mobile apps, each scoped to its users, workflows and delivery needs." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {applicationDevelopmentSubservices.map((item, index) => (
              <SubserviceCard
                key={item.slug}
                href={`${item.parentHref}/${item.slug}`}
                title={item.name}
                summary={item.summary}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </ServiceDetailPage>
  );
}
