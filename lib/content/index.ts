import { industries, industryBySlug } from "./industries";
import { insightBySlug, insights } from "./insights";
import { faqGroups } from "./faqs";
import { legalBySlug, legalDocuments } from "./legal";
import { services, serviceBySlug } from "./services";
import {
  dbFaqGroups,
  dbIndustries,
  dbIndustry,
  dbInsight,
  dbInsights,
  dbLegalDocument,
  dbLegalDocuments,
  dbService,
  dbServices,
} from "./queries";
import type { Faq, Industry, Insight, Service } from "./types";

/**
 * Content accessors.
 *
 * The database is authoritative when it answers. The checked-in seed is a
 * fallback for two situations only: Supabase is not configured, or the schema
 * has not been applied yet. Once the tables exist, an empty table really is
 * empty — unpublished content does not come back from the seed.
 */

export async function listServices(): Promise<Service[]> {
  const result = await dbServices();
  if (result.ok) return result.data;
  return [...services].sort((a, b) => a.order - b.order);
}

export async function getService(slug: string): Promise<Service | null> {
  const result = await dbService(slug);
  if (result.ok) return result.data;
  return serviceBySlug(slug) ?? null;
}

export async function listIndustries(): Promise<Industry[]> {
  const result = await dbIndustries();
  if (result.ok) return result.data;
  return industries;
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  const result = await dbIndustry(slug);
  if (result.ok) return result.data;
  return industryBySlug(slug) ?? null;
}

export async function listInsights(): Promise<Insight[]> {
  const result = await dbInsights();
  if (result.ok) return result.data;
  return [...insights].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getInsight(slug: string): Promise<Insight | null> {
  const result = await dbInsight(slug);
  if (result.ok) return result.data;
  return insightBySlug(slug) ?? null;
}

export async function listFaqGroups(): Promise<{ title: string; intro: string; items: Faq[] }[]> {
  const result = await dbFaqGroups();
  if (result.ok) return result.data;
  return faqGroups;
}

export async function listLegalDocuments() {
  const result = await dbLegalDocuments();
  if (result.ok) return result.data;
  return legalDocuments;
}

export async function getLegalDocument(slug: string) {
  const result = await dbLegalDocument(slug);
  if (result.ok) return result.data;
  return legalBySlug(slug) ?? null;
}

export async function servicesForIndustry(industry: Industry): Promise<Service[]> {
  const all = await listServices();
  return industry.services
    .map((slug) => all.find((service) => service.slug === slug))
    .filter((service): service is Service => Boolean(service));
}

export async function relatedServices(service: Service): Promise<Service[]> {
  const all = await listServices();
  return service.related
    .map((slug) => all.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is Service => Boolean(candidate));
}
