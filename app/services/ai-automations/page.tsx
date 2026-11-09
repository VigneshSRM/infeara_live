import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/site/ServiceDetailPage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SubserviceCard } from "@/components/site/SubserviceCard";
import { aiAutomationSubservices } from "@/lib/content/product-subservices";

export const revalidate = 300;

const serviceSlug = "ai-automations";

export async function generateMetadata() {
  const service = await getService(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function AIAutomationsServicePage() {
  const service = await getService(serviceSlug);
  if (!service) notFound();

  return (
    <ServiceDetailPage service={service}>
      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading eyebrow="AI Automation sub-services" title="Focused AI services for conversational and operational workflows." intro="Choose chatbot, voice, language-model or infrastructure automation capabilities with the right controls and human review." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aiAutomationSubservices.map((item, index) => (
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
