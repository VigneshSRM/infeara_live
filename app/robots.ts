import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  // An open site blocks nothing. The staff area and the API stay out of search results with
  // `noindex` (the robots tag on the pages, and the X-Robots-Tag header set in next.config.ts), and
  // a crawler can only obey `noindex` on a page it is allowed to fetch. A `Disallow` line hides the
  // tag: Google may still list the address, with no description, as "Indexed, though blocked by
  // robots.txt" (Search Console, November 2026). tests/indexing.test.mjs keeps this block empty;
  // notes/seo-audit.md has the history.
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
