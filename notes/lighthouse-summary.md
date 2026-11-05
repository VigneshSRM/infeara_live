# Lighthouse and axe results

**Date:** 2026-11-05
**Build:** production (`npm run build && npm run start`), local server on `http://localhost:3000`
**Tooling:** Lighthouse 12 (CLI, Playwright Chromium), axe-core 4.10.2 for pages Lighthouse will not load.

Raw JSON reports are in `notes/lighthouse/` (ignored by git; the numbers below are the record).

## Lighthouse — mobile, throttled (default preset)

Mobile runs on this localhost server were **not stable** and should not be used as a
performance figure. Repeated runs of the same unchanged page spanned 61–93 performance with
TBT between 230 ms and 1,690 ms, because Lighthouse's 4× CPU throttling competes with the
Next.js server on the same machine. Accessibility, best practices and SEO were identical on
every run.

| Page | Accessibility | Best practices | SEO |
| :--- | ---: | ---: | ---: |
| `/` | 100 | 100 | 69 |
| `/services/managed-it` | 100 | 100 | 69 |
| `/contact` | 100 | 100 | 69 |
| `/legal/privacy-policy` | 100 | 100 | 69 |

Re-measure mobile performance against the deployed Vercel preview, where HTML and static
assets come from the edge and the server is not sharing a core with the browser.

## Lighthouse — desktop preset

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 69 | 0.6 s | 10 ms | 0 |
| `/contact` | 97 | 100 | 100 | 69 | 0.8 s | 130 ms | 0 |
| `/legal/privacy-policy` | 97 | 100 | 100 | 69 | 0.8 s | 130 ms | 0 |

## Why SEO is 69, not 100

`SITE_INDEXABLE=false` is the launch gate. The only failing audit is `is-crawlable`: the page
is blocked from indexing, exactly as intended before the content swap.

A build with `SITE_INDEXABLE=true` was run to prove the rest of the SEO category:

| Page | SEO |
| :--- | ---: |
| `/` | 100 |
| `/services/managed-it` | 100 |
| `/contact` | 100 |

In that build `robots.txt` allows crawling except `/admin/` and `/api/`, the sitemap contains
36 canonical URLs, and the home page emits `index, follow`. The default build was restored
immediately afterwards and re-checked: `noindex, nofollow`, `Disallow: /`, empty sitemap.

## axe-core (pages Lighthouse cannot load)

Lighthouse errors on non-200 documents, so the 404 and 410 pages were audited with axe-core
directly. Rules: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.

| Route | Status | Violations |
| :--- | ---: | ---: |
| `/this-page-does-not-exist` | 404 | 0 |
| `/login` | 410 | 0 |
| `/forgot-password` | 410 | 0 |
| `/thank-you` | 200 | 0 |

## Fixed in this pass

Lighthouse found contrast failures that manual review had missed. All were resolved:

| Where | Before | After |
| :--- | :--- | :--- |
| `Figure` / `Schematic` captions | `text-charcoal/55` — 3.31:1 on ivory, 3.52:1 on white | `text-charcoal/75` — 5.6:1 / 5.9:1 |
| `CtaBand` eyebrow and body | `text-ivory/70` and `/72` on blue — 3.44:1 and 3.55:1 | full `text-ivory` — 5.29:1 |
| Home operating-principles band | `text-ivory/70` and `/85` on blue — 3.44:1 and 4.29:1 | full `text-ivory` |
| Legal table of contents | `text-charcoal/60` — 3.77:1 | `text-charcoal/75` |
| Contact body copy | `text-charcoal/65` — 4.36:1 | `text-charcoal/75` |
| Consent banner | `backdrop-blur` on a fixed 97%-opaque bar | removed (no visual change, less paint work) |

The rule that came out of it: on the blue band, secondary text stays at full ivory. Hierarchy
there is carried by size and weight, not opacity. Charcoal body text never goes below 75%
opacity on light backgrounds.
