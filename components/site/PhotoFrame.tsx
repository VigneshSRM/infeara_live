import Image from "next/image";

import type { SiteImage } from "@/lib/site-images";

export type PhotoLayout = "landscape" | "wide" | "portrait" | "square" | "caption-side";

const aspectPadding: Record<PhotoLayout, string> = {
  landscape: "66.6667%",
  wide: "56.25%",
  portrait: "125%",
  square: "100%",
  "caption-side": "75%",
};

export function PhotoFrame({
  image,
  label,
  caption,
  className = "",
  layout = "landscape",
  preload = false,
  sizes = "(min-width: 1024px) 44vw, 100vw",
}: {
  image: SiteImage;
  label: string;
  caption: string;
  className?: string;
  layout?: PhotoLayout;
  preload?: boolean;
  sizes?: string;
}) {
  const captionBesideImage = layout === "caption-side";

  return (
    <figure className={className}>
      <div className={captionBesideImage ? "grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem] md:items-end" : ""}>
        <div>
          <p className="mb-2 font-heading text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-charcoal/60">
            {label}
          </p>
          <div
            className="relative w-full overflow-hidden bg-navy"
            style={{ paddingBottom: aspectPadding[layout] }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              preload={preload}
              loading={preload ? "eager" : undefined}
              sizes={sizes}
              quality={90}
              className="object-cover"
            />
          </div>
        </div>
        <figcaption className={`mt-2 text-[0.78rem] leading-relaxed text-charcoal/70 ${captionBesideImage ? "md:mt-0" : ""}`}>
          {caption}
        </figcaption>
      </div>
    </figure>
  );
}
