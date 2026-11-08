import { notFound } from "next/navigation";
import { CybersecuritySubservicePage } from "@/components/site/CybersecuritySubservicePage";
import { cybersecuritySubserviceBySlug } from "@/lib/content/cybersecurity-subservices";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

const serviceSlug = "threat-modeling";

export async function generateMetadata() {
  const service = cybersecuritySubserviceBySlug(serviceSlug);
  if (!service) return {};

  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/cybersecurity/${service.slug}`,
  });
}

export default function ThreatModelingPage() {
  const service = cybersecuritySubserviceBySlug(serviceSlug);
  if (!service) notFound();

  return <CybersecuritySubservicePage service={service} />;
}
