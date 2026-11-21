# Search Console: "Not found (404)" — 21 November 2026

Search Console's page indexing report listed **49 addresses** as *Not found (404)* and the owner
started validation the same day.
**44 of the 49 are on the bare domain, `https://infeara.com/…`, and 5 are on `https://www.infeara.com/…`.**
This note says why they 404, what the code now does with each, and the one step that only the owner
could take.

## Status

**The owner made the DNS change on 21 November 2026, and it works.** Checked from outside between
13:53 and 13:56 UTC, with DNS queries, Vercel's domain settings, a public service that prints every
hop of a request, and by fetching the pages:

| Check | Result |
| :--- | :--- |
| `A` of `infeara.com` | `216.198.79.1` (Vercel). No `AAAA` any more. |
| `MX`, `TXT`, `NS`, `www` | unchanged: `mx1` and `mx2.hostinger.com`, the email's SPF record, `ns1` and `ns2.dns-parking.com`, the `www` `CNAME` |
| Vercel, `infeara.com` | `misconfigured: false`, set up by `A`, verified, redirect to `www.infeara.com` (308) |
| `https://infeara.com/services/audit-compliance/iso-27001` | 308 to `https://www.infeara.com/services/audit-compliance/iso-27001`, then 301 to `/services/cybersecurity`, then 200 |
| `https://infeara.com/industries/retail` and `/services/turnkey/offshore-development` | 308, then 301 to the new page, then 200 |
| `https://infeara.com/legal/cookies` (a page that exists) | 308 to `www`, then 200 |
| `http://infeara.com/contact` | 308 to `https://infeara.com/contact`, 308 to `https://www.infeara.com/contact`, then 200 |
| `https://infeara.com/robots.txt` | 308 to `https://www.infeara.com/robots.txt`, then 200 |
| `https://infeara.com/about`, `/resources/blog`, `/legal/terms-of-service`, `/index.html` | land on `www` at the page, `/blogs`, `/legal/terms` and the home page |
| `https://infeara.com/index.php` and `https://www.infeara.com/terms.php` | 403 with `X-Vercel-Mitigated: deny` (see "Three addresses were never in the old sitemap") |

No address needs more than two hops. Only one `A` record was added, `216.198.79.1`; Vercel accepts
it. Adding `64.29.17.1` as a second `A` record is optional.

**What is left is on Google's side:** validation and waiting (see "What to do in Search Console").

## Why they 404

### 1. Forty-four addresses were on a host that was not on Vercel

| Before the change (21 November 2026, from outside) | Result |
| :--- | :--- |
| Nameservers of `infeara.com` | `ns1.dns-parking.com`, `ns2.dns-parking.com` (Hostinger) |
| `A` records of `infeara.com` | for example `148.135.128.116`, `77.37.76.142`, `92.112.198.100`: Hostinger addresses; the set changes between lookups |
| `AAAA` records of `infeara.com` | `2a02:4780:…`: Hostinger |
| `MX` records | `mx1.hostinger.com`, `mx2.hostinger.com` (the company's email) |
| `www.infeara.com` | `CNAME` to `1992c456e197966a.vercel-dns-017.com`: Vercel, serving the current site |
| Vercel, `infeara.com` | listed on the project, redirect to `www.infeara.com` (308), but **misconfigured**: Vercel recommends `A 216.198.79.1` and `A 64.29.17.1` |
| `https://infeara.com/about` (a page that exists on the new site) | Hostinger's "Checking your browser" 403 page when a tool fetches it; over plain `http`, Hostinger's own 404 page |
| `https://www.infeara.com/services/audit-compliance/iso-27001` | 301 to `/services/cybersecurity`, which answers 200 |

A request for `https://infeara.com/anything` went to Hostinger and never reached Vercel, so nothing in
this repository could act on it: not the bare-domain rule in `next.config.ts`, not the map of old
addresses. The most likely reason Google has them on the bare domain: the site before this one named
`https://infeara.com` as the canonical address on every page, listed all 77 of its sitemap entries on
it, and named `https://infeara.com/sitemap.xml` in its robots file (`notes/live-site-audit.md`,
section 2). The bare domain has never served the site, so those addresses have been a 404 (or a 403)
since.

**The fix was DNS, and only the owner could make it.** The steps, kept in case the records are ever
changed again:

1. Hostinger, hPanel → **Domains** → `infeara.com` → **DNS / Nameservers** → **DNS records**.
2. Delete the `A` records for `@` and the `AAAA` records for `@` (the Hostinger addresses above). If
   hPanel will not delete one, edit its value instead.
3. Add `A` `@` → `216.198.79.1` and `A` `@` → `64.29.17.1`: the two addresses Vercel lists first for this
   domain (checked 21 November 2026). If the editor takes only one `A` record, use `76.76.21.21`, the
   single address Vercel lists as its second choice. Always copy what the domain's card in Vercel shows
   if it differs; Vercel has changed these values before.
4. **Leave alone:** the `www` `CNAME`, every `MX` record (the company's email), every `TXT` record and
   every other `CNAME` (mail set-up). On 21 November 2026 the only `TXT` record at `infeara.com` is the
   email's SPF record, so which record Search Console used to verify the property is not visible from
   outside; if it is a DNS record (it has to be for a Domain property), it lives in this same zone.
   Delete only the `A` and `AAAA` records for `@`; every record you did not add yourself stays. Do not
   change the nameservers either: the email records live at Hostinger.
5. Vercel, project **Settings → Domains**: the `infeara.com` card turns to "Valid Configuration" within
   minutes and the certificate is issued. The current `A` and `AAAA` records report a 60-second
   lifetime (seen from 8.8.8.8), so resolvers drop the old addresses within about a minute of the change.

Since the change, every one of the 44 takes the same road. For `https://infeara.com/services/audit-compliance/iso-27001`:

1. Vercel redirects `infeara.com` to `https://www.infeara.com/services/audit-compliance/iso-27001` (308, path kept).
2. `lib/redirects.ts` sends that to `https://www.infeara.com/services/cybersecurity` (301).
3. The page answers 200.

Two hops is what Google follows without trouble (it follows up to ten). To check from a terminal:

```
curl -sI https://infeara.com/services/audit-compliance/iso-27001     # 308 to https://www.infeara.com/services/audit-compliance/iso-27001
curl -sI https://www.infeara.com/services/audit-compliance/iso-27001 # 301 to /services/cybersecurity
curl -sI https://www.infeara.com/services/cybersecurity              # 200
```

### 2. Three addresses were never in the old sitemap

`/index.html`, `/index.php` and `/terms.php` appear in the report but not in the 77-entry sitemap the
map was built from, so nothing answered for them.

- `/index.html` is the home page under another name: it now takes a 301 to `/`.
- `/index.php` and `/terms.php` **cannot be fixed from the code.** Vercel answers `403 Forbidden` (a
  bare page with an `iad1::…` request id) for every address that ends in `.php`: checked on
  21 November 2026 on `www.infeara.com`, on the bare domain and on `infeara-live.vercel.app`, with a
  made-up `.php` name as well as these two. The answer carries the header `X-Vercel-Mitigated: deny`,
  which is how Vercel marks a request its Firewall has refused. A local build of this site answers the
  same addresses with its own 404 page, so the 403 does not come from the code. It is given before the
  request reaches the site, so a redirect rule would never run, and `tests/legacy-redirects.test.mjs`
  refuses to accept one. The project's Firewall settings could not be read from the tooling used here,
  so it is not known which rule does it: Vercel's own protection, a rule on the project, or a managed
  rule set. To see it: Vercel dashboard → project → Firewall → the denied events for `/terms.php`. For
  the address of an older PHP site it makes no difference. Search Console may keep them as 404, list
  them as "Blocked due to access forbidden (403)" or drop them; none of that affects the pages that
  exist.

## What changed in the code

- `lib/redirects.ts`: `/index.html` → `/`; `/resources/blog` → `/blogs` (the old blog list now goes to
  the blog list the site has, instead of Insights).
- `tests/legacy-redirects.test.mjs` (unit) accounts for all 49 reported addresses: 9 are pages that
  exist at the same address, 35 redirect to their closest page, 2 end in `.php`. It also checks that
  the map is exact paths, 301, never more than one hop, and never sends a gone page to the home page.
- `tests/http-smoke.test.mjs` asks a running build for each reported path: a page (200), or one 301 to
  a page that answers 200 with one `h1` and no `noindex`; and that a request for the bare domain is
  sent to `www` with its path and query kept.
- `tests/fixtures/search-console-404-2026-11-21.mjs` holds the 49 addresses as pasted.

Everything else in the report was already handled. Of the 35 redirected paths, 33 were in the map
before this change and are unchanged; the HTTP test asks a build for each of them, and three
(`/services/audit-compliance/iso-27001`, `/services/ai-automation/workflow-automation` and
`/resources/downloads`) were also fetched from the live `www` site on 21 November 2026.

## What to do in Search Console

1. **The DNS change is done** (see "Status"). A validation that started before it, earlier on
   21 November, fetched some of the 44 addresses while they still reached Hostinger, so it may end as
   *Failed*. If the report shows *Failed* or *Not started*, press **Validate fix**. If it shows
   *Started*, let it run: Google re-checks the addresses by itself.
2. **Sitemaps:** the only sitemap that should be listed is `https://www.infeara.com/sitemap.xml`. If an
   entry for `https://infeara.com/sitemap.xml` exists (the old robots file named it), remove it. The
   current site's own `robots.txt` names the `www` sitemap.
3. Validation can take up to about two weeks. Look at **Page indexing → Not found (404)** again in a few
   days, and press **Validate fix** again if it has failed.
4. To see one address the way Google does, use **URL inspection → Test live URL** on
   `https://infeara.com/about`: it should no longer report a 404 or 403, and should show that the
   address redirects to `https://www.infeara.com/about`.
5. Expect most of the 44 to move to **Page with redirect** (a normal status, not an error) and the count
   in *Not found (404)* to fall as Google re-crawls. It does not fall at once and it need not reach
   zero: Google treats a 404 as a normal answer for an address that really is gone.

## The 46 paths, and what each does

49 addresses, 46 paths: `/services/audit-compliance/iso-27001`, `/services/ai-automation/workflow-automation`
and `/resources/downloads` were reported on both hosts. "Bare domain" means the address is on
`https://infeara.com`; the last column is what `https://www.infeara.com` does with the path today, and
what the bare domain will do once its DNS points at Vercel (after the extra hop to `www`).

| Address | Reported on | Last crawled | What www.infeara.com does with it |
| :--- | :--- | :--- | :--- |
| `/industries/professional-services` | bare domain | 17 Nov 2026 | The page itself (200) |
| `/resources/blog` | bare domain | 17 Nov 2026 | 301 to `/blogs` |
| `/index.html` | bare domain | 16 Nov 2026 | 301 to `/` |
| `/industries/manufacturing` | bare domain | 16 Nov 2026 | The page itself (200) |
| `/legal/disclaimer` | bare domain | 4 Nov 2026 | 301 to `/legal/terms` |
| `/index.php` | bare domain | 31 Oct 2026 | Vercel answers 403 before the site is reached (see below) |
| `/services/audit-compliance/soc-monitoring` | bare domain | 26 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/turnkey/offshore-development` | bare domain | 26 Oct 2026 | 301 to `/services/turnkey-projects` |
| `/legal/cookies` | bare domain | 25 Oct 2026 | The page itself (200) |
| `/services/ai-automation/predictive-analytics` | bare domain | 19 Oct 2026 | 301 to `/services/ai-automations` |
| `/services/audit-compliance/cti` | bare domain | 18 Oct 2026 | 301 to `/services/cybersecurity` |
| `/industries/retail` | bare domain | 13 Oct 2026 | 301 to `/industries/retail-ecommerce` |
| `/services/audit-compliance/cloud-audit` | bare domain | 13 Oct 2026 | 301 to `/services/cloud-datacenter` |
| `/contact` | bare domain | 12 Oct 2026 | The page itself (200) |
| `/industries/saas` | bare domain | 12 Oct 2026 | 301 to `/industries` |
| `/legal/privacy-policy` | bare domain | 12 Oct 2026 | The page itself (200) |
| `/resources/downloads` | both | 12 Oct 2026 | 301 to `/insights` |
| `/services/audit-compliance/firewall-audit` | bare domain | 12 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/audit-compliance/iam-audit` | bare domain | 12 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/audit-compliance/red-team` | bare domain | 12 Oct 2026 | 301 to `/services/cybersecurity` |
| `/industries/startups` | bare domain | 10 Oct 2026 | 301 to `/industries` |
| `/services/audit-compliance/endpoint-security` | bare domain | 10 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/audit-compliance/app-security` | bare domain | 9 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/audit-compliance/dr-audit` | bare domain | 9 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/infrastructure/cloud-consulting` | bare domain | 9 Oct 2026 | 301 to `/services/cloud-datacenter` |
| `/services/infrastructure/cloud-solutions` | bare domain | 9 Oct 2026 | 301 to `/services/cloud-datacenter` |
| `/services/audit-compliance/wireless-security` | bare domain | 8 Oct 2026 | 301 to `/services/cybersecurity` |
| `/services/ai-automation/workflow-automation` | both | 6 Oct 2026 | 301 to `/services/ai-automations` |
| `/services/audit-compliance/cloud-security` | bare domain | 6 Oct 2026 | 301 to `/services/cybersecurity` |
| `/careers` | bare domain | 5 Oct 2026 | The page itself (200) |
| `/industries/logistics` | bare domain | 5 Oct 2026 | 301 to `/industries/logistics-transportation` |
| `/about` | bare domain | 4 Oct 2026 | The page itself (200) |
| `/services/audit-compliance/network-security` | bare domain | 4 Oct 2026 | 301 to `/services/cybersecurity` |
| `/legal/terms-of-service` | bare domain | 3 Oct 2026 | 301 to `/legal/terms` |
| `/services/ai-automation/n8n` | bare domain | 1 Oct 2026 | 301 to `/services/ai-automations` |
| `/services/infrastructure/consulting` | bare domain | 30 Sep 2026 | 301 to `/services/it-infrastructure` |
| `/services/ai-automation/custom-ai` | bare domain | 29 Sep 2026 | 301 to `/services/ai-automations` |
| `/industries` | bare domain | 11 Sep 2026 | The page itself (200) |
| `/services/infrastructure/managed-it` | bare domain | 1 Sep 2026 | 301 to `/services/managed-it` |
| `/resources` | bare domain | 29 Aug 2026 | 301 to `/insights` |
| `/services/infrastructure/network-infrastructure` | bare domain | 21 Aug 2026 | 301 to `/services/network-engineering` |
| `/services/infrastructure/outsourcing` | bare domain | 13 Aug 2026 | 301 to `/services/outsourcing-remote-support` |
| `/services/audit-compliance/iso-27001` | both | 10 Aug 2026 | 301 to `/services/cybersecurity` |
| `/industries/education` | www | 9 Aug 2026 | The page itself (200) |
| `/resources/case-studies` | bare domain | 2 Aug 2026 | 301 to `/case-studies` |
| `/terms.php` | www | 15 Jun 2026 | Vercel answers 403 before the site is reached (see below) |

## When Search Console reports another address

1. Find the closest page that exists now (never the home page, unless the address *is* the home page).
2. Add one line to `lib/redirects.ts`, add the address to the fixture, and add the path to this table.
3. `npm run test:unit` checks the map and that the address has an answer; `npm run build`, `npm start` and
   `SMOKE_BASE_URL=http://127.0.0.1:3000 npm run test:http` check it end to end on a build.
4. An address with no related page can simply stay a 404 (or take Vercel's 403, if it ends in `.php`).
