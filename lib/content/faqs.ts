import type { Faq } from "./types";

export const faqGroups: { title: string; intro: string; items: Faq[] }[] = [
  {
    title: "General",
    intro: "Who we are and how an engagement begins.",
    items: [
      {
        question: "What does Infeara Technologies do?",
        answer:
          "Infeara operates and secures business IT. That covers managed IT services, cybersecurity, infrastructure and cloud engineering, network engineering, IT facility management, turnkey projects and automation. Managed IT is our primary practice.",
      },
      {
        question: "Where is Infeara based?",
        answer:
          "The company is based in Chennai, Tamil Nadu, India. Delivery is remote by default, with onsite attendance arranged where physical access is required, such as hardware replacement or structured cabling.",
      },
      {
        question: "Do you work with clients outside Chennai?",
        answer:
          "Yes. We serve organisations across India. Remote delivery covers most administration and support; onsite work is planned around the location and the task.",
      },
      {
        question: "How does an engagement start?",
        answer:
          "With an assessment of the existing estate. We record what exists, what is documented, what is monitored and where the exposure sits, then propose scope and service levels in writing. No changes are made during the assessment.",
      },
      {
        question: "What size of organisation do you work with?",
        answer:
          "Organisations that run business-critical systems and need them supportable, typically with an internal team that is small, overloaded or between hires. The assessment establishes whether the estate fits our operating model.",
      },
    ],
  },
  {
    title: "Services & support",
    intro: "What is included, how support runs and what changes.",
    items: [
      {
        question: "What is included in managed IT services?",
        answer:
          "Monitoring of servers, endpoints and network devices, patch management, backup verification, incident handling, administration, reporting and an escalation path. The exact scope, response targets and exclusions are written into the agreement.",
      },
      {
        question: "How is managed IT different from IT outsourcing?",
        answer:
          "Managed IT is accountability for an outcome: the provider owns monitoring, response and reporting. Outsourcing supplies people or capacity to work under the client's direction. The two are often combined but they are different commitments.",
      },
      {
        question: "Do you support the infrastructure we already have?",
        answer:
          "Yes. We start by assessing the current estate and then either operate it as it stands or propose specific remediation where a component cannot be supported reliably.",
      },
      {
        question: "Do you provide on-site support?",
        answer:
          "Remote support is the default because it resolves most work faster. Onsite attendance is arranged where a task requires physical access, and the visit is recorded against the asset history.",
      },
      {
        question: "Is support available outside business hours?",
        answer:
          "Extended and out-of-hours cover can be included in the service schedule. It is stated explicitly rather than assumed, because the response model and cost differ from standard hours.",
      },
      {
        question: "Who owns the documentation and the software you build?",
        answer:
          "The client does. As-built records, access registers and operating notes are handed over, and custom software is delivered with source code, deployment instructions and documentation.",
      },
    ],
  },
  {
    title: "Security & compliance",
    intro: "How security work is scoped and what we can evidence.",
    items: [
      {
        question: "What happens during a security incident?",
        answer:
          "The response follows an agreed playbook: contain the affected systems, preserve evidence, restore service from a verified source, then document what happened and what changes prevent a repeat. Notification obligations are decided by the client with their legal advisers.",
      },
      {
        question: "Do you run penetration tests?",
        answer:
          "We scope and coordinate penetration testing and vulnerability assessment, and we act on the findings. Testing without a remediation plan produces a report rather than a lower risk position.",
      },
      {
        question: "Can you help with DPDP Act compliance?",
        answer:
          "We implement the technical and organisational measures that support compliance: access control, logging, retention, backup and recovery, and evidence for audit questions. Legal interpretation and formal compliance advice sit with the client's counsel.",
      },
      {
        question: "Do you hold ISO 27001 or other certifications?",
        answer:
          "We do not display certifications or attestations that are not current and verifiable. If a certification is material to your selection, ask us directly and we will state the position in writing.",
      },
    ],
  },
  {
    title: "Commercial",
    intro: "How work is priced, scoped and ended.",
    items: [
      {
        question: "How is pricing structured?",
        answer:
          "Managed services are priced as a recurring fee based on the systems and hours covered. Projects are quoted against a written scope. Both are stated in the proposal, with exclusions listed rather than discovered later.",
      },
      {
        question: "What is the contract length?",
        answer:
          "It depends on the service and the transition work involved. The term, notice period and review points are agreed in the contract. We do not publish a standard term because a poor fit on either side should be ended without friction.",
      },
      {
        question: "Can you procure hardware and licences?",
        answer:
          "Yes, we specify and coordinate procurement, and we check that what arrives matches the design and carries the expected warranty. The client can also buy directly.",
      },
      {
        question: "What happens if we leave?",
        answer:
          "Documentation, access registers and operating records are handed over, and a transition period is agreed. The environment should be supportable by another provider because it was documented, not because we are being generous.",
      },
    ],
  },
  {
    title: "Working with us",
    intro: "What the relationship looks like month to month.",
    items: [
      {
        question: "How is the transition handled?",
        answer:
          "The assessment produces the estate record and the risk list. Transition then follows a written plan covering access, monitoring, documentation, backup verification and the point at which operational responsibility transfers.",
      },
      {
        question: "How often will we hear from you?",
        answer:
          "Monthly reporting is standard, with a quarterly service review covering trends, risks and the improvement plan. Priority 1 incidents receive updates at agreed intervals until service is restored.",
      },
      {
        question: "Can you work alongside our internal IT team?",
        answer:
          "Yes. Internal staff usually keep ownership of strategy and approvals while we provide cover, specialist engineering or out-of-hours capacity. Responsibilities and decision rights are written down before work starts.",
      },
    ],
  },
];
