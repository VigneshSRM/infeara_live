import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { figureImage } from "@/lib/site-images";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { IndustryCard } from "@/components/site/IndustryCard";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { listIndustries } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Industries We Support",
  description:
    "See how Infeara's managed IT, cybersecurity and infrastructure services support banking, healthcare, manufacturing, retail, education, logistics and business offices.",
  path: "/industries",
});

export default async function IndustriesPage() {
  const industries = await listIndustries();

  return (
    <PageFrame>
      <PageHero
        image={figureImage(6)}
        eyebrow="Industries"
        title="IT services for business-critical industries."
        intro="The same technology decision carries different risk in a hospital, a plant and a trading floor. These pages describe what we look at first in each sector, and which services usually carry the work."
        crumbs={[{ label: "Industries", href: "/industries" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Sectors"
            title="Where our operating model fits."
            intro="We do not claim every sector. These are the environments where our engineering, security and support practices are most often applied."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <IndustryCard key={industry.slug} industry={industry} withImage />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={31}
            layout="portrait"
            label="Sector pressure"
            caption="Sector requirements compared: availability, confidentiality, evidence and change tolerance differ by environment."
          />
          <div>
            <SectionHeading
              eyebrow="Common ground"
              title="Different sectors, same four questions."
              intro="Whatever the industry, the first assessment asks the same things. The answers decide the design."
            />

            <dl className="mt-9 divide-y divide-navy/10 border-y border-navy/10">
              {[
                { term: "What must stay available?", detail: "And during which hours, at what cost of failure." },
                { term: "What must stay confidential?", detail: "Which data, whose access, and how it is evidenced." },
                { term: "What must be provable?", detail: "Which records an auditor, regulator or client will ask for." },
                { term: "What can change safely?", detail: "The maintenance windows, dependencies and rollback positions." },
              ].map((item) => (
                <div key={item.term} className="grid gap-2 py-5 sm:grid-cols-[1fr_1.2fr] sm:gap-6">
                  <dt className="font-heading text-[0.95rem] font-semibold text-navy">{item.term}</dt>
                  <dd className="text-[0.9rem] leading-relaxed text-charcoal/70">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Operating model"
              title="One standard, applied to the sector's constraints."
              intro="Sector-specific requirements change the schedule, the controls and the evidence. They do not change the commitment to a named owner, a documented change and a tested recovery."
            />
            <p className="mt-6 max-w-[36rem] text-[0.95rem] leading-relaxed text-charcoal/70">
              Where a requirement falls outside our competence — statutory audit, clinical validation or
              legal interpretation — we say so and work alongside the adviser who owns it.
            </p>
          </div>

          <Schematic
            variant="grid"
            layout="wide"
            label="Sector matrix"
            caption="A sector matrix: availability, confidentiality, evidence and change tolerance mapped to the services that address them."
          />
        </div>
      </section>

      <CtaBand
        title="Tell us about your environment."
        body="Sector context helps, but the assessment starts with what you actually operate. We will ask for the estate, not the brochure."
        primary={{ label: "Request a consultation", href: "/contact" }}
        secondary={{ label: "Explore services", href: "/services" }}
      />
    </PageFrame>
  );
}
