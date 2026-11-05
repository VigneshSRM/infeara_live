# Infeara Technologies — website

Production website for Infeara Technologies (Chennai). One Next.js application serves the
public marketing site and, in a later slice, the `/admin` CMS.

**Current state:** the public site is complete — 36 published routes plus a 404, a 410 for two
retired account routes, and a 301 for every legacy URL. The build is intentionally
non-indexable (`SITE_INDEXABLE=false`) until the client signs off the content swap. The CMS
and Supabase schema are **not** built yet.

## Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js 16.4.5 (App Router, Turbopack), React 19.3.1, TypeScript |
| Styling | Tailwind CSS v4, design tokens in `app/globals.css` |
| Fonts | Inter (body), Manrope (UI headings), Space Grotesk (display) via `next/font` |
| Data (planned) | Supabase — Auth, Postgres with RLS, Storage |
| Hosting | Vercel |

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:3000
npm run build && npm run start
```

`next/font` fetches Google Fonts at build time, so the first build needs network access.

## Environment

| Variable | Purpose |
| :--- | :--- |
| `SITE_URL` | Canonical origin used by metadata, sitemap, Open Graph and JSON-LD. |
| `SITE_INDEXABLE` | `"true"` to allow indexing. Anything else emits `noindex, nofollow`, an empty sitemap and `Disallow: /`. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Reserved for the CMS slice. |
| `REVALIDATE_SECRET` | Signed secret for on-demand revalidation. |
| `CONTACT_WEBHOOK_URL`, `CONTACT_WEBHOOK_SECRET` | Contact-form delivery. Without the URL, `/api/contact` returns 503 and the form points people at `contact@infeara.com`. |
| `NEXT_PUBLIC_GA4_ID` | GA4 property, loaded only after analytics consent. |

## Structure

```
app/
  page.tsx                 homepage (16 sections)
  services/[slug]          9 practice pages
  industries/[slug]        8 sector pages
  insights/[slug]          3 editorial articles
  legal/[slug]             privacy, terms, cookies
  about, approach, why-infeara, case-studies, partners, sla, faq, careers, contact
  api/contact              validated form endpoint
  login, forgot-password   route handlers returning 410 Gone
components/site/           shared layout, cards, figures, forms, consent
lib/content/               typed content; the single swap point for Supabase
lib/redirects.ts           legacy URL map (see below)
notes/                     build log, live-site audit, QA evidence
```

Content accessors in `lib/content/index.ts` are async even though they read local TypeScript
today, so replacing them with Supabase queries does not change any page signature.

### Images

`Figure` and `Schematic` render deterministic SVG illustrations with `role="img"` and
descriptive labels. They are deliberate stand-ins: every published page needs at least two
relevant images, and these carry descriptive alt text until licensed photography replaces
them. Swap the internals of those two components, not every page.

## Redirects

`lib/redirects.ts` maps all 77 URLs from the previous sitemap:

- 63 legacy URLs → 301 to the closest new page. Nothing redirects to the homepage.
- `/login` and `/forgot-password` → 410 via route handlers. There is no public account area.
- The remaining 12 URLs already exist under the same path (`/about`, `/services`,
  `/industries/healthcare`, …).

The apex host (`infeara.com`) 301s to `https://www.infeara.com` at the edge. That rule only
takes effect once DNS for the apex points at Vercel.

## Launch gate

`SITE_INDEXABLE=false` is the default. While it is false:

- every page carries `<meta name="robots" content="noindex, nofollow">`;
- `robots.txt` is `Disallow: /`;
- `sitemap.xml` is a valid but empty `<urlset>`.

Flip it only on the client's written instruction, after the content swap. With the gate on,
Lighthouse SEO scores 69 purely because the page is blocked from indexing; with
`SITE_INDEXABLE=true` the same pages score 100, and the sitemap lists 36 URLs.

## Quality checks

- `npm run build` — TypeScript clean, 46 routes.
- Lighthouse 12, desktop preset: performance 97–100, accessibility 100, best practices 100.
  Mobile (throttled): accessibility 100, performance 71–93.
- axe-core WCAG 2.1 A/AA: zero violations on the 404, 410 and thank-you pages, which
  Lighthouse cannot audit directly.
- 390 px viewport: no horizontal overflow on any route, one `h1` per page, canonical present.

Evidence and the dated results are in `notes/`.
