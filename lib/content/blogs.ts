// The blog lives in the database and is managed in the admin (Admin → Resources → Blogs).
// This file is two things:
//
//   * the pure helpers every blog page uses (reading time, dates, ordering), and
//   * `blogPosts`, the three starter posts. They are the seed that
//     supabase/migrations/20261110200100_resource_modules_seed.sql copies into the database,
//     and the fallback the site shows only while the blog_posts table does not exist yet.
//     Once it does, the database is the single source: edits, unpublishing and deleting a
//     post in the admin take effect and this list is no longer read.
//
// Changing a post here does NOT change the live site. Edit it in the admin. If you change the
// starter posts anyway, run `node scripts/generate-resource-seed.mjs` so the seed follows.
//
// The three starter posts make no claims about clients, results or figures. Replace or remove
// them as part of the content swap, before SITE_INDEXABLE is switched on (see "Launch gate"
// in the README).
//
// This file deliberately has no imports, so tests/blogs.test.mjs can load it as it is.

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** Calendar date (India time) as YYYY-MM-DD. Posts are listed newest first. */
  publishedAt: string;
  /** Picks the photograph from the library in lib/site-images.ts (the same seeds Figure uses). */
  figureSeed: number;
  body: { heading: string; paragraphs: string[] }[];
  /** Service pages worth reading next. The first becomes the primary button. */
  relatedServices: { label: string; href: string }[];
  seo: { title: string; description: string };
  /** Set by an editor to override the calculated reading time; empty means "work it out". */
  readingMinutesOverride?: number | null;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "vulnerability-scan-or-penetration-test",
    title: "Vulnerability scan or penetration test: which do you need?",
    excerpt:
      "A scan lists the known weaknesses across your systems. A penetration test shows what someone could actually do with them. Many organisations need both, at different points.",
    category: "Cybersecurity",
    publishedAt: "2026-11-10",
    figureSeed: 201,
    body: [
      {
        heading: "What a vulnerability scan does",
        paragraphs: [
          "A vulnerability scan is automated. It checks your systems against a database of known weaknesses, such as missing patches, outdated software and risky settings, and produces a list. It is quick and repeatable, so it can run every month and after any significant change.",
          "Its limits matter as much as its strengths. A scan reports what it recognises. It does not decide which findings matter in your environment, and it cannot show how several small weaknesses combine into a serious one.",
        ],
      },
      {
        heading: "What a penetration test adds",
        paragraphs: [
          "A penetration test is carried out by a person, inside an agreed scope and time window, who tries to get past your defences the way an attacker would. Its value is in the chain: an exposed service, a reused password and a flat network can add up to access nobody expected.",
          "Because it relies on skilled people, it is done less often: before a major release, after a significant change to the environment, or when a customer or regulator expects independent testing.",
        ],
      },
      {
        heading: "How to choose",
        paragraphs: [
          "If you have never measured your exposure, start with a scan. It sets a baseline and clears the obvious issues before anyone is paid to find them the hard way. If the basics are under control and the question is whether your defences hold against a determined attempt, that is the case for a test.",
          "Either way, agree the scope in writing first: which systems, which techniques, what is off limits and who needs to know. Testing live systems without that agreement is a risk in itself.",
        ],
      },
      {
        heading: "Make the findings count",
        paragraphs: [
          "A report only helps if every finding has an owner and a date. Track fixes like any other change, re-test the important ones, and keep the previous report so the next one shows whether things have improved.",
        ],
      },
    ],
    relatedServices: [
      { label: "Vulnerability assessment", href: "/services/cybersecurity/vulnerability-assessment" },
      { label: "Penetration testing", href: "/services/cybersecurity/penetration-testing" },
    ],
    seo: {
      title: "Vulnerability scan or penetration test?",
      description:
        "What a vulnerability scan and a penetration test each do, when to use which, and how to turn the findings into fixes that actually happen.",
    },
  },
  {
    slug: "before-you-automate-with-ai-choose-the-process",
    title: "Before you automate with AI, choose the process first",
    excerpt:
      "AI projects often stall on scope rather than technology. Choosing one well-understood process, with a clear handoff to people, decides whether the rest works.",
    category: "AI & automation",
    publishedAt: "2026-11-10",
    figureSeed: 19,
    body: [
      {
        heading: "Start with a process, not a tool",
        paragraphs: [
          "\"We should use AI\" is not a requirement. A requirement sounds like this: customers keep asking the same twenty questions, and the answers are scattered across three documents. Start from work people already do repeatedly, where the inputs and the expected result are understood.",
          "Good first candidates are frequent, rule-based and forgiving when they go wrong: drafting a first reply, routing a request to the right team, summarising a long thread. Poor first candidates are rare, high-stakes, or depend on judgement nobody has written down.",
        ],
      },
      {
        heading: "Map the exceptions before you build",
        paragraphs: [
          "The ordinary case is straightforward. The work is in the exceptions: the unusual request, the missing record, the upset customer. List them with the people who handle them today, and decide what the automation does when it meets one.",
          "The safest default is a handoff. The system recognises that it is out of its depth and passes the case to a person, with the context attached so nobody has to ask the customer again.",
        ],
      },
      {
        heading: "Decide how you will know it works",
        paragraphs: [
          "Choose the measures before the build: time to first response, the share of requests resolved without a person, corrections made by staff. Record today's figure first, so that any later claim of improvement has something to be compared with.",
          "Then review a sample of real outputs on a schedule. Automated systems tend to drift quietly when products, prices or policies change, and a regular review is how you notice.",
        ],
      },
      {
        heading: "Keep the first release small",
        paragraphs: [
          "Launch for one process, one channel and one team. A narrow release is easier to test, easier to explain to staff and easier to switch off if it misbehaves. Widen it only after the measures and the handoffs have held up in daily use.",
        ],
      },
    ],
    relatedServices: [
      { label: "AI ChatBot Development", href: "/services/ai-automations/ai-chatbot-development" },
      { label: "LLM Development", href: "/services/ai-automations/llm-development" },
    ],
    seo: {
      title: "Before you automate with AI, choose the process",
      description:
        "How to pick a first process for AI automation, plan for exceptions and handoffs, and decide in advance how you will measure whether it works.",
    },
  },
  {
    slug: "website-web-app-or-mobile-app-scoping-checklist",
    title: "Website, web app or mobile app? A scoping checklist",
    excerpt:
      "The right shape for a digital product follows from who uses it, what they need to do and what it has to connect to, not from what is fashionable.",
    category: "Application development",
    publishedAt: "2026-11-10",
    figureSeed: 20,
    body: [
      {
        heading: "Start with what people need to do",
        paragraphs: [
          "A website mostly informs: people read, compare and get in touch. A web application lets signed-in users do work, such as submitting requests, managing records or seeing their own data. A mobile app earns its extra cost when people need something the browser cannot do well.",
          "Write down the three most important things a user must be able to do. If all three are \"read about us\" and \"contact us\", you are describing a website.",
        ],
      },
      {
        heading: "Check the data and the connections",
        paragraphs: [
          "Much of the cost sits behind the screen: where the data lives, who may see which part of it, and which existing systems the product must talk to, such as accounting, inventory or a customer database. List those connections early, along with the person who owns each system.",
        ],
      },
      {
        heading: "Decide whether a mobile app earns its place",
        paragraphs: [
          "Offline use, push notifications, camera or barcode scanning and background location are the usual reasons. Without one of them, a well-built web application that works properly on a phone is often the quicker and cheaper route, and it can become an app later if the need appears.",
        ],
      },
      {
        heading: "Plan for after launch",
        paragraphs: [
          "Someone has to host it, patch it, back it up and fix it. Decide who, and what that costs each year, before the build starts. A product with no owner after launch tends to become a security and reliability liability.",
        ],
      },
    ],
    relatedServices: [
      { label: "Web Application Development", href: "/services/application-development/web-application-development" },
      { label: "Mobile Application Development", href: "/services/application-development/mobile-application-development" },
    ],
    seo: {
      title: "Website, web app or mobile app? A scoping checklist",
      description:
        "A short checklist for choosing between a website, a web application and a mobile app, covering users, data, integrations and who looks after it after launch.",
    },
  },
];

/** Newest first. Posts that share a date keep the order they were given in. */
export function sortNewestFirst<T extends { publishedAt: string }>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** The starter posts, newest first. The live site reads the database; see the header. */
export function listBlogPosts(): BlogPost[] {
  return sortNewestFirst(blogPosts);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Words in everything a reader sees on the post page. */
export function wordCount(post: Pick<BlogPost, "title" | "excerpt" | "body">): number {
  const text = [post.title, post.excerpt, ...post.body.flatMap((section) => [section.heading, ...section.paragraphs])];
  return text.join(" ").split(/\s+/).filter(Boolean).length;
}

/** An editor's own figure if there is one, otherwise about 200 words a minute (never under one). */
export function readingMinutes(post: BlogPost): number {
  const own = post.readingMinutesOverride;
  if (typeof own === "number" && Number.isFinite(own) && own >= 1) return Math.round(own);
  return Math.max(1, Math.round(wordCount(post) / 200));
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * "2026-11-09" becomes "9 November 2026". Built by hand rather than with toLocaleDateString so
 * the text does not depend on the server's locale data or time zone.
 */
export function formatPostDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
