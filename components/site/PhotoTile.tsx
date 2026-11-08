import Image from "next/image";
import type { SiteImage } from "@/lib/site-images";

type ImageShape = "wide" | "landscape" | "portrait";

const paddingRatio: Record<ImageShape, string> = {
  wide: "56.25%",
  landscape: "66.6667%",
  portrait: "125%",
};

export function PhotoTile({
  image,
  shape = "wide",
  preload = false,
  sizes = "(min-width: 1024px) 30vw, 100vw",
}: {
  image: SiteImage;
  shape?: ImageShape;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <div className="relative w-full overflow-hidden bg-navy" style={{ paddingBottom: paddingRatio[shape] }}>
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
  );
}
