import type { Faq } from "./types";
import { cybersecuritySubserviceSlugs } from "./service-taxonomy";

export type CybersecuritySubservice = {
  slug: (typeof cybersecuritySubserviceSlugs)[number];
  name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: Faq[];
  seo: { title: string; description: string };
  figure: { seed: number; label: string; caption: string };
};

export const cybersecuritySubservices: CybersecuritySubservice[] = [
  {
    slug: "vulnerability-assessment",
    name: "Vulnerability Assessment",
    tagline: "Find and prioritize weaknesses across the estate.",
    summary:
      "A scoped review of systems, identities, endpoints, networks and cloud assets, with findings validated and ranked by business risk.",
    intro:
      "A vulnerability assessment gives the team an actionable view of exposure without treating every scan result as equally urgent. We confirm what is reachable, check findings against the operating context, and turn the result into a remediation plan with owners and priorities.",
    deliverables: [
      { title: "Scope and asset discovery", body: "Confirm the authorized systems, environments and testing windows; identify assets that are missing from the current inventory." },
      { title: "Vulnerability discovery", body: "Review known software, configuration and exposure weaknesses across the approved estate." },
      { title: "Validation and prioritization", body: "Remove false positives and rank verified findings by exploitability, exposure and business impact." },
      { title: "Remediation plan", body: "Provide clear actions, owners and suggested sequencing, then validate fixes when requested." },
    ],
    outcomes: [
      "Verified findings rather than an unfiltered scan dump",
      "Risk-ranked remediation priorities",
      "Clear ownership for corrective action",
    ],
    faqs: [
      { question: "How is a vulnerability assessment different from a penetration test?", answer: "A vulnerability assessment identifies and prioritizes weaknesses across an agreed scope. A penetration test goes further by safely attempting to exploit selected weaknesses to demonstrate real attack paths." },
      { question: "Will testing disrupt production systems?", answer: "The scope and testing method are agreed first. Checks are selected and scheduled to avoid unsafe activity, and intrusive validation is only performed when explicitly authorized." },
      { question: "Do you provide remediation?", answer: "Yes. Findings are translated into practical remediation steps, and fixes can be rechecked to confirm the exposure has been reduced." },
    ],
    seo: {
      title: "Vulnerability Assessment Services",
      description: "Scoped vulnerability assessment, validated findings and risk-ranked remediation plans for business IT environments.",
    },
    figure: {
      seed: 201,
      label: "Vulnerability assessment",
      caption: "An authorized assessment maps exposed systems and prioritizes verified weaknesses for remediation.",
    },
  },
  {
    slug: "penetration-testing",
    name: "Penetration Testing",
    tagline: "Test defenses through controlled, authorized attack simulation.",
    summary:
      "A rules-of-engagement-led test of selected applications, infrastructure or external attack surfaces, followed by evidence, remediation guidance and retesting.",
    intro:
      "Penetration testing evaluates whether an attacker can chain weaknesses into meaningful access or impact. Every engagement starts with written authorization, agreed boundaries, safety controls and a clear plan for handling critical findings.",
    deliverables: [
      { title: "Rules of engagement", body: "Define systems, techniques, test windows, emergency contacts, prohibited actions and evidence handling before testing begins." },
      { title: "Controlled security testing", body: "Assess the agreed application, network or external surface using safe, scoped techniques that reflect realistic attack paths." },
      { title: "Evidence-backed report", body: "Document verified findings, impact, reproduction context and actionable remediation without unnecessary exposure of sensitive data." },
      { title: "Retest and closure", body: "Validate agreed fixes and record residual risks or follow-up actions." },
    ],
    outcomes: [
      "Demonstrated attack paths within an approved scope",
      "Evidence linked to business impact",
      "Practical fixes and optional retesting",
    ],
    faqs: [
      { question: "Do you test production systems?", answer: "Only when the client explicitly authorizes it and suitable safeguards are agreed. Testing scope, timing, emergency contacts and prohibited actions are documented before work starts." },
      { question: "What does a penetration test report include?", answer: "A report includes the approved scope, verified findings, evidence, impact, remediation guidance and any agreed retest results." },
      { question: "Can you retest after remediation?", answer: "Yes. Retesting confirms whether the agreed fixes address the original findings and records any remaining exposure." },
    ],
    seo: {
      title: "Penetration Testing Services",
      description: "Authorized, scoped penetration testing with evidence-backed findings, remediation guidance and optional retesting.",
    },
    figure: {
      seed: 202,
      label: "Penetration testing",
      caption: "A controlled test follows written authorization and rules of engagement to validate real attack paths safely.",
    },
  },
  {
    slug: "threat-modeling",
    name: "Threat Modeling",
    tagline: "Anticipate how a system could be attacked before it goes live.",
    summary:
      "Structured analysis of architecture, trust boundaries, data flows and misuse cases to identify threats and choose proportionate controls early.",
    intro:
      "Threat modeling brings security decisions into architecture and change planning. We work with the teams who design and operate the system to identify valuable assets, entry points, trust boundaries and plausible abuse cases before they become expensive remediation work.",
    deliverables: [
      { title: "System and data-flow mapping", body: "Record key components, identities, external dependencies, sensitive data and trust boundaries." },
      { title: "Threat scenarios", body: "Identify likely attacker goals, misuse cases and paths through the architecture, based on the system's actual context." },
      { title: "Control recommendations", body: "Recommend preventive, detective and recovery controls proportionate to the risks and operating constraints." },
      { title: "Action tracking", body: "Capture decisions, owners and follow-up items so the model informs implementation and future changes." },
    ],
    outcomes: [
      "Security risks considered before implementation",
      "Documented trust boundaries and attack paths",
      "Controls connected to specific threats",
    ],
    faqs: [
      { question: "When should we do threat modeling?", answer: "Do it while a system or major change is being designed, and revisit it when architecture, data flows, trust boundaries or exposure change materially." },
      { question: "Does threat modeling require a finished design?", answer: "No. An early model can be useful with a draft architecture. It helps teams identify decisions that should be made before implementation makes them costly to change." },
      { question: "What does the team receive?", answer: "A system view with assets, trust boundaries, plausible threat scenarios, recommended controls and assigned follow-up actions." },
    ],
    seo: {
      title: "Threat Modeling Services",
      description: "Architecture-focused threat modeling for data flows, trust boundaries, attack scenarios and practical security controls.",
    },
    figure: {
      seed: 203,
      label: "Threat model",
      caption: "Architecture, trust boundaries and data flows are reviewed to identify attack paths and suitable controls.",
    },
  },
  {
    slug: "threat-analysis",
    name: "Threat Analysis",
    tagline: "Turn suspicious signals into prioritized security action.",
    summary:
      "Contextual analysis of security alerts, indicators and observed activity to establish likely impact, urgency and the next response step.",
    intro:
      "Threat analysis helps a team decide what an alert means for its own environment. We correlate available evidence with asset criticality, exposure and known activity, then provide a clear assessment of what is credible, what needs investigation and what action should happen next.",
    deliverables: [
      { title: "Alert and indicator review", body: "Assess suspicious events, indicators and available telemetry against the assets and controls in scope." },
      { title: "Context and impact analysis", body: "Correlate evidence with system criticality, exposure, identity activity and relevant threat context." },
      { title: "Triage recommendations", body: "Separate likely false positives from activity that needs containment, investigation or escalation." },
      { title: "Response notes", body: "Record evidence, decisions, next actions and escalation guidance for the operating team." },
    ],
    outcomes: [
      "Prioritized alerts with operational context",
      "Clear escalation and containment guidance",
      "Recorded analysis for follow-up and review",
    ],
    faqs: [
      { question: "How is threat analysis different from threat modeling?", answer: "Threat modeling anticipates possible attacks against a system design. Threat analysis evaluates observed alerts, indicators or activity to determine what may be happening now and how to respond." },
      { question: "Do you need a specific security platform?", answer: "No. The analysis uses the logs, alerts and evidence available from the client's tools. We identify data gaps that limit confidence and can recommend how to improve visibility." },
      { question: "Does threat analysis include incident response?", answer: "It includes triage and response recommendations. Containment, recovery and incident coordination can be agreed as additional response work depending on the situation." },
    ],
    seo: {
      title: "Threat Analysis Services",
      description: "Contextual security alert and threat analysis with risk prioritization, triage guidance and response recommendations.",
    },
    figure: {
      seed: 204,
      label: "Threat analysis",
      caption: "Security signals are correlated with asset context and exposure to guide investigation and response.",
    },
  },
];

export const cybersecuritySubserviceBySlug = (slug: string) =>
  cybersecuritySubservices.find((service) => service.slug === slug) ?? null;
