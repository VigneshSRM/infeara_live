import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CookiePreferences } from "@/components/site/CookiePreferences";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { legalBySlug, legalDocuments } from "@/lib/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  return legalDocuments.map((document) => ({ slug: document.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const document = legalBySlug(slug);

  if (!document) return {};

  return pageMetadata({
    title: document.title,
    description: document.description,
    path: `/legal/${document.slug}`,
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const document = legalBySlug(slug);

  if (!document) notFound();

  const others = legalDocuments.filter((item) => item.slug !== document.slug);

  return (
    <PageFrame>
      <PageHero
        eyebrow="Legal"
        title={document.title}
        intro={document.intro}
        crumbs={[
          { label: "Legal", href: "/legal/privacy-policy" },
          { label: document.title, href: `/legal/${document.slug}` },
        ]}
      >
        <p className="mt-8 font-heading text-[10px] uppercase tracking-[0.18em] text-ivory/65">
          Last updated {document.updated}
        </p>
      </PageHero>

      <section className="bg-ivory py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-blue">Contents</p>
            <nav aria-label="Document contents" className="mt-4">
              <ol className="space-y-1.5 border-l border-navy/10">
                {document.sections.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#${slugify(section.heading)}`}
                      className="block border-l-2 border-transparent py-1 pl-4 text-[0.82rem] leading-snug text-charcoal/75 transition-colors hover:border-coral hover:text-navy"
                    >
                      <span className="mr-2 font-display text-[0.72rem] text-blue">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-8 border-t border-navy/10 pt-5">
              <p className="eyebrow text-charcoal/75">Related documents</p>
              <ul className="mt-3 space-y-2">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/legal/${item.slug}`}
                      className="text-[0.84rem] text-blue underline decoration-blue/25 underline-offset-4 hover:decoration-blue"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="max-w-[46rem]">
            {document.sections.map((section, index) => (
              <section
                key={section.heading}
                id={slugify(section.heading)}
                className={`${index === 0 ? "" : "mt-12"} scroll-mt-28`}
              >
                <h2 className="font-display text-[1.45rem] font-medium leading-[1.15] tracking-[-0.02em] text-navy">
                  <span className="mr-3 font-display text-[0.85rem] text-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[0.96rem] leading-[1.75] text-charcoal/80">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.bullets ? (
                  <ul className="mt-5 space-y-2.5 border-l border-navy/10 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item} className="text-[0.94rem] leading-relaxed text-charcoal/75">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {document.slug === "cookies" && section.heading === "Changing your choice" ? (
                  <div className="mt-6">
                    <CookiePreferences />
                  </div>
                ) : null}
              </section>
            ))}

            <div className="mt-14 rounded-[var(--radius-card)] border border-navy/10 bg-white p-7">
              <p className="eyebrow text-blue">Document control</p>
              <dl className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <dt className="font-heading text-[10px] uppercase tracking-[0.16em] text-charcoal/75">Version</dt>
                  <dd className="mt-1 text-[0.9rem] text-charcoal/75">Current</dd>
                </div>
                <div>
                  <dt className="font-heading text-[10px] uppercase tracking-[0.16em] text-charcoal/75">Last updated</dt>
                  <dd className="mt-1 text-[0.9rem] text-charcoal/75">{document.updated}</dd>
                </div>
                <div>
                  <dt className="font-heading text-[10px] uppercase tracking-[0.16em] text-charcoal/75">Owner</dt>
                  <dd className="mt-1 text-[0.9rem] text-charcoal/75">Infeara Technologies</dd>
                </div>
              </dl>
              <p className="mt-5 border-t border-navy/10 pt-4 text-[0.82rem] leading-relaxed text-charcoal/75">
                This document is reviewed when our practices, our providers or applicable law change.
                Questions can be sent to{" "}
                <a href="mailto:contact@infeara.com" className="underline underline-offset-4">
                  contact@infeara.com
                </a>
                .
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-navy/10 bg-white py-20 md:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Governance"
              title="How this document is maintained."
              intro="A policy is only useful if it reflects what actually happens. This document is reviewed against the site's real configuration and the providers in use, not copied from a template and left alone."
            />
            <ul className="mt-8 space-y-3">
              {[
                "Changes to providers or tracking trigger a review.",
                "Material changes are described on the page, not silently edited.",
                "Enquiries about this document go to a named contact.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Schematic
              variant="layers"
              label="Policy hierarchy"
              caption="Policy hierarchy: legal requirement, published policy, internal procedure and operating evidence."
            />
            <Figure
              seed={151}
              label="Review cycle"
              caption="The review cycle: change identified, impact assessed, document updated and the revision date recorded."
            />
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
