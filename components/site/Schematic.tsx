import { PhotoFrame, type PhotoLayout } from "@/components/site/PhotoFrame";
import { schematicImage } from "@/lib/site-images";

type Variant = "layers" | "mesh" | "loop" | "timeline" | "grid";

export function Schematic({
  variant = "layers",
  label,
  caption,
  className = "",
  layout = "landscape",
}: {
  variant?: Variant;
  label: string;
  caption: string;
  className?: string;
  layout?: PhotoLayout;
}) {
  // The label selects the photograph. Where pages share a label — every sector
  // page uses "Service map" — the caption and variant keep the pick distinct.
  return (
    <PhotoFrame
      image={schematicImage(label, caption, variant)}
      label={label}
      caption={caption}
      className={className}
      layout={layout}
      sizes="(min-width: 1024px) 40vw, 100vw"
    />
  );
}
