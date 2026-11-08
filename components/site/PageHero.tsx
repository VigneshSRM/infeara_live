import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PhotoTile } from "@/components/site/PhotoTile";
import type { SiteImage } from "@/lib/site-images";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  crumbs: { label: string; href: string }[];
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  image?: SiteImage;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, intro, crumbs, primary, secondary, image, children }: Props) {
  return (
    <section className="hero-surface">
      <div className="shell relative z-10 py-10 md:py-16">
        <Breadcrumbs items={crumbs} />

        <div className={`mt-6 grid items-center gap-8 lg:gap-14 ${image ? "lg:grid-cols-[1fr_0.82fr]" : ""}`}>
          {image ? (
            <div className="order-1 lg:order-2">
              <PhotoTile image={image} shape="wide" preload sizes="(min-width: 1024px) 38vw, 100vw" />
            </div>
          ) : null}

          <div className={image ? "order-2 lg:order-1" : ""}>
            <p className="font-heading text-[10px] uppercase tracking-[0.16em] text-coral/90">{eyebrow}</p>
            <h1 className="mt-4 max-w-[24ch] font-display text-[clamp(2.1rem,4.2vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-ivory">
              {title}
            </h1>
            <p className="mt-5 max-w-[42rem] text-[0.98rem] leading-relaxed text-ivory/75">{intro}</p>

            {primary || secondary ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {primary ? (
                  <Link href={primary.href} className="btn-primary text-sm">
                    {primary.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
                {secondary ? <Link href={secondary.href} className="btn-ghost text-sm">{secondary.label}</Link> : null}
              </div>
            ) : null}
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
