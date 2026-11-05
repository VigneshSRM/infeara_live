import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import { SITE_INDEXABLE, SITE_URL, site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
  themeColor: "#101D2B",
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
      <body>{children}</body>
    </html>
  );
}
