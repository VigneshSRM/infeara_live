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

## 2026-11-05 — Slice 2: complete public site

**Repository state:** 46 routes build clean. TypeScript passes. Public frontend is finished;
Supabase and `/admin` are untouched.

### Delivered

- **Homepage, 16 sections.** Hero, positioning, practice grid, engagement model, proof-of-work,
  operating principles, industries, insights, FAQ, CTA. No statistics, client names or
  certifications that cannot be evidenced.
- **Nine practice pages** at `/services/[slug]`: managed IT, cybersecurity, IT infrastructure,
  outsourcing and remote support, cloud and data centre, network engineering, IT facility
  management, turnkey projects, automation and custom software. Each has scope, inclusions,
  exclusions, engagement model, FAQs and its own metadata.
- **Eight sector pages** at `/industries/[slug]`, each framed around operating context rather
  than invented outcomes.
- **Corporate and editorial pages:** about, approach, why Infeara, case studies (capability
  format, no fabricated metrics), technology partners, SLA and support model, insights index
  plus three articles, FAQ, careers, contact, thank you, 404.
- **Legal:** privacy policy, terms, cookie policy. Written for the DPDP Act 2023 and the
  consent-gated analytics actually implemented.
- **Content layer:** `lib/content/*` holds typed seed content behind async accessors, so the
  Supabase swap changes `lib/content/index.ts` only. Slugs are frozen.
- **Lead capture:** `app/api/contact` validates name, email, company, message length and a
  honeypot; it returns 503 with an explicit mailto fallback until `CONTACT_WEBHOOK_URL` is set.
- **Consent and analytics:** nothing loads before a choice. GA4 is injected only after
  "Allow analytics"; "Essential only" is a first-class option. Preferences can be changed from
  the cookie policy.
- **Brand assets:** recoloured logo (light and dark variants), icon set, Open Graph image
  generated by `scripts/generate-og.mjs`.
- **Legacy URLs:** `lib/redirects.ts` maps all 77 previous sitemap URLs — 63 × 301, two × 410,
  12 unchanged. Verified end to end; every destination returns 200.

### Fixed during the slice

- **Contrast.** Lighthouse found 3.3:1 captions, 3.4:1 text on the blue band and 3.77:1 legal
  TOC links. All charcoal body text is now at least `/75`; the blue band uses full ivory for
  secondary text. Full matrix in `notes/lighthouse-summary.md`.
- **Duplicate Organization JSON-LD** on the homepage; it now lives once in the root layout, with
  `WebSite` beside it.
- **Missing second image** on `/insights`; added an editorial `Schematic`, keeping the
  two-images-per-page rule.
- **Homepage `h1`** gained an `aria-label` so the split-line display type reads as one sentence.
- **Consent banner** lost `backdrop-blur`; it is 97% opaque, so the blur was invisible work.

### Verified

- `npm run build`: 46 routes, TypeScript clean.
- 39 URLs at 390 px: no horizontal overflow, exactly one `h1`, canonical present, noindex on
  every page.
- Lighthouse 12 desktop: performance 97–100, accessibility 100, best practices 100 on home,
  contact and privacy policy. SEO is 69 solely because of the indexing gate; a temporary
  `SITE_INDEXABLE=true` build scored 100 and listed 36 canonical URLs, then the gated build was
  restored and re-checked.
- axe-core WCAG 2.1 A/AA: zero violations on the 404, 410 and thank-you routes.
- Redirect matrix: 63 × 301, two × 410, all destinations 200, no chains.

### Open

- Supabase project URL, anon key, service-role key and region — CMS work cannot start without
  them.
- `CONTACT_WEBHOOK_URL` (and optional secret): until set, lead delivery depends on the visitor's
  mail client.
- Licensed photography to replace the `Figure` / `Schematic` stand-ins. Alt text is already
  written per page.
- Apex DNS still points at Hostinger; the apex 301 only works after cutover.
- `SITE_INDEXABLE=false` stays until the client confirms the content swap in writing.

### Next slice

1. Read the Next 16 `proxy`, caching, revalidation and draft-mode guides.
2. Supabase migrations: content tables, RLS, audit triggers, storage buckets, three roles
   (Super Admin, Editor, SEO Manager; a fourth maps to SEO Manager).
3. Swap `lib/content/index.ts` for database queries; add preview and revalidation.
4. `/admin`: auth, entity editors, media library, lead inbox, scheduled publishing, audit log.
5. Roughly 40-check smoke test in place of formal UAT.
