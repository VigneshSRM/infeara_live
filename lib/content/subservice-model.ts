// The shape of a sub-service page, shared by the code seed, the database reader, the admin and
// the public pages.
//
// Cybersecurity, Cloud & Datacenter, AI Automations and Application Development each have a hub
// page and focused sub-services beneath it: /services/<parent>/<slug>. The sub-services began as
// three differently shaped TypeScript lists (cybersecurity-subservices.ts, cloud-subservices.ts,
// product-subservices.ts). They are database rows now, managed in the admin, and this one shape
// replaces the three. The old lists remain as the seed and as the fallback for a database that
// does not have the sub_services table yet.
//
// No imports besides a type, so tests and scripts/generate-resource-seed.mjs can load this file
// as it is.

import type { Faq } from "./types";

export type SubserviceParentSlug =
  | "cybersecurity"
  | "cloud-datacenter"
  | "ai-automations"
  | "application-development";

/**
 * The page layout each parent uses. Cybersecurity has a text-led page with a square figure beside
 * the outcomes; the others open on a wide figure and carry a "How it works" diagram and related
 * cards. Keeping the three keeps every existing page looking exactly as it did.
 */
export type SubserviceLayout = "security" | "cloud" | "product";

export type SubserviceParent = {
  slug: SubserviceParentSlug;
  name: string;
  href: string;
  layout: SubserviceLayout;
};

export const subserviceParents: readonly SubserviceParent[] = [
  { slug: "cybersecurity", name: "Cybersecurity", href: "/services/cybersecurity", layout: "security" },
  { slug: "cloud-datacenter", name: "Cloud & Datacenter", href: "/services/cloud-datacenter", layout: "cloud" },
  { slug: "ai-automations", name: "AI Automations", href: "/services/ai-automations", layout: "product" },
  {
    slug: "application-development",
    name: "Application Development",
    href: "/services/application-development",
    layout: "product",
  },
];

export type SubserviceInfographic = {
  title: string;
  steps: { title: string; description: string }[];
  /** A picture to show instead of listing the steps, e.g. /site/infographics/<slug>.svg. */
  image: string | null;
};

export type SubService = {
  parentSlug: SubserviceParentSlug;
  slug: string;
  order: number;
  name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  infographic: SubserviceInfographic | null;
  figure: { seed: number; label: string; caption: string };
  seo: { title: string; description: string };
};

export function isSubserviceParent(value: string): value is SubserviceParentSlug {
  return subserviceParents.some((parent) => parent.slug === value);
}

export function parentBySlug(slug: string): SubserviceParent | undefined {
  return subserviceParents.find((parent) => parent.slug === slug);
}

/** The page's address, e.g. /services/cloud-datacenter/cloud-cost-optimization. */
export function subservicePath(parentSlug: string, slug: string): string {
  const parent = parentBySlug(parentSlug);
  return `${parent ? parent.href : `/services/${parentSlug}`}/${slug}`;
}

/** The sub-services of one parent in the order an editor set, then by name for a tie. */
export function inParent(list: readonly SubService[], parentSlug: string): SubService[] {
  return list
    .filter((item) => item.parentSlug === parentSlug)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/**
 * Other sub-services under the same parent, for the "related" cards at the foot of a page.
 * Pass `limit` for a short row (the cloud page shows three).
 */
export function siblingsOf(list: readonly SubService[], service: SubService, limit?: number): SubService[] {
  const others = inParent(list, service.parentSlug).filter((item) => item.slug !== service.slug);
  return typeof limit === "number" ? others.slice(0, limit) : others;
}

// ── From the three code lists to the one shape ──────────────────────────────

type LegacySubservice = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  seo: { title: string; description: string };
  figure: { seed: number; label: string; caption: string };
  infographic?: { title: string; steps: { title: string; description: string }[] };
};

type LegacyProductSubservice = LegacySubservice & { group: string };

/** Where the existing diagrams live. One SVG per cloud, AI and application sub-service. */
export const infographicImagePath = (slug: string) => `/site/infographics/${slug}.svg`;

/**
 * Turns the three code lists into one list of {@link SubService}. The order within a parent is
 * the order in its code list. Used for the database seed and for the fallback, so the two
 * cannot disagree.
 */
export function normalizeSubservices(input: {
  cybersecurity: readonly LegacySubservice[];
  cloud: readonly LegacySubservice[];
  product: readonly LegacyProductSubservice[];
}): SubService[] {
  const result: SubService[] = [];

  const add = (parentSlug: SubserviceParentSlug, list: readonly LegacySubservice[]) => {
    list.forEach((item, index) => {
      result.push({
        parentSlug,
        slug: item.slug,
        order: index + 1,
        name: item.name,
        tagline: item.tagline,
        summary: item.summary,
        intro: item.intro,
        deliverables: item.deliverables,
        outcomes: item.outcomes,
        faqs: item.faqs,
        infographic: item.infographic
          ? { title: item.infographic.title, steps: item.infographic.steps, image: infographicImagePath(item.slug) }
          : null,
        figure: item.figure,
        seo: item.seo,
      });
    });
  };

  add("cybersecurity", input.cybersecurity);
  add("cloud-datacenter", input.cloud);
  add(
    "ai-automations",
    input.product.filter((item) => item.group === "ai-automations"),
  );
  add(
    "application-development",
    input.product.filter((item) => item.group === "application-development"),
  );

  return result;
}
