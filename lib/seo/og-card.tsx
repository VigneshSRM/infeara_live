import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { fitCardTitle } from "@/lib/seo/og-paths";

// The picture shown when a page is shared: the site's blue, the logo, the page's own title.
// It is drawn on request by app/og/[...path]/route.tsx.
//
// The renderer (Satori) reads ttf, otf and woff fonts, not woff2, and only flexbox layout, so the
// three Manrope weights the site uses live in assets/og as .woff (scripts/sync-fonts.mjs copies
// them from the @fontsource/manrope package) and the layout below is flex all the way down.
// The files are read once, when the route is first loaded, not on every picture.

export const CARD_SIZE = { width: 1200, height: 630 } as const;

const IVORY = "#EAE6DE";
const BLUE = "#226192";
const CORAL = "#EF8557";

const read = (file: string) => readFile(join(process.cwd(), "assets/og", file));
const logoFile = () => readFile(join(process.cwd(), "public/brand/infeara-logo-light-cropped.png"));

/** A Node Buffer may be a view into a larger pool; the renderer wants exactly the font's own bytes. */
function bytesOf(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

const [medium, bold, extraBold, logo] = await Promise.all([
  read("manrope-latin-500-normal.woff"),
  read("manrope-latin-700-normal.woff"),
  read("manrope-latin-800-normal.woff"),
  logoFile(),
]);

const fonts = [
  { name: "Manrope", data: bytesOf(medium), weight: 500 as const, style: "normal" as const },
  { name: "Manrope", data: bytesOf(bold), weight: 700 as const, style: "normal" as const },
  { name: "Manrope", data: bytesOf(extraBold), weight: 800 as const, style: "normal" as const },
];

const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
// The logo file is 1123 × 163 pixels.
const LOGO_WIDTH = 288;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 163) / 1123);

export type CardContent = {
  /** The small line above the title: the kind of page, in capitals. */
  eyebrow: string;
  title: string;
};

export function renderCard(content: CardContent, headers: Record<string, string>) {
  const { text, fontSize } = fitCardTitle(content.title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BLUE,
          padding: "64px 80px 56px",
          fontFamily: "Manrope",
          color: IVORY,
          position: "relative",
        }}
      >
        {/* The faint rules of the shared card, so a page card and the default card look related. */}
        {[150, 300, 450].map((top) => (
          <div
            key={top}
            style={{
              position: "absolute",
              left: 0,
              top,
              width: "100%",
              height: 1,
              background: "rgba(234, 230, 222, 0.07)",
            }}
          />
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element -- this is the image renderer's markup, not a page */}
        <img src={logoSrc} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: CORAL,
            }}
          >
            {content.eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -2,
              maxWidth: 1040,
            }}
          >
            {text}
          </div>
          <div style={{ display: "flex", marginTop: 34, width: 112, height: 4, background: CORAL }} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            fontWeight: 500,
            color: "rgba(234, 230, 222, 0.72)",
          }}
        >
          <div style={{ display: "flex" }}>infeara.com</div>
          <div style={{ display: "flex" }}>Managed IT · Cybersecurity · Cloud · Chennai, India</div>
        </div>
      </div>
    ),
    { ...CARD_SIZE, fonts, headers },
  );
}
