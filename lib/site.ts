export const SITE_URL = process.env.SITE_URL ?? "https://www.infeara.com";

export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const site = {
  name: "Infeara Technologies",
  tagline: "The Way to Lead",
  description:
    "Managed IT services, cybersecurity, cloud infrastructure and enterprise technology operations, delivered from Chennai, India.",
  locale: "en_IN",
  city: "Chennai",
  country: "India",
} as const;
