import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { InsightCard } from "@/components/site/InsightCard";
import { getInsight, listInsights } from "@/lib/content";
import type { Insight } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export const dynamicParams = true;

export async function generateStaticParams() {
  const insights = await listInsights();
  return insights.map((insight) => ({ slug: insight.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const insight = await getInsight(slug);

  if (!insight) return {};

  return pageMetadata({
    title: insight.seo.title,
    description: insight.seo.description,
    path: `/insights/${insight.slug}`,
  });
}

function articleSchema(insight: Insight) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.seo.description,
    datePublished: insight.publishedAt,
    dateModified: insight.publishedAt,
    author: {
      "@type": "Organization",
      name: "Infeara Technologies",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Infeara Technologies",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/infeara-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/insights/${insight.slug}`,
    },
    inLanguage: "en-IN",
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const insight = await getInsight(slug);

  if (!insight) notFound();

  const all = await listInsights();
  const related = all.filter((item) => item.slug !== insight.slug).slice(0, 2);
  const crumbs = [
    { label: "Technical resources", href: "/insights" },
    { label: insight.title, href: `/insights/${insight.slug}` },
  ];

  return (
    <>
      <JsonLd data={articleSchema(insight)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">

          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            <p className="mt-8 inline-flex rounded-sm border border-ivory/20 bg-ivory/5 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/80">
              {insight.category} guide
            </p>

            <h1 className="mt-5 max-w-[26ch] font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.03] tracking-[-0.03em] text-ivory">
              {insight.title}
            </h1>

            <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-ivory/68">
              {insight.excerpt}
            </p>
          </div>
        </section>

        <article className="bg-ivory py-16 md:py-24">
          <div className="shell grid gap-12 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
            <div>
              {insight.body.map((section, index) => (
                <section
                  key={section.heading}
                  className={`${index === 0 ? "" : "mt-10"} border-t border-navy/10 pt-6`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-heading text-[10px] font-semibold tracking-[0.12em] text-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-7 bg-coral" aria-hidden="true" />
                  </div>
                  <h2 className="font-heading text-[1.2rem] font-semibold leading-[1.3] text-navy">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-[1rem] leading-[1.75] text-charcoal/80">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}

              <div className="mt-14 rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
                <p className="eyebrow text-blue">Related service</p>
                <p className="mt-3 text-[0.94rem] leading-relaxed text-charcoal/75">
                  This guide sits inside our managed IT and infrastructure practice. If it describes
                  something you are dealing with, the service page is the practical next step.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/services/managed-it" className="btn-solid text-sm">
                    Managed IT
                  </Link>
                  <Link href="/services/it-infrastructure" className="btn-outline text-sm">
                    IT infrastructure
                  </Link>
                </div>
              </div>
            </div>

            <aside className="space-y-10">
              <Figure
                seed={51 + insight.readingMinutes}
                layout="portrait"
                label="IT operations"
                caption={`Supporting illustration for "${insight.title}": the infrastructure and people involved in the recommended approach.`}
              />
              <Schematic
                variant="loop"
                layout="square"
                label="Operating loop"
                caption="The operating loop for this process: detect, triage, change, verify and report."
              />
            </aside>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="border-t border-navy/10 bg-ivory py-20 md:py-24">
            <div className="shell">
              <SectionHeading eyebrow="Related resources" title="More guidance for your team." />
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {related.map((item) => (
                  <InsightCard key={item.slug} insight={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <CtaBand
          title="Apply this guidance to your environment."
          body="If the situation sounds familiar, a short conversation will establish what is actually happening in your environment."
          primary={{ label: "Talk to an expert", href: "/contact" }}
          secondary={{ label: "Browse technical resources", href: "/insights" }}
        />
      </PageFrame>
    </>
  );
}
