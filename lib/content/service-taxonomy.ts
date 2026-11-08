/**
 * Public service hierarchy. IT Infrastructure and Cybersecurity are core
 * practices with focused sub-services. The other core practices stand alone.
 */
export const coreServiceSlugs = [
  "it-infrastructure",
  "cybersecurity",
  "cloud-datacenter",
  "turnkey-projects",
  "automation-custom-software",
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
