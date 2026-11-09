import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbSchema } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getIndustry, listIndustries, servicesForIndustry } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const dynamicParams = false;

export async function generateStaticParams() {
  const industries = await listIndustries();
  return industries.map((industry) => ({ slug: industry.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const industry = await getIndustry(slug);

  if (!industry) return {};

  return pageMetadata({
    title: industry.seo.title,
    description: industry.seo.description,
    path: `/industries/${industry.slug}`,
  });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = await getIndustry(slug);

  if (!industry) notFound();

  const services = await servicesForIndustry(industry);
  const crumbs = [
    { label: "Industries", href: "/industries" },
    { label: industry.name, href: `/industries/${industry.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageFrame>
        <section className="hero-surface border-b border-ivory/10">

          <div className="shell relative z-10 py-16 md:py-24">
            <Breadcrumbs items={crumbs} />

            <p className="eyebrow mt-8 text-ivory/80">{industry.tagline}</p>
            <h1 className="mt-4 max-w-[24ch] font-display text-[clamp(2.1rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ivory">
              {industry.name}
            </h1>
            <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-ivory/68">
              {industry.summary}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary text-sm">
                Discuss your environment
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/industries" className="btn-ghost text-sm">
                All industries
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Pressure points"
                title="What we look at first."
                intro="These are the patterns that most often create operational risk in this sector. They are questions for the assessment, not assumptions about your business."
              />

              <ul className="mt-9 space-y-5">
                {industry.challenges.map((challenge, index) => (
                  <li key={challenge} className="flex gap-4 border-t border-navy/10 pt-5">
                    <span className="font-display text-sm text-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[0.94rem] leading-relaxed text-charcoal/75">{challenge}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading
                eyebrow="How we respond"
                title="Capabilities that carry the work."
                intro="The specific mix depends on the assessment. These are the capabilities most often applied in this sector."
              />

              <ul className="mt-9 space-y-5">
                {industry.capabilities.map((capability) => (
                  <li key={capability} className="flex items-start gap-3 border-t border-navy/10 pt-5">
                    <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                    <p className="text-[0.94rem] leading-relaxed text-charcoal/75">{capability}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
            <Figure
              seed={industry.figure.seed}
              label={industry.figure.label}
              caption={industry.figure.caption}
            />
            <div>
              <SectionHeading
                eyebrow="The environment"
                title="One sector constraint, one design decision."
                intro="The illustration is a working model, not a claim about your estate. The assessment replaces assumptions with a documented record of what is installed, how it is used and how it fails."
              />
              <p className="mt-6 max-w-[34rem] text-[0.94rem] leading-relaxed text-charcoal/70">
                Sector experience is useful because it shortens the questions. It does not replace the
                assessment, and we do not treat one client&apos;s architecture as a template for another&apos;s.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Services"
                title="Where this usually starts."
                intro="Each service page describes the scope, the deliverables and the questions we are asked most often."
              />
              <Schematic
                className="w-full max-w-[26rem]"
                variant="mesh"
                label="Service map"
                caption={`Services most often applied to ${industry.name.toLowerCase()}, connected through a single operating agreement.`}
              />
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7 transition-colors duration-150 hover:border-blue/40"
                >
                  <p className="eyebrow text-blue">{service.shortName}</p>
                  <h3 className="mt-4 font-heading text-[1.02rem] font-semibold leading-snug text-navy">
                    {service.tagline}
                  </h3>
                  <p className="mt-3 flex-1 text-[0.88rem] leading-relaxed text-charcoal/70">{service.summary}</p>
                  <span
                    aria-hidden="true"
                    className="mt-6 text-blue transition-colors duration-100 group-hover:text-coral"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Start with the estate, not the sector."
          body="We will map what you operate and where the sector requirements change the answer."
          primary={{ label: "Request a consultation", href: "/contact" }}
          secondary={{ label: "See the support model", href: "/sla" }}
        />
      </PageFrame>
    </>
  );
}
