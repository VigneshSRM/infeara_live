import Link from "next/link";
import { PhotoTile } from "@/components/site/PhotoTile";
import { SectionHeading } from "@/components/site/SectionHeading";
import { figureImage } from "@/lib/site-images";

export type JourneyStep = {
  step: string;
  title: string;
  body: string;
  imageSeed: number;
  imageLabel: string;
};

export function JourneyStory({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="shell">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <SectionHeading
          eyebrow="How we work"
          title="From unknowns to controlled operations."
          intro="Follow the work from first assessment to ongoing improvement. Open a stage to see what changes."
        />
        <p className="max-w-[32rem] self-end text-[0.92rem] leading-relaxed text-charcoal/70">
          One accountable process, shaped around the systems already in place.
        </p>
      </div>

      <div className="mt-9 border-t border-navy/15">
        {steps.map((step, index) => (
          <details
            key={step.step}
            name="engagement-journey"
            open={index === 0}
            className="group border-b border-navy/15"
          >
            <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-5 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-5">
              <span className="font-heading text-[0.72rem] font-semibold text-blue">{step.step}</span>
              <span className="font-heading text-[1rem] font-semibold text-navy sm:text-[1.08rem]">{step.title}</span>
              <span className="font-heading text-lg leading-none text-blue">
                <span className="group-open:hidden" aria-hidden="true">+</span>
                <span className="hidden group-open:inline" aria-hidden="true">−</span>
              </span>
            </summary>

            <div className="grid gap-5 pb-6 sm:grid-cols-2 sm:gap-8 sm:pl-[4rem]">
              <div>
                <p className="mb-2 font-heading text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal/60">
                  {step.imageLabel}
                </p>
                <PhotoTile image={figureImage(step.imageSeed)} shape="wide" sizes="(min-width: 1024px) 42vw, 100vw" />
              </div>
              <p className="max-w-[34rem] self-end text-[0.92rem] leading-relaxed text-charcoal/75">
                {step.body}
              </p>
            </div>
          </details>
        ))}
      </div>

      <Link href="/approach" className="link-arrow mt-7">
        See the full approach <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
