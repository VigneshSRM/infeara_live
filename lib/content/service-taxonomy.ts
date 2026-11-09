/**
 * Public service hierarchy. IT Infrastructure and Cybersecurity are core
 * practices with focused sub-services. The other core practices stand alone.
 */
export const coreServiceSlugs = [
  "it-infrastructure",
  "cybersecurity",
  "cloud-datacenter",
  "turnkey-projects",
  "ai-automations",
  "application-development",
] as const;

export const infrastructureSubserviceSlugs = [
  "managed-it",
  "it-facility-management",
  "outsourcing-remote-support",
  "network-engineering",
] as const;

export const cybersecuritySubserviceSlugs = [
  "vulnerability-assessment",
  "penetration-testing",
  "threat-modeling",
  "threat-analysis",
] as const;

export const cloudSubserviceSlugs = [
  "cloud-ai-data-services",
  "managed-cloud-support-msp",
  "cloud-cost-optimization",
  "cloud-disaster-recovery-business-continuity",
  "cloud-monitoring-management",
  "cloud-application-hosting",
  "cloud-devops-automation",
] as const;
