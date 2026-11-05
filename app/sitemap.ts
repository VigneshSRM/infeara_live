import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

// Populated from the CMS once content is published. Empty while the launch gate is closed.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_INDEXABLE) return [];

  return [{ url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 }];
}
