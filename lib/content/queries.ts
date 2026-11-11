import "server-only";

import { isMissingSchema } from "@/lib/admin/errors";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { getPublicClient } from "@/lib/supabase/public";
import type { BlogPost } from "./blogs";
import type { CaseStudy, CaseStudyKind } from "./case-studies";
import { isSubserviceParent, type SubService, type SubserviceInfographic } from "./subservice-model";
import type { Faq, Industry, Insight, Service } from "./types";
import { documentUrl, type WhitePaper } from "./white-papers";

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
    // A table that does not exist yet is the normal state of a project that has not run the
    // SQL for a newer module (the admin says so on that module's screen), so it falls back
    // quietly. Anything else is worth a line in the log.
    if (!isMissingSchema(error as { code?: string })) {
      console.error("[content] Supabase read failed, using seed:", (error as Error).message);
    }
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

// ── Sub-services, blog posts, case studies, white papers ─────────────────────
//
// Added with 20261110200000_resource_modules.sql. Same contract as above: `ok: false` means
// "the database could not answer" (not configured, table not created yet, unreachable), and an
// empty list is a real answer.

type SubServiceRow = {
  parent_slug: string;
  slug: string;
  sort_order: number;
  name: string;
  tagline: string | null;
  summary: string;
  intro: string | null;
  deliverables: { title: string; body: string }[] | null;
  outcomes: string[] | null;
  faqs: Faq[] | null;
  infographic: unknown;
  figure: ServiceRow["figure"] | null;
  seo_title: string | null;
  seo_description: string | null;
};

type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number | null;
  body: { heading?: string; paragraphs?: string[] }[] | null;
  figure_seed: number | null;
  related_services: { label?: string; href?: string }[] | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
};

type CaseStudyRow = {
  slug: string;
  title: string;
  sector: string;
  kind: string;
  client_name: string | null;
  situation: string;
  work: string[] | null;
  result: string;
  services: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
};

type WhitePaperRow = {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  file_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  external_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
};

const SUBSERVICE_COLUMNS =
  "parent_slug,slug,sort_order,name,tagline,summary,intro,deliverables,outcomes,faqs,infographic,figure,seo_title,seo_description";
const BLOG_COLUMNS =
  "slug,title,excerpt,category,reading_minutes,body,figure_seed,related_services,seo_title,seo_description,published_at,created_at";
const CASE_STUDY_COLUMNS =
  "slug,title,sector,kind,client_name,situation,work,result,services,seo_title,seo_description";
const WHITE_PAPER_COLUMNS =
  "slug,title,summary,topic,file_path,file_name,file_size_bytes,external_url,seo_title,seo_description,published_at";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The calendar date in India (the operating timezone) of a stored moment, as YYYY-MM-DD. */
export function istDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return null;
  return new Date(at + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function toInfographic(value: unknown): SubserviceInfographic | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as { title?: unknown; steps?: unknown; image?: unknown };
  const steps = Array.isArray(raw.steps)
    ? raw.steps
        .map((step) => step as { title?: unknown; description?: unknown })
        .filter((step) => typeof step.title === "string" && step.title.trim())
        .map((step) => ({ title: String(step.title), description: typeof step.description === "string" ? step.description : "" }))
    : [];
  // Only a site-relative path can be a picture, so nothing typed into the database can point the
  // page's <img> at another site.
  const image = typeof raw.image === "string" && /^\/[A-Za-z0-9/_.-]+$/.test(raw.image) ? raw.image : null;
  const title = typeof raw.title === "string" ? raw.title : "";
  if (!steps.length && !image) return null;
  return { title, steps, image };
}

function toSubService(row: SubServiceRow): SubService | null {
  // A row under a parent the site has no hub page for would have no address. Skip it.
  if (!isSubserviceParent(row.parent_slug)) return null;
  return {
    parentSlug: row.parent_slug,
    slug: row.slug,
    order: row.sort_order,
    name: row.name,
    tagline: row.tagline ?? "",
    summary: row.summary,
    intro: row.intro ?? "",
    deliverables: row.deliverables ?? [],
    outcomes: row.outcomes ?? [],
    faqs: row.faqs ?? [],
    infographic: toInfographic(row.infographic),
    figure: figure(row.figure),
    seo: { title: row.seo_title || row.name, description: row.seo_description || row.summary },
  };
}

/** Only site-relative links, so a typo or a pasted address cannot send a reader off the site. */
const isInternalHref = (href: string) => /^\/(?!\/)/.test(href);

function toBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    publishedAt: istDate(row.published_at ?? row.created_at) ?? "2026-01-01",
    figureSeed: typeof row.figure_seed === "number" ? row.figure_seed : 1,
    body: (row.body ?? [])
      .filter((section) => section.heading)
      .map((section) => ({ heading: String(section.heading), paragraphs: (section.paragraphs ?? []).filter(Boolean) })),
    relatedServices: (row.related_services ?? [])
      .filter((link): link is { label: string; href: string } => Boolean(link.label && link.href && isInternalHref(link.href))),
    seo: { title: row.seo_title || row.title, description: row.seo_description || row.excerpt },
    readingMinutesOverride: row.reading_minutes,
  };
}

function toCaseStudy(row: CaseStudyRow): CaseStudy {
  const kind: CaseStudyKind = row.kind === "client" ? "client" : "representative";
  return {
    slug: row.slug,
    title: row.title,
    sector: row.sector,
    kind,
    clientName: kind === "client" ? row.client_name : null,
    situation: row.situation,
    work: row.work ?? [],
    result: row.result,
    services: row.services ?? [],
    seo: { title: row.seo_title || row.title, description: row.seo_description || row.situation.slice(0, 155) },
  };
}

function toWhitePaper(row: WhitePaperRow): WhitePaper {
  // An uploaded file wins over a link when an editor has set both.
  const fileUrl = row.file_path ? documentUrl(SUPABASE_URL, row.file_path) : row.external_url;
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    topic: row.topic,
    fileUrl,
    fileName: row.file_name,
    fileSizeBytes: row.file_path ? row.file_size_bytes : null,
    publishedAt: istDate(row.published_at),
    seo: { title: row.seo_title || row.title, description: row.seo_description || row.summary },
  };
}

export async function dbSubservices(): Promise<DbResult<SubService[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("sub_services")
      .select(SUBSERVICE_COLUMNS)
      .eq("status", "published")
      .order("sort_order")
      .order("name");
    if (error) throw error;
    return (data as unknown as SubServiceRow[]).map(toSubService).filter((item): item is SubService => Boolean(item));
  });
}

export async function dbSubservice(parentSlug: string, slug: string): Promise<DbResult<SubService | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("sub_services")
      .select(SUBSERVICE_COLUMNS)
      .eq("status", "published")
      .eq("parent_slug", parentSlug)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toSubService(data as unknown as SubServiceRow) : null;
  });
}

export async function dbBlogPosts(): Promise<DbResult<BlogPost[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("blog_posts")
      .select(BLOG_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as BlogPostRow[]).map(toBlogPost);
  });
}

export async function dbBlogPost(slug: string): Promise<DbResult<BlogPost | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("blog_posts")
      .select(BLOG_COLUMNS)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toBlogPost(data as unknown as BlogPostRow) : null;
  });
}

export async function dbCaseStudies(): Promise<DbResult<CaseStudy[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("case_studies")
      .select(CASE_STUDY_COLUMNS)
      .eq("status", "published")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return (data as unknown as CaseStudyRow[]).map(toCaseStudy);
  });
}

export async function dbCaseStudy(slug: string): Promise<DbResult<CaseStudy | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("case_studies")
      .select(CASE_STUDY_COLUMNS)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toCaseStudy(data as unknown as CaseStudyRow) : null;
  });
}

export async function dbWhitePapers(): Promise<DbResult<WhitePaper[]>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("white_papers")
      .select(WHITE_PAPER_COLUMNS)
      .eq("status", "published")
      .order("sort_order")
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data as unknown as WhitePaperRow[]).map(toWhitePaper);
  });
}

export async function dbWhitePaper(slug: string): Promise<DbResult<WhitePaper | null>> {
  return read(async (client) => {
    const { data, error } = await client
      .from("white_papers")
      .select(WHITE_PAPER_COLUMNS)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toWhitePaper(data as unknown as WhitePaperRow) : null;
  });
}
