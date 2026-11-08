import Link from "next/link";
import type { Service } from "@/lib/content/types";
import type { SiteImage } from "@/lib/site-images";
import { PhotoTile } from "@/components/site/PhotoTile";

export function ServiceCard({
  service,
  index,
  image,
  imageShape = "wide",
}: {
  service: Service;
  index?: number;
  image?: SiteImage;
  imageShape?: "wide" | "landscape" | "portrait";
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col border-t border-navy/20 py-5 transition-colors hover:border-blue"
    >
      {image ? <PhotoTile image={image} shape={imageShape} /> : null}
      <div className={`flex items-start justify-between gap-4 ${image ? "pt-4" : ""}`}>
        <span className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-blue">
          {typeof index === "number" ? String(index + 1).padStart(2, "0") : "SERVICE"}
        </span>
        <span aria-hidden="true" className="text-blue group-hover:text-coral">→</span>
      </div>
      <h3 className="mt-4 font-heading text-[1.08rem] font-semibold leading-snug text-navy">
        {service.name}
      </h3>
      <p className="mt-2 flex-1 text-[0.88rem] leading-relaxed text-charcoal/75">{service.summary}</p>
    </Link>
  );
}
