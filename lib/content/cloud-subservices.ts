import type { Faq } from "./types";
import { cloudSubserviceSlugs } from "./service-taxonomy";

export type CloudSubservice = {
  slug: (typeof cloudSubserviceSlugs)[number];
  name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  seo: { title: string; description: string };
  figure: { seed: number; label: string; caption: string };
  infographic: {
    title: string;
    steps: { title: string; description: string }[];
  };
};

export const cloudSubservices: CloudSubservice[] = [
  {
    slug: "cloud-ai-data-services",
    name: "Cloud AI & Data Services",
    tagline: "Make cloud data useful, governed and ready to grow.",
    summary:
      "Cloud data engineering, analytics and AI workload design with clear controls for access, data quality, security and ongoing operations.",
    intro:
      "We help teams shape cloud data platforms and AI workloads around a defined business use case. The work starts with data readiness and ownership, then covers architecture, integration, governance, deployment and the operating controls needed to keep the platform useful and supportable.",
    deliverables: [
      { title: "Use-case and data readiness", body: "Clarify the decision or workflow to improve, identify relevant data sources, and assess quality, access, retention and ownership." },
      { title: "Cloud data architecture", body: "Design ingestion, storage and processing paths that fit the required scale, latency, residency and security boundaries." },
      { title: "Analytics and AI workloads", body: "Implement agreed analytics or AI capabilities with traceable inputs, validation and human review where decisions require it." },
      { title: "Governance and operations", body: "Set access controls, logging, monitoring, cost visibility and ownership for the platform after launch." },
    ],
    outcomes: [
      "A defined data path with named owners",
      "Analytics built around agreed use cases and quality checks",
      "AI workloads with access, review and operating controls",
    ],
    faqs: [
      { question: "What is included in cloud AI and data services?", answer: "Depending on scope, work can include data readiness, cloud architecture, ingestion pipelines, analytics, AI workload integration, governance and operational monitoring." },
      { question: "Do we need to build a custom AI model?", answer: "Not always. We first evaluate whether existing services or models can meet the use case, data-handling rules and expected operating cost. Custom development is considered only when it is justified." },
      { question: "How do you protect sensitive data?", answer: "Access, encryption, retention, logging and data residency are designed into the proposed platform. The exact controls are agreed against the data classification and applicable requirements." },
    ],
    seo: {
      title: "Cloud AI & Data Services",
      description: "Cloud data engineering, analytics and AI workload services with governance, access controls and operational monitoring.",
    },
    figure: {
      seed: 301,
      label: "Cloud AI and data",
      caption: "Governed data flows support analytics and AI workloads with clear ownership, access and review controls.",
    },
    infographic: {
      title: "From source data to governed insight",
      steps: [
        { title: "Connect", description: "Map approved sources and owners." },
        { title: "Govern", description: "Set access, quality and retention." },
        { title: "Analyze", description: "Apply analytics or AI to a defined use." },
        { title: "Operate", description: "Monitor outputs, access and cost." },
      ],
    },
  },
  {
    slug: "managed-cloud-support-msp",
    name: "Managed Cloud Support Services (MSP)",
    tagline: "Keep cloud operations owned, monitored and supportable.",
    summary:
      "Ongoing cloud administration, monitoring, incident handling, security hygiene and service reporting under an agreed support scope.",
    intro:
      "A managed cloud service gives teams a defined operating path for the environment after deployment. We agree which subscriptions, workloads and controls are covered, then provide administration, monitoring, incident coordination and regular service evidence to the agreed coverage and response terms.",
    deliverables: [
      { title: "Service onboarding", body: "Record accounts, subscriptions, owners, critical workloads, access paths, dependencies and support boundaries." },
      { title: "Cloud administration", body: "Manage agreed configuration, identity, capacity, patch coordination and routine operational changes." },
      { title: "Monitoring and incident response", body: "Review alerts against agreed severity, coordinate investigation and escalation, and record actions through closure." },
      { title: "Service reporting", body: "Review availability signals, incidents, changes, backup status, risks and follow-up actions on an agreed cadence." },
    ],
    outcomes: [
      "A named operating scope and escalation path",
      "Consistent administration with recorded changes",
      "Service reviews based on operating evidence",
    ],
    faqs: [
      { question: "What does a managed cloud support service cover?", answer: "The scope can include cloud account administration, monitoring, incident coordination, identity and access hygiene, backup checks, change records and service reporting. Coverage and response targets are agreed in writing." },
      { question: "Can you support a cloud environment built by another provider?", answer: "Yes. We begin with a transition review to understand the tenant, workloads, access, monitoring and open risks before accepting the agreed operating scope." },
      { question: "Do you provide 24/7 support?", answer: "Support hours and response commitments depend on the selected service agreement. We document the coverage, severity definitions and escalation contacts before service starts." },
    ],
    seo: {
      title: "Managed Cloud Support Services (MSP)",
      description: "Managed cloud administration, monitoring, incident coordination and service reporting with agreed support coverage.",
    },
    figure: {
      seed: 302,
      label: "Managed cloud operations",
      caption: "Cloud support follows an agreed path from monitoring and triage through action, escalation and service review.",
    },
    infographic: {
      title: "A managed cloud operating loop",
      steps: [
        { title: "Discover", description: "Record workloads, owners and boundaries." },
        { title: "Monitor", description: "Review health and agreed service signals." },
        { title: "Respond", description: "Triage, act and escalate by severity." },
        { title: "Report", description: "Review service evidence and open actions." },
      ],
    },
  },
  {
    slug: "cloud-cost-optimization",
    name: "Cloud Cost Optimization & Consulting",
    tagline: "Align cloud spend with workloads and business priorities.",
    summary:
      "Cloud cost visibility, workload reviews, right-sizing recommendations and governance practices based on actual usage and requirements.",
    intro:
      "Cloud cost optimization is an ongoing engineering and governance task, not a one-time promise of savings. We review billing and utilization signals alongside availability, performance, recovery and growth requirements, then prioritize changes that are safe to make and practical to measure.",
    deliverables: [
      { title: "Cost and usage baseline", body: "Organize spend by account, service, environment or owner and identify gaps in tags, budgets and allocation." },
      { title: "Workload and capacity review", body: "Compare resource sizing and utilization with performance, availability and recovery requirements." },
      { title: "Optimization plan", body: "Prioritize right-sizing, scheduling, storage lifecycle and commitment options with risks and dependencies recorded." },
      { title: "Governance and review", body: "Set budget alerts, ownership and a regular review cycle so changes can be checked against actual usage." },
    ],
    outcomes: [
      "Spend linked to workloads and owners",
      "Optimization actions ranked by impact and operational risk",
      "Ongoing cost governance and review cadence",
    ],
    faqs: [
      { question: "Can you guarantee a specific percentage of savings?", answer: "No. Results depend on current architecture, usage patterns, commercial terms and service constraints. We establish a baseline and propose measurable changes rather than promise an unsupported percentage." },
      { question: "Will cost changes affect performance or availability?", answer: "Recommendations are reviewed against workload requirements and change controls. Any action that could affect service is tested and scheduled with an agreed rollback position." },
      { question: "Which cloud platforms can you review?", answer: "We can assess major public cloud and hybrid environments where billing and utilization data are available. The required access and data sources are agreed during scoping." },
    ],
    seo: {
      title: "Cloud Cost Optimization & Consulting",
      description: "Cloud cost and utilization reviews, right-sizing guidance, budget controls and ongoing optimization governance.",
    },
    figure: {
      seed: 303,
      label: "Cloud cost review",
      caption: "Usage and cost are evaluated together with performance, availability and recovery needs before changes are prioritized.",
    },
    infographic: {
      title: "Optimize against actual usage",
      steps: [
        { title: "Baseline", description: "Attribute spend and usage to owners." },
        { title: "Analyze", description: "Compare capacity with workload needs." },
        { title: "Adjust", description: "Prioritize safe, measurable changes." },
        { title: "Review", description: "Check results and update budgets." },
      ],
    },
  },
  {
    slug: "cloud-disaster-recovery-business-continuity",
    name: "Cloud Disaster Recovery & Business Continuity",
    tagline: "Know how critical services recover before an outage.",
    summary:
      "Cloud recovery architecture, continuity planning, replication choices and practical recovery exercises tied to defined business objectives.",
    intro:
      "A cloud recovery plan is useful only when the business can execute and test it. We identify critical services, dependencies and recovery objectives, then design the appropriate backup or replication approach and rehearse the runbook so gaps are recorded before a real disruption.",
    deliverables: [
      { title: "Business impact and recovery objectives", body: "Identify critical services, dependencies, acceptable data loss and recovery time targets with the business owners." },
      { title: "Recovery architecture", body: "Select backup, replication and alternate-environment patterns according to risk, cost and service requirements." },
      { title: "Runbooks and responsibilities", body: "Document decision points, access, escalation, restoration sequence and communications responsibilities." },
      { title: "Recovery exercises", body: "Plan and conduct agreed tests, capture actual recovery evidence and track corrective actions." },
    ],
    outcomes: [
      "Recovery objectives that reflect business priorities",
      "Documented dependencies and recovery responsibilities",
      "Test evidence and a tracked improvement plan",
    ],
    faqs: [
      { question: "What is the difference between disaster recovery and business continuity?", answer: "Disaster recovery focuses on restoring technology and data. Business continuity also covers people, processes, communications and alternate ways to deliver essential services during disruption." },
      { question: "How often should recovery be tested?", answer: "The cadence should reflect service criticality, change frequency and business requirements. At minimum, tests should be repeated after material architecture changes and at the interval agreed with service owners." },
      { question: "Can cloud replication replace backups?", answer: "No. Replication can copy corruption or deletion as well as good data. Recovery design normally combines protected backups with replication or alternate capacity where appropriate." },
    ],
    seo: {
      title: "Cloud Disaster Recovery & Business Continuity",
      description: "Cloud recovery planning, backup and replication design, runbooks and tested business continuity exercises.",
    },
    figure: {
      seed: 304,
      label: "Cloud recovery planning",
      caption: "Recovery objectives, protected copies and rehearsed runbooks make continuity practical and testable.",
    },
    infographic: {
      title: "Plan, rehearse and improve recovery",
      steps: [
        { title: "Define", description: "Set service priorities and recovery targets." },
        { title: "Protect", description: "Choose backup and replication paths." },
        { title: "Rehearse", description: "Test the runbook and record timings." },
        { title: "Improve", description: "Close gaps and repeat after change." },
      ],
    },
  },
  {
    slug: "cloud-monitoring-management",
    name: "Cloud Monitoring & Management",
    tagline: "Turn cloud signals into clear operational action.",
    summary:
      "Cloud resource health, performance, logs and alerts configured around service importance, ownership and practical response paths.",
    intro:
      "Cloud monitoring should show whether a service is healthy and help the right person decide what to do next. We identify meaningful signals, assign ownership, reduce noisy alerts and connect monitoring to response and service review rather than treating dashboards as the outcome.",
    deliverables: [
      { title: "Service and resource inventory", body: "Map cloud resources to applications, owners, dependencies and service criticality." },
      { title: "Metrics, logs and health checks", body: "Select signals for availability, capacity, performance and errors that are useful for the actual workload." },
      { title: "Alert design and routing", body: "Set thresholds, severity, deduplication and destinations so actionable issues reach the right team." },
      { title: "Operational review", body: "Review incidents, trends and monitoring gaps, then tune coverage as systems change." },
    ],
    outcomes: [
      "Service health signals tied to owners",
      "Alerts prioritized by operational impact",
      "Monitoring coverage reviewed as architecture changes",
    ],
    faqs: [
      { question: "What should be monitored in a cloud environment?", answer: "Start with service availability, application errors, resource capacity, critical dependencies, security-relevant events and backup status. The exact signals depend on each workload and its service objectives." },
      { question: "Can you reduce alert noise?", answer: "Yes. We review thresholds, duplicate events, ownership and escalation logic, then tune rules against observed behavior and the agreed response process." },
      { question: "Do you provide 24/7 monitoring?", answer: "Monitoring and response coverage are distinct. We can configure continuous alerting and agree the operating hours, acknowledgement targets and escalation coverage in the service scope." },
    ],
    seo: {
      title: "Cloud Monitoring & Management",
      description: "Cloud health and performance monitoring, actionable alerting, resource administration and operational reviews.",
    },
    figure: {
      seed: 305,
      label: "Cloud monitoring",
      caption: "Metrics, logs and alerts are mapped to service owners and response paths, then tuned through operational review.",
    },
    infographic: {
      title: "From telemetry to action",
      steps: [
        { title: "Collect", description: "Gather useful health and performance signals." },
        { title: "Correlate", description: "Connect alerts with services and owners." },
        { title: "Route", description: "Send actionable events to responders." },
        { title: "Tune", description: "Review noise, gaps and recurring issues." },
      ],
    },
  },
  {
    slug: "cloud-application-hosting",
    name: "Cloud Application Hosting",
    tagline: "Host business applications with a clear operating model.",
    summary:
      "Cloud environments for business applications, with deployment planning, identity, network, backup, monitoring and support responsibilities defined.",
    intro:
      "Application hosting begins with the workload, not the cloud service menu. We assess dependencies, performance needs, data location, availability and recovery requirements, then design and operate an appropriate hosting environment with clear handover and support boundaries.",
    deliverables: [
      { title: "Workload and dependency review", body: "Map runtime, data, integrations, access, performance and continuity requirements before selecting a hosting pattern." },
      { title: "Hosting environment design", body: "Plan accounts, networks, identity, compute, storage, security controls and capacity for the agreed application." },
      { title: "Deployment and transition", body: "Coordinate release, validation, cutover and rollback steps with application and infrastructure owners." },
      { title: "Operations and lifecycle", body: "Define monitoring, backup, patching, scaling, support and maintenance responsibilities after launch." },
    ],
    outcomes: [
      "Hosting architecture tied to application needs",
      "Controlled deployment with a rollback position",
      "Clear ownership for ongoing application operations",
    ],
    faqs: [
      { question: "Can you host an existing application?", answer: "Yes, subject to a workload assessment. We review dependencies, software support, data, connectivity and recovery needs before recommending a migration or hosting plan." },
      { question: "Can hosting include application support?", answer: "Infrastructure hosting and application-level support can be combined when the required responsibilities, access, response scope and vendor dependencies are agreed." },
      { question: "How do you plan a hosting migration?", answer: "We map dependencies, prepare the environment, validate the application, schedule a controlled cutover and document the rollback path before moving production traffic." },
    ],
    seo: {
      title: "Cloud Application Hosting Services",
      description: "Cloud application hosting with workload assessment, controlled deployment, security, monitoring and defined operations.",
    },
    figure: {
      seed: 306,
      label: "Cloud application hosting",
      caption: "Application dependencies, environment design, release checks and operating responsibilities are planned together.",
    },
    infographic: {
      title: "Host the workload, not just the server",
      steps: [
        { title: "Assess", description: "Map runtime, data and dependencies." },
        { title: "Design", description: "Set identity, network and capacity." },
        { title: "Deploy", description: "Validate release and rollback steps." },
        { title: "Operate", description: "Monitor, protect and maintain service." },
      ],
    },
  },
  {
    slug: "cloud-devops-automation",
    name: "Cloud DevOps & Automation",
    tagline: "Make cloud delivery repeatable, tested and observable.",
    summary:
      "Cloud infrastructure automation and delivery pipelines that reduce manual release steps while keeping approvals, security checks and rollback visible.",
    intro:
      "DevOps and automation improve delivery when they make changes repeatable without hiding risk. We review the current release path, then implement suitable infrastructure-as-code, build and deployment workflows with access controls, validation, approvals and an agreed rollback method.",
    deliverables: [
      { title: "Delivery workflow assessment", body: "Map source, environments, approvals, deployment steps, secrets and release dependencies." },
      { title: "Infrastructure as code", body: "Represent agreed cloud configuration in reviewable, version-controlled templates or code." },
      { title: "Build and release automation", body: "Automate selected build, test and deployment steps with controlled promotion between environments." },
      { title: "Security and operations", body: "Add access boundaries, secret handling, change records, pipeline monitoring and failure recovery guidance." },
    ],
    outcomes: [
      "Repeatable cloud configuration and releases",
      "Review and approval points preserved in the pipeline",
      "Clear failure and rollback procedures for deployments",
    ],
    faqs: [
      { question: "Do we need a full CI/CD platform to start?", answer: "No. We assess the existing repository, cloud platform and release process, then automate the highest-value steps using tools the team can maintain." },
      { question: "Can infrastructure changes still require approval?", answer: "Yes. Code review, environment promotion and production approval can remain explicit controls within an automated workflow." },
      { question: "What happens when a deployment fails?", answer: "The workflow should stop safely, retain logs and provide a tested rollback or recovery step appropriate to the application and infrastructure change." },
    ],
    seo: {
      title: "Cloud DevOps & Automation Services",
      description: "Cloud infrastructure-as-code, build and release automation with security checks, approvals and rollback procedures.",
    },
    figure: {
      seed: 307,
      label: "Cloud DevOps pipeline",
      caption: "A controlled delivery path connects infrastructure code, tests, approvals, release and operational feedback.",
    },
    infographic: {
      title: "A controlled cloud delivery pipeline",
      steps: [
        { title: "Commit", description: "Review and version infrastructure changes." },
        { title: "Build", description: "Validate code and run selected tests." },
        { title: "Release", description: "Promote changes with clear approvals." },
        { title: "Observe", description: "Track health and improve the workflow." },
      ],
    },
  },
];

export const cloudSubserviceBySlug = (slug: string) =>
  cloudSubservices.find((service) => service.slug === slug) ?? null;
