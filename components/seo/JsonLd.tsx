import { serializeJsonLd } from "@/lib/seo/schema";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Built on the server from typed content. Blog titles come from the database and staff can
      // edit them, so "<" is escaped: a title cannot close this tag and add markup to the page.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infeara Technologies",
  url: "https://www.infeara.com",
  logo: "https://www.infeara.com/brand/infeara-logo.png",
  description:
    "Managed IT services, cybersecurity, cloud infrastructure and enterprise technology operations, delivered from Chennai, India.",
  areaServed: { "@type": "Country", name: "India" },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Infeara Technologies",
  url: "https://www.infeara.com",
  inLanguage: "en-IN",
};
