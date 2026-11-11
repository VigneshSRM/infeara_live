import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CaseStudyServiceLinks } from "@/components/site/CaseStudyServiceLinks";
import { CtaBand } from "@/components/site/CtaBand";
import { PageFrame } from "@/components/site/PageFrame";
import { getCaseStudy, listCaseStudies, listServices } from "@/lib/content";
import { caseStudyLabel, type CaseStudy } from "@/lib/content/case-studies";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

// One page per case study, so each entry has its own address and its own SEO fields. Managed in
// the admin (Admin → Resources → Case studies). Pages that exist at build time are built ahead;
// one published later is rendered on its first visit; anything else is a 404.
export const revalidate = 300;

export async function generateStaticParams() {
  const studies = await listCaseStudies();
  return studies.map((study) => ({ slug: study.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};

  return pageMetadata({
    title: study.seo.title,
    description: study.seo.description,
    path: `/case-studies/${study.slug}`,
  });
}

function studySchema(study: CaseStudy) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.seo.description,
    author: { "@type": "Organization", name: "Infeara Technologies", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Infeara Technologies",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/infeara-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/case-studies/${study.slug}` },
    inLanguage: "en-IN",
  };
}

const heading = "font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal/75";

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const services = await listServices();
  const known = new Set(services.map((service) => service.slug));
  const crumbs = [
    { label: "Case studies", href: "/case-studies" },
    { label: study.title, href: `/case-studies/${study.slug}` },
  ];

  return (
    <>
      <JsonLd data={studySchema(study)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            <p className="mt-8 inline-flex rounded-sm border border-ivory/20 bg-ivory/5 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/80">
              {caseStudyLabel(study)}
            </p>

            <h1 className="mt-5 max-w-[26ch] font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.03] tracking-[-0.03em] text-ivory">
              {study.title}
            </h1>

            <p className="mt-6 font-heading text-[0.78rem] text-ivory/70">{study.sector}</p>
          </div>
        </section>

        <article className="bg-ivory py-16 md:py-24">
          <div className="shell grid gap-12 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
            <div>
              <section className="border-t border-navy/10 pt-6">
                <h2 className={heading}>The situation</h2>
                <p className="mt-4 text-[1rem] leading-[1.75] text-charcoal/80">{study.situation}</p>
              </section>

              {study.work.length > 0 ? (
                <section className="mt-10 border-t border-navy/10 pt-6">
                  <h2 className={heading}>What we did</h2>
                  <ul className="mt-4 space-y-3">
                    {study.work.map((step, index) => (
                      <li key={`${index}-${step}`} className="flex items-start gap-3 text-[1rem] leading-[1.7] text-charcoal/80">
                        <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="mt-10 border-t border-navy/10 pt-6">
                <h2 className={heading}>Change in state</h2>
                <p className="mt-4 text-[1rem] leading-[1.75] text-charcoal/80">{study.result}</p>
              </section>

              <CaseStudyServiceLinks slugs={study.services.filter((item) => known.has(item))} />
            </div>

            <aside className="space-y-6">
              <div className="rounded-[var(--radius-card)] border border-blue/20 bg-ivory p-7">
                <p className="eyebrow text-blue">
                  {study.kind === "client" ? "A named client study" : "How to read this entry"}
                </p>
                <p className="mt-4 text-[0.92rem] leading-relaxed text-charcoal/75">
                  {study.kind === "client"
                    ? `${study.clientName ?? "The client"} has approved the publication of this study.`
                    : "This is a representative engagement: it describes the situation, the work and the change in operating state without naming a client. It carries no percentages, time savings or availability figures, because those numbers belong to a specific client and need their approval to publish."}
                </p>
                <Link href="/case-studies" className="link-arrow mt-6">
                  All case studies <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          </div>
        </article>

        <CtaBand
          title="Have a situation like this?"
          body="If the starting point sounds familiar, a short conversation will establish what is actually happening in your environment and what we would do first."
          primary={{ label: "Discuss a similar situation", href: "/contact" }}
          secondary={{ label: "All case studies", href: "/case-studies" }}
        />
      </PageFrame>
    </>
  );
}
