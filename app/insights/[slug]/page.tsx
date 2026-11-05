import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getInsight, listInsights } from "@/lib/content";
import type { Insight } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

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
    { label: "Insights", href: "/insights" },
    { label: insight.title, href: `/insights/${insight.slug}` },
  ];

  return (
    <>
      <JsonLd data={articleSchema(insight)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-vignette" aria-hidden="true" />

          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-heading text-[10px] uppercase tracking-[0.18em] text-ivory/65">
              <span className="text-coral/90">{insight.category}</span>
              <span aria-hidden="true">·</span>
              <span>{insight.readingMinutes} min read</span>
              <span aria-hidden="true">·</span>
              <time dateTime={insight.publishedAt}>
                {new Date(`${insight.publishedAt}T00:00:00Z`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            </div>

            <h1 className="lift mt-5 max-w-[26ch] font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.03] tracking-[-0.03em] text-ivory">
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
                <section key={section.heading} className={index === 0 ? "" : "mt-12"}>
                  <h2 className="font-display text-[1.55rem] font-medium leading-[1.15] tracking-[-0.02em] text-navy">
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

              <div className="mt-14 rounded-[var(--radius-card)] border border-navy/10 bg-white p-7">
                <p className="eyebrow text-blue">Related service</p>
                <p className="mt-3 text-[0.94rem] leading-relaxed text-charcoal/75">
                  This article sits inside our managed IT and infrastructure practice. If it describes
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
                label="Working note"
                caption={`Supporting illustration for "${insight.title}": the operational records behind the argument.`}
              />
              <Schematic
                variant="loop"
                label="Operating loop"
                caption="The operating loop referenced in the article: detect, triage, change, verify and report."
              />
            </aside>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="border-t border-navy/10 bg-white py-20 md:py-24">
            <div className="shell">
              <SectionHeading eyebrow="Continue reading" title="Other notes from the team." />
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/insights/${item.slug}`}
                    className="group rounded-[var(--radius-card)] border border-navy/10 p-7 transition-colors hover:border-blue/40"
                  >
                    <p className="eyebrow text-blue">{item.category}</p>
                    <h3 className="mt-4 font-display text-[1.3rem] font-medium leading-[1.2] tracking-[-0.02em] text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[0.9rem] leading-relaxed text-charcoal/70">{item.excerpt}</p>
                    <span
                      aria-hidden="true"
                      className="mt-6 inline-block text-blue transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <CtaBand
          title="Put the article into practice."
          body="If the situation sounds familiar, a short conversation will establish what is actually happening in your environment."
          primary={{ label: "Talk to an expert", href: "/contact" }}
          secondary={{ label: "Back to insights", href: "/insights" }}
        />
      </PageFrame>
    </>
  );
}
