import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { listServices } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "IT Services",
  description:
    "Managed IT, cybersecurity, infrastructure, cloud, network engineering, facility management, turnkey projects and automation — delivered from Chennai.",
  path: "/services",
});

const startSteps = [
  {
    title: "Assessment",
    body: "We record what exists, what is documented, what is monitored and where the exposure sits. No changes are made in this phase.",
  },
  {
    title: "Agreement",
    body: "Scope, responsibilities, response targets, reporting and exclusions are written down before work begins.",
  },
  {
    title: "Operation",
    body: "The service runs to the agreement, is reviewed monthly, and is adjusted against evidence rather than opinion.",
  },
];

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <PageFrame>
      <PageHero
        eyebrow="Services"
        title="Nine practices, one operating standard."
        intro="Infeara covers the infrastructure a business already runs and the changes it needs to make next. Managed IT is our primary practice; every other service is delivered to the same standard of documentation, monitoring and reporting."
        crumbs={[{ label: "Services", href: "/services" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="What we do"
            title="Find the practice that matches the problem."
            intro="Most engagements combine two or three of these. The service pages describe what is included, what changes, and how the work is accounted for."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="How engagements start"
              title="Assess, agree, then operate."
              intro="We do not take over an environment we have not looked at. The first weeks are deliberately spent establishing what is really there."
            />

            <ol className="mt-10 space-y-7">
              {startSteps.map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span className="mt-0.5 font-display text-sm text-coral-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading text-[1rem] font-semibold text-navy">{step.title}</h3>
                    <p className="mt-2 max-w-[34rem] text-[0.92rem] leading-relaxed text-charcoal/70">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Schematic
            variant="timeline"
            label="Engagement sequence"
            caption="An engagement sequence: assessment, agreement, transition, operation and periodic review, with each stage producing a recorded output."
          />
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={21}
            label="Service coverage"
            caption="A service map: managed operations at the centre, with security, infrastructure, cloud, network and project work connected to it."
          />
          <div>
            <SectionHeading
              eyebrow="Coverage"
              title="One provider for the run and the change."
              intro="The split between operations and projects is where accountability usually breaks. We keep both under the same agreement, so a change made in a project is handed into the operating service with the documentation, monitoring and backup position already in place."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "One service owner",
                "One escalation path",
                "One monthly report",
                "One change record",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-navy/10 pt-3 text-[0.9rem] text-charcoal/75">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        title="Tell us what you are running."
        body="A short conversation is enough to establish which service fits and whether we are the right partner for it."
        primary={{ label: "Request a consultation", href: "/contact" }}
        secondary={{ label: "Read the SLA model", href: "/sla" }}
      />
    </PageFrame>
  );
}
