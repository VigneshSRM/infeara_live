// Page copy that changed after the first seed, from the SEO audit of 21 November 2026.
//
// What changed, and why:
//
//   * Every service and focused-service page has a search title that now says where the company
//     is ("… in Chennai, India"). The audit found 28 titles with no place in them. (One blog post
//     title was a character over the 60 a search result shows; it is shortened here too.)
//   * Four pages that were thin (Managed IT, Penetration Testing, Vulnerability Assessment, Cloud
//     Disaster Recovery & Business Continuity) have a fuller introduction, more deliverables and
//     outcomes, and eight or nine questions each.
//
// Why a separate file, and not an edit of the lists in services.ts and the three *-subservices.ts
// files? Those lists ARE the seed: supabase/seed.sql and 20261110200100_resource_modules_seed.sql
// were generated from them, have already run in production, and a test keeps them equal. Editing
// the lists would change files that were applied, and would not change a database that already has
// the rows. So the lists stay exactly as they were seeded, and this file holds the later wording:
//
//   * the live site reads the database, which scripts/generate-copy-refresh-migration.mjs updates
//     (supabase/migrations/20261121120000_seo_audit_copy.sql, pasted as
//     supabase/apply/07-seo-audit-copy.sql). A row is changed only while it still holds the
//     seeded wording, so a title or text an editor has changed in the admin is never overwritten;
//   * the code fallback (used only while the database cannot answer) shows the same wording, by
//     passing the seeded lists through refreshServices() and refreshSubservices() below.
//
// Changing a page's text here does NOT change the live site by itself: re-run the generator
// (`node scripts/generate-copy-refresh-migration.mjs`, then `node scripts/make-apply-blobs.mjs`)
// and run the new SQL, or edit the page in the admin.
//
// Voice (kept by tests/seo-audit-fixes.test.mjs): no client names, figures or outcomes, no
// "best / leading / top" claims, no certification the company has not been awarded. Standards are
// named only as context, and only where the requirement is stated as published (PCI DSS v4.0.1
// requirements 11.3 and 11.4, ISO/IEC 27001:2022 Annex A 8.8, 8.29 and 5.30, CERT-In empanelment of
// security auditors). Whether a report satisfies an auditor is always left to the client.
//
// This file imports nothing, so the tests and the generator can load it as it is.

export type RefreshedBody = {
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: { question: string; answer: string }[];
};

export type RefreshedPage = {
  kind: "service" | "subservice" | "blog";
  /** "managed-it" for a service; "cybersecurity/penetration-testing" for a focused service; a post's slug for a blog post. */
  page: string;
  /** The title in search results, without the " — Infeara" the layout adds (50 characters at most). */
  seoTitle: string;
  /** Present only on the four pages whose text was expanded. */
  body?: RefreshedBody;
};

const managedIt: RefreshedBody = {
  intro:
    "Managed IT is our primary practice. From Chennai, Infeara takes responsibility for the health of the servers, endpoints, network and backups that an organisation already depends on, and reports against that responsibility every month. Support is not reactive ticket handling; it is a monitored operation with defined response times, an escalation path and a named owner. The service suits organisations across India that run business-critical systems with an internal team that is small, overloaded or between hires, and that want the arrangement written down: what is covered, who owns it, how quickly we respond and what evidence you will see. Every engagement begins with an assessment of the existing estate. We record what exists, what is monitored and where the exposure sits, then agree scope and service levels in writing before we operate anything.",
  deliverables: [
    {
      title: "Estate assessment and onboarding",
      body: "Before support starts we record the servers, endpoints, network devices, identities, backups and dependencies that make up the estate, and note monitoring gaps and unsupported systems. No changes are made during the assessment. The output is an estate record, a prioritised risk list and a written scope.",
    },
    {
      title: "Infrastructure monitoring",
      body: "Servers, endpoints, network devices, storage and backup jobs are watched continuously. Alerts are triaged against severity rather than forwarded to a mailbox, and thresholds and alert routes are agreed with you so the right person hears about the right problem. Monitoring hours are stated in the service schedule rather than assumed.",
    },
    {
      title: "Patch and vulnerability management",
      body: "Operating system and application updates are staged, tested where it matters, and applied on a schedule with a rollback position recorded. A system that is out of vendor support is recorded as a risk with a remediation plan, not quietly left behind.",
    },
    {
      title: "Administration and access management",
      body: "Day-to-day administration of the operating systems, directory and user accounts: joiners, movers and leavers, permissions, group policies and licence housekeeping. Access registers are kept current and handed over to you, so you always know who can reach what.",
    },
    {
      title: "Incident management",
      body: "Every incident has a severity, an owner, a communication path and a closure note. Severity is set at triage, from Priority 1 (critical) to Priority 4 (request), as set out in our support model. Recurring incidents are turned into changes rather than tolerated.",
    },
    {
      title: "Backup and recovery verification",
      body: "Backups are checked for completion and integrity, and restores are tested on a schedule. The time a restore actually takes is recorded, so recovery time is measured rather than assumed. A backup that has never been restored is treated as unverified.",
    },
    {
      title: "Change control and documentation",
      body: "Every change has a request, an approval, a maintenance window and a rollback position, and is recorded against the asset. As-built documentation and operating notes are kept current, so another engineer, or another provider, could pick the environment up.",
    },
    {
      title: "Reporting, reviews and escalation",
      body: "Monthly reporting covers availability, incidents, changes, patching state, backup state and open risks, written for a business reader rather than an engineer. A quarterly review looks at trends and the improvement plan. Response and resolution targets are agreed in writing, with an escalation ladder and a review when a target is missed.",
    },
  ],
  outcomes: [
    "A named owner for infrastructure health",
    "Response targets written into the agreement, not implied",
    "Fewer repeat incidents through root-cause changes",
    "Evidence of patching, backup and recovery state",
    "An estate record and risk list that are yours to keep",
    "Documentation another engineer or provider could pick up",
  ],
  faqs: [
    {
      question: "What are managed IT services?",
      answer:
        "Managed IT services are an ongoing contract under which a provider operates and supports a business's technology on agreed terms. That covers monitoring, patching, backup checks, incident response, administration and reporting, with defined service levels rather than ad hoc support.",
    },
    {
      question: "What is not covered by a managed IT agreement?",
      answer:
        "Exclusions are written down so that neither side is guessing. Typically they are systems not named in the schedule, software development, hardware purchases unless procurement is agreed, and work outside the supported hours unless extended cover is included. A system that cannot be supported to the standard, for example because it is out of vendor support, is recorded as a risk with a remediation plan rather than silently left out.",
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
    {
      question: "How long does onboarding take?",
      answer:
        "It depends on the size of the estate and how well it is documented, so we do not quote a standard duration. The assessment produces the estate record and the risk list, and onboarding then follows a written plan that covers access, monitoring, documentation, backup verification and the date on which operational responsibility passes to us.",
    },
    {
      question: "How quickly will you respond when something fails?",
      answer:
        "Response targets are set per client, by severity, in the service schedule, because the right target depends on the systems, the hours and the impact of failure. A Priority 1 incident, where a business-critical system is unavailable or a security incident is active, is triaged immediately during contracted hours, with updates at agreed intervals until service is restored.",
    },
    {
      question: "Which systems can you manage?",
      answer:
        "The usual scope is servers, virtualisation and storage, directory and identity services, endpoints and network devices. The assessment establishes exactly what is in your estate and whether we can support it reliably. Where a component is outside our competence we say so and work with the vendor or adviser who owns it.",
    },
    {
      question: "What reporting will we receive?",
      answer:
        "A monthly report covers availability, incidents, changes, patching state, backup state and open risks, in plain language. A quarterly review looks at trends, repeat incidents and the improvement plan, with owners and dates. A serious incident ends with a written closure note that records the cause and the change that prevents a repeat.",
    },
    {
      question: "Where is managed IT delivered from?",
      answer:
        "From Chennai, Tamil Nadu. Most monitoring, administration and support is delivered remotely, so organisations anywhere in India can use the service. Onsite attendance is arranged where a task needs physical access, such as hardware replacement or cabling, and is planned around the location and the task.",
    },
  ],
};

const penetrationTesting: RefreshedBody = {
  intro:
    "Penetration testing evaluates whether an attacker could chain weaknesses into meaningful access or impact. Infeara carries out scoped, authorized testing of selected applications, internal networks and external attack surfaces for organizations in Chennai and across India. Every engagement starts with written authorization, agreed boundaries, safety controls and a plan for handling critical findings, so testing never surprises the people who run the systems. The result is not a scanner export: findings are verified by a person, linked to business impact and written up with the evidence and the fix. Testing is most useful when something is about to change, such as a release, a migration or a new customer requirement, or when an auditor or customer asks for independent evidence. It is most effective after a vulnerability assessment has cleared the known issues.",
  deliverables: [
    {
      title: "Scoping and written authorization",
      body: "We agree what is in scope, what is not, which techniques are allowed and who must be told, then record it as written authorization before any testing starts. Scope can be one application, an external attack surface, an internal network segment or a combination.",
    },
    {
      title: "Rules of engagement",
      body: "Define systems, techniques, test windows, emergency contacts, prohibited actions and evidence handling before testing begins. A named contact on each side can stop the test at any time.",
    },
    {
      title: "Reconnaissance and attack-surface mapping",
      body: "We map what an outsider can see: exposed hosts, services, applications and login pages, and what they reveal about the software behind them. Anything reachable that is missing from your inventory is reported as a finding in its own right.",
    },
    {
      title: "Controlled security testing",
      body: "Assess the agreed application, network or external surface using safe, scoped techniques that reflect realistic attack paths. Testing combines tools with manual work and looks for weaknesses such as broken access control, injection, weak authentication, misconfiguration and exposed secrets.",
    },
    {
      title: "Exploitation and attack-path validation",
      body: "Where the rules allow, selected weaknesses are exploited safely to show what they lead to, and small issues are chained to show how an attacker could reach something that matters. We stop at the agreed point, and evidence is kept to the minimum needed to prove each finding.",
    },
    {
      title: "Evidence-backed report",
      body: "Document verified findings, impact, reproduction context and actionable remediation without unnecessary exposure of sensitive data. Each finding has a severity, the affected asset, the evidence and a recommended fix, and an executive summary is written for non-technical readers.",
    },
    {
      title: "Findings walkthrough",
      body: "We go through the report with the engineers who will fix it: what matters first, what can wait and what a fix should look like. Questions are answered before remediation begins, not after the report has been filed.",
    },
    {
      title: "Retest and closure",
      body: "Validate agreed fixes and record residual risks or follow-up actions. The retest checks each fix against the original finding, and anything still open stays on the record with an owner.",
    },
  ],
  outcomes: [
    "Demonstrated attack paths within an approved scope",
    "Evidence linked to business impact",
    "Practical fixes and optional retesting",
    "A written record of what was tested, when and how",
    "A prioritized fix list your team can schedule",
    "A clearer picture of risk before a release, migration or customer review",
  ],
  faqs: [
    {
      question: "Do you test production systems?",
      answer:
        "Only when the client explicitly authorizes it and suitable safeguards are agreed. Testing scope, timing, emergency contacts and prohibited actions are documented before work starts. Where a staging copy exists we test that first, and on production we avoid techniques that could interrupt service, such as denial-of-service testing, unless you specifically ask for them.",
    },
    {
      question: "What does a penetration test report include?",
      answer:
        "A report includes the approved scope, verified findings, evidence, impact, remediation guidance and any agreed retest results. Each finding carries a severity, the affected asset and the steps to reproduce it, and the report opens with a short summary for non-technical readers. Sensitive data seen during testing is described, not copied into the report.",
    },
    {
      question: "Can you retest after remediation?",
      answer:
        "Yes. Retesting confirms whether the agreed fixes address the original findings and records any remaining exposure. The retest covers the findings you choose to fix, not a fresh test of everything, and its results are added to the report so that there is one record from first finding to closure.",
    },
    {
      question: "How long does a penetration test take?",
      answer:
        "It depends on the scope: the number of applications, user roles and hosts, and the depth of testing. We estimate the effort after a scoping conversation and write the duration, the test window and the price into the proposal, rather than quoting a standard number.",
    },
    {
      question: "Should we run a vulnerability assessment first?",
      answer:
        "Often yes. An assessment clears known, easily found issues cheaply, so paid manual testing time goes on the weaknesses that need human judgment. If you have never measured your exposure, start there. If the basics are already managed and you need to know whether your defenses hold against a determined attacker, go straight to a penetration test.",
    },
    {
      question: "Which standards or regulations require penetration testing?",
      answer:
        "Some frameworks name it directly. PCI DSS v4.0.1 requirement 11.4 asks for internal and external penetration tests at least once every 12 months and after significant changes, by a qualified and organizationally independent tester. ISO/IEC 27001:2022 expects technical vulnerabilities to be managed (Annex A 8.8) and security testing during development and acceptance (8.29), which test reports commonly evidence. Whether a report satisfies your auditor depends on the scope, so share the requirement with us before scoping.",
    },
    {
      question: "Does the tester need a specific empanelment or certification?",
      answer:
        "Some government and regulated-sector tenders ask for a security auditor empanelled by CERT-In, India's national cyber security agency. Tell us early if yours does. We say plainly whether we meet a requirement like that instead of implying it, and where we do not, we tell you so that you can choose the right auditor.",
    },
    {
      question: "How do you protect our data during a test?",
      answer:
        "Access is limited to what the scope needs, credentials and evidence are handled under the agreement we sign, test data is kept to the minimum needed to prove a finding, and the report goes only to the people you name. Anything serious found during testing is reported to your emergency contact straight away rather than saved for the final report.",
    },
    {
      question: "How often should we test?",
      answer:
        "At least when something significant changes: a major release, a migration, a new internet-facing system or a change of provider. Many organizations also test once a year, and some frameworks, PCI DSS among them, set that interval. Between tests, a vulnerability assessment keeps the known issues in check.",
    },
  ],
};

const vulnerabilityAssessment: RefreshedBody = {
  intro:
    "A vulnerability assessment gives your team an actionable view of exposure without treating every scan result as equally urgent. Infeara carries out scoped assessments of systems, identities, endpoints, networks and cloud assets for organizations in Chennai and across India. We confirm what is reachable, check findings against how your systems are actually used, remove false positives and turn the result into a remediation plan with owners and priorities. An assessment can be a one-off baseline, a recurring check on an agreed schedule, or a review before a significant change goes live. The first assessment sets a baseline you can measure against, and repeat assessments show whether exposure is falling. It is the usual starting point before a penetration test, and the routine that keeps patching honest between tests.",
  deliverables: [
    {
      title: "Scope and asset discovery",
      body: "Confirm the authorized systems, environments and testing windows; identify assets that are missing from the current inventory. Unknown or forgotten systems are a frequent source of exposure, so discovery is part of the scope, not an extra. The inventory we build is handed back to you with the report.",
    },
    {
      title: "Rules and safety checks",
      body: "Agree testing windows, scan intensity, systems to treat with care and emergency contacts so the assessment does not disturb production. Intrusive checks run only when they are explicitly authorized.",
    },
    {
      title: "Vulnerability discovery",
      body: "Review known software, configuration and exposure weaknesses across the approved estate. Authenticated checks, using a read-only account you provide, see missing patches and settings that an outside scan cannot; the approach is agreed per system. Coverage gaps, such as a system we could not log in to, are listed in the report rather than hidden.",
    },
    {
      title: "Configuration and exposure review",
      body: "Review what scanners miss or mislabel: open management ports, default or shared credentials, weak protocols, over-broad firewall rules and publicly reachable cloud storage. The review follows the systems in scope, not a generic checklist.",
    },
    {
      title: "Validation and prioritization",
      body: "Remove false positives and rank verified findings by exploitability, exposure and business impact. A critical score on a system nobody can reach ranks below a medium one on the internet, and each ranking comes with the reason.",
    },
    {
      title: "Report and remediation plan",
      body: "Provide clear actions, owners and suggested sequencing. The report has a short summary for decision makers and a findings list for engineers, with affected assets, evidence, severity and the recommended fix for every finding. Findings use plain language and one consistent severity scale, with no unexplained scores.",
    },
    {
      title: "Findings walkthrough and remediation support",
      body: "We go through the findings with the team that will act on them, answer questions about the fixes and, where agreed, support the changes through change control. The decisions made in that conversation, such as what will be fixed, what is accepted and by whom, are recorded with the report.",
    },
    {
      title: "Recheck and trend reporting",
      body: "Validate fixes when requested and record what remains. Repeat assessments are compared with the previous one, so the next report shows what was fixed, what is new and whether overall exposure is falling.",
    },
  ],
  outcomes: [
    "Verified findings rather than an unfiltered scan dump",
    "Risk-ranked remediation priorities",
    "Clear ownership for corrective action",
    "A more complete inventory of what is exposed",
    "A baseline to measure against at the next assessment",
    "A remediation plan your team can schedule",
  ],
  faqs: [
    {
      question: "How is a vulnerability assessment different from a penetration test?",
      answer:
        "A vulnerability assessment identifies and prioritizes weaknesses across an agreed scope. A penetration test goes further by safely attempting to exploit selected weaknesses to demonstrate real attack paths. The assessment is broader and quicker, and the test is deeper and slower. Many organizations use both: an assessment to keep known issues in check, and a penetration test before a major release or when independent evidence is needed.",
    },
    {
      question: "Will testing disrupt production systems?",
      answer:
        "The scope and testing method are agreed first. Checks are selected and scheduled to avoid unsafe activity, and intrusive validation is only performed when explicitly authorized. Fragile systems, such as old devices or busy databases, are flagged during scoping and checked gently or in a quiet window.",
    },
    {
      question: "Do you provide remediation?",
      answer:
        "Yes. Findings are translated into practical remediation steps, and fixes can be rechecked to confirm the exposure has been reduced. Where you want hands-on help, the changes can be carried out through your normal change process, with a rollback position recorded.",
    },
    {
      question: "How often should we run a vulnerability assessment?",
      answer:
        "It depends on how quickly your environment changes and on any requirement you are subject to. A common pattern is a full assessment at least once a quarter, plus one after any significant change. PCI DSS, for example, asks for internal and external vulnerability scans at least every three months. We agree a cadence with you based on your risk rather than the calendar.",
    },
    {
      question: "What do you assess?",
      answer:
        "Whatever is named in the scope: servers, endpoints, network devices, firewalls, web applications, identity and directory settings and cloud assets. The scope is agreed in writing, and anything outside it is left alone.",
    },
    {
      question: "Do you need credentials or access to our systems?",
      answer:
        "Not always. An external assessment looks at what the internet can see and needs none. Authenticated internal checks find more, and use a read-only account that you create and can disable at any time. We agree which approach applies to each system before we start.",
    },
    {
      question: "What will we receive at the end?",
      answer:
        "A summary for decision makers and a findings list for engineers. Every finding has the affected assets, the evidence, a severity based on your context and the recommended fix. We walk the team through it so that questions are answered before work begins.",
    },
    {
      question: "Does an assessment satisfy PCI DSS or ISO 27001 requirements?",
      answer:
        "It can form part of the evidence, but it does not by itself meet every requirement. PCI DSS requires the quarterly external scan to be run by a PCI SSC Approved Scanning Vendor, so an assessment from us supports your internal program rather than replacing that report. ISO/IEC 27001:2022 expects technical vulnerabilities to be managed (Annex A 8.8), and assessment reports are a common way to show it. Share the requirement with us before scoping.",
    },
    {
      question: "Can you assess cloud environments as well as on-premises systems?",
      answer:
        "Yes, where the cloud accounts are in scope and you have given authorization, and notice to the provider where its policy requires it. We review exposed services, identity and permission settings, storage and network rules alongside the servers and applications that run there.",
    },
  ],
};

const cloudDisasterRecovery: RefreshedBody = {
  intro:
    "A cloud recovery plan is useful only when the business can execute and test it. Infeara helps organisations in Chennai and across India decide how quickly each service must come back and how much data they can afford to lose, then design the backup or replication approach that meets those targets at a cost the business accepts. We identify critical services and their dependencies, write the runbook, assign responsibilities and rehearse recovery so that gaps are recorded before a real disruption. The planning applies whether your workloads run on a public cloud, a private cloud, a datacenter or a mixture, and whether recovery means restoring from backups or switching to a standby environment.",
  deliverables: [
    {
      title: "Business impact analysis",
      body: "Identify critical services, their owners and dependencies with the business, and agree what an outage costs in practice: missed orders, missed deadlines, regulatory exposure. The result is a ranked list of services, not a technology inventory.",
    },
    {
      title: "Recovery objectives",
      body: "Set a recovery time objective (how long a service may be down) and a recovery point objective (how much data may be lost) for each service tier, with the business owner who accepts the trade-off against cost.",
    },
    {
      title: "Recovery architecture",
      body: "Select backup, replication and alternate-environment patterns according to risk, cost and service requirements. The common patterns run from backup and restore, through a minimal standby and a scaled-down warm standby, to running in two places at once. Each recovers faster and costs more than the one before, so they are matched to service tiers, not applied everywhere.",
    },
    {
      title: "Backup design and protection",
      body: "Define what is backed up, how often, where copies are kept and who can delete them. Protected copies, such as immutable or separately credentialed backups, limit the damage from ransomware or an administrator's mistake, because replication alone copies deletion and corruption as well as good data.",
    },
    {
      title: "Runbooks and responsibilities",
      body: "Document decision points, access, escalation, restoration sequence and communications responsibilities. The runbook is written so that someone who did not build the system can follow it under pressure, and it says who declares a disaster and who tells customers.",
    },
    {
      title: "Network, identity and access planning",
      body: "Recovery fails when people cannot get in. We plan DNS, network routes, identity services, secrets and administrator access in the recovery location, and record which of them depend on the environment that has failed.",
    },
    {
      title: "Recovery exercises",
      body: "Plan and conduct agreed tests, capture actual recovery evidence and track corrective actions. Tests range from restoring one system to a full failover rehearsal, and are scheduled with the business so that nobody is surprised.",
    },
    {
      title: "Continuity planning and review",
      body: "Extend the plan beyond technology to people, premises, suppliers and communications: how essential work continues while systems are down. Plans are reviewed after material changes and at the interval agreed with service owners, and test results feed an improvement list with owners and dates.",
    },
  ],
  outcomes: [
    "Recovery objectives that reflect business priorities",
    "Documented dependencies and recovery responsibilities",
    "Test evidence and a tracked improvement plan",
    "Backups protected from deletion and corruption, and proven by restore",
    "A runbook that someone who did not build the system can follow",
    "A recovery approach matched to cost, not applied equally to everything",
  ],
  faqs: [
    {
      question: "What is the difference between disaster recovery and business continuity?",
      answer:
        "Disaster recovery focuses on restoring technology and data. Business continuity also covers people, processes, communications and alternate ways to deliver essential services during disruption. In practice the two plans share the same business impact analysis, and recovery of the systems is one step inside the wider plan for keeping the business running.",
    },
    {
      question: "How often should recovery be tested?",
      answer:
        "The cadence should reflect service criticality, change frequency and business requirements. At minimum, tests should be repeated after material architecture changes and at the interval agreed with service owners. Critical services are tested more often than minor ones, and every test, including a small restore, is recorded so that the evidence builds up over time.",
    },
    {
      question: "Can cloud replication replace backups?",
      answer:
        "No. Replication can copy corruption or deletion as well as good data. Recovery design normally combines protected backups with replication or alternate capacity where appropriate. Replication answers how quickly a service can return after a failure, and a protected backup answers how far back you can go when the data itself has been damaged.",
    },
    {
      question: "What are RTO and RPO?",
      answer:
        "The recovery time objective (RTO) is how long a service can be unavailable before the damage becomes unacceptable. The recovery point objective (RPO) is how much recent data you can afford to lose, measured in time. The business sets both for each service, and they decide the architecture and the cost.",
    },
    {
      question: "What are the common disaster recovery patterns in the cloud?",
      answer:
        "Four are widely used. Backup and restore is the cheapest and the slowest. Pilot light keeps data replicated and a minimal core ready to scale up. Warm standby runs a smaller working copy that can take traffic quickly. Multi-site active/active runs full capacity in two places and recovers fastest, at the highest cost. The major cloud platforms support the same patterns under different product names.",
    },
    {
      question: "Do we need a second region or a second provider?",
      answer:
        "Not for every service. A second region protects against a regional failure, but many outages come from human error, bad deployments or ransomware, which a protected backup and a tested runbook address at a lower cost. We match extra capacity to the services where the business case is clear and record the risk accepted for the rest.",
    },
    {
      question: "How much does a disaster recovery plan cost?",
      answer:
        "The cost depends mainly on the recovery targets rather than the number of servers, because a faster recovery needs capacity that is already running. We give a range once the business impact and objectives are agreed, and show the options side by side so that you can choose between speed and cost with the figures in front of you.",
    },
    {
      question: "Which compliance requirements does this support?",
      answer:
        "Frameworks ask for tested recovery in different words. ISO/IEC 27001:2022, for example, includes a control on ICT readiness for business continuity (Annex A 5.30). We produce the plan, test records and improvement log that an auditor may ask to see, but whether they satisfy a particular framework is a decision for you and your auditor.",
    },
    {
      question: "Do you test the plan with us?",
      answer:
        "Yes. Testing is part of the work, because a plan that has never been exercised is an assumption. We agree the test types and dates with you, from a single restore to a full failover rehearsal, record how long recovery actually took against the objective and track fixes to completion.",
    },
  ],
};

/** Every page whose search title changed, in site order: services, then the focused services, then the one blog post. */
export const refreshedPages: readonly RefreshedPage[] = [
  { kind: "service", page: "managed-it", seoTitle: "Managed IT Services in Chennai, India", body: managedIt },
  { kind: "service", page: "cybersecurity", seoTitle: "Cybersecurity Services in Chennai, India" },
  { kind: "service", page: "it-infrastructure", seoTitle: "IT Infrastructure Services in Chennai, India" },
  { kind: "service", page: "outsourcing-remote-support", seoTitle: "Remote IT Services & Dedicated Support, India" },
  { kind: "service", page: "cloud-datacenter", seoTitle: "Cloud & Datacenter Services in Chennai, India" },
  { kind: "service", page: "network-engineering", seoTitle: "Network Engineering Services in Chennai, India" },
  { kind: "service", page: "it-facility-management", seoTitle: "IT Facility Management in Chennai, India" },
  { kind: "service", page: "turnkey-projects", seoTitle: "Turnkey IT Infrastructure Projects in Chennai" },
  { kind: "service", page: "ai-automations", seoTitle: "AI Automation Services in Chennai, India" },
  { kind: "service", page: "application-development", seoTitle: "Custom Application Development in Chennai, India" },

  { kind: "subservice", page: "cybersecurity/vulnerability-assessment", seoTitle: "Vulnerability Assessment in Chennai, India", body: vulnerabilityAssessment },
  { kind: "subservice", page: "cybersecurity/penetration-testing", seoTitle: "Penetration Testing Services in Chennai, India", body: penetrationTesting },
  { kind: "subservice", page: "cybersecurity/threat-modeling", seoTitle: "Threat Modeling Services in Chennai, India" },
  { kind: "subservice", page: "cybersecurity/threat-analysis", seoTitle: "Threat Analysis Services in Chennai, India" },
  { kind: "subservice", page: "cloud-datacenter/cloud-ai-data-services", seoTitle: "Cloud AI & Data Services in Chennai, India" },
  { kind: "subservice", page: "cloud-datacenter/managed-cloud-support-msp", seoTitle: "Managed Cloud Support (MSP) in Chennai, India" },
  { kind: "subservice", page: "cloud-datacenter/cloud-cost-optimization", seoTitle: "Cloud Cost Optimization in Chennai, India" },
  { kind: "subservice", page: "cloud-datacenter/cloud-disaster-recovery-business-continuity", seoTitle: "Cloud Disaster Recovery in Chennai, India", body: cloudDisasterRecovery },
  { kind: "subservice", page: "cloud-datacenter/cloud-monitoring-management", seoTitle: "Cloud Monitoring & Management in Chennai, India" },
  { kind: "subservice", page: "cloud-datacenter/cloud-application-hosting", seoTitle: "Cloud Application Hosting in Chennai, India" },
  { kind: "subservice", page: "cloud-datacenter/cloud-devops-automation", seoTitle: "Cloud DevOps & Automation in Chennai, India" },
  { kind: "subservice", page: "ai-automations/ai-chatbot-development", seoTitle: "AI Chatbot Development in Chennai, India" },
  { kind: "subservice", page: "ai-automations/ai-callers-development", seoTitle: "AI Callers Development in Chennai, India" },
  { kind: "subservice", page: "ai-automations/llm-development", seoTitle: "LLM Development Services in Chennai, India" },
  { kind: "subservice", page: "ai-automations/it-infrastructure-ai-automations", seoTitle: "IT Infrastructure AI Automation in Chennai" },
  { kind: "subservice", page: "application-development/web-application-development", seoTitle: "Web Application Development in Chennai, India" },
  { kind: "subservice", page: "application-development/website-development", seoTitle: "Website Development Services in Chennai, India" },
  { kind: "subservice", page: "application-development/mobile-application-development", seoTitle: "Mobile App Development in Chennai, India" },

  // 51 characters with the site name added made 61, one over what a search result shows.
  { kind: "blog", page: "website-web-app-or-mobile-app-scoping-checklist", seoTitle: "Website, web app or mobile app? Scoping checklist" },
];

// ── Applying the refresh to the seeded lists (the code fallback) ────────────

type PageShape = {
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: { question: string; answer: string }[];
  seo: { title: string; description: string };
};

function refreshed<T extends PageShape>(item: T, page: RefreshedPage | undefined): T {
  if (!page) return item;
  return {
    ...item,
    ...(page.body ?? {}),
    seo: { ...item.seo, title: page.seoTitle },
  };
}

const pageFor = (kind: RefreshedPage["kind"], key: string) =>
  refreshedPages.find((page) => page.kind === kind && page.page === key);

/** The seeded services with this wording applied. A service that was not refreshed is returned as it is. */
export function refreshServices<T extends PageShape & { slug: string }>(list: readonly T[]): T[] {
  return list.map((item) => refreshed(item, pageFor("service", item.slug)));
}

/** The seeded focused services with this wording applied. */
export function refreshSubservices<T extends PageShape & { parentSlug: string; slug: string }>(
  list: readonly T[],
): T[] {
  return list.map((item) => refreshed(item, pageFor("subservice", `${item.parentSlug}/${item.slug}`)));
}

/** The seeded blog posts with this wording applied. */
export function refreshBlogPosts<T extends { slug: string; seo: { title: string; description: string } }>(
  list: readonly T[],
): T[] {
  return list.map((post) => {
    const page = pageFor("blog", post.slug);
    return page ? { ...post, seo: { ...post.seo, title: page.seoTitle } } : post;
  });
}
