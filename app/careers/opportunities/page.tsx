import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationForm } from "@/components/site/ApplicationForm";
import { CtaBand } from "@/components/site/CtaBand";
import { Figure } from "@/components/site/Figure";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/site/SectionHeading";
import { openRoles, disciplines } from "@/lib/content/careers";
import { company } from "@/lib/content/site";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Open Roles",
  description:
    "Current engineering and operations vacancies at Infeara Technologies in Chennai, with the scope of each role and a direct application form.",
  path: "/careers/opportunities",
});

const employmentType: Record<string, string> = {
  "Full time": "FULL_TIME",
  Contract: "CONTRACTOR",
  Internship: "INTERN",
};

const jobPostingSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Open roles at Infeara Technologies",
  itemListElement: openRoles.map((role, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "JobPosting",
      title: role.title,
      description: role.summary,
      employmentType: employmentType[role.type] ?? role.type,
      hiringOrganization: {
        "@type": "Organization",
        name: company.name,
        sameAs: SITE_URL,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: company.city,
          addressRegion: company.region,
          addressCountry: "IN",
        },
      },
      url: `${SITE_URL}/careers/opportunities#${role.slug}`,
    },
  })),
};

export default function OpportunitiesPage() {
  return (
    <PageFrame>
      {openRoles.length > 0 ? <JsonLd data={jobPostingSchema} /> : null}

      <PageHero
        eyebrow="Careers · Open roles"
        title="Work where the estate is the argument."
        intro={
          openRoles.length > 0
            ? "Every role below is a live vacancy with a stated scope. If nothing matches today, the application form still reaches the engineering team."
            : "No role is published today. The application form still reaches the engineering team, and speculative applications are read."
        }
        crumbs={[
          { label: "Careers", href: "/careers" },
          { label: "Opportunities", href: "/careers/opportunities" },
        ]}
        primary={{ label: "Apply now", href: "#apply" }}
        secondary={{ label: "How we hire", href: "/careers" }}
      />

      {/* Overview */}
      <section className="bg-ivory py-20 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Overview"
              title="A short list, kept honest."
              intro="We publish a role only when the work, the level and the location are settled. Nothing here is a pipeline advertisement."
            />

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Open roles", value: String(openRoles.length) },
                { label: "Base", value: `${company.city}, India` },
                { label: "Disciplines", value: String(disciplines.length) },
              ].map((item) => (
                <div key={item.label} className="border-t border-navy/15 pt-4">
                  <p className="font-display text-[1.55rem] leading-none text-navy">{item.value}</p>
                  <p className="mt-2 font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/55">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9 space-y-4 text-[0.96rem] leading-relaxed text-charcoal/75">
              <p>
                Infeara is a small technical company. Engineers here touch more of the stack than a
                narrow specialism would allow: a firewall review, a restore test, a virtual host
                upgrade, and the change note that makes the next person&apos;s job possible.
              </p>
              <p>
                Most delivery is remote from {company.city}, with onsite visits where a task needs
                physical access. Roles state their location, type and level rather than leaving it to
                inference.
              </p>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Scope stated before you apply",
                "Technical interviewers, not panels",
                "Written terms and a clear start date",
                "Feedback at every stage",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.88rem] leading-relaxed text-charcoal/75"
                >
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Figure
            seed={137}
            label="Open roles"
            caption="The role list as published: each entry states the team, location, type and experience level before the application form."
            className="lg:pt-2"
          />
        </div>
      </section>

      {/* Openings */}
      <section id="openings" className="scroll-mt-28 border-y border-navy/10 bg-white py-20 md:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Openings"
            title={openRoles.length > 0 ? "Current vacancies." : "No published vacancies."}
            intro={
              openRoles.length > 0
                ? "Each role links to its full description and to the application form."
                : "We do not have a published vacancy at this time. Applications still reach the team, and speculative ones are read."
            }
          />

          {openRoles.length > 0 ? (
            <ul className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
              {openRoles.map((role) => (
                <li key={role.slug} id={role.slug} className="scroll-mt-28 py-7">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h3 className="font-heading text-[1.12rem] font-semibold text-navy">
                          {role.title}
                        </h3>
                        <span className="rounded-full border border-blue/30 px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.14em] text-blue">
                          {role.team}
                        </span>
                      </div>

                      <p className="mt-3 max-w-[52rem] text-[0.94rem] leading-relaxed text-charcoal/75">
                        {role.summary}
                      </p>

                      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-heading text-[10px] uppercase tracking-[0.16em] text-charcoal/55">
                        <div className="flex gap-2">
                          <dt>Location</dt>
                          <dd className="text-charcoal/75">{role.location}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Type</dt>
                          <dd className="text-charcoal/75">{role.type}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Experience</dt>
                          <dd className="text-charcoal/75">{role.experience}</dd>
                        </div>
                      </dl>

                      {role.responsibilities.length > 0 ? (
                        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                          {role.responsibilities.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-charcoal/70"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-blue/60"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <Link href="#apply" className="btn-outline shrink-0 text-sm">
                      Apply for this role
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 grid gap-8 rounded-[var(--radius-card)] border border-coral/40 bg-ivory p-7 md:grid-cols-[1.3fr_0.7fr] md:items-start md:p-9">
              <div>
                <p className="eyebrow text-coral-ink">What happens next</p>
                <p className="mt-3 max-w-[40rem] text-[0.96rem] leading-relaxed text-charcoal/80">
                  Send the form below with a note about the environment you have operated and what you
                  changed. If your experience matches a discipline we hire into, we will write back. No
                  invented pipeline, no holding pool.
                </p>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-charcoal/70">
                  Prefer email? Write to{" "}
                  <a
                    href={`mailto:${company.email}?subject=Careers%20enquiry`}
                    className="font-medium text-blue underline decoration-blue/30 underline-offset-4"
                  >
                    {company.email}
                  </a>
                  .
                </p>
              </div>

              <ul className="space-y-3">
                {disciplines.map((item) => (
                  <li key={item.title} className="border-t border-navy/10 pt-3">
                    <p className="font-heading text-[0.88rem] font-semibold text-navy">{item.title}</p>
                    <p className="mt-1 text-[0.82rem] leading-relaxed text-charcoal/65">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="scroll-mt-28 bg-ivory py-20 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Apply"
              title="Tell us what you operated."
              intro="A person reads every application. The useful part is not the job title history — it is the environment, your role in it, and one thing you fixed that stayed fixed."
            />

            <div className="mt-9 space-y-4 border-t border-navy/10 pt-6 text-[0.9rem] leading-relaxed text-charcoal/75">
              <p>
                We do not accept attachments through this form. Share a hosted CV, a LinkedIn profile or
                a portfolio URL instead.
              </p>
              <p>
                Your details are used to assess this application and are not added to a marketing list.
                The{" "}
                <Link
                  href="/legal/privacy-policy"
                  className="text-blue underline decoration-blue/30 underline-offset-4"
                >
                  privacy policy
                </Link>{" "}
                sets out retention and your rights.
              </p>
            </div>

            <Figure
              seed={139}
              label="Application review"
              caption="Applications are read by the engineering team that would work with you, not by an automated filter."
              className="mt-10"
            />
          </div>

          <div>
            <ApplicationForm />
          </div>
        </div>
      </section>

      <CtaBand
        title="Not sure where you fit?"
        body="Read how the teams are organised, the four-stage hiring process, and what the company expects in writing."
        primary={{ label: "Back to careers", href: "/careers" }}
        secondary={{ label: "About Infeara", href: "/about" }}
      />
    </PageFrame>
  );
}
