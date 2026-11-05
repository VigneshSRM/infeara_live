import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, faqSchema } from "@/components/site/FaqList";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { faqGroups } from "@/lib/content/faqs";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about Infeara's managed IT services, security practice, support model, commercials and onboarding.",
  path: "/faq",
});

export default function FaqPage() {
  const all = faqGroups.flatMap((group) => group.items);

  return (
    <>
      <JsonLd data={faqSchema(all)} />

      <PageFrame>
        <PageHero
          eyebrow="FAQ"
          title="Questions worth asking before you sign."
          intro="These are the questions we are asked most often. Where the answer depends on your estate or your contract, we say so rather than inventing a standard."
          crumbs={[{ label: "FAQ", href: "/faq" }]}
          primary={{ label: "Ask a different question", href: "/contact" }}
          secondary={{ label: "Read the SLA model", href: "/sla" }}
        />

        <section className="bg-ivory py-20 md:py-28">
          <div className="shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                eyebrow="On this page"
                title="Five groups, direct answers."
                intro="If something is still unclear, ask it. We would rather answer before an engagement than after one."
              />

              <nav aria-label="FAQ sections" className="mt-8">
                <ul className="space-y-2 border-l border-navy/10">
                  {faqGroups.map((group) => (
                    <li key={group.title}>
                      <a
                        href={`#${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="block border-l-2 border-transparent py-1.5 pl-4 text-[0.88rem] text-charcoal/75 transition-colors hover:border-coral hover:text-navy"
                      >
                        {group.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <Figure
                className="mt-10 hidden lg:block"
                seed={121}
                label="Questions"
                caption="An assessment replaces assumptions with answers about the estate, its dependencies and its recovery position."
              />
            </div>

            <div className="space-y-14">
              {faqGroups.map((group) => (
                <section
                  key={group.title}
                  id={group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  className="scroll-mt-28"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-display text-[1.6rem] font-medium tracking-[-0.02em] text-navy">
                      {group.title}
                    </h2>
                    <p className="text-[0.82rem] text-charcoal/75">{group.intro}</p>
                  </div>
                  <div className="mt-6">
                    <FaqList items={group.items} idPrefix={group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} />
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-white py-20 md:py-24">
          <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <Schematic
              variant="loop"
              label="Question to answer"
              caption="How a question becomes an answer: context gathered, constraint identified, option stated and decision recorded."
            />
            <div>
              <SectionHeading
                eyebrow="Still deciding"
                title="Ask us something specific."
                intro="A useful first conversation is not a sales pitch. Bring one problem, one constraint and one deadline; we will tell you how we would approach it and whether we are the right fit."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-solid text-sm">
                  Contact Infeara
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/services/managed-it" className="btn-outline text-sm">
                  Read about managed IT
                </Link>
              </div>
            </div>
          </div>
        </section>

        <CtaBand
          title="Have a question not answered here?"
          body="Send it directly. We answer with what we know and say when we do not."
          primary={{ label: "Ask us", href: "/contact" }}
          secondary={{ label: "Back to services", href: "/services" }}
        />
      </PageFrame>
    </>
  );
}
