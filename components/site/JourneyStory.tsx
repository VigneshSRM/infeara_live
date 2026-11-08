import Link from "next/link";
import { SectionHeading } from "@/components/site/SectionHeading";

export type JourneyStep = {
  step: string;
  title: string;
  body: string;
};

export function JourneyStory({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="shell">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <SectionHeading
          eyebrow="How we work"
          title="A clear process for managed IT and infrastructure."
          intro="We assess your current IT environment, agree priorities, then operate, secure and improve it in planned stages. Open a stage to see what happens."
        />
        <p className="max-w-[32rem] self-end text-[0.92rem] leading-relaxed text-charcoal/70">
          You get a written scope, clear ownership and a record of decisions from the outset.
        </p>
      </div>

      <picture className="mt-9 block">
        <source
          media="(max-width: 639px)"
          srcSet="/site/home-how-we-work-circles-mobile.svg"
          width={600}
          height={1040}
        />
        <img
          src="/site/home-how-we-work-circles.svg"
          alt="Our managed IT delivery cycle: assess the environment, stabilise risk, operate to agreed service levels, and improve from service evidence."
          width={1200}
          height={390}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>

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

            <div className="pb-6 sm:pl-[4rem]">
              <p className="max-w-[48rem] text-[0.92rem] leading-relaxed text-charcoal/75">
                {step.body}
              </p>
            </div>
          </details>
        ))}
      </div>

      <Link href="/approach" className="link-arrow mt-7">
        Read about our managed IT delivery approach <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
