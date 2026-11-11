import { cache } from "react";
import { blogPosts as codeBlogPosts, sortNewestFirst } from "./blogs";
import { caseStudies as codeCaseStudies, type CaseStudy } from "./case-studies";
import { industries, industryBySlug } from "./industries";
import { insightBySlug, insights } from "./insights";
import { faqGroups } from "./faqs";
import { legalBySlug, legalDocuments } from "./legal";
import { services, serviceBySlug } from "./services";
import {
  dbBlogPost,
  dbBlogPosts,
  dbCaseStudies,
  dbCaseStudy,
  dbFaqGroups,
  dbIndustries,
  dbIndustry,
  dbInsight,
  dbInsights,
  dbLegalDocument,
  dbLegalDocuments,
  dbService,
  dbServices,
  dbSubservice,
  dbSubservices,
  dbWhitePaper,
  dbWhitePapers,
} from "./queries";
import { inParent, subserviceParents, type SubService } from "./subservice-model";
import { codeSubservices } from "./subservices";
import type { BlogPost } from "./blogs";
import type { Faq, Industry, Insight, Service } from "./types";
import { whitePapers as codeWhitePapers, type WhitePaper } from "./white-papers";

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

// ── Sub-services, blog posts, case studies and white papers ─────────────────
//
// Managed in the admin since 20261110200000_resource_modules.sql. The database is the single
// source once its tables exist: an unpublished or deleted item is gone from the site and the
// code copy does not bring it back. The code copy (the content that shipped before) is read
// only while the database cannot answer: Supabase not configured, or the tables not created yet.
//
// The `get…` accessors are wrapped in `cache` so a page and its generateMetadata share one read.

// One read per page render. The header menu, the contact form and the page itself all want the
// list, and a failing database would otherwise be asked (and logged) once for each of them.
const allSubservices = cache(async (): Promise<readonly SubService[]> => {
  const result = await dbSubservices();
  return result.ok ? result.data : codeSubservices;
});

/** Every published sub-service, grouped by parent in the order of the hub pages, then by order. */
export async function listSubservices(parentSlug?: string): Promise<SubService[]> {
  const all = await allSubservices();
  if (parentSlug) return inParent(all, parentSlug);
  return subserviceParents.flatMap((parent) => inParent(all, parent.slug));
}

export const getSubservice = cache(async (parentSlug: string, slug: string): Promise<SubService | null> => {
  const result = await dbSubservice(parentSlug, slug);
  if (result.ok) return result.data;
  return codeSubservices.find((item) => item.parentSlug === parentSlug && item.slug === slug) ?? null;
});

/** Newest first. */
export async function listBlogPosts(): Promise<BlogPost[]> {
  const result = await dbBlogPosts();
  if (result.ok) return result.data;
  return sortNewestFirst(codeBlogPosts);
}

export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const result = await dbBlogPost(slug);
  if (result.ok) return result.data;
  return codeBlogPosts.find((post) => post.slug === slug) ?? null;
});

export async function listCaseStudies(): Promise<CaseStudy[]> {
  const result = await dbCaseStudies();
  if (result.ok) return result.data;
  return codeCaseStudies;
}

export const getCaseStudy = cache(async (slug: string): Promise<CaseStudy | null> => {
  const result = await dbCaseStudy(slug);
  if (result.ok) return result.data;
  return codeCaseStudies.find((study) => study.slug === slug) ?? null;
});

export async function listWhitePapers(): Promise<WhitePaper[]> {
  const result = await dbWhitePapers();
  if (result.ok) return result.data;
  return codeWhitePapers;
}

export const getWhitePaper = cache(async (slug: string): Promise<WhitePaper | null> => {
  const result = await dbWhitePaper(slug);
  if (result.ok) return result.data;
  return codeWhitePapers.find((paper) => paper.slug === slug) ?? null;
});
