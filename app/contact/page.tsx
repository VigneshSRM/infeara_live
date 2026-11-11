import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { figureImage } from "@/lib/site-images";
import { ContactForm } from "@/components/site/ContactForm";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { SectionHeading } from "@/components/site/SectionHeading";
import { listSubservices } from "@/lib/content/index";
import { subserviceOptionGroups } from "@/lib/content/nav-model";
import { company } from "@/lib/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact Infeara IT Services",
  description:
    "Contact Infeara to discuss managed IT, cybersecurity, infrastructure, cloud or a specific project. Based in Chennai, we work with organisations across India.",
  path: "/contact",
});

const nextSteps = [
  {
    title: "We read the enquiry",
    body: "A person, not a routing rule. We look at the estate you describe and decide who is the right engineer to respond.",
  },
  {
    title: "A short conversation",
    body: "Thirty minutes is usually enough to establish the problem, the constraints and whether an assessment makes sense.",
  },
  {
    title: "A written next step",
    body: "If there is a fit, you receive a scope and a proposal. If there is not, we say so and point you elsewhere where we can.",
  },
];

// The form's service list follows the sub-services published in the admin.
export const revalidate = 300;

export default async function ContactPage() {
  const subserviceGroups = subserviceOptionGroups(await listSubservices());

  return (
    <PageFrame>
      <PageHero
        image={figureImage(3)}
        eyebrow="Contact"
        title="Talk with us about your IT environment."
        intro="Tell us what you run, what is failing and what needs to change. A short conversation is enough to establish whether we are the right partner and what the next step should be."
        crumbs={[{ label: "Contact", href: "/contact" }]}
        primary={{ label: "Send an enquiry", href: "#enquiry" }}
        secondary={{ label: "Read the SLA model", href: "/sla" }}
      />

      <section id="enquiry" className="bg-ivory py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Enquiry"
              title="Tell us what you are dealing with."
              intro="The more specific the description, the more useful our first reply. Systems, site count, what changed recently and any deadline all help."
            />
            <div className="mt-8">
              <ContactForm subserviceGroups={subserviceGroups} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
              <p className="eyebrow text-blue">Contact by form</p>
              <p className="mt-4 text-[0.9rem] leading-relaxed text-charcoal/75">
                Send your enquiry through the form and our team will respond to the details you provide.
              </p>
              <dl className="mt-6 space-y-4 border-t border-navy/10 pt-5 text-[0.86rem]">
                <div>
                  <dt className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">Hours</dt>
                  <dd className="mt-1 text-charcoal/75">{company.hours}</dd>
                </div>
                <div>
                  <dt className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">Base</dt>
                  <dd className="mt-1 text-charcoal/75">
                    {company.city}, {company.region}, {company.country}
                  </dd>
                </div>
                <div>
                  <dt className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">Coverage</dt>
                  <dd className="mt-1 text-charcoal/75">Clients across India</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-navy/15 pt-5">
              <p className="eyebrow text-blue">Existing client?</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-charcoal/75">
                Use the agreed support channel rather than this form. Priority 1 incidents should be raised
                through the escalation path in your service schedule.
              </p>
              <Link href="/sla" className="mt-4 inline-flex items-center gap-2 font-heading text-[0.82rem] text-blue underline decoration-blue/30 underline-offset-4">
                Support model <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
              <p className="eyebrow text-blue">Careers</p>
              <p className="mt-4 text-[0.88rem] leading-relaxed text-charcoal/70">
                For engineering applications, send a CV and a short note about the environment you have
                operated.
              </p>
              <Link href="/careers" className="link-arrow mt-4">
                Careers at Infeara <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={141}
            layout="caption-side"
            label="First conversation"
            caption="A first conversation mapped: estate described, constraints identified, fit assessed and a written next step agreed."
          />
          <div>
            <SectionHeading
              eyebrow="What happens next"
              title="Three steps, no sales sequence."
              intro="We do not run a lead-nurture sequence. The enquiry either becomes a conversation, a proposal or a polite no."
            />

            <ol className="mt-9 space-y-5">
              {nextSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4 border-t border-navy/10 pt-5">
                  <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-heading text-[0.96rem] font-semibold text-navy">{step.title}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-charcoal/70">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-7 text-[0.82rem] leading-relaxed text-charcoal/75">
              We aim to reply within one business day. If the matter is urgent, describe its impact and timing in the enquiry form.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Schematic
            variant="mesh"
            layout="square"
            label="Enquiry routing"
            caption="Enquiry routing: the message reaches a person who identifies the right engineer, rather than entering an automated sales sequence."
          />
          <div>
            <SectionHeading
              eyebrow="Before you write"
              title="Three things that make the first reply useful."
            />
            <ul className="mt-8 space-y-3">
              {[
                "What you operate: sites, users, servers, network and cloud.",
                "What is failing or changing: the symptom, the trigger and the impact.",
                "What you need: support cover, a project, a second opinion or a deadline.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.92rem] leading-relaxed text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 max-w-[34rem] text-[0.88rem] leading-relaxed text-charcoal/75">
              Please do not send credentials, customer data or security-sensitive detail through this form.
              We will arrange a secure channel if the conversation requires it.
            </p>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
