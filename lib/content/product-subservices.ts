import type { Faq } from "./types";
import { aiAutomationSubserviceSlugs, applicationDevelopmentSubserviceSlugs } from "./service-taxonomy";

export type ProductSubserviceGroup = "ai-automations" | "application-development";
type ProductSubserviceSlug =
  | (typeof aiAutomationSubserviceSlugs)[number]
  | (typeof applicationDevelopmentSubserviceSlugs)[number];

export type ProductSubservice = {
  slug: ProductSubserviceSlug;
  group: ProductSubserviceGroup;
  parentName: string;
  parentHref: string;
  name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  seo: { title: string; description: string };
  figure: { seed: number; label: string; caption: string };
  infographic: { title: string; steps: { title: string; description: string }[] };
};

export const productSubservices: ProductSubservice[] = [
  {
    slug: "ai-chatbot-development",
    group: "ai-automations",
    parentName: "AI Automations",
    parentHref: "/services/ai-automations",
    name: "AI ChatBot Development",
    tagline: "Build useful conversations around your real processes.",
    summary: "Custom AI chatbots for customer support, internal knowledge and guided workflows, with approved data sources, safe handoffs and measurable evaluation.",
    intro: "A useful chatbot needs more than a language model. We define the audience and supported tasks, connect approved knowledge, design clear boundaries and human escalation, then evaluate answers against realistic questions before release.",
    deliverables: [
      { title: "Conversation and use-case design", body: "Map user intents, supported questions, unavailable answers and the points where a person must take over." },
      { title: "Knowledge and system connections", body: "Connect approved documents or APIs with access controls, source attribution and a refresh process." },
      { title: "Safety and handoff", body: "Set refusal behavior, sensitive-data boundaries, escalation paths, logging and feedback capture." },
      { title: "Testing and launch", body: "Evaluate representative conversations, edge cases and response quality, then document ownership and ongoing review." },
    ],
    outcomes: ["A chatbot scoped to specific user tasks", "Responses grounded in approved knowledge sources", "Clear escalation when the bot cannot safely answer"],
    faqs: [
      { question: "Can the chatbot use our internal documents?", answer: "Yes, if the documents are approved for that use. We plan access, indexing, source attribution, update frequency and permission boundaries as part of the design." },
      { question: "Will the chatbot always answer correctly?", answer: "No AI system can guarantee that. We test against agreed examples, show appropriate uncertainty, provide a human handoff and monitor feedback to improve the experience." },
      { question: "Can you add the chatbot to our existing website or support portal?", answer: "Yes, subject to the platform and security requirements. We scope the integration, authentication, data exchange and operating ownership before implementation." },
    ],
    seo: { title: "AI ChatBot Development Services", description: "Custom AI chatbot development with approved knowledge sources, safe escalation, evaluation and integration." },
    figure: { seed: 401, label: "AI chatbot development", caption: "A purpose-built chatbot connects approved knowledge to a tested conversation, with a human handoff when needed." },
    infographic: { title: "Design a grounded AI conversation", steps: [
      { title: "Discover", description: "Define users, intents and boundaries." },
      { title: "Connect", description: "Ground replies in approved knowledge." },
      { title: "Evaluate", description: "Test answers and safe handoffs." },
      { title: "Improve", description: "Review feedback and update sources." },
    ] },
  },
  {
    slug: "ai-callers-development",
    group: "ai-automations",
    parentName: "AI Automations",
    parentHref: "/services/ai-automations",
    name: "AI Callers Development",
    tagline: "Automate routine voice interactions with human oversight.",
    summary: "Voice assistants for defined inbound and outbound tasks such as appointment coordination and service updates, designed around consent, disclosure and a clear transfer to staff.",
    intro: "Voice automation should make routine interactions easier without obscuring who is calling or removing access to a person. We define allowed call purposes and consent requirements, create the conversation flow, connect approved scheduling or service systems, and test interruptions, failed recognition and escalation before launch.",
    deliverables: [
      { title: "Call purpose and consent rules", body: "Document permitted audiences, call timing, disclosures, opt-out handling, recording rules and escalation triggers." },
      { title: "Voice conversation design", body: "Create concise prompts, turn-taking, confirmation steps and recovery behavior for misunderstood or incomplete responses." },
      { title: "Telephony and system integration", body: "Connect approved calling infrastructure with scheduling, ticketing or customer systems using scoped data access." },
      { title: "Quality and oversight", body: "Test realistic call scenarios, review call outcomes and provide staff transfer, audit and improvement processes." },
    ],
    outcomes: ["Voice automation limited to agreed call tasks", "Clear disclosure, consent and opt-out handling", "A reliable route to a human agent"],
    faqs: [
      { question: "What kinds of calls can an AI caller handle?", answer: "Typical scoped uses include appointment reminders, scheduling assistance and routine service updates. The purpose, audience, disclosures, consent and escalation rules are agreed before deployment." },
      { question: "Can a caller transfer someone to a person?", answer: "Yes. Human transfer is part of the conversation design, with defined triggers such as a request for staff, uncertainty, a complaint or an out-of-scope question." },
      { question: "Do you support call recording?", answer: "Recording is optional and subject to applicable consent and retention requirements. We define whether calls are recorded, how notice is provided, who can access recordings and when they are deleted." },
    ],
    seo: { title: "AI Callers Development Services", description: "Responsible AI voice caller development for defined service workflows, with consent, opt-out and human escalation controls." },
    figure: { seed: 402, label: "AI voice caller development", caption: "A supervised voice workflow confirms intent, handles routine tasks and transfers uncertain calls to a person." },
    infographic: { title: "A responsible AI voice interaction", steps: [
      { title: "Authorize", description: "Set purpose, consent and disclosure." },
      { title: "Engage", description: "Use clear prompts and confirmations." },
      { title: "Resolve", description: "Complete the approved routine task." },
      { title: "Transfer", description: "Escalate uncertainty to a person." },
    ] },
  },
  {
    slug: "llm-development",
    group: "ai-automations",
    parentName: "AI Automations",
    parentHref: "/services/ai-automations",
    name: "LLM Development",
    tagline: "Engineer language-model solutions against clear evaluation criteria.",
    summary: "Language-model application design, retrieval-augmented generation, prompt and tool orchestration, evaluation and deployment controls aligned to your data and product needs.",
    intro: "We help teams choose and engineer a language-model approach for a defined product or workflow. That may mean integrating a managed model, grounding responses in private content, connecting tools, or adapting a model when evidence supports it. Quality, privacy, latency, cost and operational ownership are evaluated before production use.",
    deliverables: [
      { title: "Model and use-case assessment", body: "Compare candidate approaches against task quality, data boundaries, latency, cost, hosting and ongoing support needs." },
      { title: "Retrieval and orchestration", body: "Build document retrieval, structured tool use and response workflows with permission checks and traceable sources." },
      { title: "Evaluation and guardrails", body: "Create representative test sets and measure factuality, relevance, refusal behavior, robustness and regression over time." },
      { title: "Deployment and monitoring", body: "Plan versioning, observability, access, fallback behavior and a review path for model or prompt changes." },
    ],
    outcomes: ["A model approach justified by task and constraints", "Repeatable evaluation before and after changes", "Production controls for data, access and model behavior"],
    faqs: [
      { question: "Does LLM development mean training a model from scratch?", answer: "Usually not. We first assess managed models, retrieval and prompt or tool orchestration. Fine-tuning or custom training is considered only when it is appropriate for the data, task and operating budget." },
      { question: "Can a language model work with private company data?", answer: "Yes, with an architecture that enforces access controls and approved data handling. We evaluate provider terms, data retention, permissions, retrieval and logging as part of the design." },
      { question: "How do you measure model quality?", answer: "We agree a representative evaluation set and assess task-specific measures such as relevance, groundedness, correct tool use, refusal behavior, latency and cost." },
    ],
    seo: { title: "LLM Development Services", description: "LLM application engineering, retrieval, orchestration, evaluation and production controls for business use cases." },
    figure: { seed: 403, label: "LLM engineering", caption: "Model selection, retrieval, evaluation and monitoring form a repeatable engineering lifecycle for language-model applications." },
    infographic: { title: "Engineer an LLM solution end to end", steps: [
      { title: "Select", description: "Match a model to task and constraints." },
      { title: "Ground", description: "Connect controlled data and tools." },
      { title: "Evaluate", description: "Measure quality, risk and cost." },
      { title: "Deploy", description: "Monitor versions and live behavior." },
    ] },
  },
  {
    slug: "it-infrastructure-ai-automations",
    group: "ai-automations",
    parentName: "AI Automations",
    parentHref: "/services/ai-automations",
    name: "IT Infrastructure AI Automations",
    tagline: "Bring controlled automation to infrastructure operations.",
    summary: "AI-assisted incident triage, operational knowledge lookup and approved infrastructure workflows that keep change controls, engineer review and audit records in place.",
    intro: "Infrastructure automation must not turn a suggested action into an uncontrolled production change. We connect approved telemetry and runbooks to triage or orchestration workflows, define which actions can run automatically, and preserve review, approval, rollback and audit steps for consequential changes.",
    deliverables: [
      { title: "Operations workflow assessment", body: "Map alert sources, runbooks, access boundaries, repeat incidents and the operational decisions that can be safely assisted." },
      { title: "Triage and knowledge workflows", body: "Summarize incident context, retrieve relevant procedures and route events to the correct team with source links." },
      { title: "Approved remediation automation", body: "Automate low-risk, reversible tasks where authorized; require engineer approval for production-impacting changes." },
      { title: "Audit and rollback controls", body: "Record inputs, decisions, approvals and outcomes, and define rollback and disable procedures for every automation." },
    ],
    outcomes: ["Faster context gathering for infrastructure incidents", "Automation limited by risk and explicit approval rules", "Auditable actions with a rollback and disable path"],
    faqs: [
      { question: "Can AI make infrastructure changes without an engineer?", answer: "Only narrowly scoped, low-risk actions should be considered for unattended execution. Production-impacting or irreversible changes require explicit authorization and review controls." },
      { question: "Can this work with our existing monitoring and ticketing tools?", answer: "Often, if supported APIs or event interfaces are available. We review access and integration constraints before designing the workflow." },
      { question: "How is an automated action audited?", answer: "The workflow can record its triggering signal, supporting context, policy decision, approvals, action result and rollback status in the agreed operations record." },
    ],
    seo: { title: "IT Infrastructure AI Automation Services", description: "AI-assisted IT operations automation for incident triage and approved remediation with human review and audit controls." },
    figure: { seed: 404, label: "Infrastructure AI automation", caption: "Operational signals and runbooks guide an approved response, with engineer review and an auditable rollback path." },
    infographic: { title: "Keep infrastructure automation under control", steps: [
      { title: "Detect", description: "Collect signals from approved systems." },
      { title: "Triage", description: "Add context from trusted runbooks." },
      { title: "Approve", description: "Apply risk-based human review." },
      { title: "Record", description: "Log actions, outcomes and rollback." },
    ] },
  },
  {
    slug: "web-application-development",
    group: "application-development",
    parentName: "Application Development",
    parentHref: "/services/application-development",
    name: "Web Application Development",
    tagline: "Build secure web products around the way people work.",
    summary: "Custom browser-based applications, internal portals and workflow tools with accessible interfaces, tested integrations and a supportable architecture.",
    intro: "Web applications combine user experience, business logic, data and integrations into a product people rely on every day. We define roles and workflows first, then design the application architecture, build and test the interface and services, and prepare an accountable release and handover.",
    deliverables: [
      { title: "Product and workflow discovery", body: "Define user roles, key journeys, permissions, data needs, integrations and measurable acceptance criteria." },
      { title: "Application architecture and interface", body: "Design browser experience, application services and data boundaries for usability, accessibility and future change." },
      { title: "Implementation and integration", body: "Develop features and connect approved APIs or enterprise systems with validation and resilient error handling." },
      { title: "Testing, release and handover", body: "Test critical journeys and access controls, prepare deployment and rollback guidance, and deliver source and technical notes." },
    ],
    outcomes: ["A browser application tailored to defined workflows", "Tested integrations and role-aware access", "A controlled release with clear support ownership"],
    faqs: [
      { question: "What is the difference between a website and a web application?", answer: "A website primarily publishes content and information. A web application enables users to sign in, enter or manage data, and complete interactive workflows. Some products combine both." },
      { question: "Can you modernize an existing web application?", answer: "Yes. We assess the codebase, hosting, dependencies, security and user workflows, then scope an incremental improvement or rebuild based on risk and business priorities." },
      { question: "Do you provide the source code?", answer: "The agreed handover includes source code and documentation, with repository ownership and any third-party dependencies clarified in the project scope." },
    ],
    seo: { title: "Web Application Development Services", description: "Custom web application development for portals and workflows, with secure integrations, testing and handover." },
    figure: { seed: 405, label: "Web application development", caption: "User workflows, application services, integration tests and a managed release connect into a maintainable web product." },
    infographic: { title: "From workflow to working web app", steps: [
      { title: "Discover", description: "Map users, roles and key journeys." },
      { title: "Design", description: "Plan interface, services and data." },
      { title: "Build", description: "Implement and test features." },
      { title: "Release", description: "Deploy, hand over and support." },
    ] },
  },
  {
    slug: "website-development",
    group: "application-development",
    parentName: "Application Development",
    parentHref: "/services/application-development",
    name: "Website Development",
    tagline: "Create a clear, fast and maintainable web presence.",
    summary: "Responsive business websites with content structure, accessible design, search fundamentals, analytics readiness and a practical editing and maintenance handover.",
    intro: "A business website should make it easy to understand what you offer and take the next step. We shape the site structure and content model, design responsive page templates, implement performance and accessibility practices, and prepare the publishing and maintenance workflow for your team.",
    deliverables: [
      { title: "Content and site architecture", body: "Organize audiences, pages, navigation and calls to action around the information visitors need." },
      { title: "Responsive design and implementation", body: "Build consistent page templates that work across screen sizes and support accessible interaction." },
      { title: "Search and performance fundamentals", body: "Configure page metadata, semantic structure, image optimization, redirects and technical performance checks." },
      { title: "Publishing and handover", body: "Set up the agreed content editing workflow, analytics integration and maintenance documentation." },
    ],
    outcomes: ["A coherent and easy-to-navigate website", "Responsive pages with search and accessibility basics", "A documented content and upkeep workflow"],
    faqs: [
      { question: "Can we update website content ourselves?", answer: "Yes. The content workflow can use an agreed CMS or a managed publishing process. Editing roles and training are included in the handover plan." },
      { question: "Does website development include SEO?", answer: "We implement technical and on-page foundations such as metadata, semantic page structure, redirects and performance. Search visibility also depends on ongoing content and external factors." },
      { question: "Can you redesign an existing website without losing its search pages?", answer: "We inventory current routes and metadata, map redirects where URLs change and validate key pages during launch to reduce avoidable search disruption." },
    ],
    seo: { title: "Website Development Services", description: "Responsive business website design and development with content structure, accessibility, performance and handover." },
    figure: { seed: 406, label: "Website development", caption: "A content-led website moves from audience and structure through responsive design, implementation and publishing." },
    infographic: { title: "Plan and launch a business website", steps: [
      { title: "Plan", description: "Set audiences, content and navigation." },
      { title: "Design", description: "Shape responsive page templates." },
      { title: "Develop", description: "Build accessible, fast pages." },
      { title: "Publish", description: "Launch, measure and maintain." },
    ] },
  },
  {
    slug: "mobile-application-development",
    group: "application-development",
    parentName: "Application Development",
    parentHref: "/services/application-development",
    name: "Mobile Application Development",
    tagline: "Put useful workflows in the hands of your mobile users.",
    summary: "Mobile app product design and engineering for iOS, Android or cross-platform delivery, including API integration, device testing and release planning.",
    intro: "A mobile application succeeds when it fits the user, the device and the operating environment. We define the core journeys and offline or notification needs, choose an appropriate native or cross-platform approach, build against secure services and test across representative devices before release.",
    deliverables: [
      { title: "Mobile product discovery", body: "Define user journeys, device capabilities, accessibility, offline behavior, permissions and release requirements." },
      { title: "Platform and interface design", body: "Select native or cross-platform architecture and design touch-first interactions for the supported devices." },
      { title: "Application and API engineering", body: "Build app features, connect secure backend APIs and manage authentication, errors and data synchronization." },
      { title: "Device testing and store release", body: "Test supported device and OS combinations, prepare release assets and document update and support responsibilities." },
    ],
    outcomes: ["A mobile experience designed for real device use", "Secure integration with agreed application services", "Tested builds and a documented release process"],
    faqs: [
      { question: "Do you build for both iOS and Android?", answer: "Yes. We choose native or cross-platform implementation based on device features, experience requirements, support needs and the agreed budget." },
      { question: "Can the mobile app work offline?", answer: "Offline access can be designed for selected workflows. We define what can be stored locally, how data synchronizes and how conflicts or stale data are handled." },
      { question: "Do you publish the app to the app stores?", answer: "We can prepare and support release submissions, subject to the client's developer accounts, store policies, privacy disclosures and approval process." },
    ],
    seo: { title: "Mobile Application Development Services", description: "Mobile app design and development for iOS and Android with secure APIs, device testing and release support." },
    figure: { seed: 407, label: "Mobile application development", caption: "Mobile product planning, touch-first design, API engineering and device testing lead to a controlled app release." },
    infographic: { title: "Design, build and ship a mobile app", steps: [
      { title: "Discover", description: "Define journeys and device needs." },
      { title: "Design", description: "Create touch-first interfaces." },
      { title: "Develop", description: "Build app features and secure APIs." },
      { title: "Validate", description: "Test devices and prepare release." },
    ] },
  },
];

export const aiAutomationSubservices = productSubservices.filter((service) => service.group === "ai-automations");
export const applicationDevelopmentSubservices = productSubservices.filter((service) => service.group === "application-development");

export const productSubserviceBySlug = (slug: string, group?: ProductSubserviceGroup) =>
  productSubservices.find((service) => service.slug === slug && (!group || service.group === group)) ?? null;
