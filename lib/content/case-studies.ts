// Case studies live in the database and are managed in the admin (Admin → Resources → Case
// studies). This file is the shape, a few pure helpers, and the three starter entries: the seed
// that supabase/migrations/20261110200100_resource_modules_seed.sql copies into the database,
// and the fallback the site shows only while the case_studies table does not exist yet.
//
// The site's rule, which the admin enforces in the database as well (see
// 20261110200000_resource_modules.sql):
//
//   * "representative" entries describe the shape of an engagement. They name no client and
//     carry no percentages, time savings or availability figures, because those belong to a
//     specific client and need that client's approval to publish.
//   * "client" entries are named studies. A client entry cannot be published until the
//     client's approval is recorded, and it must name the client.
//
// This file deliberately has no imports, so tests and scripts can load it as it is.

export type CaseStudyKind = "representative" | "client";

export type CaseStudy = {
  slug: string;
  title: string;
  sector: string;
  kind: CaseStudyKind;
  /** Only for kind "client". Never set on a representative entry. */
  clientName: string | null;
  situation: string;
  work: string[];
  result: string;
  /** Slugs of pages under /services, e.g. "managed-it". */
  services: string[];
  seo: { title: string; description: string };
};

export const caseStudyKindLabel: Record<CaseStudyKind, string> = {
  representative: "Representative engagement",
  client: "Client case study",
};

/** Written for the page's eyebrow: short, and honest about what the reader is looking at. */
export function caseStudyLabel(study: Pick<CaseStudy, "kind" | "clientName">): string {
  return study.kind === "client" && study.clientName ? `Client: ${study.clientName}` : caseStudyKindLabel[study.kind];
}

/** "managed-it" becomes "managed it"; the page shows it as a link label. */
export function serviceLinkLabel(slug: string): string {
  return slug.replace(/-/g, " ");
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "taking-over-an-undocumented-server-estate",
    title: "Taking over an undocumented server estate",
    sector: "Professional services",
    kind: "representative",
    clientName: null,
    situation:
      "A firm had servers installed over several years by different suppliers. Documentation was partial, backup jobs existed but had not been restored, and no one could describe the dependency between the file services and the line-of-business application.",
    work: [
      "Recorded the estate, including the undocumented virtual hosts and storage paths.",
      "Verified backup integrity and ran a restore test into an isolated environment.",
      "Documented the dependency map and the access model.",
      "Moved monitoring and patching into a defined operating service.",
    ],
    result:
      "The estate became supportable by someone other than the original installer, with a verified restore and a current record.",
    services: ["it-infrastructure", "managed-it"],
    seo: {
      title: "Taking over an undocumented server estate",
      description:
        "A representative engagement: recording an undocumented server estate, proving the backups restore and moving it into a defined operating service.",
    },
  },
  {
    slug: "separating-plant-and-office-networks",
    title: "Separating plant and office networks",
    sector: "Manufacturing",
    kind: "representative",
    clientName: null,
    situation:
      "Production equipment and corporate systems shared a flat network. A single compromised office endpoint could reach the plant floor, and change windows for either side were coordinated informally.",
    work: [
      "Mapped the traffic paths between plant equipment, servers and office users.",
      "Designed segmentation with documented rules and a phased cutover.",
      "Applied firewall changes with a rollback position for each phase.",
      "Recorded the resulting topology and change process.",
    ],
    result: "Plant and office traffic follow documented paths, with changes coordinated through a single record.",
    services: ["network-engineering", "cybersecurity"],
    seo: {
      title: "Separating plant and office networks",
      description:
        "A representative engagement: separating a flat plant and office network with documented rules, a phased cutover and a rollback for each phase.",
    },
  },
  {
    slug: "making-recovery-a-tested-capability",
    title: "Making recovery a tested capability",
    sector: "Healthcare",
    kind: "representative",
    clientName: null,
    situation:
      "A clinical environment had nightly backups and an assumed recovery time. The backup product reported success, but no restore had been attempted and the dependency on directory services was unclear.",
    work: [
      "Defined recovery point and recovery time expectations per system.",
      "Confirmed an off-site copy existed and was independent of the primary storage.",
      "Tested restores for the clinical application and its directory dependencies.",
      "Recorded actual recovery times and the sequence for restoring service.",
    ],
    result: "Recovery expectations are now based on measured restores rather than on backup job status.",
    services: ["cloud-datacenter", "managed-it"],
    seo: {
      title: "Making recovery a tested capability",
      description:
        "A representative engagement: replacing an assumed recovery time with measured restore tests for a clinical application and its directory dependencies.",
    },
  },
];
