export const SITE_URL = process.env.SITE_URL ?? "https://www.infeara.com";

export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const site = {
  name: "Infeara Technologies",
  tagline: "The Way to Lead",
  description:
    "Managed IT, cybersecurity and infrastructure support for organisations across India, from Chennai. Infeara helps teams run critical systems and plan recovery.",
  locale: "en_IN",
  city: "Chennai",
  country: "India",
} as const;
