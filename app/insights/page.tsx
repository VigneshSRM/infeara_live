import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { figureImage } from "@/lib/site-images";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { InsightCard } from "@/components/site/InsightCard";
import { Figure } from "@/components/site/Figure";
import { listInsights } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Business IT Guides & Resources",
  description:
    "Read practical guides from Infeara's engineering team on managed IT, cybersecurity, cloud migration and reliable infrastructure operations.",
  path: "/insights",
});

export default async function InsightsPage() {
  const insights = await listInsights();
  const [featured, ...rest] = insights;

  return (
    <PageFrame>
      <PageHero
        image={figureImage(3)}
        eyebrow="Technical resources"
        title="Practical guides for running business IT."
        intro="Clear guidance on the systems and decisions that keep business technology secure, supportable and recoverable."
        crumbs={[{ label: "Technical resources", href: "/insights" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          {featured ? (
            <div className="grid gap-10 border-b border-navy/10 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow text-coral-ink">Featured guide</p>
                <h2 className="mt-4 max-w-[24ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em] text-navy">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-[40rem] text-[1rem] leading-relaxed text-charcoal/75">
                  {featured.excerpt}
                </p>
                <p className="mt-6 inline-flex rounded-sm bg-blue/10 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-blue">
                  {featured.category}
                </p>
                <Link href={`/insights/${featured.slug}`} className="btn-solid mt-8 text-sm">
                  View guide
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <Figure
                seed={41}
                layout="wide"
                label="IT operations"
                caption="Engineers monitoring service health and coordinating the work behind stable business systems."
              />
            </div>
          ) : null}

          <div className="mt-14">
            <SectionHeading eyebrow="Resource library" title="Guidance for common IT challenges." />

            {rest.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((insight) => (
                  <InsightCard key={insight.slug} insight={insight} />
                ))}
              </div>
            ) : (
              <p className="mt-8 max-w-[36rem] text-[0.95rem] leading-relaxed text-charcoal/70">
                More practical guides are in preparation. The current library covers managed services, cloud migration
                and recovery testing.
              </p>
            )}
          </div>
        </div>
      </section>

      <CtaBand
        title="Need guidance for your environment?"
        body="Talk with our team about the systems, risks and support needs you are working through."
        primary={{ label: "Contact Infeara", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />
    </PageFrame>
  );
}
