import Link from "next/link";
import { Header } from "@/components/site/Header";
import { OperationsDiagram } from "@/components/site/OperationsDiagram";

const capabilities = [
  { label: "Operations", value: "24/7 monitoring options" },
  { label: "Accountability", value: "SLA-based support" },
  { label: "Method", value: "Security-first delivery" },
  { label: "Base", value: "Chennai, India" },
];

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero-surface min-h-[100svh]">
        <div className="hero-grid" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] items-center opacity-[0.62] lg:flex">
          <OperationsDiagram />
        </div>
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-scan" aria-hidden="true" />

        <Header />

        <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-center pb-16 pt-28 sm:pb-20 sm:pt-36 lg:pt-40">
          <div className="max-w-[54rem]">
            <div className="reveal flex items-center gap-3" style={{ animationDelay: "0.15s" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />
              <span className="font-heading text-[11px] uppercase tracking-[0.24em] text-ivory/55">
                Managed IT · Cybersecurity · Cloud
              </span>
            </div>

            <h1 className="lift mt-7 font-display text-[clamp(2.35rem,4.6vw,4.15rem)] font-medium leading-[0.99] tracking-[-0.032em] text-ivory">
              Engineering the
              <br />
              infrastructure behind
              <br />
              <span className="relative inline-block">
                business growth.
                <span
                  className="grow-x absolute -bottom-2 left-0 h-[3px] w-full bg-coral"
                  style={{ animationDelay: "0.9s" }}
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p
              className="reveal mt-6 max-w-[36rem] text-[1rem] leading-relaxed text-ivory/70 sm:mt-8 sm:text-[1.0625rem]"
              style={{ animationDelay: "0.55s" }}
            >
              From managed IT operations and cybersecurity to cloud infrastructure
              and enterprise technology, Infeara Technologies helps businesses
              build, secure and operate technology with confidence.
            </p>

            <div
              className="reveal mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4"
              style={{ animationDelay: "0.75s" }}
            >
              <Link href="/services" className="btn-primary">
                Explore our services
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact" className="btn-ghost">
                Talk to our experts
              </Link>
            </div>
          </div>

          <div
            className="reveal mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ivory/10 pt-6 sm:mt-16 sm:gap-x-8 sm:gap-y-6 sm:pt-7 md:grid-cols-4"
            style={{ animationDelay: "0.95s" }}
          >
            {capabilities.map((item) => (
              <div key={item.label}>
                <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-ivory/40">
                  {item.label}
                </p>
                <p className="mt-2 text-[0.9rem] text-ivory/80">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="shell grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
          <div>
            <p className="font-heading text-[11px] uppercase tracking-[0.24em] text-blue/70">
              The way to lead
            </p>
            <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.06] tracking-[-0.025em] text-navy">
              A technology partner, not a support desk.
            </h2>
          </div>
          <div className="max-w-[38rem]">
            <p className="text-[1.0625rem] leading-relaxed text-charcoal/80">
              Infeara Technologies manages, secures, modernises and operates
              business-critical IT environments. Our work starts with the
              infrastructure a business already depends on and ends with an
              operation that is documented, monitored and accountable.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 font-heading text-sm font-medium text-blue underline decoration-blue/30 underline-offset-4 transition-colors hover:decoration-blue"
            >
              Read our approach
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
