// Open roles published on /careers/opportunities.
//
// Add a role here and it appears on the listing page, in the application form's
// role menu and in the page's structured data. Remove it when the role closes.
// Nothing is invented: an empty list renders the "no published vacancies" state.

export type Role = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: "Full time" | "Contract" | "Internship";
  experience: string;
  summary: string;
  responsibilities: string[];
};

export const openRoles: Role[] = [];

export const disciplines = [
  {
    title: "Service operations",
    body: "Monitoring, triage, endpoint and server administration, and the monthly reporting that keeps an agreement honest.",
  },
  {
    title: "Infrastructure & network",
    body: "Windows and Linux systems, virtualisation, storage, routing, switching, firewalls and the documentation around them.",
  },
  {
    title: "Security & automation",
    body: "Assessment, hardening, vulnerability management, monitoring and the integrations that remove repetitive work.",
  },
];
