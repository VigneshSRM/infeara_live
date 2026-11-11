// Structured data (JSON-LD) built as plain objects, so tests can read exactly what a search
// engine will read. Nothing here imports anything: tests/blog-directory.test.mjs loads this
// file as it is.
//
// Two rules the pages rely on:
//
//   * Every address is absolute. A relative `item` in a BreadcrumbList, or a relative `image`,
//     is rejected by strict validators (and is ambiguous to anything reading the JSON on its own).
//   * A calendar date goes out as midnight India time, with the offset written down. A bare date
//     leaves the time zone to the reader, and the site's days are India days.

export type Crumb = { label: string; href: string };

/** `siteUrl` plus a path on this site. An address that is already absolute is returned as it is. */
export function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Home first, then each crumb in order, numbered from 1. */
export function breadcrumbListSchema(siteUrl: string, items: readonly Crumb[]) {
  const list: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(siteUrl, item.href),
    })),
  };
}

/** "2026-11-11" becomes "2026-11-11T00:00:00+05:30": the start of that day in India. */
export function indiaDateTime(isoDate: string): string {
  return `${isoDate}T00:00:00+05:30`;
}

export type BlogPostingInput = {
  siteUrl: string;
  slug: string;
  headline: string;
  description: string;
  category: string;
  /** Calendar date in India, YYYY-MM-DD. */
  publishedAt: string;
  /** A path on this site, such as /site/noc-monitoring.jpg. */
  imagePath: string;
};

/**
 * schema.org BlogPosting, which is an Article (Article > SocialMediaPosting > BlogPosting), so
 * anything that understands Article understands it. Written by Infeara, which is also the
 * publisher.
 */
export function blogPostingSchema(input: BlogPostingInput) {
  const url = absoluteUrl(input.siteUrl, `/blogs/${input.slug}`);
  const organization = { "@type": "Organization", name: "Infeara Technologies", url: absoluteUrl(input.siteUrl, "/") };

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    image: [absoluteUrl(input.siteUrl, input.imagePath)],
    articleSection: input.category,
    datePublished: indiaDateTime(input.publishedAt),
    dateModified: indiaDateTime(input.publishedAt),
    author: organization,
    publisher: {
      ...organization,
      logo: { "@type": "ImageObject", url: absoluteUrl(input.siteUrl, "/brand/infeara-logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en-IN",
  };
}

/**
 * JSON for a <script type="application/ld+json"> tag. A "<" is written as \u003c, which any JSON
 * reader turns straight back into "<", so a title that contains "</script>" cannot end the tag
 * early and let the rest of the text through as HTML.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
