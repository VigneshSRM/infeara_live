import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { InsightCard } from "@/components/site/InsightCard";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { listInsights } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Insights",
  description:
    "Practical writing on managed IT, cybersecurity, cloud migration and infrastructure operations from the Infeara engineering team.",
  path: "/insights",
});

export default async function InsightsPage() {
  const insights = await listInsights();
  const [featured, ...rest] = insights;

  return (
    <PageFrame>
      <PageHero
        eyebrow="Insights"
        title="Notes from operating the estate."
        intro="Short, practical writing about the decisions that keep infrastructure supportable. No trend pieces, no vendor messaging. If we have not done the work, we do not write about it as though we have."
        crumbs={[{ label: "Insights", href: "/insights" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          {featured ? (
            <div className="grid gap-10 border-b border-navy/10 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow text-coral-ink">Latest</p>
                <h2 className="mt-4 max-w-[24ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em] text-navy">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-[40rem] text-[1rem] leading-relaxed text-charcoal/75">
                  {featured.excerpt}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-heading text-[10px] uppercase tracking-[0.16em] text-charcoal/75">
                  <span className="text-blue">{featured.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featured.readingMinutes} min read</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={featured.publishedAt}>
                    {new Date(`${featured.publishedAt}T00:00:00Z`).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                </div>
                <Link href={`/insights/${featured.slug}`} className="btn-solid mt-8 text-sm">
                  Read the article
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <Figure
                seed={41}
                label="Operations note"
                caption="An operating record: monitoring signals, change entries and reports read together rather than in isolation."
              />
            </div>
          ) : null}

          <div className="mt-14">
            <SectionHeading eyebrow="All articles" title="The archive." />

            {rest.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((insight) => (
                  <InsightCard key={insight.slug} insight={insight} />
                ))}
              </div>
            ) : (
              <p className="mt-8 max-w-[36rem] text-[0.95rem] leading-relaxed text-charcoal/70">
                More articles are in preparation. The first three cover managed services, cloud migration
                and recovery testing.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-16 md:py-20">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Editorial policy" title="Why there are no statistics here." />
            <div className="mt-6 space-y-4 text-[0.94rem] leading-relaxed text-charcoal/75">
              <p>
                We publish numbers when we can evidence them: internal measurements, documented outcomes, or
                figures a client has agreed to release. Anything else would be decoration.
              </p>
              <p>
                Where an article describes a pattern rather than a measured result, it says so. The same rule
                applies to case studies.
              </p>
            </div>
          </div>

          <Schematic
            variant="grid"
            label="Editorial standard"
            caption="The editorial standard: claim, evidence, review and publication, with any unevidenced statement removed before publishing."
          />
        </div>
      </section>

      <CtaBand
        title="Have a question the articles do not answer?"
        body="Ask it directly. We will answer with what we know and say when we do not."
        primary={{ label: "Contact Infeara", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />
    </PageFrame>
  );
}
