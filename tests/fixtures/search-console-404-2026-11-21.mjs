// The "Not found (404)" report from Google Search Console, as the owner pasted it on 21 November
// 2026 (validation started the same day): 49 addresses, each with the day Google last crawled it.
// 44 are on the bare domain, which Hostinger still served when the report was pasted (its DNS was
// moved to Vercel later the same day), and 5 are on www.
//
// Used by tests/legacy-redirects.test.mjs (every address has an answer) and by the HTTP check in
// tests/http-smoke.test.mjs (each answers with a page, or one redirect to a page, on a real build).
// notes/search-console-404.md says what each one does and why.

export const reportedNotFound = [
  ["https://infeara.com/industries/professional-services", "2026-11-17"],
  ["https://infeara.com/resources/blog", "2026-11-17"],
  ["https://infeara.com/industries/manufacturing", "2026-11-16"],
  ["https://infeara.com/index.html", "2026-11-16"],
  ["https://infeara.com/legal/disclaimer", "2026-11-04"],
  ["https://infeara.com/index.php", "2026-10-31"],
  ["https://infeara.com/services/audit-compliance/soc-monitoring", "2026-10-26"],
  ["https://infeara.com/services/turnkey/offshore-development", "2026-10-26"],
  ["https://infeara.com/legal/cookies", "2026-10-25"],
  ["https://infeara.com/services/ai-automation/predictive-analytics", "2026-10-19"],
  ["https://infeara.com/services/audit-compliance/cti", "2026-10-18"],
  ["https://infeara.com/services/audit-compliance/cloud-audit", "2026-10-13"],
  ["https://infeara.com/industries/retail", "2026-10-13"],
  ["https://infeara.com/resources/downloads", "2026-10-12"],
  ["https://infeara.com/services/audit-compliance/red-team", "2026-10-12"],
  ["https://infeara.com/contact", "2026-10-12"],
  ["https://infeara.com/industries/saas", "2026-10-12"],
  ["https://infeara.com/services/audit-compliance/firewall-audit", "2026-10-12"],
  ["https://infeara.com/services/audit-compliance/iam-audit", "2026-10-12"],
  ["https://infeara.com/legal/privacy-policy", "2026-10-12"],
  ["https://infeara.com/industries/startups", "2026-10-10"],
  ["https://infeara.com/services/audit-compliance/endpoint-security", "2026-10-10"],
  ["https://infeara.com/services/infrastructure/cloud-consulting", "2026-10-09"],
  ["https://infeara.com/services/audit-compliance/app-security", "2026-10-09"],
  ["https://infeara.com/services/audit-compliance/dr-audit", "2026-10-09"],
  ["https://infeara.com/services/infrastructure/cloud-solutions", "2026-10-09"],
  ["https://infeara.com/services/audit-compliance/wireless-security", "2026-10-08"],
  ["https://infeara.com/services/audit-compliance/cloud-security", "2026-10-06"],
  ["https://infeara.com/services/ai-automation/workflow-automation", "2026-10-06"],
  ["https://infeara.com/industries/logistics", "2026-10-05"],
  ["https://infeara.com/careers", "2026-10-05"],
  ["https://infeara.com/services/audit-compliance/network-security", "2026-10-04"],
  ["https://infeara.com/about", "2026-10-04"],
  ["https://infeara.com/legal/terms-of-service", "2026-10-03"],
  ["https://infeara.com/services/ai-automation/n8n", "2026-10-01"],
  ["https://infeara.com/services/infrastructure/consulting", "2026-09-30"],
  ["https://infeara.com/services/ai-automation/custom-ai", "2026-09-29"],
  ["https://infeara.com/industries", "2026-09-11"],
  ["https://infeara.com/services/infrastructure/managed-it", "2026-09-01"],
  ["https://infeara.com/resources", "2026-08-29"],
  ["https://infeara.com/services/infrastructure/network-infrastructure", "2026-08-21"],
  ["https://infeara.com/services/infrastructure/outsourcing", "2026-08-13"],
  ["https://www.infeara.com/services/audit-compliance/iso-27001", "2026-08-10"],
  ["https://infeara.com/services/audit-compliance/iso-27001", "2026-08-10"],
  ["https://www.infeara.com/industries/education", "2026-08-09"],
  ["https://infeara.com/resources/case-studies", "2026-08-02"],
  ["https://www.infeara.com/services/ai-automation/workflow-automation", "2026-08-01"],
  ["https://www.infeara.com/resources/downloads", "2026-08-01"],
  ["https://www.infeara.com/terms.php", "2026-06-15"],
];

/** Pages that exist on the current site at the same address. Google crawled them on the bare domain. */
export const samePath = [
  "/about",
  "/careers",
  "/contact",
  "/industries",
  "/industries/education",
  "/industries/manufacturing",
  "/industries/professional-services",
  "/legal/cookies",
  "/legal/privacy-policy",
];

/** Addresses ending in .php: Vercel answers 403 for these before the request reaches the site. */
export const answeredByThePlatform = ["/index.php", "/terms.php"];
