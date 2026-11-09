import { notFound } from "next/navigation";
import { CloudSubservicePage } from "@/components/site/CloudSubservicePage";
import { cloudSubservices, cloudSubserviceBySlug } from "@/lib/content/cloud-subservices";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return cloudSubservices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = cloudSubserviceBySlug(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/cloud-datacenter/${service.slug}`,
  });
}

export default async function CloudSubserviceRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = cloudSubserviceBySlug(slug);
  if (!service) notFound();
  return <CloudSubservicePage service={service} />;
}
