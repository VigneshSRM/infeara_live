import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { WhitePaperCard } from "@/components/site/WhitePaperCard";
import { listWhitePapers } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { figureImage } from "@/lib/site-images";

// White papers are managed in the admin (Admin → Resources → White papers). While none is
// published the page stays out of search results and says so plainly; the moment one is
// published it becomes indexable and lists it (and app/sitemap.ts adds the pages).
export const revalidate = 300;

export async function generateMetadata() {
  const papers = await listWhitePapers();

  if (papers.length === 0) {
    return pageMetadata({
      title: "White Papers",
      description:
        "Infeara has not published any white papers yet. The guides, blog posts and representative case studies cover the same ground in a shorter form.",
      path: "/white-papers",
      noIndex: true,
    });
  }

  return pageMetadata({
    title: "White Papers",
    description:
      "In-depth papers from Infeara on IT operations, security and software, free to open and read with no form to fill in.",
    path: "/white-papers",
  });
}

const meanwhile = [
  {
    title: "Insights",
    detail: "Practical guides on managed IT, cloud migration and recovery testing.",
    href: "/insights",
    action: "Read the guides",
  },
  {
    title: "Blogs",
    detail: "Short posts on IT, security and software, written for the people making the decision.",
    href: "/blogs",
    action: "Read the blog",
  },
  {
    title: "Case studies",
    detail: "Representative engagements, described without figures we cannot substantiate.",
    href: "/case-studies",
    action: "See case studies",
  },
];

export default async function WhitePapersPage() {
  const papers = await listWhitePapers();
  const hasPapers = papers.length > 0;

  return (
    <PageFrame>
      <PageHero
        image={figureImage(171)}
        eyebrow="White papers"
        title={hasPapers ? "In-depth papers on IT, security and software." : "In-depth papers, published when they are ready."}
        intro={
          hasPapers
            ? "Longer than our guides and written for the people who have to make the decision. Each one opens straight from this page, with no form to fill in first."
            : "We have not published any white papers yet. This page will list them as they are released. Until then, our guides, blog posts and representative case studies cover the same ground in a shorter form."
        }
        crumbs={[{ label: "White papers", href: "/white-papers" }]}
        primary={{ label: "Ask about a topic", href: "/contact" }}
        secondary={{ label: "Read the guides", href: "/insights" }}
      />

      {hasPapers ? (
        <section className="bg-ivory py-20 md:py-28">
          <div className="shell">
            <SectionHeading eyebrow="Papers" title="Read and download." />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {papers.map((paper) => (
                <WhitePaperCard key={paper.slug} paper={paper} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${hasPapers ? "border-t border-navy/10" : ""} bg-ivory py-20 md:py-28`}>
        <div className="shell">
          <SectionHeading
            eyebrow={hasPapers ? "More to read" : "In the meantime"}
            title={hasPapers ? "Shorter reads on the same ground." : "Where to start reading."}
            intro="Nothing here is hidden behind a form. Each of these is open to read."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {meanwhile.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7 transition-colors hover:border-blue/40"
              >
                <h3 className="font-heading text-[1.05rem] font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-charcoal/70">{item.detail}</p>
                <span className="mt-5 font-heading text-[0.8rem] font-semibold text-blue group-hover:text-navy">
                  {item.action} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Looking for a paper on a specific topic?"
        body="Tell us what you are trying to decide. If we are preparing something relevant we will say so, and if not we will say that too."
        primary={{ label: "Contact Infeara", href: "/contact" }}
        secondary={{ label: "Browse insights", href: "/insights" }}
      />
    </PageFrame>
  );
}
