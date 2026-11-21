import { isIndexable } from "@/lib/seo/indexing";

export const SITE_URL = process.env.SITE_URL ?? "https://www.infeara.com";

/**
 * Open to search engines unless SITE_INDEXABLE closes it (and closed on Vercel previews). The
 * rule, and why, are in lib/seo/indexing.ts. robots.txt, the sitemap and every page's robots tag
 * all read this one value, so they always agree.
 */
export const SITE_INDEXABLE = isIndexable({
  SITE_INDEXABLE: process.env.SITE_INDEXABLE,
  VERCEL_ENV: process.env.VERCEL_ENV,
});

export const site = {
  name: "Infeara Technologies",
  tagline: "The Way to Lead",
  description:
    "Managed IT, cybersecurity and infrastructure support for organisations across India, from Chennai. Infeara helps teams run critical systems and plan recovery.",
  locale: "en_IN",
  city: "Chennai",
  country: "India",
} as const;
