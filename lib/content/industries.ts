import type { Industry } from "./types";

export const industries: Industry[] = [
  {
    slug: "banking-financial-services",
    name: "Banking & Financial Services",
    tagline: "Availability and evidence, under scrutiny.",
    summary:
      "Financial operations need infrastructure that is available during trading hours, access that is provably controlled, and records that survive an audit.",
    challenges: [
      "Audit questions about access control that cannot be answered from memory",
      "Change windows that must not affect transaction processing",
      "Third-party and regulator reporting deadlines",
    ],
    capabilities: [
      "Identity review and privileged access control",
      "Patch and change scheduling around processing windows",
      "Evidence collection for audit and regulator requests",
    ],
    services: ["cybersecurity", "managed-it", "it-infrastructure"],
    seo: {
      title: "IT Services for Banking and Financial Services",
      description:
        "Managed IT, cybersecurity and infrastructure support for banking and financial services teams in India.",
    },
    figure: { seed: 11, label: "Controls and evidence", caption: "Access reviews, change records and evidence prepared for audit." },
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    tagline: "Systems that cannot wait for a reboot.",
    summary:
      "Clinical and administrative systems carry patient data and continuous demand. Downtime has a cost beyond the IT budget.",
    challenges: [
      "Clinical systems that cannot be interrupted for routine maintenance",
      "Patient data held across systems with uneven access control",
      "Backup and recovery expectations that exceed a file restore",
    ],
    capabilities: [
      "Maintenance scheduled around clinical hours",
      "Access control and logging for patient-data systems",
      "Recovery testing with recorded recovery times",
    ],
    services: ["managed-it", "cybersecurity", "cloud-datacenter"],
    seo: {
      title: "IT Services for Healthcare",
      description:
        "Managed IT, security and recovery support for clinics, hospitals and healthcare organisations.",
    },
    figure: { seed: 12, label: "Continuity", caption: "Maintenance windows, access control and recovery testing across clinical systems." },
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    tagline: "Plant networks and office networks are not the same problem.",
    summary:
      "Production equipment, plant networks and office systems have different availability and change requirements. Treating them as one estate creates risk.",
    challenges: [
      "Legacy industrial equipment that cannot be patched normally",
      "Segmentation between plant and office networks",
      "Spare-parts and lifecycle records that are out of date",
    ],
    capabilities: [
      "Network segmentation between operational and corporate systems",
      "Asset registers covering plant and office equipment",
      "Replacement planning around production schedules",
    ],
    services: ["network-engineering", "it-facility-management", "managed-it"],
    seo: {
      title: "IT Services for Manufacturing",
      description:
        "Network segmentation, asset management and managed IT for manufacturing plants and corporate offices.",
    },
    figure: { seed: 13, label: "Segmented plant", caption: "Separated plant and office networks with asset records across both." },
  },
  {
    slug: "retail-ecommerce",
    name: "Retail & E-commerce",
    tagline: "Peak hours do not move for maintenance.",
    summary:
      "Store systems, payment paths and online storefronts share a peak window. Infrastructure changes have to work around it.",
    challenges: [
      "Payment and storefront availability during peak trading",
      "Multiple sites with inconsistent network equipment",
      "Seasonal capacity swings",
    ],
    capabilities: [
      "Change scheduling outside trading windows",
      "Standardised store network configuration",
      "Capacity review before seasonal peaks",
    ],
    services: ["managed-it", "network-engineering", "cloud-datacenter"],
    seo: {
      title: "IT Services for Retail and E-commerce",
      description:
        "Managed IT, network engineering and cloud support for retail stores and e-commerce operations.",
    },
    figure: { seed: 14, label: "Store estate", caption: "Standardised store configurations and peak-window change scheduling." },
  },
  {
    slug: "education",
    name: "Education",
    tagline: "Many users, few administrators.",
    summary:
      "Institutions support large, changing user populations with small IT teams. Identity, device management and network capacity carry the load.",
    challenges: [
      "Large user populations with seasonal turnover",
      "Shared devices and uncontrolled software installation",
      "Campus network capacity during examination periods",
    ],
    capabilities: [
      "Identity lifecycle for staff and student accounts",
      "Device standards and software control",
      "Wireless and network capacity planning",
    ],
    services: ["it-infrastructure", "network-engineering", "outsourcing-remote-support"],
    seo: {
      title: "IT Services for Education",
      description:
        "Identity, device management and campus network support for schools, colleges and institutions.",
    },
    figure: { seed: 15, label: "Campus identity", caption: "Account lifecycle and device standards across a changing user population." },
  },
  {
    slug: "logistics-transportation",
    name: "Logistics & Transportation",
    tagline: "Distributed sites, one operating standard.",
    summary:
      "Warehouses, hubs and vehicles generate data continuously. The estate is distributed, so consistency matters more than individual site performance.",
    challenges: [
      "Warehouse and hub connectivity that varies by site",
      "Handheld devices and scanners that need to keep working",
      "Asset records spread across locations",
    ],
    capabilities: [
      "Standardised site connectivity and equipment",
      "Device management for handheld and scanning fleets",
      "Central asset and lifecycle records",
    ],
    services: ["network-engineering", "it-facility-management", "managed-it"],
    seo: {
      title: "IT Services for Logistics and Transportation",
      description:
        "Site connectivity, device management and asset tracking for logistics and transportation operations.",
    },
    figure: { seed: 16, label: "Distributed sites", caption: "One configuration standard applied across warehouses and hubs." },
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    tagline: "Confidentiality is part of the service.",
    summary:
      "Legal, financial and consulting firms hold client material that has to stay controlled, available and recoverable.",
    challenges: [
      "Client confidentiality across shared systems",
      "Document retention and recovery expectations",
      "Small teams carrying wide administrative responsibility",
    ],
    capabilities: [
      "Access control aligned to client matters",
      "Retention and recovery for document systems",
      "Remote administration for a distributed team",
    ],
    services: ["cybersecurity", "managed-it", "cloud-datacenter"],
    seo: {
      title: "IT Services for Professional Services",
      description:
        "Confidentiality, access control and managed IT for legal, financial and consulting firms.",
    },
    figure: { seed: 17, label: "Matter access", caption: "Client-matter access boundaries mapped to identity groups." },
  },
  {
    slug: "enterprise-offices",
    name: "Enterprise & Corporate Offices",
    tagline: "A headquarters is an infrastructure site too.",
    summary:
      "Corporate offices concentrate users, meeting systems and executive functions into a small physical footprint with high expectations.",
    challenges: [
      "Meeting-room and audiovisual systems that fail during use",
      "High-density wireless and wired demand",
      "Joiner, mover and leaver processes handled manually",
    ],
    capabilities: [
      "Meeting-room and network standards",
      "Wireless design for dense occupancy",
      "Automated identity lifecycle",
    ],
    services: ["network-engineering", "it-infrastructure", "ai-automations", "application-development"],
    seo: {
      title: "IT Services for Enterprise and Corporate Offices",
      description:
        "Network, meeting-room and identity support for corporate headquarters and enterprise offices.",
    },
    figure: { seed: 18, label: "Dense occupancy", caption: "Wireless and wired capacity designed for concentrated office occupancy." },
  },
];

export const industryBySlug = (slug: string) => industries.find((i) => i.slug === slug);
