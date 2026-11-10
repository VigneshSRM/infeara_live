import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogCard } from "@/components/site/BlogCard";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  blogPosts,
  formatPostDate,
  getBlogPost,
  listBlogPosts,
  readingMinutes,
  type BlogPost,
} from "@/lib/content/blogs";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

// Posts live in lib/content/blogs.ts, so every page is built ahead of time and any other
// address under /blogs is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return {};

  return pageMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blogs/${post.slug}`,
  });
}

function postSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
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
      "@id": `${SITE_URL}/blogs/${post.slug}`,
    },
    inLanguage: "en-IN",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const related = listBlogPosts()
    .filter((item) => item.slug !== post.slug)
    .slice(0, 2);
  const crumbs = [
    { label: "Blogs", href: "/blogs" },
    { label: post.title, href: `/blogs/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={postSchema(post)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">
          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            <p className="mt-8 inline-flex rounded-sm border border-ivory/20 bg-ivory/5 px-3 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/80">
              {post.category}
            </p>

            <h1 className="mt-5 max-w-[26ch] font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.03] tracking-[-0.03em] text-ivory">
              {post.title}
            </h1>

            <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-ivory/68">{post.excerpt}</p>

            <p className="mt-6 font-heading text-[0.78rem] text-ivory/70">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span aria-hidden="true"> · </span>
              {readingMinutes(post)} min read
            </p>
          </div>
        </section>

        <article className="bg-ivory py-16 md:py-24">
          <div className="shell grid gap-12 lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-20">
            <div>
              {post.body.map((section, index) => (
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

              {post.relatedServices.length > 0 ? (
                <div className="mt-14 rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
                  <p className="eyebrow text-blue">Related services</p>
                  <p className="mt-3 text-[0.94rem] leading-relaxed text-charcoal/75">
                    If this post describes something you are dealing with, these service pages are the
                    practical next step.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {post.relatedServices.map((service, index) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className={`${index === 0 ? "btn-solid" : "btn-outline"} text-sm`}
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-10">
              <Figure
                seed={post.figureSeed}
                layout="portrait"
                label={post.category}
                caption={`Illustration for "${post.title}".`}
              />
            </aside>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="border-t border-navy/10 bg-ivory py-20 md:py-24">
            <div className="shell">
              <SectionHeading eyebrow="Keep reading" title="More from the blog." />
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {related.map((item) => (
                  <BlogCard key={item.slug} post={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <CtaBand
          title="Apply this to your environment."
          body="If the situation sounds familiar, a short conversation will establish what is actually happening where you work."
          primary={{ label: "Talk to an expert", href: "/contact" }}
          secondary={{ label: "All blog posts", href: "/blogs" }}
        />
      </PageFrame>
    </>
  );
}
