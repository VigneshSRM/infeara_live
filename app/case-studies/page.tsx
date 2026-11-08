import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { figureImage } from "@/lib/site-images";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Case Studies",
  description:
    "How Infeara approaches representative engagements, and the evidence policy that governs named case studies and published outcomes.",
  path: "/case-studies",
});

const engagements = [
  {
    sector: "Professional services",
    title: "Taking over an undocumented server estate",
    situation:
      "A firm had servers installed over several years by different suppliers. Documentation was partial, backup jobs existed but had not been restored, and no one could describe the dependency between the file services and the line-of-business application.",
    work: [
      "Recorded the estate, including the undocumented virtual hosts and storage paths.",
      "Verified backup integrity and ran a restore test into an isolated environment.",
      "Documented the dependency map and the access model.",
      "Moved monitoring and patching into a defined operating service.",
    ],
    result: "The estate became supportable by someone other than the original installer, with a verified restore and a current record.",
    services: ["it-infrastructure", "managed-it"],
  },
  {
    sector: "Manufacturing",
    title: "Separating plant and office networks",
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
  },
  {
    sector: "Healthcare",
    title: "Making recovery a tested capability",
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
  },
];

export default function CaseStudiesPage() {
  return (
    <PageFrame>
      <PageHero
        image={figureImage(6)}
        eyebrow="Case studies"
        title="Evidence before storytelling."
        intro="We publish outcomes only when a client has approved them and the evidence exists. Until then, this page describes the shape of representative engagements without attributing them to named clients or attaching figures we cannot substantiate."
        crumbs={[{ label: "Case studies", href: "/case-studies" }]}
        primary={{ label: "Discuss a similar situation", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />

      <section className="bg-ivory py-14 md:py-16">
        <div className="shell">
          <div className="rounded-[var(--radius-card)] border border-blue/20 bg-white p-7 md:p-8">
            <p className="eyebrow text-blue">How to read this page</p>
            <p className="mt-4 max-w-[58rem] text-[0.94rem] leading-relaxed text-charcoal/75">
              The engagements below are <strong className="font-semibold text-navy">representative patterns</strong>,
              not attributed client stories. They describe the situation, the work and the change in operating
              state. There are no percentages, time savings or availability figures, because those numbers
              belong to a specific client and require their approval to publish. Named studies will replace
              these entries as permissions are confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory pb-20 md:pb-28">
        <div className="shell space-y-6">
          {engagements.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-8 rounded-[var(--radius-card)] border border-navy/10 bg-white p-7 md:p-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14"
            >
              <div>
                <p className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</p>
                <p className="eyebrow mt-4 text-blue">{item.sector}</p>
                <h2 className="mt-4 font-display text-[1.6rem] font-medium leading-[1.12] tracking-[-0.025em] text-navy">
                  {item.title}
                </h2>
                <p className="mt-5 text-[0.9rem] leading-relaxed text-charcoal/70">{item.situation}</p>
              </div>

              <div>
                <h3 className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">What we did</h3>
                <ul className="mt-4 space-y-2.5">
                  {item.work.map((step) => (
                    <li key={step} className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                      <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                      {step}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 border-t border-navy/10 pt-5">
                  <h3 className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">Change in state</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal/80">{item.result}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {item.services.map((slug) => (
                    <Link
                      key={slug}
                      href={`/services/${slug}`}
                      className="rounded-sm border border-navy/15 px-4 py-1.5 font-heading text-[0.76rem] text-navy transition-colors hover:border-blue/50 hover:text-blue"
                    >
                      {slug.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Schematic
            variant="loop"
            label="Evidence loop"
            caption="The evidence loop behind a publishable case study: baseline recorded, change applied, result measured and client approval obtained."
          />
          <div>
            <SectionHeading
              eyebrow="Policy"
              title="What a named study will include."
              intro="When a client agrees to be named, the study will contain the elements below. Until all of them exist, the story stays unpublished."
            />

            <ol className="mt-8 space-y-4">
              {[
                "The baseline, recorded before the engagement began.",
                "The scope and the constraints the client set.",
                "What was changed, with the sequence and the rollback positions.",
                "The measured result, defined before the work started.",
                "The client's written approval to publish the detail.",
              ].map((item, index) => (
                <li key={item} className="flex gap-4 border-t border-navy/10 pt-4">
                  <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-[0.92rem] leading-relaxed text-charcoal/75">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={91}
            label="Measured change"
            caption="A baseline compared with a measured result: the shape of evidence required before an outcome is published."
          />
          <div>
            <SectionHeading
              eyebrow="Your baseline"
              title="Start by measuring what you have."
              intro="A case study is only as good as its baseline. The same is true of an engagement: without a recorded starting point, improvement is an opinion."
            />
            <p className="mt-6 max-w-[34rem] text-[0.95rem] leading-relaxed text-charcoal/70">
              Our assessment produces that baseline: the estate record, the risk list and the current
              operating state. It is also the first thing a client keeps if the engagement stops there.
            </p>
            <Link href="/contact" className="link-arrow mt-8">
              Request an assessment <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Have a situation worth documenting?"
        body="If you are weighing a change and want a second view, we will look at the estate and tell you what we would do first."
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "Read our approach", href: "/approach" }}
      />
    </PageFrame>
  );
}
