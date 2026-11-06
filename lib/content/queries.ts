import "server-only";

import { getPublicClient } from "@/lib/supabase/public";
import type { Faq, Industry, Insight, Service } from "./types";

/**
 * Reads published content from Supabase.
 *
 * Every function reports `ok: false` when the database is unreachable or the
 * tables have not been created yet, so the content layer can fall back to the
 * checked-in seed without breaking a build. An empty result is *not* an error:
 * if an editor unpublishes everything, the site should show nothing, not
 * resurrect the seed.
 */
export type DbResult<T> = { ok: true; data: T } | { ok: false };

type ServiceRow = {
  slug: string;
  sort_order: number;
  name: string;
  short_name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  related: string[];
  figure: { seed: number; label: string; caption: string };
  seo_title: string;
  seo_description: string;
};

type IndustryRow = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  challenges: string[];
  capabilities: string[];
  services: string[];
  figure: { seed: number; label: string; caption: string };
  seo_title: string;
  seo_description: string;
  sort_order: number;
};

type InsightRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number;
  published_at: string | null;
  body: { heading: string; paragraphs: string[] }[];
  seo_title: string;
  seo_description: string;
};

type LegalRow = {
  slug: string;
  title: string;
  description: string;
  updated_label: string;
  intro: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  seo_title: string;
  seo_description: string;
};

type FaqGroupRow = {
  title: string;
  intro: string;
  items: Faq[];
  sort_order: number;
};

const dateOnly = (value: string | null) => (value ? value.slice(0, 10) : "2026-01-01");

const figure = (value: ServiceRow["figure"] | null) =>
  value && typeof value.seed === "number"
    ? value
    : { seed: 1, label: "Infrastructure", caption: "" };

function toService(row: ServiceRow): Service {
  return {
    slug: row.slug,
    order: row.sort_order,
    name: row.name,
    shortName: row.short_name,
    tagline: row.tagline,
    summary: row.summary,
    intro: row.intro,
    deliverables: row.deliverables ?? [],
    outcomes: row.outcomes ?? [],
    faqs: row.faqs ?? [],
    related: row.related ?? [],
    seo: { title: row.seo_title, description: row.seo_description },
    figure: figure(row.figure),
  };
}

function toIndustry(row: IndustryRow): Industry {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    summary: row.summary,
    challenges: row.challenges ?? [],
    capabilities: row.capabilities ?? [],
    services: row.services ?? [],
    seo: { title: row.seo_title, description: row.seo_description },
    figure: figure(row.figure),
  };
}

function toInsight(row: InsightRow): Insight {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    readingMinutes: row.reading_minutes,
    publishedAt: dateOnly(row.published_at),
    body: row.body ?? [],
    seo: { title: row.seo_title, description: row.seo_description },
  };
}

function toLegal(row: LegalRow) {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    updated: row.updated_label,
    intro: row.intro,
    sections: row.sections ?? [],
    seo: { title: row.seo_title, description: row.seo_description },
  };
}

async function read<T>(run: (client: NonNullable<ReturnType<typeof getPublicClient>>) => Promise<T>): Promise<DbResult<T>> {
  const client = getPublicClient();
  if (!client) return { ok: false };
  try {
    return { ok: true, data: await run(client) };
  } catch (error) {
    console.error("[content] Supabase read failed, using seed:", (error as Error).message);
    return { ok: false };
  }
}

export async function dbServices(): Promise<DbResult<Service[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("services")
      .select("slug,sort_order,name,short_name,tagline,summary,intro,deliverables,outcomes,faqs,related,figure,seo_title,seo_description")
      .eq("status", "published")
      .order("sort_order");
    if (error) throw error;
    return (data as ServiceRow[]).map(toService);
  });
}

export async function dbService(slug: string): Promise<DbResult<Service | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("services")
      .select("slug,sort_order,name,short_name,tagline,summary,intro,deliverables,outcomes,faqs,related,figure,seo_title,seo_description")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toService(data as ServiceRow) : null;
  });
}

export async function dbIndustries(): Promise<DbResult<Industry[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("industries")
      .select("slug,name,tagline,summary,challenges,capabilities,services,figure,seo_title,seo_description,sort_order")
      .eq("status", "published")
      .order("sort_order");
    if (error) throw error;
    return (data as IndustryRow[]).map(toIndustry);
  });
}

export async function dbIndustry(slug: string): Promise<DbResult<Industry | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("industries")
      .select("slug,name,tagline,summary,challenges,capabilities,services,figure,seo_title,seo_description")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toIndustry(data as IndustryRow) : null;
  });
}

export async function dbInsights(): Promise<DbResult<Insight[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("insights")
      .select("slug,title,excerpt,category,reading_minutes,published_at,body,seo_title,seo_description")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data as InsightRow[]).map(toInsight);
  });
}

export async function dbInsight(slug: string): Promise<DbResult<Insight | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("insights")
      .select("slug,title,excerpt,category,reading_minutes,published_at,body,seo_title,seo_description")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toInsight(data as InsightRow) : null;
  });
}

export async function dbLegalDocuments() {
  return read(async (client) => {
    const { data, error } = await client
      .from("legal_documents")
      .select("slug,title,description,updated_label,intro,sections,seo_title,seo_description")
      .eq("status", "published")
      .order("title");
    if (error) throw error;
    return (data as LegalRow[]).map(toLegal);
  });
}

export async function dbLegalDocument(slug: string) {
  return read(async (client) => {
    const { data, error } = await client
      .from("legal_documents")
      .select("slug,title,description,updated_label,intro,sections,seo_title,seo_description")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toLegal(data as LegalRow) : null;
  });
}

export async function dbFaqGroups() {
  return read(async (client) => {
    const { data, error } = await client
      .from("faq_groups")
      .select("title,intro,items,sort_order")
      .eq("status", "published")
      .order("sort_order");
    if (error) throw error;
    return (data as FaqGroupRow[]).map((row) => ({
      title: row.title,
      intro: row.intro,
      items: row.items ?? [],
    }));
  });
}
