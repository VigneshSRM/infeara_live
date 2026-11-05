# Build log

## 2026-11-05 — Slice 1: foundation and hero

**Repository state:** `D:\Automation\Infeara Website`, Next.js 16.4.5 / React 19.3.1, TypeScript, Tailwind v4. `npm run build` passes.

### Delivered

- **Brand assets.** `Logo.png` recoloured from `#014E82` to the brand `#226192`, coral remapped to `#EF8557`, alpha preserved. Outputs `public/brand/infeara-logo.png` (1200px) and `public/brand/infeara-logo-light.png` (ivory wordmark for dark sections). Scripts kept in `scripts/` so the assets can be regenerated.
- **Icon set.** The final "A" glyph with its coral triangle, isolated by anchoring on the coral pixel cluster because the letterforms touch and column-gap segmentation merges them. Outputs `app/icon.png` (512), `app/apple-icon.png` (180), `public/brand/infeara-icon-192.png`.
- **Design tokens.** `app/globals.css` `@theme`: ivory, blue, coral, navy, charcoal, muted; three font families; one easing curve. Contrast rules from the brief are encoded in the component choices, not left to taste.
- **Typography.** Inter (body), Manrope (headings), Space Grotesk (display), all self-hosted through `next/font` at build time.
- **Canonical and indexing.** `SITE_URL` fixed to `https://www.infeara.com`; `next.config.ts` redirects the apex host at the network layer; `robots.ts` and `sitemap.ts` respect `SITE_INDEXABLE`, which is `false` at launch.
- **Homepage hero.** Code-built cinematic scene: perspective grid, scan sweep, SVG operations diagram with travelling signals and rack LEDs, no animation library. Reveal choreography uses a translate-only `.lift` for the headline so the LCP element is painted immediately, and every animation is disabled under `prefers-reduced-motion`.
- **Second section.** Positioning statement in the ivory editorial layout.

### Fixed during the slice

- `var(--ease-out-expo)` was referenced before being defined, which invalidated the whole `animation` shorthand and left every `.reveal` element at `opacity: 0`. Defined in `@theme`.
- Headline was oversized at 5.15rem and broke to four lines on desktop; reduced to a 4.15rem ceiling with a 54rem measure.
- Mobile hero overflowed the viewport; mobile padding, paragraph size, CTA gap and capability strip spacing reduced.

### Verified

- Production build compiles and generates all routes statically.
- Desktop 1440×900 and mobile 390×844 screenshots checked (`notes/hero-desktop-4.png`, `notes/hero-mobile-2.png`).

### Next slice

1. Read the Next 16 guides in `node_modules/next/dist/docs/` for `proxy` (the middleware replacement), caching, revalidation and draft mode before writing CMS code.
2. Supabase migrations: tables, row-level security, audit triggers, storage buckets. Requires a provisioned project.
3. Content queries and page templates for the nine services, eight industries and the corporate pages.
4. `/admin`: authentication, entity editors, media library, preview, lead inbox.
5. Redirect map for the 60 legacy service URLs.

### Needed from the client

- Supabase project URL, anon key, service-role key and the chosen region.
- Confirmation that `SITE_INDEXABLE` stays false until the content swap.
- The name of the person who signs off published claims.
