import { notFound } from "next/navigation";
import { ProductSubservicePage } from "@/components/site/ProductSubservicePage";
import { aiAutomationSubservices, productSubserviceBySlug } from "@/lib/content/product-subservices";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return aiAutomationSubservices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = productSubserviceBySlug(slug, "ai-automations");
  if (!service) return {};
  return pageMetadata({ title: service.seo.title, description: service.seo.description, path: `${service.parentHref}/${service.slug}` });
}

export default async function AIAutomationSubserviceRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = productSubserviceBySlug(slug, "ai-automations");
  if (!service) notFound();
  return <ProductSubservicePage service={service} />;
}
