/**
 * Photographic library used by the `Figure` and `Schematic` components.
 *
 * Both components used to render placeholder SVG drawings. They now render real
 * photography from `public/site/`, keyed semantically so the picture beside a
 * section is about the same subject as the section.
 *
 * Adding or replacing an image:
 *   1. drop the file in `public/site/` (16:9, 1200x675 or larger, JPG or WebP),
 *   2. add an entry to `siteImages` with descriptive alt text,
 *   3. point the relevant `seed` (figures) or `label` (schematics) at it.
 *
 * No page needs to change: call sites still pass `seed` / `label` / `caption`
 * exactly as they always did.
 */

export type SiteImageKey =
  | "ai-automations"
  | "application-development"
  | "banking-office"
  | "campus-lab"
  | "client-meeting"
  | "cloud-ai-data"
  | "managed-cloud-support"
  | "cloud-cost-optimization"
  | "cloud-disaster-recovery"
  | "cloud-monitoring-management"
  | "cloud-application-hosting"
  | "cloud-devops-automation"
  | "cybersecurity-hub"
  | "penetration-testing"
  | "threat-analysis"
  | "threat-modeling"
  | "vulnerability-assessment"
  | "homepage-hero"
  | "healthcare-it"
  | "logistics-warehouse"
  | "network-cabinet"
  | "operations-centre"
  | "retail-store"
  | "runbook-desk"
  | "server-room";

export type SiteImage = { src: string; alt: string };

export const coreServiceImages = {
  "it-infrastructure": {
    src: "/site/core-it-infrastructure.jpg",
    alt: "Infrastructure engineer inspecting organized server racks in a modern data center.",
  },
  cybersecurity: {
    src: "/site/core-cybersecurity.jpg",
    alt: "Security operations analyst reviewing monitoring dashboards at a workstation.",
  },
  "cloud-datacenter": {
    src: "/site/core-cloud-datacenter.jpg",
    alt: "Technician checking a server cabinet in a clean, modern data center.",
  },
  "turnkey-projects": {
    src: "/site/core-turnkey-projects.jpg",
    alt: "Engineers coordinating a structured network installation in an office.",
  },
  "ai-automations": {
    src: "/site/core-ai-automations.jpg",
    alt: "Business operations and automation specialists reviewing an AI-assisted workflow.",
  },
  "application-development": {
    src: "/site/core-application-development.jpg",
    alt: "Software developers collaborating on a custom web application.",
  },
} satisfies Record<string, SiteImage>;

export const siteImages: Record<SiteImageKey, SiteImage> = {
  "ai-automations": {
    src: "/site/core-ai-automations.jpg",
    alt: "Business operations and automation specialists reviewing an AI-assisted workflow.",
  },
  "application-development": {
    src: "/site/core-application-development.jpg",
    alt: "Software developers collaborating on a custom web application.",
  },
  "cloud-ai-data": {
    src: "/site/cloud-ai-data.jpg",
    alt: "Cloud data specialists reviewing an analytics platform and data flows together.",
  },
  "managed-cloud-support": {
    src: "/site/managed-cloud-support.jpg",
    alt: "Cloud operations engineers monitoring services and documenting support activity.",
  },
  "cloud-cost-optimization": {
    src: "/site/cloud-cost-optimization.jpg",
    alt: "Cloud engineers reviewing resource usage and cost trends on a dashboard.",
  },
  "cloud-disaster-recovery": {
    src: "/site/cloud-disaster-recovery.jpg",
    alt: "Engineers validating recovery readiness beside a secondary server environment.",
  },
  "cloud-monitoring-management": {
    src: "/site/cloud-monitoring-management.jpg",
    alt: "A cloud infrastructure engineer reviewing service health and monitoring dashboards.",
  },
  "cloud-application-hosting": {
    src: "/site/cloud-application-hosting.jpg",
    alt: "An application and platform engineer reviewing a hosted service release.",
  },
  "cloud-devops-automation": {
    src: "/site/cloud-devops-automation.jpg",
    alt: "Software engineers reviewing a cloud build and release pipeline together.",
  },
  "operations-centre": {
    src: "/site/noc-monitoring.jpg",
    alt: "Engineers at a curved desk in a dark network operations centre, watching monitoring dashboards on a wall of screens.",
  },
  "server-room": {
    src: "/site/server-room.jpg",
    alt: "A clean data centre aisle with rows of server racks lit by blue status LEDs and an engineer checking a cabinet.",
  },
  "network-cabinet": {
    src: "/site/plant-network.jpg",
    alt: "An engineer inspecting a wall-mounted industrial network cabinet with bundled cabling on a factory floor.",
  },
  "runbook-desk": {
    src: "/site/runbook-desk.jpg",
    alt: "An engineer writing notes beside two monitors showing terminals and a document, with printed runbooks on the desk.",
  },
  "client-meeting": {
    src: "/site/client-meeting.jpg",
    alt: "A small working meeting around a table with a hand-drawn network diagram on the whiteboard.",
  },
  "homepage-hero": {
    src: "/site/homepage-hero.jpg",
    alt: "Two IT engineers working together to maintain a business server environment.",
  },
  "cybersecurity-hub": {
    src: "/site/cybersecurity-hub.jpg",
    alt: "A cybersecurity engineer reviews a tablet beside a secure glass entrance to a blue-lit server room.",
  },
  "vulnerability-assessment": {
    src: "/site/vulnerability-assessment.jpg",
    alt: "A security analyst reviews risk findings on a display while inspecting enterprise network equipment.",
  },
  "penetration-testing": {
    src: "/site/penetration-testing.jpg",
    alt: "An authorized security tester studies application flows and test output at a controlled workstation.",
  },
  "threat-modeling": {
    src: "/site/threat-modeling.jpg",
    alt: "A security and engineering team discusses system architecture and trust boundaries on a glass board.",
  },
  "threat-analysis": {
    src: "/site/threat-analysis.jpg",
    alt: "A threat analyst correlates incident timelines and network activity across security operations displays.",
  },
  "healthcare-it": {
    src: "/site/hospital-it.jpg",
    alt: "An IT engineer supporting clinical staff at a workstation on a bright hospital corridor.",
  },
  "logistics-warehouse": {
    src: "/site/warehouse-it.jpg",
    alt: "A warehouse supervisor scanning with a handheld terminal while an engineer checks a network cabinet between racks.",
  },
  "campus-lab": {
    src: "/site/campus-lab.jpg",
    alt: "Rows of desktop workstations in a college computer laboratory with a technician connecting a network cable.",
  },
  "retail-store": {
    src: "/site/store-pos.jpg",
    alt: "A technician testing a point-of-sale terminal and card reader at a retail checkout.",
  },
  "banking-office": {
    src: "/site/bank-branch.jpg",
    alt: "A modern back-office floor with rows of dual-monitor workstations and staff reviewing documents.",
  },
};

/**
 * Figures are addressed by the numeric `seed` each page already passes.
 *
 * Service page seeds are defined by each service record, 11-18 are the eight
 * sector pages, and the remaining values are fixed marketing pages.
 */
const figureSeeds: Record<number, SiteImageKey> = {
  // practice pages (lib/content/services.ts)
  1: "operations-centre", // Managed IT
  2: "cybersecurity-hub", // Cybersecurity
  3: "server-room", // IT Infrastructure
  4: "client-meeting", // Outsourcing & Remote Support
  5: "server-room", // Cloud & Datacenter
  6: "network-cabinet", // Network Engineering
  7: "runbook-desk", // IT Facility Management
  8: "client-meeting", // Turnkey Projects
  19: "ai-automations", // AI Automations
  20: "application-development", // Application Development
  301: "cloud-ai-data",
  302: "managed-cloud-support",
  303: "cloud-cost-optimization",
  304: "cloud-disaster-recovery",
  305: "cloud-monitoring-management",
  306: "cloud-application-hosting",
  307: "cloud-devops-automation",
  10: "homepage-hero", // Homepage hero
  201: "vulnerability-assessment", // Vulnerability Assessment
  202: "penetration-testing", // Penetration Testing
  203: "threat-modeling", // Threat Modeling
  204: "threat-analysis", // Threat Analysis

  // sector pages (lib/content/industries.ts)
  11: "banking-office", // Banking & Financial Services
  12: "healthcare-it", // Healthcare
  13: "network-cabinet", // Manufacturing
  14: "retail-store", // Retail & E-commerce
  15: "campus-lab", // Education
  16: "logistics-warehouse", // Logistics & Transportation
  17: "client-meeting", // Professional Services
  18: "banking-office", // Enterprise & Corporate Offices

  // fixed pages
  21: "operations-centre", // /services — service coverage
  31: "client-meeting", // /industries — sector pressure
  41: "operations-centre", // /technical resources — IT operations guide
  // /insights/[slug] passes 51 + readingMinutes (articles run 5-7 minutes)
  56: "operations-centre",
  57: "server-room",
  58: "network-cabinet",
  61: "runbook-desk", // /about — operating discipline
  71: "client-meeting", // /approach — improvement loop
  81: "operations-centre", // /why-infeara — accountability
  91: "client-meeting", // /case-studies — measured change
  101: "server-room", // /partners — vendor landscape
  111: "operations-centre", // /sla — service evidence
  121: "runbook-desk", // /faq — questions
  131: "runbook-desk", // /careers — engineering culture
  137: "banking-office", // /careers/opportunities — open roles
  139: "runbook-desk", // /careers/opportunities — application review
  141: "client-meeting", // /contact — first conversation
  151: "runbook-desk", // /legal/[slug] — review cycle
};

/**
 * Schematics are addressed by the `label` each page already passes. Practice
 * labels are chosen to differ from the figure on the same page, so a
 * service page never shows the same photograph twice.
 */
const schematicLabels: Record<string, SiteImageKey> = {
  // practice pages
  "Managed operations": "runbook-desk",
  "Exposure review": "server-room",
  "Compute and storage": "network-cabinet",
  "Support tiers": "operations-centre",
  "Migration path": "client-meeting",
  "Network path": "server-room",
  "Asset lifecycle": "banking-office",
  "Project build": "network-cabinet",
  "Automation flow": "runbook-desk",
  "Application workflow": "client-meeting",

  // fixed pages
  "Company structure": "client-meeting",
  "Delivery sequence": "runbook-desk",
  "Engagement sequence": "client-meeting",
  "Enquiry routing": "operations-centre",
  "Evidence loop": "operations-centre",
  "Evidence stack": "server-room",
  "Hiring process": "client-meeting",
  "Incident flow": "runbook-desk",
  "Operating loop": "operations-centre",
  "Platform stack": "network-cabinet",
  "Policy hierarchy": "banking-office",
  "Question to answer": "client-meeting",
  "Sector matrix": "logistics-warehouse",
};

/**
 * The eight sector pages all use the label "Service map"; their caption names
 * the sector, so the sector is matched here. Each entry differs from the
 * figure on the same page.
 */
const serviceMapBySector: [match: string, key: SiteImageKey][] = [
  ["banking & financial services", "runbook-desk"],
  ["healthcare", "operations-centre"],
  ["manufacturing", "server-room"],
  ["retail & e-commerce", "banking-office"],
  ["education", "client-meeting"],
  ["logistics & transportation", "runbook-desk"],
  ["professional services", "banking-office"],
  ["enterprise & corporate offices", "client-meeting"],
];

const pool = Object.keys(siteImages) as SiteImageKey[];

/** Stable hash, so an unmapped seed or label always resolves to the same photo. */
function pick(text: string): SiteImageKey {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100003;
  }
  return pool[hash % pool.length];
}

export function figureImage(seed: number): SiteImage {
  return siteImages[figureSeeds[seed] ?? pick(`figure-${seed}`)];
}

/**
 * Sector pages all share the label "Service map", so those are resolved from
 * the caption, which names the sector. Anything unmapped falls back to a stable
 * hash over the label and variant.
 */
export function schematicImage(label: string, caption: string, variant: string): SiteImage {
  const mapped = schematicLabels[label];
  if (mapped) return siteImages[mapped];

  if (label === "Service map") {
    const sector = serviceMapBySector.find(([match]) => caption.includes(match));
    if (sector) return siteImages[sector[1]];
    return siteImages[pick(`${caption} ${variant}`)];
  }

  return siteImages[pick(`${label} ${variant}`)];
}
