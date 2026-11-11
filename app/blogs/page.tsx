import Link from "next/link";
import { BlogCard } from "@/components/site/BlogCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { listBlogPosts } from "@/lib/content";
import { formatPostDate, readingMinutes } from "@/lib/content/blogs";
import { pageMetadata } from "@/lib/metadata";
import { figureImage } from "@/lib/site-images";

// Posts are managed in the admin (Admin → Resources → Blogs), so the list is read from the
// database and refreshed every five minutes.
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "IT, Security and Software Blog",
  description:
    "Posts from Infeara on choosing security tests, planning AI automation, scoping software and shortlisting managed IT providers, for people making the decision.",
  path: "/blogs",
});

export default async function BlogsPage() {
  const posts = await listBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <PageFrame>
      <PageHero
        image={figureImage(161)}
        eyebrow="Blogs"
        title="Posts on IT, security and software."
        intro="How to think about scoping, testing, automation and choosing a provider, written for the people who have to make the decision."
        crumbs={[{ label: "Blogs", href: "/blogs" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "Read the guides", href: "/insights" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          {featured ? (
            <div className="grid gap-10 border-b border-navy/10 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow text-coral-ink">Latest post</p>
                <h2 className="mt-4 max-w-[24ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em] text-navy">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-[40rem] text-[1rem] leading-relaxed text-charcoal/75">{featured.excerpt}</p>
                <p className="mt-6 inline-flex rounded-sm bg-blue/10 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-blue">
                  {featured.category}
                </p>
                <p className="mt-4 font-heading text-[0.78rem] text-charcoal/70">
                  <time dateTime={featured.publishedAt}>{formatPostDate(featured.publishedAt)}</time>
                  <span aria-hidden="true"> · </span>
                  {readingMinutes(featured)} min read
                </p>
                <Link href={`/blogs/${featured.slug}`} className="btn-solid mt-8 text-sm">
                  Read post
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <Figure
                seed={featured.figureSeed}
                layout="wide"
                label={featured.category}
                caption={`Illustration for "${featured.title}".`}
              />
            </div>
          ) : null}

          <div className={featured ? "mt-14" : ""}>
            <SectionHeading eyebrow="All posts" title="More from the blog." />

            {rest.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <p className="mt-8 max-w-[36rem] text-[0.95rem] leading-relaxed text-charcoal/70">
                {featured
                  ? "This is the only post so far; more are on the way."
                  : "The first posts are in preparation."}{" "}
                Our longer{" "}
                <Link href="/insights" className="underline underline-offset-4 hover:text-blue">
                  guides
                </Link>{" "}
                cover managed services, cloud migration and recovery testing.
              </p>
            )}
          </div>
        </div>
      </section>

      <CtaBand
        title="Want to talk it through?"
        body="If a post describes something you are dealing with, a short conversation will establish what is actually happening in your environment."
        primary={{ label: "Contact Infeara", href: "/contact" }}
        secondary={{ label: "Browse insights", href: "/insights" }}
      />
    </PageFrame>
  );
}
