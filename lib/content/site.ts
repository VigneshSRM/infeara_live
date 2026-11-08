export const company = {
  name: "Infeara Technologies",
  tagline: "The Way to Lead",
  city: "Chennai",
  region: "Tamil Nadu",
  country: "India",
  description:
    "IT Infrastructure, managed operations, cybersecurity, cloud platforms and enterprise technology services, delivered from Chennai, India.",
  // Seed contact details. Replace through the CMS before the site is indexed.
  email: "contact@infeara.com",
  hours: "Monday to Saturday, 09:00–18:00 IST",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "IT Infrastructure",
        href: "/services/it-infrastructure",
        children: [
          { label: "Managed IT Services", href: "/services/managed-it" },
          { label: "IT Facility Management", href: "/services/it-facility-management" },
          { label: "Remote IT Services", href: "/services/outsourcing-remote-support" },
          { label: "Network Engineering", href: "/services/network-engineering" },
        ],
      },
      {
        label: "Cybersecurity",
        href: "/services/cybersecurity",
        children: [
          { label: "Vulnerability Assessment", href: "/services/cybersecurity/vulnerability-assessment" },
          { label: "Penetration Testing", href: "/services/cybersecurity/penetration-testing" },
          { label: "Threat Modeling", href: "/services/cybersecurity/threat-modeling" },
          { label: "Threat Analysis", href: "/services/cybersecurity/threat-analysis" },
        ],
      },
      { label: "Cloud & Datacenter", href: "/services/cloud-datacenter" },
      { label: "Turnkey Projects", href: "/services/turnkey-projects" },
      { label: "Automation & Software", href: "/services/automation-custom-software" },
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "Banking & Financial Services", href: "/industries/banking-financial-services" },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Manufacturing", href: "/industries/manufacturing" },
      { label: "Retail & E-commerce", href: "/industries/retail-ecommerce" },
      { label: "Education", href: "/industries/education" },
      { label: "Logistics & Transportation", href: "/industries/logistics-transportation" },
      { label: "Professional Services", href: "/industries/professional-services" },
      { label: "Enterprise & Corporate Offices", href: "/industries/enterprise-offices" },
    ],
  },
  { label: "Technical resources", href: "/insights" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "IT Infrastructure", href: "/services/it-infrastructure" },
      { label: "Cybersecurity", href: "/services/cybersecurity" },
      { label: "Cloud & Datacenter", href: "/services/cloud-datacenter" },
      { label: "Turnkey Projects", href: "/services/turnkey-projects" },
      { label: "Automation & Custom Software", href: "/services/automation-custom-software" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our approach", href: "/approach" },
      { label: "Why Infeara", href: "/why-infeara" },
      { label: "Case studies", href: "/case-studies" },
      { label: "Technology partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
      { label: "Open roles", href: "/careers/opportunities" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Technical resources", href: "/insights" },
      { label: "SLA & support model", href: "/sla" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/legal/privacy-policy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
    ],
  },
] as const;

export const primaryCta = {
  label: "Talk to an expert",
  href: "/contact",
} as const;
