import { industries, industryBySlug } from "./industries";
import { insightBySlug, insights } from "./insights";
import { services, serviceBySlug } from "./services";
import type { Industry, Insight, Service } from "./types";

// Accessors are async on purpose: the seed data is local today, and the Supabase
// queries replace these bodies later without changing a single template.

export async function listServices(): Promise<Service[]> {
  return [...services].sort((a, b) => a.order - b.order);
}

export async function getService(slug: string): Promise<Service | null> {
  return serviceBySlug(slug) ?? null;
}

export async function listIndustries(): Promise<Industry[]> {
  return industries;
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  return industryBySlug(slug) ?? null;
}

export async function listInsights(): Promise<Insight[]> {
  return [...insights].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getInsight(slug: string): Promise<Insight | null> {
  return insightBySlug(slug) ?? null;
}

export async function servicesForIndustry(industry: Industry): Promise<Service[]> {
  return industry.services
    .map((slug) => serviceBySlug(slug))
    .filter((s): s is Service => Boolean(s));
}

export async function relatedServices(service: Service): Promise<Service[]> {
  return service.related
    .map((slug) => serviceBySlug(slug))
    .filter((s): s is Service => Boolean(s));
}
