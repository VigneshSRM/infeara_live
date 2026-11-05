import Link from "next/link";

type Props = {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export function CtaBand({
  title = "Let's scope what you are running.",
  body = "A short conversation is enough to establish whether we are the right fit. We will ask what you operate today, what is failing, and what you need to change.",
  primary = { label: "Request a consultation", href: "/contact" },
  secondary = { label: "Explore managed IT", href: "/services/managed-it" },
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 font-heading text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
          >
            {primary.label}
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-full border border-ivory/30 px-6 py-3 font-heading text-sm text-ivory transition-colors hover:bg-ivory/10"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
