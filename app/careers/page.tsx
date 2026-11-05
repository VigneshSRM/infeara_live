import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { pageMetadata } from "@/lib/metadata";
import { company } from "@/lib/content/site";

export const metadata = pageMetadata({
  title: "Careers",
  description:
    "Engineering roles at Infeara Technologies in Chennai: service operations, infrastructure and network engineering, security and automation.",
  path: "/careers",
});

const teams = [
  {
    title: "Service operations",
    body: "Monitoring, triage, endpoint and server administration, and the monthly reporting that keeps an agreement honest. This is where the client relationship is felt day to day.",
  },
  {
    title: "Infrastructure & network",
    body: "Windows and Linux systems, virtualisation, storage, routing, switching, firewalls and the documentation that makes an estate supportable by someone else.",
  },
  {
    title: "Security & automation",
    body: "Assessment, hardening, vulnerability management, monitoring and the integrations that remove repetitive work from the operating team.",
  },
];

export default function CareersPage() {
  return (
    <PageFrame>
      <PageHero
        eyebrow="Careers"
        title="Engineers who like the estate to make sense."
        intro="Infeara is a small, technical company in Chennai. The work is hands-on, documented and judged by whether the environment is more supportable than it was last month."
        crumbs={[{ label: "Careers", href: "/careers" }]}
        primary={{ label: "Send your CV", href: `mailto:${company.email}?subject=Careers%20enquiry` }}
        secondary={{ label: "About Infeara", href: "/about" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="The work"
              title="No ticket theatre."
              intro="Support is not measured by how many tickets were closed. It is measured by whether the environment stayed available, recoverable and documented."
            />
          </div>

          <div className="space-y-5 text-[1rem] leading-relaxed text-charcoal/80 lg:pt-3">
            <p>
              Engineers here work across the stack. A week might include a firewall rule review, a restore
              test, a virtual host upgrade and writing the change note that makes the next person&apos;s job
              possible.
            </p>
            <p>
              We expect curiosity, clear writing and the discipline to record what was done. We do not
              expect anyone to pretend to know something they do not.
            </p>
            <p>
              The company is based in {company.city}. Most work is delivered remotely, with onsite visits
              where the task requires physical access.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Teams"
            title="Where engineers work."
            intro="These are the disciplines we hire into. A published vacancy, when one exists, will state the level, location and scope."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {teams.map((team, index) => (
              <div key={team.title} className="flex flex-col rounded-[var(--radius-card)] border border-navy/10 p-7">
                <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-heading text-[1.02rem] font-semibold text-navy">{team.title}</h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-charcoal/70">{team.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[var(--radius-card)] border border-coral/40 bg-ivory p-7 md:p-8">
            <p className="eyebrow text-coral-ink">Vacancies</p>
            <p className="mt-3 max-w-[50rem] text-[0.95rem] leading-relaxed text-charcoal/80">
              We do not have a published vacancy at this time. We still read speculative applications from
              engineers who work the way described above. Send a CV and a short note about the environment
              you have operated to{" "}
              <a
                href={`mailto:${company.email}?subject=Careers%20enquiry`}
                className="font-medium text-blue underline decoration-blue/30 underline-offset-4"
              >
                {company.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Schematic
            variant="timeline"
            label="Hiring process"
            caption="The hiring process: application review, technical conversation, practical discussion and a written offer, with feedback at each stage."
          />
          <div>
            <SectionHeading
              eyebrow="Hiring"
              title="Four stages, no mystery."
              intro="We keep the process short and technical. You will meet the people you would work with, and we will tell you where you stand."
            />

            <ol className="mt-9 space-y-5">
              {[
                { title: "Application review", detail: "We read the note as well as the CV. Tell us what you operated and what you changed." },
                { title: "Technical conversation", detail: "A discussion of real environments: what broke, how you found it, what you recorded." },
                { title: "Practical discussion", detail: "A scenario or walkthrough relevant to the role. No trick questions." },
                { title: "Offer and references", detail: "Written terms, a clear start date and an honest description of the work." },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-4 border-t border-navy/10 pt-5">
                  <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-heading text-[0.96rem] font-semibold text-navy">{item.title}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-charcoal/70">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={131}
            label="Engineering culture"
            caption="The working record: changes documented, restores tested and reports written so that the next engineer can pick up the environment."
          />
          <div>
            <SectionHeading
              eyebrow="What we value"
              title="Clear thinking, written down."
              intro="Technical skill matters. So does the ability to explain a problem, choose a proportionate fix and leave a record that survives your departure."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Curiosity about how systems fail",
                "Clear written communication",
                "Discipline with change control",
                "Respect for the client's constraints",
                "Willingness to say 'I do not know'",
                "Ownership of the outcome",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="link-arrow mt-8">
              Contact the team <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Think you would fit?"
        body="Send a CV and a short note about the environment you have operated. We read both."
        primary={{ label: "Email your CV", href: `mailto:${company.email}?subject=Careers%20enquiry` }}
        secondary={{ label: "Read about the company", href: "/about" }}
      />
    </PageFrame>
  );
}
