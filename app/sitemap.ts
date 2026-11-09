import type { MetadataRoute } from "next";
import { listIndustries, listInsights, listServices } from "@/lib/content";
import { cybersecuritySubservices } from "@/lib/content/cybersecurity-subservices";
import { cloudSubservices } from "@/lib/content/cloud-subservices";
import { productSubservices } from "@/lib/content/product-subservices";
import { legalDocuments } from "@/lib/content/legal";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/managed-it", priority: 0.9, changeFrequency: "monthly" },
  { path: "/industries", priority: 0.8, changeFrequency: "monthly" },
  { path: "/approach", priority: 0.8, changeFrequency: "monthly" },
  { path: "/why-infeara", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sla", priority: 0.7, changeFrequency: "monthly" },
  { path: "/case-studies", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights", priority: 0.7, changeFrequency: "weekly" },
  { path: "/partners", priority: 0.6, changeFrequency: "yearly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.6, changeFrequency: "weekly" },
  { path: "/careers/opportunities", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Launch gate: nothing is submitted for indexing until the content swap and
  // buy-off are complete.
  if (!SITE_INDEXABLE) return [];

  const [services, industries, insights] = await Promise.all([
    listServices(),
    listIndustries(),
    listInsights(),
  ]);

  const lastModified = new Date();

  const serviceRoutes = services
    .filter((service) => service.slug !== "managed-it")
    .map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const cybersecurityRoutes = cybersecuritySubservices.map((service) => ({
    url: `${SITE_URL}/services/cybersecurity/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const cloudRoutes = cloudSubservices.map((service) => ({
    url: `${SITE_URL}/services/cloud-datacenter/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productSubserviceRoutes = productSubservices.map((service) => ({
    url: `${SITE_URL}${service.parentHref}/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const industryRoutes = industries.map((industry) => ({
    url: `${SITE_URL}/industries/${industry.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const insightRoutes = insights.map((insight) => ({
    url: `${SITE_URL}/insights/${insight.slug}`,
    lastModified: new Date(`${insight.publishedAt}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const legalRoutes = legalDocuments.map((document) => ({
    url: `${SITE_URL}/legal/${document.slug}`,
    lastModified,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...serviceRoutes,
    ...cybersecurityRoutes,
    ...cloudRoutes,
    ...productSubserviceRoutes,
    ...industryRoutes,
    ...insightRoutes,
    ...legalRoutes,
  ];
}
