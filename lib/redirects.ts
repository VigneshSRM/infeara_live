import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Legacy URL map for the site rebuild.
 *
 * Every URL that appeared in the previous sitemap
 * (https://www.infeara.com/sitemap.xml, 77 entries) resolves to exactly one of:
 *
 *   1. the equivalent new page (no redirect needed — handled in next.config.ts),
 *   2. the closest new practice, industry or content page (301), or
 *   3. a retired account route (410 Gone, served by app/login/route.ts and
 *      app/forgot-password/route.ts). Those two paths are deliberately absent
 *      from this list.
 *
 * Rules:
 *   - Slugs are mapped to the closest topical page, never to the homepage.
 *   - 301 rather than 308 so the intent is explicit for crawlers and the
 *     client's redirect spreadsheet.
 *   - No chain is longer than one hop.
 */
type LegacyRedirect = { source: string; destination: string };

const security = "/services/cybersecurity";
const cloud = "/services/cloud-datacenter";
const infrastructure = "/services/it-infrastructure";
const network = "/services/network-engineering";
const outsourcing = "/services/outsourcing-remote-support";
const facilities = "/services/it-facility-management";
const turnkey = "/services/turnkey-projects";
const aiAutomations = "/services/ai-automations";
const applicationDevelopment = "/services/application-development";
const managedIt = "/services/managed-it";

const legacy: LegacyRedirect[] = [
  // ── Corporate and legal ────────────────────────────────────────────────
  { source: "/legal/terms-of-service", destination: "/legal/terms" },
  { source: "/legal/disclaimer", destination: "/legal/terms" },
  { source: "/legal/sitemap", destination: "/faq" },
  { source: "/handbook", destination: "/about" },

  // ── Resource centre (collapsed into Insights / Case studies) ───────────
  { source: "/resources", destination: "/insights" },
  { source: "/resources/blog", destination: "/insights" },
  { source: "/resources/downloads", destination: "/insights" },
  { source: "/resources/case-studies", destination: "/case-studies" },
  {
    source:
      "/resources/blog/securing-your-cloud-strategy-proact-hybrid-cloud-phc-in-a-changing-vmware-world",
    destination: "/insights/three-questions-before-a-cloud-migration",
  },
  {
    source: "/resources/blog/it-infrastructure-update-2026-future-ready-enterprise-guide",
    destination: "/insights/what-managed-it-actually-covers",
  },
  {
    source: "/resources/case-studies/it-support-outsourcing-chennai-strategic-advantage",
    destination: "/case-studies",
  },
  { source: "/resources/downloads/cyber-audit-checklist", destination: "/insights" },

  // ── Audit, compliance and security (15) ────────────────────────────────
  // All security assessments and certification advisory work now sits under
  // the cybersecurity practice; cloud posture reviews point at cloud.
  { source: "/services/audit-compliance/vapt", destination: security },
  { source: "/services/audit-compliance/network-security", destination: security },
  { source: "/services/audit-compliance/app-security", destination: security },
  { source: "/services/audit-compliance/cloud-security", destination: security },
  { source: "/services/audit-compliance/endpoint-security", destination: security },
  { source: "/services/audit-compliance/firewall-audit", destination: security },
  { source: "/services/audit-compliance/iam-audit", destination: security },
  { source: "/services/audit-compliance/red-team", destination: security },
  { source: "/services/audit-compliance/wireless-security", destination: security },
  { source: "/services/audit-compliance/cti", destination: security },
  { source: "/services/audit-compliance/cloud-audit", destination: cloud },
  { source: "/services/audit-compliance/iso-27001", destination: security },
  { source: "/services/audit-compliance/soc2-consulting", destination: security },
  { source: "/services/audit-compliance/dr-audit", destination: security },
  { source: "/services/audit-compliance/soc-monitoring", destination: security },

  // ── Infrastructure and operations (16) ─────────────────────────────────
  { source: "/services/infrastructure/managed-it", destination: managedIt },
  { source: "/services/infrastructure/cloud-solutions", destination: cloud },
  { source: "/services/infrastructure/network-infrastructure", destination: network },
  { source: "/services/infrastructure/outsourcing", destination: outsourcing },
  { source: "/services/infrastructure/consulting", destination: infrastructure },
  { source: "/services/infrastructure/cloud-consulting", destination: cloud },
  { source: "/services/infrastructure/fms", destination: facilities },
  { source: "/services/infrastructure/remote-services", destination: outsourcing },
  { source: "/services/infrastructure/network-architecture", destination: network },
  { source: "/services/infrastructure/server-implementation", destination: infrastructure },
  { source: "/services/infrastructure/data-center-ops", destination: cloud },
  { source: "/services/infrastructure/structured-cabling", destination: network },
  { source: "/services/infrastructure/aws-management", destination: cloud },
  { source: "/services/infrastructure/azure-management", destination: cloud },
  { source: "/services/infrastructure/cloud-migration", destination: cloud },
  { source: "/services/infrastructure/hybrid-cloud", destination: cloud },

  // ── AI automation and application development (legacy URLs) ───────────
  { source: "/services/automation-custom-software", destination: "/services" },
  { source: "/services/ai-automation", destination: aiAutomations },
  { source: "/services/ai-automation/workflow-automation", destination: aiAutomations },
  { source: "/services/ai-automation/chatbots", destination: aiAutomations },
  { source: "/services/ai-automation/chatbot-development", destination: aiAutomations },
  { source: "/services/ai-automation/predictive-analytics", destination: aiAutomations },
  { source: "/services/ai-automation/n8n", destination: aiAutomations },
  { source: "/services/ai-automation/custom-ai", destination: aiAutomations },
  { source: "/services/ai-automation/app-development", destination: applicationDevelopment },

  // ── Turnkey and delivery (4) ───────────────────────────────────────────
  { source: "/services/turnkey/offshore-development", destination: turnkey },
  { source: "/services/turnkey/dedicated-teams", destination: turnkey },
  { source: "/services/turnkey/consultation", destination: turnkey },
  { source: "/services/turnkey/implementation", destination: turnkey },

  // ── Old flat service shortcuts (4) ─────────────────────────────────────
  { source: "/services/managed-it-amc", destination: managedIt },
  { source: "/services/cyber-security", destination: security },
  { source: "/services/cloud-solutions", destination: cloud },
  { source: "/services/remote-support", destination: outsourcing },

  // ── Industries (8) ─────────────────────────────────────────────────────
  // SaaS and startups have no dedicated page in the new taxonomy; the
  // industries index is the closest honest destination.
  { source: "/industries/saas", destination: "/industries" },
  { source: "/industries/startups", destination: "/industries" },
  { source: "/industries/retail", destination: "/industries/retail-ecommerce" },
  { source: "/industries/logistics", destination: "/industries/logistics-transportation" },

  // ── Careers ────────────────────────────────────────────────────────────
  { source: "/careers/senior-system-administrator", destination: "/careers" },
];

export const legacyRedirects: Redirect[] = legacy.map((entry) => ({
  source: entry.source,
  destination: entry.destination,
  statusCode: 301 as const,
}));
