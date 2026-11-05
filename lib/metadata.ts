import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export function pageMetadata({
  title,
  description,
  path,
  ogImage = "/brand/og-image.png",
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      title: `${title} — Infeara Technologies`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Infeara Technologies" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Infeara Technologies`,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
