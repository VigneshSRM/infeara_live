import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "managed-it",
    order: 1,
    name: "Managed IT Services",
    shortName: "Managed IT",
    tagline: "The operating layer for business-critical IT.",
    summary:
      "Infeara runs the day-to-day operation of your infrastructure: monitoring, patching, backup checks, incident response and reporting, under an agreed service level.",
    intro:
      "Managed IT is our primary practice. We take responsibility for the health of the servers, endpoints, network and backups a business already depends on, and we report against that responsibility every month. Support is not reactive ticket handling; it is a monitored operation with defined response times, an escalation path and a named owner.",
    deliverables: [
      {
        title: "Infrastructure monitoring",
        body: "Servers, endpoints, network devices, storage and backup jobs are watched continuously. Alerts are triaged against severity rather than forwarded to a mailbox.",
      },
      {
        title: "Patch and vulnerability management",
        body: "Operating system and application updates are staged, tested where it matters, and applied on a schedule with a rollback position recorded.",
      },
      {
        title: "Incident management",
        body: "Every incident has a severity, an owner, a communication path and a closure note. Recurring incidents are turned into changes rather than tolerated.",
      },
      {
        title: "Backup and recovery verification",
        body: "Backups are checked for completion and integrity, and restores are tested. A backup that has never been restored is treated as unverified.",
      },
      {
        title: "Reporting and accountability",
        body: "Monthly reporting covers availability, incidents, changes, patching state and open risks, written for a business reader rather than an engineer.",
      },
      {
        title: "Escalation and service levels",
        body: "Response and resolution targets are agreed in writing, with a defined escalation ladder and a review when targets are missed.",
      },
    ],
    outcomes: [
      "A named owner for infrastructure health",
      "Defined response times instead of best efforts",
      "Fewer repeat incidents through root-cause changes",
      "Evidence of patching, backup and recovery state",
    ],
    faqs: [
      {
        question: "What are managed IT services?",
        answer:
          "Managed IT services are an ongoing contract under which a provider operates and supports a business's technology on agreed terms. That covers monitoring, patching, backup checks, incident response, administration and reporting, with defined service levels rather than ad hoc support.",
      },
      {
        question: "What is included in a managed IT contract?",
        answer:
          "A typical contract covers monitoring of servers and endpoints, patch management, backup verification, incident handling, administration of the operating systems and directory, reporting, and an escalation path. The exact scope, response times and exclusions are written into the agreement.",
      },
      {
        question: "How is managed IT different from IT outsourcing?",
        answer:
          "Managed IT is accountability for an outcome: the provider owns monitoring, response and reporting. IT outsourcing supplies people or capacity to work under the client's direction. The two are often combined, but they are different commitments.",
      },
      {
        question: "Do you support existing infrastructure or require a rebuild?",
        answer:
          "We support what is already in place. The first step is an assessment of the current estate, after which we either operate it as it stands or propose specific remediation where a component cannot be supported reliably.",
      },
    ],
    related: ["it-infrastructure", "cybersecurity", "outsourcing-remote-support"],
    seo: {
      title: "Managed IT Services",
      description:
        "Managed IT services from Infeara Technologies: monitoring, patching, backup verification, incident response and monthly reporting under agreed service levels.",
    },
    figure: {
      seed: 1,
      label: "Managed operations",
      caption:
        "A monitoring loop: signals from servers, endpoints and network devices are triaged, assigned and closed, with each closure recorded against a service level.",
    },
  },
  {
    slug: "cybersecurity",
    order: 2,
    name: "Cybersecurity Services",
    shortName: "Cybersecurity",
    tagline: "Assess exposure, test defenses and understand threats.",
    summary:
      "Four focused services for assessing vulnerabilities, testing defenses, modeling threats and analyzing suspicious activity.",
    intro:
      "Cybersecurity brings together preventive assessment and practical response. Select a focused service for vulnerability assessment, penetration testing, threat modeling or threat analysis; each engagement is scoped to the environment and produces prioritized actions.",
    deliverables: [
      {
        title: "Security assessment",
        body: "A review of exposure across identity, endpoints, network perimeter, cloud tenancy and patching, ranked by what an attacker would reach first.",
      },
      {
        title: "Vulnerability management",
        body: "Scanning, validation and prioritisation. Findings are translated into a remediation sequence with owners and dates, not a raw report.",
      },
      {
        title: "Endpoint and firewall management",
        body: "Endpoint protection policies, firewall rule review, and removal of rules that no longer serve a documented purpose.",
      },
      {
        title: "Security monitoring and response",
        body: "Alerting on the events that matter, with a triage path and an incident playbook covering containment, evidence and recovery.",
      },
      {
        title: "Hardening and compliance support",
        body: "Configuration baselines for servers, directory and cloud, with evidence collected for audits such as ISO 27001 readiness where the client is pursuing one.",
      },
    ],
    outcomes: [
      "A prioritised view of real exposure",
      "Remediation with owners and dates",
      "Monitoring with a response path attached",
      "Evidence available for audit questions",
    ],
    faqs: [
      {
        question: "How can a business improve infrastructure security?",
        answer:
          "Start with identity and patching, because those two account for most practical exposure. Then reduce the network perimeter to what is documented, harden the systems that remain, enable logging that can be reviewed, and rehearse what happens when an alert fires.",
      },
      {
        question: "Do you run penetration tests?",
        answer:
          "We scope and coordinate penetration testing and vulnerability assessment, and we act on the findings. Testing without a remediation plan produces a report, not a lower risk position.",
      },
      {
        question: "What happens during a security incident?",
        answer:
          "The response follows an agreed playbook: contain the affected systems, preserve evidence, restore service from a verified source, then document what happened and what changes to prevent a repeat. The client decides on notification obligations with their legal advisers.",
      },
    ],
    related: ["managed-it", "network-engineering", "cloud-datacenter"],
    seo: {
      title: "Cybersecurity Services",
      description:
        "Cybersecurity services for vulnerability assessment, penetration testing, threat modeling and threat analysis across business IT environments.",
    },
    figure: {
      seed: 2,
      label: "Exposure review",
      caption:
        "A ranked exposure map: identity, endpoints, perimeter and cloud tenancy assessed in the order an attacker would reach them.",
    },
  },
  {
    slug: "it-infrastructure",
    order: 3,
    name: "IT Infrastructure",
    shortName: "IT Infrastructure",
    tagline: "The core practice for operating and improving business IT.",
    summary:
      "The core practice for operating and improving business IT, delivered through managed IT, facility management, remote support, network engineering and infrastructure modernisation.",
    intro:
      "IT Infrastructure brings together the services that keep a business technology estate running and ready to change. Choose a focused service below for managed operations, facility management, remote support or network engineering; the core team coordinates them to one operating standard.",
    deliverables: [
      {
        title: "Server deployment and administration",
        body: "Windows and Linux systems provisioned to a standard build, with patching, logging and backup configured before the workload is handed over.",
      },
      {
        title: "Active Directory and identity",
        body: "Directory design, group policy, and the identity hygiene that keeps access aligned with who actually needs it.",
      },
      {
        title: "Virtualisation and storage",
        body: "Compute and storage platforms sized for the workload they carry, with capacity and performance monitored rather than assumed.",
      },
      {
        title: "Modernisation and optimisation",
        body: "Replacement or consolidation of ageing components, planned around maintenance windows and with a tested rollback path.",
      },
      {
        title: "Documentation and handover",
        body: "As-built records, credential and access registers, and operating notes, so the environment can be supported by someone other than the person who built it.",
      },
    ],
    outcomes: [
      "Infrastructure built to a repeatable standard",
      "Backup and monitoring configured at handover",
      "Documentation that survives staff changes",
      "A clear modernisation sequence",
    ],
    faqs: [
      {
        question: "What is included in IT infrastructure management?",
        answer:
          "It covers the servers, virtualisation, storage and directory services that carry business workloads: provisioning, patching, capacity, backup, monitoring and documentation, along with the changes required to keep those components supportable.",
      },
      {
        question: "Can you take over an environment someone else built?",
        answer:
          "Yes, and that is the common case. We start with an assessment that records what exists, what is documented, what is monitored and what is at risk, then agree the remediation sequence before taking operational responsibility.",
      },
      {
        question: "Do you support both Windows and Linux?",
        answer:
          "Both, including mixed estates where directory services, virtualisation and storage span platforms. The operating standard is set per system rather than per platform.",
      },
    ],
    related: ["managed-it", "cloud-datacenter", "network-engineering"],
    seo: {
      title: "IT Infrastructure Services",
      description:
        "Managed IT services, facility management, remote support, network engineering and infrastructure modernisation from one core practice.",
    },
    figure: {
      seed: 3,
      label: "Compute and storage",
      caption:
        "A layered infrastructure view: compute, virtualisation, storage and directory, each with its own monitoring and backup position.",
    },
  },
  {
    slug: "outsourcing-remote-support",
    order: 4,
    name: "Remote IT Services",
    shortName: "Remote IT Services",
    tagline: "Remote support with dedicated capacity when needed.",
    summary:
      "Remote administration, tiered helpdesk coverage and dedicated engineers, from first-line response to senior engineering.",
    intro:
      "Remote IT services provide capacity and continuity when an internal team is small, overloaded or between hires. We combine remote administration, tiered helpdesk cover and dedicated engineer capacity, with responsibilities and decision rights agreed up front.",
    deliverables: [
      {
        title: "Dedicated support resources",
        body: "Engineers assigned to a single client, working to that client's standards, tools and change process.",
      },
      {
        title: "Tiered helpdesk",
        body: "First-line response, second-line diagnosis and third-line engineering, with a documented handover between tiers rather than a ticket queue.",
      },
      {
        title: "Remote administration",
        body: "Day-to-day administration of servers, endpoints and network devices performed remotely under an agreed change process.",
      },
      {
        title: "Troubleshooting and recovery",
        body: "Structured diagnosis for recurring faults, with the fix recorded so the same failure does not return as a surprise.",
      },
    ],
    outcomes: [
      "Coverage without a full internal team",
      "A defined path from first line to engineering",
      "Administration that follows a change process",
      "Continuity during hiring gaps",
    ],
    faqs: [
      {
        question: "How does remote IT support work?",
        answer:
          "An external team takes on defined support responsibilities under an agreement. Requests arrive through an agreed channel, are triaged by severity, worked through defined tiers, and closed with a record. Reporting shows volume, response and recurring causes.",
      },
      {
        question: "Can you work alongside our internal IT team?",
        answer:
          "Yes. The usual arrangement is that internal staff keep ownership of strategy and approvals while we provide cover, specialist engineering or out-of-hours capacity. Responsibilities and decision rights are written down before work starts.",
      },
      {
        question: "Do you provide on-site support?",
        answer:
          "Remote support is the default because it is faster for most work. On-site attendance is arranged where a task requires physical access, such as hardware replacement or structured cabling.",
      },
    ],
    related: ["managed-it", "it-facility-management", "network-engineering"],
    seo: {
      title: "Remote IT Services & Dedicated Support",
      description:
        "Remote IT administration, tiered helpdesk and dedicated engineering capacity from Infeara Technologies.",
    },
    figure: {
      seed: 4,
      label: "Support tiers",
      caption:
        "A tiered support path: first-line response, second-line diagnosis and third-line engineering, with an explicit handover at each step.",
    },
  },
  {
    slug: "cloud-datacenter",
    order: 5,
    name: "Cloud & Datacenter Services",
    shortName: "Cloud & Datacenter",
    tagline: "Migration planned around a way back.",
    summary:
      "Cloud AI and data, managed support, cost optimization, monitoring, application hosting, DevOps automation and tested recovery.",
    intro:
      "Cloud decisions are infrastructure decisions with a time horizon. We plan migrations with a rollback position, run hybrid and private environments where that is the better answer, and connect cloud AI and data, managed operations, cost optimization, monitoring, hosting, DevOps and recovery to a clear operating model.",
    deliverables: [
      {
        title: "Cloud migration",
        body: "Workload assessment, dependency mapping, a migration sequence and a rollback position for each phase.",
      },
      {
        title: "Hybrid and private cloud",
        body: "Environments that combine on-premise capacity with cloud services where latency, data location or cost makes that the correct split.",
      },
      {
        title: "Datacenter deployment",
        body: "Server room and datacenter build-out including power, cooling coordination, rack layout and commissioning.",
      },
      {
        title: "Backup and disaster recovery",
        body: "Backup architecture, retention policy, off-site copies and recovery testing with recorded recovery times.",
      },
      {
        title: "Cloud cost and performance review",
        body: "Periodic review of what is running, what is idle and what is sized incorrectly, with changes proposed against evidence.",
      },
    ],
    outcomes: [
      "A migration sequence with rollback points",
      "Recovery that has been tested, not assumed",
      "Clear data location and residency decisions",
      "Cost reviewed against actual usage",
    ],
    faqs: [
      {
        question: "Should we move everything to the cloud?",
        answer:
          "Usually not. Latency-sensitive systems, large data sets and workloads with strict residency requirements often run better on dedicated capacity. The decision should be made workload by workload, with cost and recovery included in the comparison.",
      },
      {
        question: "How long does a cloud migration take?",
        answer:
          "It depends on the number and dependencies of workloads. A single application can move in weeks; an estate with directory, storage and network dependencies is usually phased over several months, with each phase independently reversible.",
      },
      {
        question: "What does disaster recovery involve?",
        answer:
          "A defined recovery point and recovery time for each system, a copy held somewhere the primary failure does not reach, and a test that proves the restore works. The test is the part most often missing and the part we insist on.",
      },
    ],
    related: ["it-infrastructure", "network-engineering", "managed-it"],
    seo: {
      title: "Cloud & Datacenter Services",
      description:
        "Cloud AI and data services, managed cloud support, cost optimization, monitoring, application hosting, DevOps automation and tested disaster recovery.",
    },
    figure: {
      seed: 5,
      label: "Migration path",
      caption:
        "A phased migration map: workloads assessed, sequenced and moved with a rollback position recorded at each stage.",
    },
  },
  {
    slug: "network-engineering",
    order: 6,
    name: "Network Engineering",
    shortName: "Network Engineering",
    tagline: "The path between systems, designed and documented.",
    summary:
      "LAN and WAN architecture, routing and switching, firewalls, VPN, wireless and performance troubleshooting.",
    intro:
      "Most infrastructure problems present as network problems until someone maps the path. We design and implement network architecture, document what was built, and troubleshoot performance with evidence rather than guesswork.",
    deliverables: [
      {
        title: "Network architecture",
        body: "LAN and WAN design covering segmentation, addressing, redundancy and the traffic paths between systems.",
      },
      {
        title: "Routing, switching and wireless",
        body: "Implementation and configuration of routing, switching and wireless infrastructure, with firmware and change control recorded.",
      },
      {
        title: "Firewall and VPN",
        body: "Rule design with documented purpose, VPN deployment, and periodic review of rules that no longer serve one.",
      },
      {
        title: "Performance troubleshooting",
        body: "Measurement of latency, throughput and packet loss along the actual path, with the bottleneck identified rather than assumed.",
      },
    ],
    outcomes: [
      "A documented network path, not tribal knowledge",
      "Segmentation that limits lateral movement",
      "Firewall rules with documented purpose",
      "Performance measured instead of guessed",
    ],
    faqs: [
      {
        question: "Why does network documentation matter?",
        answer:
          "Because every change and every incident depends on knowing the path traffic takes. Without documentation, troubleshooting becomes trial and error and firewall reviews cannot tell which rules are still needed.",
      },
      {
        question: "Can you improve performance without replacing hardware?",
        answer:
          "Often. Misconfigured links, unnecessary routing hops, poor wireless placement and overloaded segments account for a large share of performance complaints. Measurement shows whether the constraint is configuration or capacity.",
      },
      {
        question: "Do you manage firewalls?",
        answer:
          "Yes, including rule review, change control and periodic cleanup. A firewall that only ever accumulates rules eventually stops being an effective control.",
      },
    ],
    related: ["cybersecurity", "cloud-datacenter", "it-facility-management"],
    seo: {
      title: "Network Engineering",
      description:
        "Network architecture, LAN and WAN implementation, routing, switching, firewall configuration, VPN and wireless infrastructure.",
    },
    figure: {
      seed: 6,
      label: "Network path",
      caption:
        "A traced network path: segments, routing hops and perimeter controls measured end to end rather than assumed.",
    },
  },
  {
    slug: "it-facility-management",
    order: 7,
    name: "IT Facility Management",
    shortName: "IT Facility Management",
    tagline: "Assets tracked from purchase to retirement.",
    summary:
      "Asset lifecycle, IT infrastructure maintenance, datacenter coordination, inventory and onsite operations.",
    intro:
      "Facility management is the physical and administrative side of IT: what equipment exists, where it is, what state it is in, and when it will fail. We keep that record current and act on it before an asset becomes an outage.",
    deliverables: [
      {
        title: "IT asset management",
        body: "A register of hardware, ownership, location, warranty and lifecycle state, reconciled against what is actually installed.",
      },
      {
        title: "Hardware lifecycle",
        body: "Replacement planning based on age, support status and failure history rather than on year-end budget timing alone.",
      },
      {
        title: "Preventive maintenance",
        body: "Scheduled checks of power, cooling, storage health and firmware, with findings turned into work orders.",
      },
      {
        title: "Onsite coordination",
        body: "Attendance for physical work, vendor coordination and datacenter access, recorded in the asset history.",
      },
    ],
    outcomes: [
      "An asset register that matches reality",
      "Replacement planned before failure",
      "Maintenance with a recorded history",
      "Vendor visits coordinated, not improvised",
    ],
    faqs: [
      {
        question: "What does IT facility management cover?",
        answer:
          "The physical estate: hardware assets and their lifecycle, server room and datacenter conditions, preventive maintenance, inventory accuracy and onsite coordination for work that cannot be done remotely.",
      },
      {
        question: "Do we need a full asset register?",
        answer:
          "If you operate hardware you depend on, yes. Without one, warranty dates, replacement planning and incident history are guesses. The register is usually built during the first assessment and kept current afterwards.",
      },
      {
        question: "Can this be combined with managed IT?",
        answer:
          "It is normally part of the same agreement. Monitoring tells you a disk is failing; facility management tells you which asset it is, what warranty covers it and when a replacement can be scheduled.",
      },
    ],
    related: ["managed-it", "turnkey-projects", "it-infrastructure"],
    seo: {
      title: "IT Facility Management",
      description:
        "IT asset management, hardware lifecycle planning, preventive maintenance, datacenter coordination and onsite IT operations.",
    },
    figure: {
      seed: 7,
      label: "Asset lifecycle",
      caption:
        "An asset register in use: purchase, warranty, maintenance and replacement dates tracked against installed equipment.",
    },
  },
  {
    slug: "turnkey-projects",
    order: 8,
    name: "Turnkey IT Infrastructure Projects",
    shortName: "Turnkey Projects",
    tagline: "Survey, build, commission, document.",
    summary:
      "Site surveys, structured cabling, server rooms, network build-out, procurement coordination, commissioning and handover.",
    intro:
      "Some work has to be delivered as a project: a new site, a server room, a network build-out. We survey, design, implement, commission and document it, with the acceptance criteria agreed before work starts.",
    deliverables: [
      {
        title: "Site survey and consultation",
        body: "A survey of the physical space, power, cooling, containment and access constraints before any design is committed.",
      },
      {
        title: "Structured cabling and network build",
        body: "Cabling, containment, patching and network implementation delivered to a documented standard with test results.",
      },
      {
        title: "Server room and datacenter setup",
        body: "Rack layout, power distribution, cooling coordination and equipment installation, commissioned against a checklist.",
      },
      {
        title: "Procurement coordination",
        body: "Specification and vendor coordination for hardware, with delivery and warranty terms checked against the design.",
      },
      {
        title: "Commissioning and documentation",
        body: "Acceptance testing, as-built records, labelling and handover notes, followed by a post-deployment support window.",
      },
    ],
    outcomes: [
      "Acceptance criteria agreed before work starts",
      "As-built documentation at handover",
      "Test results rather than assurances",
      "A support path after commissioning",
    ],
    faqs: [
      {
        question: "What is a turnkey IT infrastructure project?",
        answer:
          "A single contract that covers survey, design, implementation, commissioning and documentation, so the client receives a working environment rather than a set of separate installations to coordinate.",
      },
      {
        question: "How is acceptance decided?",
        answer:
          "Through written acceptance criteria agreed before work begins: cable test results, commissioning checks, labelling and documentation. The project closes when those criteria are met, not when the equipment is installed.",
      },
      {
        question: "Do you handle hardware procurement?",
        answer:
          "We specify and coordinate procurement, and we check that what arrives matches the design and carries the expected warranty. The client can buy directly or through us.",
      },
    ],
    related: ["it-facility-management", "network-engineering", "it-infrastructure"],
    seo: {
      title: "Turnkey IT Infrastructure Projects",
      description:
        "Site surveys, structured cabling, server room and datacenter build-out, procurement coordination, commissioning and documentation.",
    },
    figure: {
      seed: 8,
      label: "Project build",
      caption:
        "A project sequence: survey, design, implementation, commissioning and handover, with acceptance agreed up front.",
    },
  },
  {
    slug: "ai-automations",
    order: 9,
    name: "AI Automations",
    shortName: "AI Automations",
    tagline: "Put repeatable work on a reliable path.",
    summary:
      "AI chatbot and caller development, LLM engineering and controlled IT infrastructure automations for connected business workflows.",
    intro:
      "We map the process before automating it, then choose where rules-based automation or AI assistance is useful. Workflows include defined permissions, validation, logs, exception handling and human review where a decision needs it.",
    deliverables: [
      {
        title: "Process and suitability review",
        body: "Identify repeated tasks, data sources, decision points and failure cases before selecting an automation approach.",
      },
      {
        title: "Workflow automation",
        body: "Route requests, approvals, notifications and routine updates across the systems your team already uses.",
      },
      {
        title: "AI-assisted information handling",
        body: "Support document classification, extraction, summarisation and knowledge lookup with validation and human review built into the workflow.",
      },
      {
        title: "Integrations and controls",
        body: "Connect approved services through APIs with scoped access, execution logs, retry behaviour and clear exception paths.",
      },
      {
        title: "Testing and handover",
        body: "Test normal and failure cases, document the workflow and hand over operating guidance and ownership.",
      },
    ],
    outcomes: [
      "Less time spent on repetitive process steps",
      "Clear records of automated actions and exceptions",
      "Human review retained for decisions that need it",
      "Documented workflows with defined ownership",
    ],
    faqs: [
      {
        question: "What is AI automation?",
        answer:
          "It combines workflow rules and, where useful, AI assistance to handle repeatable work such as routing requests or extracting information from documents. Each use case is scoped to the process, data and systems involved.",
      },
      {
        question: "How do you keep automated workflows reliable?",
        answer:
          "We define permissions, test expected and failure cases, record actions and provide exception paths. Human approval stays in place where a decision should not run without review.",
      },
      {
        question: "Do we need a custom AI model?",
        answer:
          "Not necessarily. We first assess whether an approved existing model or rules-based workflow meets the need and data-handling requirements. Custom model work is considered only when there is a clear case for it.",
      },
    ],
    related: ["application-development", "managed-it", "cloud-datacenter"],
    seo: {
      title: "AI Automation Services",
      description:
        "AI chatbot and caller development, LLM engineering and infrastructure automation with integrations, human review and documented handover.",
    },
    figure: {
      seed: 19,
      label: "Automation flow",
      caption:
        "An AI-assisted workflow with scoped access, validation, a human review point, recorded actions and an exception path.",
    },
  },
  {
    slug: "application-development",
    order: 10,
    name: "Application Development",
    shortName: "Application Development",
    tagline: "Build software around the work your team does.",
    summary:
      "Custom web applications, business websites and mobile apps, delivered with tested code, connected systems and a clear handover.",
    intro:
      "We develop web applications around the people, processes and systems that need to use them. The work covers requirements, interface design, application logic, data and API integration, testing, release and documentation, with security and maintainability considered throughout.",
    deliverables: [
      {
        title: "Requirements and scope",
        body: "Agree user roles, core workflows, data needs, integrations and acceptance criteria before implementation begins.",
      },
      {
        title: "Web applications and portals",
        body: "Build internal tools, customer portals, operational dashboards and workflow applications to suit the agreed use case.",
      },
      {
        title: "APIs and data integration",
        body: "Connect existing systems through supported APIs and data interfaces, with validation and failure behaviour defined.",
      },
      {
        title: "Testing and release",
        body: "Test key workflows and edge cases, prepare a controlled release and document the deployment and rollback steps.",
      },
      {
        title: "Source code and handover",
        body: "Provide the agreed source code, setup instructions and technical documentation so the application can be maintained after delivery.",
      },
    ],
    outcomes: [
      "An application designed for agreed user workflows",
      "Integrations with documented boundaries and failure handling",
      "Tested release and deployment instructions",
      "Source code and documentation for ongoing ownership",
    ],
    faqs: [
      {
        question: "What types of applications do you build?",
        answer:
          "We build web applications such as internal portals, operational dashboards, request and approval tools, and customer-facing interfaces. Scope is based on the users, process and systems involved.",
      },
      {
        question: "Can a new application connect to our existing systems?",
        answer:
          "Yes, when the systems expose a supported API or data interface. We confirm access, security and technical constraints during discovery and document them in the agreed scope.",
      },
      {
        question: "Who owns the application after handover?",
        answer:
          "The delivery includes the agreed source code and documentation. Hosting, third-party services, maintenance and support are defined separately so ongoing responsibilities are clear.",
      },
    ],
    related: ["ai-automations", "cybersecurity", "cloud-datacenter"],
    seo: {
      title: "Custom Application Development Services",
      description:
        "Web application, website and mobile application development for connected business workflows, with tested releases and source-code handover.",
    },
    figure: {
      seed: 20,
      label: "Application workflow",
      caption:
        "A custom application moving from user requirements and interface design through integration, testing, release and handover.",
    },
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
