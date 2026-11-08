import Link from "next/link";
import type { Industry } from "@/lib/content/types";
import { figureImage } from "@/lib/site-images";
import { PhotoTile } from "@/components/site/PhotoTile";

export function IndustryCard({ industry, withImage = false }: { industry: Industry; withImage?: boolean }) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className={`group flex gap-5 border-t border-navy/20 py-5 transition-colors hover:border-blue ${
        withImage ? "flex-col items-stretch" : "items-start justify-between"
      }`}
    >
      {withImage ? <PhotoTile image={figureImage(industry.figure.seed)} shape="landscape" /> : null}
      <div className={withImage ? "pt-4" : ""}>
        <h3 className="font-heading text-[0.98rem] font-semibold leading-snug text-navy">{industry.name}</h3>
        <p className="mt-2 text-[0.84rem] leading-relaxed text-charcoal/75">{industry.tagline}</p>
      </div>
      <span aria-hidden="true" className={`mt-1 shrink-0 text-blue group-hover:text-coral ${withImage ? "self-end" : ""}`}>→</span>
    </Link>
  );
}
