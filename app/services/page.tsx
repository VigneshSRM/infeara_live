import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { listServices } from "@/lib/content";
import { figureImage } from "@/lib/site-images";
import { cybersecuritySubservices } from "@/lib/content/cybersecurity-subservices";
import { cloudSubservices } from "@/lib/content/cloud-subservices";
import { aiAutomationSubservices, applicationDevelopmentSubservices } from "@/lib/content/product-subservices";
import { coreServiceSlugs, infrastructureSubserviceSlugs } from "@/lib/content/service-taxonomy";
import { SubserviceCard } from "@/components/site/SubserviceCard";
import type { Service } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Managed IT, Cybersecurity & Cloud Services",
  description:
    "Explore Infeara's six core services: managed IT, cybersecurity, cloud and datacenter, turnkey projects, AI automations and application development.",
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
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  const selectServices = (slugs: readonly string[]) =>
    slugs
      .map((slug) => bySlug.get(slug))
      .filter((service): service is Service => Boolean(service));
  const coreServices = selectServices(coreServiceSlugs);
  const infrastructureServices = selectServices(infrastructureSubserviceSlugs);
  const cloudService = bySlug.get("cloud-datacenter");

  return (
    <PageFrame>
      <PageHero
        image={figureImage(5)}
        eyebrow="Services"
        title="Managed IT, cybersecurity and infrastructure services."
        intro="Six core services cover IT operations, cybersecurity, cloud and datacenter, turnkey projects, AI automations and application development. IT Infrastructure, Cybersecurity, Cloud & Datacenter, AI Automations and Application Development link to focused specialist services below."
        crumbs={[{ label: "Services", href: "/services" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "See our approach", href: "/approach" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Core services"
            title="Six core services. One clear starting point."
            intro="Choose managed IT, Cybersecurity, Cloud & Datacenter, Turnkey Projects, AI Automations or Application Development. IT Infrastructure, Cybersecurity and Cloud & Datacenter link to focused services below."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} image={figureImage(service.figure.seed)} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="IT Infrastructure sub-services"
            title="Focused teams for the operational layers."
            intro="Choose managed operations, facility management, remote IT support or network engineering. Dedicated engineers are available within the remote IT service; they are not a separate offering."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {infrastructureServices.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Cloud & Datacenter sub-services"
            title="Cloud capabilities for the full service lifecycle."
            intro={cloudService?.summary ?? "Explore specialist cloud services for data, operations, cost, resilience, monitoring, hosting and automation."}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cloudSubservices.map((service, index) => (
              <SubserviceCard
                key={service.slug}
                href={`/services/cloud-datacenter/${service.slug}`}
                title={service.name}
                summary={service.summary}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="AI Automation sub-services"
            title="AI capabilities for conversation, knowledge and operations."
            intro="Explore chatbot and voice experiences, LLM engineering and AI-assisted infrastructure automation. Each capability is scoped with suitable safety, review and operating controls."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aiAutomationSubservices.map((service, index) => (
              <SubserviceCard key={service.slug} href={`${service.parentHref}/${service.slug}`} title={service.name} summary={service.summary} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Application Development sub-services"
            title="Digital products for web, content and mobile."
            intro="Choose custom web applications, a content-led business website or a mobile application, with distinct discovery, engineering and release plans."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {applicationDevelopmentSubservices.map((service, index) => (
              <SubserviceCard key={service.slug} href={`${service.parentHref}/${service.slug}`} title={service.name} summary={service.summary} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Cybersecurity sub-services"
            title="Assess exposure, validate defenses, understand threats."
            intro="Choose a scoped assessment or analysis engagement, with authorization, clear outputs and practical next steps agreed in advance."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cybersecuritySubservices.map((service, index) => (
              <SubserviceCard
                key={service.slug}
                href={`/services/cybersecurity/${service.slug}`}
                title={service.name}
                summary={service.summary}
                index={index}
                image={figureImage(service.figure.seed)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-ivory py-20 md:py-28">
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
            layout="portrait"
            label="Engagement sequence"
            caption="An engagement sequence: assessment, agreement, transition, operation and periodic review, with each stage producing a recorded output."
          />
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={21}
            layout="wide"
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
                  <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue/60" />
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
