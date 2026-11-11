import { SectionHeading } from "@/components/site/SectionHeading";
import type { SubService } from "@/lib/content/subservice-model";

/**
 * The "How it works" section of a sub-service page.
 *
 * A sub-service with a picture (the 14 that shipped with one) shows that picture. One without
 * lists its steps instead, so a page created in the admin has a diagram section too without
 * anyone drawing anything. With neither, there is no section.
 */
export function SubserviceDiagram({
  service,
  intro,
  imageCaption,
}: {
  service: SubService;
  intro: string;
  imageCaption: string;
}) {
  const diagram = service.infographic;
  if (!diagram) return null;
  const steps = diagram.steps;
  if (!diagram.image && steps.length === 0) return null;

  const title = diagram.title || `How ${service.name} works`;
  const alt = steps.length
    ? `${title}: ${steps.map((step) => (step.description ? `${step.title}, ${step.description}` : step.title)).join("; ")}`
    : title;

  return (
    <section className="border-y border-navy/10 bg-ivory py-16 md:py-24">
      <div className="shell">
        <SectionHeading eyebrow="How it works" title={title} intro={intro} />

        {diagram.image ? (
          <figure className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-[#EAE6DE]">
            {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size SVG diagram from /public */}
            <img src={diagram.image} alt={alt} width="1400" height="780" loading="lazy" className="h-auto w-full" />
            <figcaption className="border-t border-navy/10 px-5 py-3 text-[0.8rem] leading-relaxed text-charcoal/65 md:px-7">
              {imageCaption}
            </figcaption>
          </figure>
        ) : (
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={`${index}-${step.title}`}
                className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-6"
              >
                <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-heading text-[1rem] font-semibold text-navy">{step.title}</h3>
                {step.description ? (
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-charcoal/70">{step.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
