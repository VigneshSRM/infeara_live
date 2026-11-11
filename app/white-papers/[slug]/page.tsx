import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { PageFrame } from "@/components/site/PageFrame";
import { SectionHeading } from "@/components/site/SectionHeading";
import { paperFacts, WhitePaperCard } from "@/components/site/WhitePaperCard";
import { getWhitePaper, listWhitePapers } from "@/lib/content";
import { formatPostDate } from "@/lib/content/blogs";
import type { WhitePaper } from "@/lib/content/white-papers";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

// One page per white paper, with its own address and SEO fields. Managed in the admin (Admin →
// Resources → White papers). Pages that exist at build time are built ahead; one published later is
// rendered on its first visit; anything else is a 404.
export const revalidate = 300;

export async function generateStaticParams() {
  const papers = await listWhitePapers();
  return papers.map((paper) => ({ slug: paper.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const paper = await getWhitePaper(slug);
  if (!paper) return {};

  return pageMetadata({
    title: paper.seo.title,
    description: paper.seo.description,
    path: `/white-papers/${paper.slug}`,
  });
}

function paperSchema(paper: WhitePaper) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: paper.title,
    description: paper.seo.description,
    ...(paper.publishedAt ? { datePublished: paper.publishedAt } : {}),
    author: { "@type": "Organization", name: "Infeara Technologies", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Infeara Technologies",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/infeara-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/white-papers/${paper.slug}` },
    inLanguage: "en-IN",
  };
}

export default async function WhitePaperPage({ params }: Props) {
  const { slug } = await params;
  const paper = await getWhitePaper(slug);
  if (!paper) notFound();

  const others = (await listWhitePapers()).filter((item) => item.slug !== paper.slug).slice(0, 2);
  const { date, size } = paperFacts(paper);
  const crumbs = [
    { label: "White papers", href: "/white-papers" },
    { label: paper.title, href: `/white-papers/${paper.slug}` },
  ];

  return (
    <>
      <JsonLd data={paperSchema(paper)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            {paper.topic ? (
              <p className="mt-8 inline-flex rounded-sm border border-ivory/20 bg-ivory/5 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/80">
                {paper.topic}
              </p>
            ) : null}

            <h1 className="mt-5 max-w-[26ch] font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.03] tracking-[-0.03em] text-ivory">
              {paper.title}
            </h1>

            <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-ivory/68">{paper.summary}</p>

            {date ? (
              <p className="mt-6 font-heading text-[0.78rem] text-ivory/70">
                <time dateTime={date}>{formatPostDate(date)}</time>
              </p>
            ) : null}
          </div>
        </section>

        <section className="bg-ivory py-16 md:py-24">
          <div className="shell">
            <div className="max-w-[42rem] rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7 md:p-9">
              <p className="eyebrow text-blue">The paper</p>

              {paper.fileUrl ? (
                <>
                  <p className="mt-4 text-[0.96rem] leading-relaxed text-charcoal/75">
                    Open it straight from here. There is no form to fill in first.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-solid text-sm">
                      Open the paper
                      <span className="sr-only"> (opens in a new tab)</span>
                      <span aria-hidden="true">→</span>
                    </a>
                    {paper.fileName || size ? (
                      <p className="font-heading text-[0.78rem] text-charcoal/70">
                        {paper.fileName ?? ""}
                        {paper.fileName && size ? <span aria-hidden="true"> · </span> : null}
                        {size}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-[0.96rem] leading-relaxed text-charcoal/75">
                  The file for this paper is not available right now. Please{" "}
                  <Link href="/contact" className="underline underline-offset-4 hover:text-blue">
                    get in touch
                  </Link>{" "}
                  and we will send it to you.
                </p>
              )}
            </div>
          </div>
        </section>

        {others.length > 0 ? (
          <section className="border-t border-navy/10 bg-ivory py-20 md:py-24">
            <div className="shell">
              <SectionHeading eyebrow="Keep reading" title="More white papers." />
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {others.map((item) => (
                  <WhitePaperCard key={item.slug} paper={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <CtaBand
          title="Want to talk it through?"
          body="If the paper describes something you are dealing with, a short conversation will establish what is actually happening where you work."
          primary={{ label: "Talk to an expert", href: "/contact" }}
          secondary={{ label: "All white papers", href: "/white-papers" }}
        />
      </PageFrame>
    </>
  );
}
