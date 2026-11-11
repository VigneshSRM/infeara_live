import { notFound } from "next/navigation";
import { CybersecuritySubservicePage } from "@/components/site/CybersecuritySubservicePage";
import { getSubservice, listSubservices } from "@/lib/content";
import { subservicePath } from "@/lib/content/subservice-model";
import { pageMetadata } from "@/lib/metadata";

// The four pages that used to be one file each are rows in the database now, so a new
// cybersecurity sub-service added in the admin gets its page here without a deploy. The pages
// that exist at build time are built ahead; any other published slug is rendered on first visit.
// A slug that is not published (or never existed) is a 404.
export const revalidate = 300;

const PARENT = "cybersecurity";

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

export default async function CybersecuritySubserviceRoute({ params }: Props) {
  const { slug } = await params;
  const service = await getSubservice(PARENT, slug);
  if (!service) notFound();

  return <CybersecuritySubservicePage service={service} />;
}
