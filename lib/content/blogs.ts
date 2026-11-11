// The blog lives in the database and is managed in the admin (Admin → Resources → Blogs).
// This file is two things:
//
//   * the pure helpers every blog page uses (reading time, dates, ordering, and how the text of
//     a paragraph becomes links, bullets and bold; see "Text in a paragraph" below), and
//   * the posts that ship in code. `starterBlogPosts` are the three the database was seeded
//     with (supabase/migrations/20261110200100_resource_modules_seed.sql, never edited since).
//     `laterBlogPosts` are the ones added afterwards: each has its own additive migration, made
//     by scripts/generate-blog-migrations.mjs, so a database that already holds the starter
//     posts can take it in without rewriting anything it has already run. `blogPosts` is both,
//     and is the fallback the site shows only while the blog_posts table does not exist yet.
//     Once it does, the database is the single source: edits, unpublishing and deleting a
//     post in the admin take effect and this list is no longer read.
//
// Changing a post here does NOT change the live site. Edit it in the admin. If you change a
// shipped post anyway, run `node scripts/generate-resource-seed.mjs` (starter posts) or
// `node scripts/generate-blog-migrations.mjs` (later posts), then `node scripts/make-apply-blobs.mjs`,
// so the SQL follows.
//
// The starter posts make no claims about clients, results or figures. Replace or remove them
// as part of the content swap, before SITE_INDEXABLE is switched on (see "Launch gate" in the
// README). A later post that describes other companies says only what each one says about
// itself on its own website, and says when that was checked.
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
  /** Sections under an H2. A paragraph is plain text with a few conventions: see "Text in a paragraph". */
  body: { heading: string; paragraphs: string[] }[];
  /** Service pages worth reading next. The first becomes the primary button. */
  relatedServices: { label: string; href: string }[];
  seo: { title: string; description: string };
  /** Set by an editor to override the calculated reading time; empty means "work it out". */
  readingMinutesOverride?: number | null;
};

/** The three posts the database was seeded with. Do not add to this list: see `laterBlogPosts`. */
export const starterBlogPosts: BlogPost[] = [
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

/**
 * Posts added after the starter set. Each needs an entry in scripts/generate-blog-migrations.mjs
 * (a test fails if one is missing), and then `node scripts/make-apply-blobs.mjs`.
 *
 * "Top 10 Managed IT Services Companies in Chennai" is a list, so it is held to a stricter
 * standard than a guide: it names no ranking it cannot support (the ten are in alphabetical
 * order), every company is held to the same five published criteria, every statement about a
 * company is taken from that company's own website, and the page says on what day that was
 * checked. Infeara is one of the ten only because it meets the same criteria, and says so.
 * tests/blog-directory.test.mjs enforces all of this, so a later edit cannot quietly undo it.
 * The pages that were read, and when, are in notes/chennai-managed-it-sources.md.
 *
 * There is one page for this keyword. Update it in place (in the admin, or here and then
 * regenerate the migration) rather than publishing a second list for the same search.
 */
export const laterBlogPosts: BlogPost[] = [
  {
    slug: "top-10-managed-it-services-companies-in-chennai",
    title: "Top 10 Managed IT Services Companies in Chennai",
    excerpt:
      "Ten managed IT services companies headquartered in Chennai, chosen against five published criteria and listed alphabetically. A shortlist to check for yourself, not a ranking.",
    category: "Managed IT",
    publishedAt: "2026-11-11",
    figureSeed: 1,
    body: [
      {
        heading: "What this list is, and what it is not",
        paragraphs: [
          "Managed IT services means a provider takes ongoing responsibility for part of your IT, usually monitoring, patching, backups, help for staff, and the network and security around them, under agreed response times. This guide lists ten companies headquartered in Chennai that sell it.",
          "It is a shortlist to check for yourself, not a league table. We have not scored the companies or ranked them. They appear in alphabetical order, so position means nothing. Every statement about a company comes from its own website, or from its owner's announcement where the entry says so, and was checked on 11 November 2026.",
          "It is also not a complete directory. Other Chennai companies may meet the criteria below, and a company's absence from this page says nothing about its quality.",
          "Infeara Technologies publishes this guide and is one of the ten, because it meets the same criteria as the others. Its entry is written in the same way and sits in alphabetical order. Read it as you would read any other: check it against Infeara's own website, not against this page.",
          "For what a managed IT contract should cover, see [What managed IT actually covers](/insights/what-managed-it-actually-covers).",
        ],
      },
      {
        heading: "The criteria we used",
        paragraphs: [
          "A company is listed only if all five of these are true:",
          "- **Chennai headquarters.** The company, or its owner in a public announcement, gives Chennai as its head office.",
          "- **Managed IT as a service line.** Its website describes ongoing operation or support of a customer's IT, such as infrastructure monitoring, a service desk, network or security operations, or managed cloud. Selling products or writing software on its own does not count.",
          "- **Business customers.** It serves organisations, not households.",
          "- **Details you can check.** Its website says what it does and where it is, so a reader can verify each line in this guide.",
          "- **Still operating.** Its website was live, and described current services, when we checked.",
          "We did not use revenue, staff numbers, awards, reviews or advertising, and no company paid to be listed. None of those can be compared fairly from public pages, and an order built on them would claim more than we can show.",
        ],
      },
      {
        heading: "Ten managed IT services companies in Chennai, A to Z",
        paragraphs: [
          "Each entry says what the company says it does, where it is based, and links to its official website. Services are summarised from the company's own pages, so check the site for the current scope.",
          "### Accel IT Services (Accel Limited)",
          "Accel Limited describes itself as a technology and media services group headquartered in Chennai, and Accel IT Services as its flagship business. It says it has three decades of experience in IT infrastructure managed services.",
          "- **Services:** IT infrastructure services (maintenance, facility management and remote management), cloud solutions, cybersecurity including a managed security operations centre, and managed services covering data centre, cloud, print, security and network management.",
          "- **Location:** Headquartered in Chennai, with a pan-India presence.",
          "- **Official website:** [accelits.com](https://accelits.com/)",
          "### Fourth Dimension Technologies (FourD)",
          "An IT infrastructure and managed services provider. Its website says its teams have served banking, manufacturing, retail, software, telecom and BPO customers over 36 years, and describes the company as part of CEI. CEI's 2024 announcement of the acquisition describes it as headquartered in Chennai.",
          "- **Services:** Managed IT, with remote or on-site ownership of the infrastructure; cloud services including migration, backup and disaster recovery, and cloud managed services; managed security; infrastructure design and integration; and IT services for non-profits.",
          "- **Location:** Chennai (Saidapet, Anna Salai). Its site also lists offices in Coimbatore and Campbell, California.",
          "- **Official website:** [fourdtech.com](https://fourdtech.com/)",
          "### Futurenet Technologies (India)",
          "An IT consulting and services company that gives Chennai as its headquarters. Its website says it has been in IT services for more than two decades, and that it offers round-the-clock support for data centre and cloud infrastructure through remote infrastructure management, in a managed services model.",
          "- **Services:** Remote and onsite infrastructure management, total IT infrastructure outsourcing, data centre and cloud services, networking, backup and information security, and end-user services.",
          "- **Location:** Headquarters in Maduravoyal, Chennai. Other offices in Coimbatore and Puducherry, and in Sharjah, UAE.",
          "- **Official website:** [futurenet.in](https://futurenet.in/)",
          "### Infeara Technologies",
          "The publisher of this guide: a small, technical company in Chennai whose primary practice is managed IT. It runs the day-to-day operation of customers' infrastructure under an agreed service level, and starts every engagement with an assessment of what is already in place.",
          "- **Services:** Managed IT (monitoring, patching, backup and recovery checks, incident response and monthly reporting), cybersecurity, cloud and data centre, network engineering, IT facility management, turnkey infrastructure projects, AI automations and application development.",
          "- **Location:** Chennai, Tamil Nadu. Delivery is remote by default, with onsite attendance arranged where physical access is needed. It serves organisations across India.",
          "- **Official website:** [infeara.com](https://www.infeara.com/)",
          "### Inspirisys Solutions",
          "An IT services company whose corporate office is in Chennai. Its infrastructure practice describes end-to-end services to create, run and manage IT infrastructure, including a managed IT service provider (MSP) offering.",
          "- **Services:** Data centre managed services, managed IT services (MSP), network solutions, workplace transformation, tools and services automation, and audit and consulting. It also lists enterprise security, cloud, product engineering and warranty management practices.",
          "- **Location:** Corporate office in Kilpauk, Chennai, with regional offices across India.",
          "- **Official website:** [inspirisys.com](https://www.inspirisys.com/)",
          "### Mentor Infocomm India",
          "An enterprise IT, networking and cybersecurity company, headquartered in Chennai, that says it has supported organisations in education, banking, government, healthcare and IT services since 2012. Its managed IT page describes round-the-clock monitoring and support under customised plans.",
          "- **Services:** Monitoring and support, server and network management, cybersecurity and threat protection, data backup and disaster recovery, and remote helpdesk support. It also lists IT and cloud infrastructure, networking, audio-visual integration and surveillance.",
          "- **Location:** Head office on Greams Road, Thousand Lights, Chennai. It says it supports businesses across India.",
          "- **Official website:** [mentorinfocomm.com](https://mentorinfocomm.com/)",
          "### MSP Info Services",
          "An IT infrastructure and services company headquartered in Chennai, with a branch office in Bengaluru. It says it has served organisations since 2020, supplying, deploying and supporting business technology, and describes managed IT as remote and onsite operational support for users, systems, networks, backup and vendors.",
          "- **Services:** Managed IT services (remote helpdesk, monitoring and preventive maintenance, annual maintenance contracts, backup and security oversight, asset and vendor coordination), IT infrastructure, networks and wireless, cloud and Microsoft 365, end-user computing, security and surveillance, procurement and rental.",
          "- **Location:** Headquarters in Velachery, Chennai, with a branch in Bengaluru.",
          "- **Official website:** [mspinfoservices.in](https://www.mspinfoservices.in/)",
          "### Net Access India",
          "An IT infrastructure management company with its corporate office in Chennai, part of the Murugappa Group. Its website describes more than two decades of experience and managed services for infrastructure, end users and security.",
          "- **Services:** IT infrastructure management (data centre, network management and transformation, and managed cloud on AWS and Azure), end-user support (help desk, onsite and on-call support, break-fix, asset and vendor management), managed cybersecurity and application support.",
          "- **Location:** Corporate office on Moore Street, Chennai. Branch offices in Chennai (Taramani), Bengaluru, Pune and Delhi.",
          "- **Official website:** [netaccess-india.com](https://www.netaccess-india.com/)",
          "### Sify Technologies",
          "An information and communications technology company headquartered at TIDEL Park in Taramani, Chennai. Its website describes more than 25 years in digital infrastructure, and a single provider for managed services across data centres, cloud, network and security operations.",
          "- **Services:** Infrastructure managed services (data centre, cloud, network and security management, monitoring and maintenance), managed security services and managed detection and response, hybrid and multi-cloud management, network services and data centre colocation.",
          "- **Location:** Headquarters in Taramani, Chennai. Its site also lists offices in Bengaluru, Hyderabad, Mumbai, Kolkata and Noida, and overseas.",
          "- **Official website:** [sifytechnologies.com](https://www.sifytechnologies.com/)",
          "### Sniper Systems and Solutions",
          "An IT solutions provider headquartered in Chennai that says it has served businesses across India since 2009. Managed services sit alongside its infrastructure, cloud, device deployment and cybersecurity work.",
          "- **Services:** IT infrastructure, cloud services, device deployment, cybersecurity, quick support, IT consulting, managed services and AV solutions.",
          "- **Location:** Headquarters in Chennai, with offices in Bengaluru, Hyderabad, Gurugram, Coimbatore, Kochi and Vijayawada.",
          "- **Official website:** [sniperindia.com](https://sniperindia.com/)",
        ],
      },
      {
        heading: "How to compare them",
        paragraphs: [
          "Once you have two or three names, the useful questions are about scope and accountability, not size.",
          "- **Scope.** What is covered and what is excluded? Ask for it in writing.",
          "- **Response times.** What are the response and resolution targets, and how are they reported to you each month?",
          "- **People.** Who is your named contact, and who picks up when something fails at night or at a weekend?",
          "- **Backups.** How are backups checked, and when was a restore last tested?",
          "- **Exit.** What documentation and access would you get back if you left?",
          "- **Presence.** Which work is done remotely and which on site, and how soon can someone reach your office?",
          "Ask for references from organisations of a similar size to yours, and speak to them. A reference you have spoken to is worth more than any claim on a website, including those summarised here.",
        ],
      },
      {
        heading: "How this list is kept accurate",
        paragraphs: [
          "Details were checked on 11 November 2026 against each company's own website, and against its owner's announcement where an entry names one. Companies change their services, offices and names, so confirm the current position with the company before you decide.",
          "Company names belong to their owners. Being listed here is not an endorsement by, or a partnership with, any of them.",
          "If an entry is wrong, or you run a managed IT company in Chennai that meets the criteria and is not listed, [tell us through the contact page](/contact). We will check it against your website and update this guide. It is the only version of this list, and we update it in place.",
        ],
      },
      {
        heading: "Talk to Infeara about managed IT",
        paragraphs: [
          "If you would like to talk about managed IT for your organisation, Infeara offers it as its primary practice: monitoring, patching, backup and recovery verification, incident response and monthly reporting, under service levels agreed in writing.",
          "Work starts with an assessment of what you already run, and nothing is changed during the assessment. Delivery is remote by default, with onsite attendance arranged where it is needed, for organisations in Chennai and across India.",
          "- [Read about Infeara's managed IT services](/services/managed-it)",
          "- [Send an enquiry to Infeara](/contact)",
          "This section is the publisher's own service enquiry. It is separate from the list above, which was made by the criteria in the second section.",
        ],
      },
    ],
    relatedServices: [
      { label: "Managed IT Services", href: "/services/managed-it" },
      { label: "Remote IT Services", href: "/services/outsourcing-remote-support" },
      { label: "Managed Cloud Support Services (MSP)", href: "/services/cloud-datacenter/managed-cloud-support-msp" },
    ],
    seo: {
      title: "Top 10 Managed IT Services Companies in Chennai",
      description:
        "Ten managed IT services companies headquartered in Chennai, with descriptions, services, locations and official websites. Chosen by criteria, listed A to Z.",
    },
  },
];

/** Every post that ships in code, starter and later. The fallback while the table is missing. */
export const blogPosts: BlogPost[] = [...starterBlogPosts, ...laterBlogPosts];

/** Newest first. Posts that share a date keep the order they were given in. */
export function sortNewestFirst<T extends { publishedAt: string }>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** The posts that ship in code, newest first. The live site reads the database; see the header. */
export function listBlogPosts(): BlogPost[] {
  return sortNewestFirst(blogPosts);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Words in everything a reader sees on the post page (link and bold markers are not words). */
export function wordCount(post: Pick<BlogPost, "title" | "excerpt" | "body">): number {
  const text = [
    post.title,
    post.excerpt,
    ...post.body.flatMap((section) => [section.heading, ...section.paragraphs.map(plainBlogText)]),
  ];
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

/* ── Text in a paragraph ─────────────────────────────────────────────────────
 *
 * A paragraph is plain text with four conventions an editor can type in the admin:
 *
 *   ### Heading        a sub-heading inside the section (an H3)
 *   - item             a bullet; bullets that follow one another make one list
 *   [label](address)   a link: https:// or http:// (opens in a new tab), or a path on this site
 *   **text**           bold
 *
 * Anything else is shown exactly as typed, and that includes a link whose address is not
 * allowed (so a `javascript:` address can never become a link). The page builds elements from
 * what is parsed here; it never inserts the text as HTML.
 */

export type BlogInline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string; external: boolean };

export type BlogBlock =
  | { type: "paragraph"; inline: BlogInline[] }
  | { type: "subheading"; text: string }
  | { type: "list"; items: BlogInline[][] };

const INTERNAL_HREF = /^\/(?!\/)[^\s"'<>\\]*$/;
const EXTERNAL_HREF = /^https?:\/\/[^\s"'<>\\]+$/i;

/** "internal" for a path on this site, "external" for http(s), null for anything else. */
export function blogLinkKind(href: string): "internal" | "external" | null {
  if (href.length > 500) return null;
  if (INTERNAL_HREF.test(href)) return "internal";
  if (EXTERNAL_HREF.test(href)) return "external";
  return null;
}

// [label](address), where the address may hold one level of brackets (Wikipedia-style), or **bold**.
const INLINE = /\[([^\]\n]{1,200})\]\(((?:[^()\s]|\([^()\s]*\))+)\)|\*\*([^*\n]{1,200})\*\*/g;

export function parseBlogInline(text: string): BlogInline[] {
  const nodes: BlogInline[] = [];
  const addText = (value: string) => {
    if (!value) return;
    const last = nodes[nodes.length - 1];
    if (last?.type === "text") last.text += value;
    else nodes.push({ type: "text", text: value });
  };

  let cursor = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    addText(text.slice(cursor, start));
    if (match[3] !== undefined) {
      nodes.push({ type: "bold", text: match[3] });
    } else {
      const kind = blogLinkKind(match[2]);
      if (kind) nodes.push({ type: "link", text: match[1], href: match[2], external: kind === "external" });
      else addText(match[0]);
    }
    cursor = start + match[0].length;
  }
  addText(text.slice(cursor));
  return nodes;
}

/** What a reader would read, with no markers: for word counts and anything that wants plain text. */
export function plainBlogText(paragraph: string): string {
  return parseBlogInline(paragraph.trim().replace(/^(?:###|-)\s+/, ""))
    .map((node) => node.text)
    .join("");
}

/** The paragraphs of one section as blocks: sub-headings, lists and paragraphs, in order. */
export function parseBlogBlocks(paragraphs: readonly string[]): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  for (const raw of paragraphs) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("### ")) {
      const heading = plainBlogText(line.slice(4));
      if (heading) blocks.push({ type: "subheading", text: heading });
    } else if (line.startsWith("- ")) {
      const item = parseBlogInline(line.slice(2).trim());
      const last = blocks[blocks.length - 1];
      if (last?.type === "list") last.items.push(item);
      else blocks.push({ type: "list", items: [item] });
    } else {
      blocks.push({ type: "paragraph", inline: parseBlogInline(line) });
    }
  }
  return blocks;
}

/** Addresses typed as a link that are not allowed. The admin refuses to save while there are any. */
export function unsafeBlogLinks(paragraphs: readonly string[]): string[] {
  const bad: string[] = [];
  for (const paragraph of paragraphs) {
    for (const match of paragraph.matchAll(INLINE)) {
      if (match[3] === undefined && !blogLinkKind(match[2])) bad.push(match[2]);
    }
  }
  return bad;
}
