export const SITE_URL = process.env.SITE_URL ?? "https://www.infeara.com";

export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const site = {
  name: "Infeara Technologies",
  tagline: "The Way to Lead",
  description:
    "Managed IT services, cybersecurity and infrastructure support for organisations across India. Based in Chennai, Infeara helps teams operate business-critical systems, reduce exposure and plan recovery.",
  locale: "en_IN",
  city: "Chennai",
  country: "India",
} as const;
