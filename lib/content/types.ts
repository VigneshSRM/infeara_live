export type Faq = { question: string; answer: string };

export type Service = {
  slug: string;
  order: number;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  related: string[];
  seo: { title: string; description: string };
  figure: { seed: number; label: string; caption: string };
};

export type Industry = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  challenges: string[];
  capabilities: string[];
  services: string[];
  seo: { title: string; description: string };
  figure: { seed: number; label: string; caption: string };
};

export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  publishedAt: string;
  body: { heading: string; paragraphs: string[] }[];
  seo: { title: string; description: string };
};

export type PageContent = {
  slug: string;
  name: string;
  seo: { title: string; description: string };
};

export type Cta = {
  label: string;
  href: string;
  kind: "primary" | "ghost" | "inline";
};
