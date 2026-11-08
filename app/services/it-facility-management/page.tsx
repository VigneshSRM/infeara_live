import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/site/ServiceDetailPage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

const serviceSlug = "it-facility-management";

export async function generateMetadata() {
  const service = await getService(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
  });
}

export default async function FacilityManagementServicePage() {
  const service = await getService(serviceSlug);
  if (!service) notFound();

  return <ServiceDetailPage service={service} />;
}
