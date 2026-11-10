import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMetadata } from "@/lib/metadata";
import { figureImage } from "@/lib/site-images";

// There is nothing to list yet, so the page stays out of search results and out of the sitemap
// (app/sitemap.ts). When the first paper is published: remove `noIndex`, add the route to the
// sitemap and replace the "not published yet" copy below.
export const metadata = pageMetadata({
  title: "White Papers",
  description:
    "Infeara has not published any white papers yet. The guides, blog posts and representative case studies cover the same ground in a shorter form.",
  path: "/white-papers",
  noIndex: true,
});

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

export default function WhitePapersPage() {
  return (
    <PageFrame>
      <PageHero
        image={figureImage(171)}
        eyebrow="White papers"
        title="In-depth papers, published when they are ready."
        intro="We have not published any white papers yet. This page will list them as they are released. Until then, our guides, blog posts and representative case studies cover the same ground in a shorter form."
        crumbs={[{ label: "White papers", href: "/white-papers" }]}
        primary={{ label: "Ask about a topic", href: "/contact" }}
        secondary={{ label: "Read the guides", href: "/insights" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="In the meantime"
            title="Where to start reading."
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
