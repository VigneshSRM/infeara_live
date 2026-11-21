# SEO audit — 21 November 2026

An online audit tool reported that it could not read the site. Two separate things blocked a crawler,
and which one it met depended on the address it was given:

1. **`https://www.infeara.com`: the launch gate, closed on purpose.** With `SITE_INDEXABLE` unset,
   `robots.txt` said `Disallow: /`, every page carried `noindex, nofollow` and `sitemap.xml` was empty
   (README, "Launch gate"). A crawler that obeys `robots.txt` stops at the first line. **Opened the
   same day, at the owner's request:** see "After the gate was opened" below.
2. **`https://infeara.com` (no `www`): on Hostinger, until the owner moved it the same day.** Only the
   bare address redirected; every other path tried was refused or missing. See "The bare domain was not
   on Vercel" below, which also records the check after the change. Added 21 November 2026, after the
   first version of this note had named only the gate.

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
  honest-voice rule forbids. Real client case studies will be longer. (The four thin *service* pages
  were lengthened in the second audit, below.)
- **`/white-papers` is `noindex`** until the first paper is published; it joins the sitemap then.
- **No email, phone number or social profile in the Organization data.** The site publishes none, on
  purpose (no public company mailbox). Add `contactPoint` and `sameAs` when the client supplies them.

*Two items that were here were done in the second audit: the one 61-character blog title is
shortened, and `llms.txt` exists.*

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

## The bare domain was not on Vercel (fixed 21 November 2026)

**Status: fixed.** The owner changed the records at Hostinger on 21 November 2026; the check after it,
with the evidence for each address, is in `notes/search-console-404.md` ("Status"). In short: `A` of
`infeara.com` is `216.198.79.1`, Vercel says `misconfigured: false`, and an old address takes one 308
to `www` and then one 301 or a 200. Nothing is left to do here.

Checked from outside on 21 November 2026, **before** the change:

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

**The fix, done by the owner: Option A of the DNS cutover runbook** (`concepts_brief.md`, step 5), kept
here in case the records are ever changed again. Step 4 (`www` to the new Vercel project) was already
done; the apex was the part left.

1. Vercel, project **Settings → Domains**: `infeara.com` should be listed. Its card shows the exact
   `A` record to use. Copy it from there; Vercel has changed that value before. On 21 November 2026
   it recommended `216.198.79.1` and `64.29.17.1`, with `76.76.21.21` as the single-address second choice.
2. Hostinger, **DNS zone** for `infeara.com`: delete the `A` records and any `AAAA` records for
   `@` (the Hostinger addresses above), add the `A` record from step 1, and keep the `www` `CNAME`.
   Do not touch `MX`, `TXT` or other `CNAME` records: they carry the company's email, and the DNS
   record Search Console used to verify the domain (if it did) sits in the same zone.
3. Wait a few minutes for the certificate. The Domains card turns to "Valid Configuration".
4. Check: `curl -I https://infeara.com/contact` gives one 308 to `https://www.infeara.com/contact`,
   and `curl -I https://www.infeara.com/contact` gives 200.

Search Console's "Not found (404)" report of the same day (49 addresses, 44 of them on the bare
domain) is this same problem seen from Google's side: `notes/search-console-404.md`.

## Still needed from the client

- **Search Console: press "Validate fix"** on the "Not found (404)" report if it shows *Failed*, and
  remove a stale `https://infeara.com/sitemap.xml` entry if one is listed (`notes/search-console-404.md`).
- **Submit the sitemap**, `https://www.infeara.com/sitemap.xml`, in Google Search Console and in Bing
  Webmaster Tools. Both need the owner's own account.
- **Check the live site after the deployment.** `https://www.infeara.com/robots.txt` should say
  `Allow: /`. If it still says `Disallow: /`, `SITE_INDEXABLE` is set in Vercel to something other
  than `true`: delete it (or set it to `true`) and redeploy.

## Second audit, 21 November 2026: an online tool, 67/100 (provisional)

The owner attached a report from an online tool. It had fetched **six pages** and could not read
`robots.txt`, the sitemap, the structured data or the response headers, so it marked those "could not
verify" and gave a provisional score (Technical 70, Content 58, On-page 72, AI search 62, Images 78).
Each finding was checked against the live site and the code.

### Already fine (the tool could not see it)

| The tool said | What the site does |
| :--- | :--- |
| `robots.txt`, sitemap: could not verify | `Allow: /`, `Disallow: /admin/` and `/api/`, a `Sitemap:` line; 64 URLs. |
| Structured data: could not verify | Organization, WebSite, Service, Article, BlogPosting, FAQPage, BreadcrumbList, ItemList and JobPosting, all parsing, all addresses absolute. |
| Canonical and robots meta | On every page. |
| HTTPS and security headers | HTTPS, HSTS (two years, preload), `nosniff`, referrer policy and frame options. |
| Apex redirect | 308 to `www`, set in Vercel and working since the owner moved the bare domain's DNS to Vercel on 21 November 2026; see "The bare domain was not on Vercel". |

### Fixed in code

| Finding | Before | After |
| :--- | :--- | :--- |
| Titles with no place (28 service and focused-service pages) | "Penetration Testing Services — Infeara" | "Penetration Testing Services in Chennai, India — Infeara" (live since 21 November 2026: script 07 changed 27 of the 28 and the owner set the last one in the admin, see below) |
| Home page lead without a place | "…for organisations across India, with…" | "Managed IT services from Chennai for organisations across India: …"; the home title is "Managed IT & Cybersecurity Services in Chennai — Infeara" |
| `<title>` ended "— Infeara", `og:title` "— Infeara Technologies" | two strings per page | one string per page (tab, result, `og:title`, `twitter:title`), checked on all 66 pages |
| `og:type` `website` on guides and posts | 7 articles said `website` | `article`, with `article:published_time`, `article:author` and `article:section` |
| No date or byline on guides; no byline on posts | none | the day, "By Infeara Technologies" (linked to the About page) and the reading time |
| Insight dates a day early (sitemap `lastmod`, Article `datePublished`) | 11 Oct, 23 Sep, 29 Aug | 12 Oct, 24 Sep, 30 Aug: the India day, as stored |
| No skip link on the home page (and the 404 page) | missing | present on every page, before the menu |
| One OG picture for every page | 1 image, 66 pages | 46 pages with their own card, 20 sharing the default |
| No `llms.txt` | 404 | `/llms.txt`, 51 links, every one a page that exists |
| Duplicate FAQ on the home and Managed IT pages | "How is managed IT different from IT outsourcing?" on both, and "What happens during a security incident?" on the home and Cybersecurity pages | the home page asks questions no service page asks |
| Thin service pages | Managed IT ~410 words of copy; Penetration Testing ~190; Vulnerability Assessment ~215; Cloud DR ~225 | ~970–1,070 each; 8 deliverables, 6 outcomes, 9 questions |
| One 61-character title (a blog post) | 61 | 59 (live since script 07 was run) |

How the live database gets the new wording: README, "SEO audit fixes". Short version: the seeded
lists and seed files are untouched, the later wording is in `lib/content/copy-refresh.ts`, and
`supabase/apply/07-seo-audit-copy.sql` updates only rows that still hold the seeded wording.

### Script 07 on the live site (checked 21 November 2026, 14:08 to 14:50 UTC)

The owner ran `supabase/apply/07-seo-audit-copy.sql` in the Supabase SQL editor. It was checked on the
live site afterwards, page by page. The Supabase account connected to the assistant cannot see the
project (`list_projects` is empty, `get_project` answers 403), so the database itself was not read.

- **27 of the 28 service and focused-service titles are new, and so is the blog title.** That is 9 of
  the 10 services, all 18 focused services and the one post.
- **The four expanded pages are live:** Managed IT, Penetration Testing, Vulnerability Assessment and
  Cloud Disaster Recovery show the fuller introduction, eight deliverables, the outcomes and the extra
  questions.
- **One title did not change, and the owner then set it by hand:** `/services/outsourcing-remote-support`
  still read "IT Outsourcing & Remote Support — Infeara" after the script. Its row holds older wording than the seed: in the database the page is
  named "IT Outsourcing & Remote Support", while the repository (the seed, the code lists and the menu
  label) calls it "Remote IT Services". The migration that renames it,
  `20261106120000_service_hierarchy.sql`, was never run in production. It also touches
  `it-infrastructure`, whose title did change. Script 07 changes a title only while it still equals the
  seeded "Remote IT Services & Dedicated Support", so it left this one alone, as designed.
- **Why this shows the database was updated:** the code fallback carries the new wording for all 29
  pages, so an old title on the live site can only come from the database. The site is reading the
  database, and the 28 new titles are in it.
- **The last title, set in the admin (Services → the Remote IT row → "Search engine listing" → "SEO
  title"):** `IT Outsourcing & Remote Support in Chennai, India` (49 characters, 59 with the site name).
  Checked live at about 14:45 UTC: the page's title is now "IT Outsourcing & Remote Support in Chennai,
  India — Infeara". Saving a service refreshes its public page (`saveService` in
  `lib/admin/content-actions.ts` revalidates `/`, `/services` and `/services/<slug>`). One read through a metadata service still gave the old title for a
  minute, from its own cache; a read with that cache bypassed and a plain page fetch both gave the new
  one, so **all 28 service and focused-service titles and the blog title are now live.**
- **Still on the older wording:** this page's heading ("IT Outsourcing & Remote Support"), introduction,
  card text on the IT Infrastructure page and meta description, while the menu says "Remote IT
  Services". That is the same unrun migration. To make the page carry the repository's name, change
  Name, Tagline, Summary, Intro and the meta description in the admin (their wording is in
  `20261106120000_service_hierarchy.sql`) and retitle it `Remote IT Services & Dedicated Support, India`.
  Optional; the page works as it is.

Standards named in the fuller pages are context, at the places they are published, and a report
satisfying an auditor is always left to the client: PCI DSS v4.0.1 requirement 11.4 (penetration
tests at least every 12 months and after significant change, by a qualified, organisationally
independent tester) and 11.3 (internal and external vulnerability scans at least every three months;
the external one by an Approved Scanning Vendor); ISO/IEC 27001:2022 Annex A 8.8 (technical
vulnerabilities), 8.29 (security testing) and 5.30 (ICT readiness for business continuity); CERT-In
empanelment of security auditors, mentioned as something a tender may ask for, with the page saying
it will state plainly whether a requirement is met rather than imply it. RBI was not mentioned: it
was not verified. No certification, client or figure is claimed anywhere.

### Not in the code: needs the owner

- A street address, phone number and email to publish (the site shows only "Chennai, Tamil Nadu,
  India", its hours and a contact form).
- Named people with roles and profile links (the byline is the company until then).
- The registered legal name, and whether "Infeara Secure Technologies Pvt Ltd" (Srivilliputhur) is related.
- LinkedIn, GitHub and Google Business Profile addresses, for `sameAs` and the local listing.
- Directory listings (Justdial, IndiaMART, Clutch, GoodFirms) and the Search Console and Bing accounts.
- Case studies a client has agreed in writing may be published; city pages only where the company
  really serves the city.
- A PageSpeed Insights run on the live site.

### Left alone

The desktop and mobile menus both appear in the page (the tool rates it Low), reused photographs,
the placeholder case studies (which say they are representative), and `/white-papers` being `noindex`
while empty.

### Verified

A local production build with the code copy of the content, crawled from the sitemap: 66 pages return
200, none over 60 characters, none over 160 in the description, no duplicate titles or descriptions,
one `h1` each, a canonical and a skip link on every page, no image without `alt`, no link to a page
that does not exist. `npm run test:unit`, `npm run test:http` and the Playwright suite pass. The
migration was run in a throwaway Postgres: every title and the four pages change; a second run
changes nothing; a page whose title or text was edited is left as it was and named in a notice; the
audit trigger is switched back on; a missing table stops the run with the script to run first.
