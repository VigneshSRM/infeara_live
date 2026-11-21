# SEO audit — 21 November 2026

An online audit tool reported that it could not read the site. Two separate things blocked a crawler,
and which one it met depended on the address it was given:

1. **`https://www.infeara.com`: the launch gate, closed on purpose.** With `SITE_INDEXABLE` unset,
   `robots.txt` said `Disallow: /`, every page carried `noindex, nofollow` and `sitemap.xml` was empty
   (README, "Launch gate"). A crawler that obeys `robots.txt` stops at the first line. **Opened the
   same day, at the owner's request:** see "After the gate was opened" below.
2. **`https://infeara.com` (no `www`): still on Hostinger.** Only the bare address redirects; every
   other path tried was refused or missing. See "The bare domain is not on Vercel" below. Added 21 November
   2026, after the first version of this note had named only the gate.

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

## After the gate was opened (21 November 2026)

The owner then asked for the crawling problem to be fixed, so the site is open by default
(`lib/seo/indexing.ts`; README, "Launch gate"). What changed:

- **Open unless closed.** `SITE_INDEXABLE` not set means open; `true` opens; any other value closes;
  a Vercel preview deployment stays closed. Before, only the exact value `true` opened the site, so
  production, which had no such setting, was closed.
- **The sitemap keeps pace.** It was a snapshot taken at build time: an insight published in the
  admin, or a post scheduled for later, was missing until the next deployment. It is now rebuilt
  every five minutes, like the pages.
- **No made-up dates.** 57 of 64 sitemap entries said "modified" on the day of the build. An entry
  now carries a date only where the site knows one (the day a post, insight or white paper was
  published); the others carry none.

Crawl of a local production build with no setting at all (the code copy of the content, which is
what ships in the repo; the live site reads the same pages from the database):

| Check | Result |
| :--- | :--- |
| `robots.txt` | `Allow: /`, `Disallow: /admin/`, `Disallow: /api/`, `Sitemap: https://www.infeara.com/sitemap.xml` |
| Robots tag on the home page | `index, follow` |
| Sitemap | 64 URLs, all on `www`, none twice |
| Crawl by links, from `/` and from the sitemap | 65 pages: 64 indexable, and `/white-papers` noindex while empty |
| Sitemap against the pages that can be indexed | the same 64: nothing indexable is missing, nothing listed is blocked |
| Every sitemap address | 200, not noindex, canonical equal to the address |
| Kept out whatever the setting | `/admin/login`, `/thank-you`, the 404 page, `/login` and `/forgot-password` (410): all noindex |
| `SITE_INDEXABLE=false` | `Disallow: /`, 65 of 65 pages noindex, empty sitemap |
| `VERCEL_ENV=preview`, no setting | closed likewise |

The same checks now run as `npm run test:http` (robots.txt, the sitemap and the pages must agree;
every sitemap address must be a real, indexable page) and as `tests/indexing.test.mjs`.

## The bare domain is not on Vercel

Checked from outside on 21 November 2026:

| Check | Result |
| :--- | :--- |
| Nameservers of `infeara.com` | `ns1.dns-parking.com`, `ns2.dns-parking.com` (Hostinger) |
| `A` / `AAAA` of `infeara.com` | Hostinger addresses (`147.79.120.214`, `92.112.198.191` and IPv6 `2a02:4780:…`; they rotate; `notes/live-site-audit.md` recorded `147.79.69.59`, `93.127.173.42`) |
| `www.infeara.com` | `CNAME` to `1992c456e197966a.vercel-dns-017.com`: Vercel, serving the current build |
| `https://infeara.com/` | redirects to `https://www.infeara.com/` |
| `https://infeara.com/contact`, `/sla`, `/about` | **403 Forbidden**, a "Checking your browser before accessing" page, for tools and crawlers |
| `http://infeara.com/about` | **404 Not Found** from Hostinger's default site (`/htdocs_error/page_not_found.svg`) |

Those requests never reach Vercel, so neither the apex-to-`www` rule in `next.config.ts` nor the
legacy redirect map can act on them. The old site named the bare domain as canonical in all 77
sitemap entries, so links and index entries that still use it dead-end. An audit tool given
`infeara.com` would stop at the 403, which matches the hint in its report to "check a WAF or bot rule". Until this is
fixed, audit `https://www.infeara.com`.

**Fix: Option A of the DNS cutover runbook** (`concepts_brief.md`, step 5). Step 4 (`www` to the new
Vercel project) is done; the apex is the part left.

1. Vercel, project **Settings → Domains**: `infeara.com` should be listed. Its card shows the exact
   `A` record to use. Copy it from there; Vercel has changed that value before.
2. Hostinger, **DNS zone** for `infeara.com`: delete the `A` records and any `AAAA` records for
   `@` (the Hostinger addresses above), add the `A` record from step 1, and keep the `www` `CNAME`.
   Do not touch `MX` or `TXT` records: they carry the company's email.
3. Wait a few minutes for the certificate. The Domains card turns to "Valid Configuration".
4. Check: `curl -I https://infeara.com/contact` gives one 301/308 to `https://www.infeara.com/contact`,
   and `curl -I https://www.infeara.com/contact` gives 200.

## Still needed from the client

- **The apex DNS change above.** Until then, point audit tools at `https://www.infeara.com`.
- **Submit the sitemap**, `https://www.infeara.com/sitemap.xml`, in Google Search Console and in Bing
  Webmaster Tools. Both need the owner's own account.
- **Check the live site after the deployment.** `https://www.infeara.com/robots.txt` should say
  `Allow: /`. If it still says `Disallow: /`, `SITE_INDEXABLE` is set in Vercel to something other
  than `true`: delete it (or set it to `true`) and redeploy.
