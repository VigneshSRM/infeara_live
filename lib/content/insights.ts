import type { Insight } from "./types";

export const insights: Insight[] = [
  {
    slug: "what-managed-it-actually-covers",
    title: "What managed IT actually covers",
    excerpt:
      "Managed IT is often sold as a support contract. The useful version is an operating agreement with defined responsibilities, response times and reporting.",
    category: "Managed services",
    readingMinutes: 6,
    publishedAt: "2026-10-12",
    body: [
      {
        heading: "The difference between support and operation",
        paragraphs: [
          "Support begins when someone reports a problem. Operation begins before that: monitoring, patching, capacity review, backup verification and change control happen on a schedule, whether or not a user has noticed anything.",
          "The distinction matters because the failures that hurt most are the ones nobody reports. A backup job that has been failing quietly for three weeks is a support ticket when it is discovered and an operational failure that was never checked.",
        ],
      },
      {
        heading: "What should be written down",
        paragraphs: [
          "A managed IT agreement should name the systems covered, the monitoring in place, the response time per severity, the escalation path, the reporting cadence and the exclusions. If any of those are left to interpretation, the relationship will be managed by expectation rather than by contract.",
        ],
      },
      {
        heading: "How reporting keeps it honest",
        paragraphs: [
          "Monthly reporting turns the agreement into something checkable: incidents by severity, response against target, patch compliance, backup status and open risks. It also gives the client a basis for deciding whether the service is worth what it costs, which is a healthier conversation than one held only after an outage.",
        ],
      },
    ],
    seo: {
      title: "What managed IT actually covers",
      description:
        "The difference between support and operation, what a managed IT agreement should specify, and how reporting keeps the service accountable.",
    },
  },
  {
    slug: "three-questions-before-a-cloud-migration",
    title: "Three questions to answer before a cloud migration",
    excerpt:
      "Most migration problems are decisions that were never made: what moves, what stays, and how you get back.",
    category: "Cloud & datacenter",
    readingMinutes: 7,
    publishedAt: "2026-09-24",
    body: [
      {
        heading: "What actually has to move",
        paragraphs: [
          "A workload inventory with dependencies is the starting point. Applications that appear independent often share directory authentication, storage paths or network rules, and those shared dependencies decide the migration order.",
        ],
      },
      {
        heading: "What should stay where it is",
        paragraphs: [
          "Latency-sensitive systems, very large data sets and workloads with strict data-location requirements frequently run better on dedicated capacity. A migration that moves everything because moving is the goal tends to cost more and perform worse.",
        ],
      },
      {
        heading: "How you get back",
        paragraphs: [
          "Each phase needs a rollback position: the previous environment kept intact, the data state recorded, and a tested way to return. Without it, the first unexpected failure turns a planned migration into an incident.",
        ],
      },
    ],
    seo: {
      title: "Three questions before a cloud migration",
      description:
        "Workload inventory, what should stay on dedicated capacity, and the rollback position every migration phase needs.",
    },
  },
  {
    slug: "a-backup-is-not-a-recovery-plan",
    title: "A backup is not a recovery plan",
    excerpt:
      "Backup jobs report success. Recovery is a different claim, and it is only true once someone has tested it.",
    category: "Infrastructure",
    readingMinutes: 5,
    publishedAt: "2026-08-30",
    body: [
      {
        heading: "Success is not integrity",
        paragraphs: [
          "A backup job can complete and still produce something unusable: an application-consistent copy that is not actually consistent, a database dump that omits a log, or a copy stored on the same array as the source.",
        ],
      },
      {
        heading: "The only useful test",
        paragraphs: [
          "Restore into an isolated environment and record how long it takes and what is missing. That produces two numbers a business can act on: the recovery point, meaning how much data is lost, and the recovery time, meaning how long the system is unavailable.",
        ],
      },
      {
        heading: "What to fix first",
        paragraphs: [
          "Start with the systems whose loss would stop the business, verify an off-site copy exists, and put a date on the calendar for the next restore test. A plan that has never been executed is a document, not a capability.",
        ],
      },
    ],
    seo: {
      title: "A backup is not a recovery plan",
      description:
        "Why backup success does not prove recoverability, and the restore test that produces a recovery point and recovery time.",
    },
  },
];

export const insightBySlug = (slug: string) => insights.find((i) => i.slug === slug);
