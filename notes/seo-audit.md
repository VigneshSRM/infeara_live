# SEO audit — 21 November 2026

An online audit tool reported that it could not read www.infeara.com. That is the launch gate, not a
fault: with `SITE_INDEXABLE` unset, `robots.txt` says `Disallow: /`, every page carries
`noindex, nofollow` and `sitemap.xml` is empty (README, "Launch gate"). A crawler that obeys
`robots.txt` stops at the first line.

So the site was audited the way that tool would have done it, on a copy with the gate open: a local
production build with `SITE_INDEXABLE=true`, Supabase and GA4 variables blank (the code copy of the
content, which is what ships in the repo).

## Method

- Crawled from the sitemap's 64 URLs and followed every internal link: **65 pages**. The extra one is
  `/white-papers`, which is `noindex` and left out of the sitemap while nothing is published.
- Per page: status, redirects, title, meta description, canonical, robots meta, Open Graph and Twitter
  tags, number of `h1`s and heading order, `lang`, viewport, image `alt`, link names, `rel` on
  `target="_blank"` links, JSON-LD (parses; breadcrumb addresses are absolute), links to missing
  pages, links that go through a redirect.
- Site: `robots.txt`, sitemap against the crawl, the 404 page, security headers.
- Re-run after the fixes below, on a fresh build.

## Fixed

| Finding | Before | After |
| :--- | ---: | ---: |
| `og:site_name` and `og:locale` missing (a page's own `openGraph` replaces the layout's, so every page lost them) | 65 pages | 0 |
| Title over 60 characters (the suffix ` — Infeara Technologies` alone was 23) | 15 pages | 1 (61) |
| Meta description over 160 characters | 4 pages, and the 201-character site default | 0 (longest 159) |
| Link text that says nothing about where it goes ("Read post", "View guide" on the featured cards) | 2 | 0 |
| `Host:` line in `robots.txt` (Yandex only, withdrawn in 2018) | present | removed |
| Organization data without a place | none | Chennai, Tamil Nadu, IN |

The admin's SEO-title hint said "under 60 characters" while the site added 23 more, so editors
could not have met the limit by following it. The suffix is now ` — Infeara` and the hint says 50.
The limits live in `lib/seo/limits.ts`; `tests/seo-limits.test.mjs` and `npm run test:http` guard them.

## Checked and clean

Canonical address on all 65 pages, on the page's own path and the `www` host · exactly one `h1`
each · no skipped heading levels · `lang="en-IN"` and a viewport on every page · 289 images, every
one with an `alt` · no broken internal links and none that go through a redirect · sitemap equals
the crawl minus `/white-papers` · JSON-LD parses on all pages · outside links carry
`rel="noopener noreferrer"` · the 404 page returns 404 with `noindex` · HSTS, `nosniff`,
referrer policy and frame options are set · the Open Graph picture is 1200 × 630 (94 KB).

Lighthouse SEO with the gate open was 100 on the three pages measured (`notes/lighthouse-summary.md`).
It was not re-run for this audit; none of the fixes touches what Lighthouse measures.

## Left alone, on purpose

- **Thin pages (under 250 words):** the three representative case studies (200–221 words) and the
  `/insights` and `/white-papers` listings. Lengthening them means inventing detail, which the
  honest-voice rule forbids. Real client case studies will be longer.
- **`/white-papers` is `noindex`** until the first paper is published; it joins the sitemap then.
- **One 61-character title:** the blog post "Website, web app or mobile app? A scoping checklist".
  It comes from the database, so fix it in Admin → Blogs → SEO title.
- **No `llms.txt`.** It is an unofficial convention that no major search engine reads. Easy to add
  if the client wants it.
- **No email, phone number or social profile in the Organization data.** The site publishes none, on
  purpose (no public company mailbox). Add `contactPoint` and `sameAs` when the client supplies them.
- **Sitemap `lastmod`:** 57 of 64 entries carry the day of the build, because most content has no
  modified date. Google ignores a `lastmod` it cannot trust; nothing is harmed.

## Still needed from the client

The site stays closed to crawlers until the client confirms the content swap in writing, so an
online audit will keep failing until then. Opening it is two steps in Vercel (README, "Search
listings"): set `SITE_INDEXABLE=true` for Production, then redeploy.
