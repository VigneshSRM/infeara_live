import { notFound } from "next/navigation";
import { ProductSubservicePage } from "@/components/site/ProductSubservicePage";
import { getSubservice, listSubservices } from "@/lib/content";
import { siblingsOf, subservicePath } from "@/lib/content/subservice-model";
import { pageMetadata } from "@/lib/metadata";

// Rows in the database (Admin → Services → Sub-services). Pages that exist at build time are built
// ahead; a sub-service published later is rendered on first visit. Anything else is a 404.
export const revalidate = 300;

const PARENT = "application-development";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await listSubservices(PARENT);
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getSubservice(PARENT, slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: subservicePath(PARENT, service.slug),
  });
}

export default async function ApplicationDevelopmentSubserviceRoute({ params }: Props) {
  const { slug } = await params;
  const service = await getSubservice(PARENT, slug);
  if (!service) notFound();

  const related = siblingsOf(await listSubservices(PARENT), service);
  return <ProductSubservicePage service={service} related={related} />;
}
