// Which pages have a picture of their own for a shared link, and where it lives. Import-free, so
// the unit tests can load it as it is.
//
// A link to a service, a guide or a post that is pasted into LinkedIn, WhatsApp, Slack or X shows
// a card. Every page used to show the same one. The pages below get a card with their own title,
// drawn on request by app/og/[...path]/route.tsx from the same content the page itself shows.
//
//   /services/managed-it                          →  /og/services/managed-it.png
//   /services/cybersecurity/penetration-testing   →  /og/services/cybersecurity/penetration-testing.png
//   /insights/<slug>  /blogs/<slug>  /case-studies/<slug>  /industries/<slug>
//
// Every other page keeps the shared card (public/brand/og-image.png). The picture's address is
// the page's address with "/og" in front and ".png" after, so lib/metadata.ts can work it out
// from the page path alone, and the route can work the page out from the address.

export const OG_PREFIX = "/og";

/** The four services that have focused services beneath them: /services/<parent>/<slug>. */
export const CARD_SUBSERVICE_PARENTS = [
  "cybersecurity",
  "cloud-datacenter",
  "ai-automations",
  "application-development",
] as const;

export type CardTarget =
  | { kind: "service"; slug: string }
  | { kind: "subservice"; parent: string; slug: string }
  | { kind: "insight"; slug: string }
  | { kind: "blog"; slug: string }
  | { kind: "case-study"; slug: string }
  | { kind: "industry"; slug: string };

// The same shape the admin enforces for a slug: lowercase words separated by single hyphens.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SINGLE_SEGMENT_KINDS: Record<string, Exclude<CardTarget["kind"], "service" | "subservice">> = {
  insights: "insight",
  blogs: "blog",
  "case-studies": "case-study",
  industries: "industry",
};

/** "/services/managed-it" becomes its card target; a page without a card (the home page, /about, …) gives null. */
export function cardTargetForPath(path: string): CardTarget | null {
  if (!path.startsWith("/")) return null;
  // A doubled or trailing slash leaves an empty segment, which is not a slug: not a page address.
  const segments = path.slice(1).split("/");
  if (segments.length < 2 || segments.length > 3) return null;
  if (!segments.every((segment) => SLUG.test(segment))) return null;

  const [section, first, second] = segments;
  if (section === "services") {
    if (segments.length === 2) return { kind: "service", slug: first };
    return (CARD_SUBSERVICE_PARENTS as readonly string[]).includes(first)
      ? { kind: "subservice", parent: first, slug: second }
      : null;
  }

  const kind = SINGLE_SEGMENT_KINDS[section];
  return kind && segments.length === 2 ? { kind, slug: first } : null;
}

/** The address of a page's card, or null when the page has none. */
export function ogCardPath(path: string): string | null {
  return cardTargetForPath(path) ? `${OG_PREFIX}${path}.png` : null;
}

/** The segments the route receives (everything after /og, with ".png" on the last one) back to a target. */
export function cardTargetForSegments(segments: readonly string[]): CardTarget | null {
  if (!segments.length) return null;
  const last = segments[segments.length - 1];
  if (!last.endsWith(".png")) return null;
  const path = `/${[...segments.slice(0, -1), last.slice(0, -".png".length)].join("/")}`;
  return cardTargetForPath(path);
}

// ── The words on a card ─────────────────────────────────────────────────────

/** The longest title a card prints; a longer one is cut at a word and ends in an ellipsis. */
export const CARD_TITLE_MAX = 110;

/** The title as it is printed (cut to fit) and the type size that fills the card without crowding it. */
export function fitCardTitle(title: string): { text: string; fontSize: number } {
  const flat = title.replace(/\s+/g, " ").trim();
  let text = flat;
  if (flat.length > CARD_TITLE_MAX) {
    const cut = flat.slice(0, CARD_TITLE_MAX - 1);
    text = `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,;:.-]+$/, "")}…`;
  }
  const length = text.length;
  const fontSize = length <= 26 ? 88 : length <= 40 ? 76 : length <= 62 ? 64 : length <= 84 ? 54 : 46;
  return { text, fontSize };
}
