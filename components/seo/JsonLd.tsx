export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Data is assembled on the server from typed content, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
