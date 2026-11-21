import type { Metadata } from "next";
import { SITE_TITLE_SUFFIX } from "@/lib/seo/limits";
import { ogCardPath } from "@/lib/seo/og-paths";
import { indiaDateTime } from "@/lib/seo/schema";
import { SITE_URL, site } from "@/lib/site";

/** Shown for every page that has no card of its own (see lib/seo/og-paths.ts). */
const SHARED_OG_IMAGE = "/brand/og-image.png";

/** What marks a page as an article for Facebook, LinkedIn and anything else that reads Open Graph. */
export type ArticleMeta = {
  /** The day it was published, in India, as YYYY-MM-DD. */
  publishedDay: string;
  /** The category, such as "Cybersecurity". */
  section?: string;
};

export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  ogImage,
  article,
  noIndex = false,
}: {
  /** The page's own title. The root layout adds " — Infeara" after it. */
  title: string;
  /** A full title that gets nothing added: only the home page uses it. */
  absoluteTitle?: string;
  description: string;
  path: string;
  /** Overrides the picture shown for a shared link. Without it: the page's own card, else the shared one. */
  ogImage?: string;
  /** Set for guides and blog posts, so a shared link says "article" with a date and an author. */
  article?: ArticleMeta;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  // One name per page, wherever it is shown: the browser tab and the search result (<title>), a
  // shared link (og:title) and a post on X (twitter:title). They used to end differently.
  const fullTitle = absoluteTitle ?? `${title}${SITE_TITLE_SUFFIX}`;
  const card = ogImage ?? ogCardPath(path);
  const image = card ?? SHARED_OG_IMAGE;
  const imageAlt = card ? `${title} — Infeara Technologies` : "Infeara Technologies";

  // A page's openGraph replaces the root layout's rather than adding to it, so the site name
  // and locale have to be repeated here or every page loses them.
  const openGraphBase = {
    siteName: site.name,
    locale: site.locale,
    url,
    title: fullTitle,
    description,
    images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
  };

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: article
      ? {
          ...openGraphBase,
          type: "article",
          publishedTime: indiaDateTime(article.publishedDay),
          // The profile an article points to: for a company byline, its About page.
          authors: [`${SITE_URL}/about`],
          ...(article.section ? { section: article.section } : {}),
        }
      : { ...openGraphBase, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
