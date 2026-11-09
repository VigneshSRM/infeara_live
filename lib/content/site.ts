export const company = {
  name: "Infeara Technologies",
  tagline: "The Way to Lead",
  city: "Chennai",
  region: "Tamil Nadu",
  country: "India",
  description:
    "Managed IT services, cybersecurity and infrastructure support for organisations across India, delivered from Chennai by Infeara Technologies.",
  hours: "Monday to Saturday, 09:00–18:00 IST",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Approach", href: "/approach" },
      { label: "Why Infeara", href: "/why-infeara" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Technology Partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
    ],
  },
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
      {
        label: "Cloud & Datacenter",
        href: "/services/cloud-datacenter",
        children: [
          { label: "Cloud AI & Data Services", href: "/services/cloud-datacenter/cloud-ai-data-services" },
          { label: "Managed Cloud Support Services (MSP)", href: "/services/cloud-datacenter/managed-cloud-support-msp" },
          { label: "Cloud Cost Optimization & Consulting", href: "/services/cloud-datacenter/cloud-cost-optimization" },
          { label: "Cloud Disaster Recovery & Business Continuity", href: "/services/cloud-datacenter/cloud-disaster-recovery-business-continuity" },
          { label: "Cloud Monitoring & Management", href: "/services/cloud-datacenter/cloud-monitoring-management" },
          { label: "Cloud Application Hosting", href: "/services/cloud-datacenter/cloud-application-hosting" },
          { label: "Cloud DevOps & Automation", href: "/services/cloud-datacenter/cloud-devops-automation" },
        ],
      },
      { label: "Turnkey Projects", href: "/services/turnkey-projects" },
      {
        label: "AI Automations",
        href: "/services/ai-automations",
        children: [
          { label: "AI ChatBot Development", href: "/services/ai-automations/ai-chatbot-development" },
          { label: "AI Callers Development", href: "/services/ai-automations/ai-callers-development" },
          { label: "LLM Development", href: "/services/ai-automations/llm-development" },
          { label: "IT Infrastructure AI Automations", href: "/services/ai-automations/it-infrastructure-ai-automations" },
        ],
      },
      {
        label: "Application Development",
        href: "/services/application-development",
        children: [
          { label: "Web Application Development", href: "/services/application-development/web-application-development" },
          { label: "Website Development", href: "/services/application-development/website-development" },
          { label: "Mobile Application Development", href: "/services/application-development/mobile-application-development" },
        ],
      },
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
      { label: "AI Automations", href: "/services/ai-automations" },
      { label: "Application Development", href: "/services/application-development" },
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
