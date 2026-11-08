import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/analytics/Analytics";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/seo/JsonLd";
import { ConsentBanner } from "@/components/site/ConsentBanner";
import { SITE_INDEXABLE, SITE_URL, site } from "@/lib/site";
import "./globals.css";

// Self-hosted from app/fonts (see scripts/sync-fonts.mjs). Same latin variable
// faces and ranges that next/font/google used to fetch, without a build-time
// request to fonts.googleapis.com.

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const manrope = localFont({
  src: "./fonts/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  style: "normal",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infeara Technologies — Managed IT, Cybersecurity and Cloud",
    template: "%s — Infeara Technologies",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: SITE_URL,
    title: "Infeara Technologies — The Way to Lead",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Infeara Technologies — The Way to Lead",
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#14283A",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      {children}
      <ConsentBanner />
      <Analytics />
    </body>
    </html>
  );
}
