import Link from "next/link";
import type { SiteImage } from "@/lib/site-images";
import { PhotoTile } from "@/components/site/PhotoTile";

type Props = {
  href: string;
  title: string;
  summary: string;
  index?: number;
  image?: SiteImage;
};

export function SubserviceCard({ href, title, summary, index, image }: Props) {
  return (
    <Link href={href} className="group flex h-full flex-col border-t border-navy/20 py-5 transition-colors hover:border-blue">
      {image ? <PhotoTile image={image} shape="landscape" /> : null}
      <div className={`flex items-start justify-between gap-4 ${image ? "pt-4" : ""}`}>
        <span className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-blue">
          {typeof index === "number" ? String(index + 1).padStart(2, "0") : "SERVICE"}
        </span>
        <span aria-hidden="true" className="text-blue group-hover:text-coral">→</span>
      </div>
      <h3 className="mt-4 font-heading text-[1rem] font-semibold leading-snug text-navy">{title}</h3>
      <p className="mt-2 flex-1 text-[0.88rem] leading-relaxed text-charcoal/75">{summary}</p>
    </Link>
  );
}
