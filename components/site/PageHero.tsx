import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  crumbs: { label: string; href: string }[];
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, intro, crumbs, primary, secondary, children }: Props) {
  return (
    <section className="hero-surface border-b border-ivory/10">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="shell relative z-10 py-16 md:py-24">
        <Breadcrumbs items={crumbs} />

        <p className="mt-8 font-heading text-[10px] uppercase tracking-[0.24em] text-coral/90">
          {eyebrow}
        </p>

        <h1 className="lift mt-4 max-w-[24ch] font-display text-[clamp(2.1rem,4.2vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ivory">
          {title}
        </h1>

        <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-ivory/68">
          {intro}
        </p>

        {primary || secondary ? (
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {primary ? (
              <Link href={primary.href} className="btn-primary text-sm">
                {primary.label}
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            {secondary ? (
              <Link href={secondary.href} className="btn-ghost text-sm">
                {secondary.label}
              </Link>
            ) : null}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}
