import Link from "next/link";

type Props = {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export function CtaBand({
  title = "Ready to improve your IT?",
  body = "Tell us what you run, what is at risk and what needs to change. We will confirm whether we are the right fit.",
  primary = { label: "Talk to Infeara", href: "/contact" },
  secondary = { label: "Our services", href: "/services" },
}: Props) {
  return (
    <section className="bg-blue">
      <div className="shell grid gap-10 py-16 md:grid-cols-[1.3fr_0.7fr] md:items-center md:py-20">
        <div>
          <p className="font-heading text-[10px] uppercase tracking-[0.24em] text-ivory">
            Next step
          </p>
          <h2 className="mt-4 max-w-[22ch] font-display text-[clamp(1.8rem,3.2vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.025em] text-ivory">
            {title}
          </h2>
          <p className="mt-5 max-w-[34rem] text-[0.98rem] leading-relaxed text-ivory">{body}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <Link
            href={primary.href}
            className="btn-primary text-sm"
          >
            {primary.label}
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={secondary.href}
            className="btn-ghost text-sm"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
