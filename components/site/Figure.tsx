import { PhotoFrame, type PhotoLayout } from "@/components/site/PhotoFrame";
import { figureImage } from "@/lib/site-images";

export function Figure({
  seed,
  label,
  caption,
  className = "",
  layout = "landscape",
  preload = false,
}: {
  seed: number;
  label: string;
  caption: string;
  className?: string;
  layout?: PhotoLayout;
  preload?: boolean;
}) {
  // The seed each page passes selects a photograph from the library in
  // lib/site-images.ts, so a given seed always resolves to the same picture.
  return (
    <PhotoFrame
      image={figureImage(seed)}
      label={label}
      caption={caption}
      className={className}
      layout={layout}
      preload={preload}
    />
  );
}
