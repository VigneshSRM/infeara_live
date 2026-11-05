# Infeara Technologies — Corporate Website and CMS

* **Author:** VigneshSRM
* **Date:** 2026-11-05

## Overview

Infeara Technologies is a Chennai-based IT infrastructure, cybersecurity, managed services and software company. The goal is a new public website with a built-in content management system, replacing the current site on `www.infeara.com`, with nine dedicated service pages, eight industry pages, an insights section, careers, lead capture and full SEO metadata control.

The build is a single Next.js 16.4.5 application on Vercel, using React 19.3.1 and a Supabase project for Postgres, authentication, row-level security and file storage. The public site and the `/admin` dashboard live in the same deployment. Editors work through the dashboard; nothing on the public site is hardcoded.

The current site is live and indexed. It is not empty ground to build on: it has 77 URLs in its sitemap, 60 service sub-pages spread across four groups, eight industry pages, blog posts, a case study and three legal pages. That content is the seed material. The design is new.

## Analysis

### Measured facts that drive the plan

These were verified against the live site on 2026-11-05, not assumed.

| Fact | Evidence |
| :--- | :--- |
| `www.infeara.com` serves the current site from Vercel | HTTP 200, Vercel response headers |
| `infeara.com` (apex) does not serve the site | A records point at Hostinger IPs; returns 403 |
| Every page declares the broken apex as its canonical | `<link rel="canonical" href="https://infeara.com"/>` |
| All 77 sitemap entries point at the broken apex | `https://www.infeara.com/sitemap.xml` |
| The live site has no structured data at all | zero `application/ld+json` blocks on the homepage |
| The live service tree is four groups, 60 children | audit-compliance 15, infrastructure 17, ai-automation 7, turnkey 4 |
| The sitemap lists `/login`, `/forgot-password`, `/handbook` | all at priority 0.8 |
| The logo blue is `#014E82`, the brand token is `#226192` | pixel sample from `Logo.png` |
| The favicon is 1258×973 and not square | file dimensions |

The apex problem is the most concrete defect in the whole project. The site tells search engines that the real copy of every page lives at an address that returns 403. That predates the redesign and will be inherited by it unless fixed.

### Blockers

**1. Host and canonical resolution.** Middleware cannot fix the apex, because a request that never reaches Vercel never reaches middleware. The apex must be redirected at the network layer (`next.config` `redirects()` with a host match) or repointed in DNS, and every canonical, `og:url`, sitemap entry and JSON-LD URL must come from one `SITE_URL` constant fixed to `https://www.infeara.com`. A launch gate must crawl every sitemap URL and assert a 200, a self-referencing canonical and a single redirect hop. Without a named person who can change the apex records, this cannot be closed, and the launch ships the same defect again.

**2. Content truth at launch.** Seed copy rewritten from the live site carries claims the brief itself forbids: "2+ years", "50+ projects", "25+ active clients", "100% client satisfaction", "military-grade", "digital fortresses". Rewriting them does not make them verified. `100% Client Satisfaction` cannot be substantiated as written and must be removed. Every number published needs an owner who can evidence it. If copy cannot be verified before launch, the honest options are to publish without the numbers, or to keep the site out of the index until it can be verified. The brief's rule against placeholder content in production and the plan to replace seed content later cannot both hold at once.

**3. Seven days, and what "done" means.** Sixteen homepage sections, nine service pages, eight industry pages, roughly twelve corporate pages, insights, careers, FAQ, three legal pages, 404 handling, a thirteen-entity CMS, three roles, draft preview, rich text, an audit trail, sixty redirects, JSON-LD, and Core Web Vitals targets is not seven days of work at the quality the brief describes. No capacity figure has been supplied. The date survives only if the launch slice is defined, signed, and the rest is scheduled after it. "Done" must also be defined as an evidence set, not as a feeling: apex behaviour, canonical agreement, every redirect returning one hop to a 200, a real form submission received, a failed anonymous write, and Lighthouse numbers recorded.

**4. Authorisation model.** The anonymous key is public in the browser, so row-level security is the only boundary protecting drafts, leads and audit rows. Three specific failures to design out: policies without a matching `WITH CHECK`; role lookups that recurse through a profiles table and produce a 500 on every admin read; and the SEO Manager role. Row-level security is row-level, so "SEO Manager may edit SEO fields only" cannot be expressed by RLS alone. It must be enforced in the server action with an explicit column allowlist, and the database must still refuse writes it should refuse. Every role boundary needs a test that authenticates as that role and asserts the denied action actually fails.

**5. Draft preview and the service key.** Previewing unpublished content requires bypassing the published-only policy, which means the service-role key. If that client is ever re-exported from a shared module or imported by a client component, the key reaches the browser and the entire database, including leads, is exposed. The service client must live in one `server-only` module, preview must validate the Supabase session and role rather than a static shared secret, and every draft response must be `no-store` so a cached draft is never served to the public.

**6. Rich-text format.** "Rich text editing" has no defined storage format, and this decides the cross-site scripting surface. HTML rendered through `dangerouslySetInnerHTML` makes every editor field an injection point; JSON from an editor library needs a closed renderer that refuses unknown node types. Either way the format needs a `schema_version` so an editor upgrade does not make stored content unreadable. Sanitise on write and on read, and keep a plain-text projection for meta descriptions and search.

**7. Render and cache contract.** Roughly thirty routes generated at build time, each querying Supabase, will fail the build if the database is empty, unmigrated, paused or missing environment variables. Equally, content edited in the dashboard will not appear until redeploy unless the publish action calls `revalidateTag` for the exact entity and its listing pages. Both failure modes need to be designed for, not discovered. The design needs one table listing every route, its strategy and its cache tags.

**8. The redirect map.** Sixty old service URLs collapse into nine pages, and the two taxonomies do not line up: audit-compliance has surplus material, while IT facility management, outsourcing and network engineering have no dedicated source pages at all. A "nearest page" heuristic applied at cutover produces silent, unauditable pairings. The four shortcut URLs (`/services/managed-it-amc`, `/services/cyber-security`, `/services/cloud-solutions`, `/services/remote-support`) are the shallowest and most linked entries and must be mapped by hand. `/login` and `/forgot-password` should return 410, not redirect into a marketing page. The map must be a reviewed data file with a test that fails on chains, loops, duplicate sources, or a destination that is not a canonical 200.

**9. Brand assets.** The logo colour and the brand token disagree, so the header logo will visibly clash with the buttons and headings beside it, and `#014E82` has low contrast on the dark navy. There is no vector logo, so it will soften at hero sizes. There is no inverted lockup for dark sections. The favicon is not square and will distort. These are cheap to fix and they block every component, so they must be settled on day one rather than repainted on day six.

### Major findings

**Plan limits.** Vercel Hobby is non-commercial and queues builds one at a time; Supabase's free tier pauses inactive projects and carries no SLA. A corporate site that returns a quota error is an outage. Launch on paid tiers, with usage alerts and a stated degradation behaviour.

**Migration workflow.** Schema changes must be committed SQL migrations, not dashboard clicks. Seed content must be a separate idempotent script with `ON CONFLICT DO NOTHING`; content seeded inside a migration will re-run and overwrite the copy the client has since written. That is the worst failure mode available here, because it destroys work with no error.

**Media pipeline.** Browser-side type checks are advisory; uploads need server-side magic-byte validation, a byte and dimension cap, no SVG, UUID object paths, mandatory alt text, and explicit storage policies per bucket. `next/image` needs `remotePatterns` pinned to the Supabase host and path, or remote images will fail.

**Audit trail.** A trigger that raises on failure turns audit logging into a CMS outage. Audit writes must be `AFTER`, `SECURITY DEFINER`, failure-tolerant, diff-only with a payload cap, and pruned on a schedule. With no browsing UI at launch, someone must still be able to query it, and that person must be named.

**Performance contract.** The largest contentful element must be static server-rendered HTML with no JavaScript dependency: a preloaded `next/image` with explicit dimensions, no entrance animation on the hero text. Animation libraries load after the largest contentful element, below-fold sections use `content-visibility`, fonts are self-hosted and subset, GA4 loads only after consent, and the translate widget stays off. Measure with mobile-emulated Lighthouse on the four templates that matter, and record the numbers.

**Information architecture registry.** Six requested pages (Our Approach, Why Infeara, Case Studies, Technology Partners, SLA and Support Model, FAQ) have no assigned parent. The Services hub must be a real page because it is the breadcrumb parent for nine children. Breadcrumbs, internal links and `BreadcrumbList` must all read from one declared parent registry rather than from URL splitting.

**Service and industry duplication.** Nine service pages plus eight industry pages create seventy-two overlapping intents. Service pages own the service term; industry pages own only the "service for industry" modifier and must not restate service copy. Otherwise the pages compete with each other and consolidation achieves nothing.

**Positioning.** The brief asks for parity with TCS, Wipro, HCLTech, Infosys and Tech Mahindra. That parity is a trust-asset problem, not a copy problem: named clients, held certifications, met SLAs and published cases. None of that can be manufactured in a week, and asserting it produces exactly the ungrounded language the brief bans. The defensible position is enterprise-grade process and standards delivered from Chennai, evidenced only by what can be shown today, with the enterprise claims deferred to a twelve-month evidence programme.

**Answer-engine readiness.** As written, "AEO-ready" cannot be passed or failed. Reduce it to a checklist that a build can verify: valid Organization, WebSite, Service, BreadcrumbList, Article and FAQ schema where eligible; all marketing copy present in the initial HTML response; descriptive alt text; no content that requires JavaScript. No speculative files.

**DPDP Act 2023.** Consent must gate analytics. The privacy notice needs a purpose statement, retention rule, grievance contact and the Data Principal rights the Act gives. Leads are personal data. Google Fonts and any translate widget are third-party processors and should be declared or removed. Supabase region selection is a data-residency decision and must be recorded.

**Cutover and rollback.** Capture the current DNS records verbatim. Keep the old deployment warm for a seven-day soak. Lower TTL at least a day ahead. Freeze slugs on day two, schema on day three, content on day six, and allow no deploy in the last four hours except verified hotfixes. Reverting the domain after content entry is not symmetric: leads captured and content published in the window are lost.

**Retiring the old system.** `/admin/` protection is unverified. Contact form destinations and historical leads are unknown. `/handbook` is publicly listed and its contents are unread. Each needs a decision before the old site is replaced: what is exported, what is deleted, what returns 410.

**Observability.** A request identifier generated in the server action and echoed into both the log line and the audit row lets a failure be traced to its cause. Empty data and failed data must be distinguished in the dashboard, because a denied policy returns an empty list that looks identical to "nothing published". Soft deletes on pages, services, industries, insights and media, with a restore path.

**Dependency risk.** Editor and animation libraries are the two classes most likely to still declare React 16–18 peers. Pin exact versions, prove them against React 19.3.1 in CI, and keep the editor import confined to admin chunks. Tailwind v4 uses the `@tailwindcss/postcss` plugin and CSS-first `@theme` tokens; the v3 configuration shape will fail in a way `next dev` can hide.

### Also noted

- `#014E82` on `#101D2B` fails contrast; a light lockup is required regardless of which blue wins.
- The generated Supabase types render every `jsonb` column as an opaque union, so content payloads need boundary parsers.
- Storage egress is unbounded without an image budget; a homepage with twelve 200KB images is a 2.4MB page.
- Seed imagery referenced from `/public` must be asserted absent at launch, not left to a checklist.
- `/handbook`, `/login` and `/forgot-password` should not appear in a public sitemap.

## Goals vs. Non-Goals

* **In-Scope Goals (launch slice):** new Next.js application on `www.infeara.com`; nine service pages with unique copy, at least two distinct images each, service schema, FAQ blocks and internal links; eight industry pages; home with the sixteen sections; About, Our Approach, Why Infeara, Case Studies, Technology Partners, SLA and Support Model, FAQ, Careers, Contact, Insights index and article template; three legal pages; 404 and error handling; Supabase CMS covering pages, services, industries, insights, media, leads, navigation, footer, homepage blocks and SEO metadata; three roles enforced by row-level security; draft preview; rich-text editing; audit trail written by database triggers; canonical, sitemap, robots and redirects; JSON-LD on every indexable page; consent-gated analytics; Lighthouse measurement recorded for four templates.
* **Out-of-Scope Non-Goals (deferred, in writing):** the Google Translate widget; `hreflang` and translated content; named testimonials, case-study outcomes and statistics until evidence exists; any claim of parity with the named large IT firms; migration of historical leads unless a lawful basis and retention decision are supplied; multi-day stakeholder acceptance testing with external participants.

## Alternatives Weighed

- **Reuse the existing Next.js codebase.** Rejected by author: the project is a new build, not an extension.
- **Static site with git-based content and no CMS.** Rejected by author: staff and the SEO partner must publish and edit without a developer.
- **A managed CMS (Sanity, Payload, Directus) instead of a custom dashboard.** Rejected by author: the stack is fixed to Supabase, and the dashboard is part of the deliverable.
- **Keep the current four-group, sixty-page service tree.** Rejected by author: the brief requires nine flat, dedicated service pages.
- **Redirect all old service URLs to the homepage.** Rejected by the review: it is a soft 404 and discards the reason for redirecting at all.
- **Canonicalise on the apex `infeara.com`.** Rejected after measurement: the apex returns 403 and cannot host canonicals.
- **A video or 3D hero.** Rejected by author: the cinematic effect is built in code, themed around managed IT, to protect the load target.
- **Four CMS roles.** Rejected by author: two editing audiences, so three roles.
- **Ship the Google Translate widget at launch.** Deferred: it is client-side, sends page text to a third party, creates crawlable duplicates and fights the layout-stability target.
- **Publish testimonials and case studies at launch.** Rejected by the review: no verified material exists, and inventing it is barred by the brief.
- **Assert enterprise parity with TCS, Wipro, HCLTech, Infosys and Tech Mahindra.** Rejected by the review: the evidence does not exist, and the claim would breach the brief's own honesty rule. Position on standards and process instead.

## Key Decisions & Staging for Next Steps

**Decided.**

1. One Next.js application, public site and `/admin` together; Supabase Auth, Postgres with row-level security, and Storage for uploads; seed imagery in `/public`.
2. `https://www.infeara.com` is canonical everywhere. The apex is redirected at the network layer. One `SITE_URL` constant produces every URL.
3. Three roles. SEO field restrictions enforced in the server action with a column allowlist, plus database-level refusals.
4. New URL scheme, nine flat service pages, slugs frozen on day two.
5. Redirects to the nearest specific page, mapped in a reviewed data file, one hop each, with the four shortcut URLs handled by hand.
6. Seed copy from the live site, rewritten; imagery replaced before go-live; no unverifiable number published.
7. Rendering: marketing routes static or tag-revalidated; leads and preview only dynamic; publish actions fire a signed revalidation webhook.
8. DNS: Hostinger access is with the author. The apex is fixed as part of cutover, using the runbook below. The exact option is chosen at execution.
9. Brand: the brief palette is authoritative. The supplied logo is the brand mark and will be recoloured to `#226192` and vectorised. A square icon set is generated from the mark.

**Staging.**

| Day | Work | Gate |
| :--- | :--- | :--- |
| 0 | Supabase project with region recorded; Vercel project; apex DNS owner named; logo/token decision; icon set | Environment reachable; brand decision signed |
| 1 | Schema migrations, RLS policies for all entities, audit triggers, design tokens, claims list | Anonymous write denied; editor cannot publish |
| 2 | URL registry, redirect map, page shell, navigation, breadcrumbs | Redirect map approved; slugs frozen |
| 3 | Service and industry templates, home sections, insights, careers, contact, legal, 404 | Every template renders from seed data |
| 4 | Dashboard: entities, preview, rich text, media upload | Preview works end to end on one entity |
| 5 | Content entry through the dashboard, schema, metadata, internal links | Every indexable page has two distinct images and valid schema |
| 6 | Security negatives, redirect crawl, Lighthouse, consent flow, error states | Named evidence set captured |
| 7 | Freeze, cutover, soak begins | Rollback not needed |

## Brand and Colour Decision

The palette in the brief is authoritative: `#EAE6DE` ivory, `#226192` deep blue, `#EF8557` coral, with `#101D2B` navy, `#202832` charcoal, `#FFFFFF` white and `#737B83` muted grey as supporting colours.

The supplied `Logo.png` samples `#014E82`, which is a different blue from the `#226192` token. Since the palette is now fixed, the logo is recoloured to `#226192` rather than the token moving to the logo. It is also converted to vector, because a 2172×724 raster softens at hero sizes and at 1× pixel density in the header. A square icon set (32, 180, 192, 512) replaces the current 1258×973 `favicon.png`.

Measured contrast ratios, so the system does not rely on taste:

| Foreground | Background | Ratio | Verdict |
| :--- | :--- | :--- | :--- |
| `#226192` | `#EAE6DE` | 5.28 | Body text passes |
| `#226192` | `#FFFFFF` | 6.58 | Body text passes |
| `#EAE6DE` | `#226192` | 5.28 | Body text passes |
| `#FFFFFF` | `#226192` | 6.58 | Body text passes |
| `#101D2B` | `#EF8557` | 6.62 | Body text passes |
| `#202832` | `#EAE6DE` | 11.96 | Body text passes |
| `#226192` | `#101D2B` | 2.59 | **Fails.** No blue text on navy, and no blue-on-transparent logo on navy |
| `#EF8557` | `#226192` | 2.56 | **Fails.** Coral is a fill or an underline on blue, never small text |
| `#FFFFFF` | `#EF8557` | 2.57 | **Fails.** Coral buttons carry navy text, not white |
| `#737B83` | `#EAE6DE` | 3.45 | **Fails for body copy.** Use `#202832`; muted grey is for large text and borders only |
| `#014E82` | `#101D2B` | 1.96 | **Fails.** The unrecoloured logo is nearly invisible on navy |

Three rules follow, and they are binding on the components: dark sections use ivory or white text, never blue; every coral button uses navy text; and body copy is charcoal on ivory, with muted grey restricted to large text and rules. The logo needs a light lockup for dark sections regardless of which blue it uses, because no mid-blue passes on `#101D2B`.

## Deferral Reconciliation

Four items were originally going to be deferred. Three of them can be kept inside the launch slice at low cost, and one is a scope change that should be documented rather than deferred. This is the revised position.

| Item | What the brief expects | Why it was deferred | Treatment now | Effort | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Scheduled publishing | Draft and scheduled publishing | Depends on tag revalidation and a scheduler that were not planned | Store `published_at`; the public query returns only rows where `published_at <= now()`; a Vercel cron job every ten minutes revalidates the tags of rows that have crossed the threshold | 3–4 h | **Ship it** |
| Audit-log browsing | The brief names audit logs, not a viewer | A diff viewer was assumed | Write path plus a read-only list of the last 200 events, filterable by actor, entity and date. The diff stays in the table, unrendered | 3 h | **Ship it** |
| Fourth CMS role | Four roles: Super Admin, Content Admin, SEO Manager, Editor | Content Admin has no permission that Editor lacks | Keep three roles and record the mapping: Super Admin (all); Editor (create, edit, publish, media, leads); SEO Manager (SEO fields and metadata only, enforced in the server action). Separation of duties is preserved | 1 h of documentation | **Amend the brief** |
| Formal UAT and test reports | Phase 13 plus a testing report deliverable | No external participants available inside seven days | A scripted 40-check smoke test run on day six against the preview deployment, with pass/fail recorded in the repository, plus automated redirect crawl, anonymous-write denial and Lighthouse runs | 2 h | **Substitute, then run full UAT after launch** |

The launch slice gains roughly eight hours. The genuine deferrals left are the translate widget, `hreflang` and translated content, testimonials and case-study outcomes pending evidence, and the multi-day stakeholder UAT. Every one of those is stated as a non-goal above rather than dropped silently.

## DNS Cutover Runbook

Access to Hostinger is confirmed. Order matters; the apex must not be changed until the new site is verified on its preview URL.

1. **Capture the current records verbatim** before touching anything: apex `A` → `147.79.69.59`, `93.127.173.42`; `www` `CNAME` → `7bdeb77b1fe3aaae.vercel-dns-017.com`.
2. **Lower the TTL to 300 seconds** and wait at least 24 hours.
3. **Verify the new site on the preview URL.** Redirects, canonicals, form delivery, anonymous write denial, Lighthouse.
4. **Associate `www.infeara.com` with the new Vercel project.** This is a domain reassignment in Vercel, not a DNS change. Leave the old project deployed for rollback.
5. **Fix the apex.** either:
   - *Option A, preferred:* add `infeara.com` as a domain on the new Vercel project, then at Hostinger replace both `A` records with the apex `A` record Vercel shows for that project. Keep the `www` CNAME.
   - *Option B:* leave the apex on Hostinger and set a permanent 301 to `https://www.infeara.com`. The application then never receives apex traffic, and the canonical host is unambiguous.
6. **Verify from outside the local network:** `curl -I https://infeara.com` returns a single 301 to the `www` URL, and `curl -I https://www.infeara.com` returns 200. Every sitemap entry returns 200 with a self-referencing canonical.
7. **Certificate issuance** can lag a few minutes after the change. Do not revert during propagation.

If Option A is used, read the A record from the Vercel dashboard rather than from any document; Vercel has changed that value before.

## Indexing Gate

Seed content exists to prove the system works. Publishing it openly on day seven puts unverified numbers and near-duplicate service copy into the index, and replacing it afterwards means Google must re-crawl and reassess every page. That is more expensive than waiting.

Recommendation: launch with a single environment flag, `SITE_INDEXABLE=false`, which emits `Disallow: /` in `robots.txt` and `noindex` on every page and keeps the sitemap empty. The site is live, usable, reviewable and testable, but not indexed. Flip the flag to `true` after the CMS content swap, then submit the sitemap in Search Console. Cost: about one hour.

If you reject the gate, then the seed copy must contain zero unverifiable claims and the nine service pages must be genuinely distinct before public launch. Both conditions are harder to meet than the flag.

## Status Before Day One

| Item | Status |
| :--- | :--- |
| Apex DNS | Resolved. Hostinger access confirmed by the author; the apex is corrected during cutover using the runbook above. |
| Brand | Resolved. The brief palette governs; the logo is recoloured to `#226192` and vectorised; a square icon set is generated from the mark. |
| Deferral reconciliation | Accepted as revised. Scheduled publishing and audit-log browsing ship; the fourth role becomes a documented three-role mapping; UAT becomes the scripted smoke test plus post-launch stakeholder testing. |
| Indexing gate | Closed by default. The site launches with `SITE_INDEXABLE=false` and flips to `true` after the content swap, unless the author instructs otherwise in writing before cutover. |
| Claims sign-off | Open. One person must confirm each number that survives the copy rewrite. Until that person is named, no statistic is published. |

The only open item is the name of the person who signs off published claims. Everything else is decided.

## After Launch

Content replacement through the dashboard, the translate widget decision, `hreflang` if localisation is wanted, page depth across the nine services, a claims and evidence programme, multi-day stakeholder UAT, and the formal test reports the original brief describes.
