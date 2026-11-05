# Live site audit — www.infeara.com

**Date:** 2026-11-05
**Method:** HTTP requests to the live host, DNS lookups, sitemap and robots retrieval, logo/favicon pixel inspection. No authenticated checks were performed.

This file records only what was observed. Where something could not be verified, it is marked as unverified.

---

## 1. Hosting and DNS are split across two providers

| Host | DNS | Serves | Result |
| :--- | :--- | :--- | :--- |
| `www.infeara.com` | CNAME → `7bdeb77b1fe3aaae.vercel-dns-017.com` (Vercel) | The live Next.js site | HTTP 200 |
| `infeara.com` (apex) | A records `147.79.69.59`, `93.127.173.42` (Hostinger) | Nothing usable | HTTP 403 from `hcdn` |

The apex returns a Hostinger "403 Forbidden" page for both a browser user agent and the default user agent.

## 2. Every page declares a canonical URL that returns 403

The live homepage sends:

```
<link rel="canonical" href="https://infeara.com"/>
<meta property="og:url" content="https://infeara.com"/>
```

The sitemap at `https://www.infeara.com/sitemap.xml` lists 77 URLs and every `<loc>` uses `https://infeara.com` as the host.

So the site currently tells search engines "the authoritative copy of this page is at an address that returns 403". This is a live defect, it is cheap to fix, and it exists independently of the redesign. Two possible fixes: point the apex A records at Vercel, or 301 the apex to `www` and change all canonical/sitemap hosts to the host that actually serves 200.

Also: `robots.txt` declares `Sitemap: https://infeara.com/sitemap.xml`, and `Disallow: /admin/`.

## 3. The site already has 77 indexed URLs

Service structure is four groups with 60 child pages:

- `/services/audit-compliance/` — 15 child pages (vapt, network-security, app-security, cloud-security, endpoint-security, firewall-audit, iam-audit, red-team, wireless-security, cti, dr-audit, soc-monitoring, cloud-audit, iso-27001, soc2-consulting)
- `/services/infrastructure/` — 17 child pages (managed-it, cloud-solutions, network-infrastructure, outsourcing, consulting, cloud-consulting, fms, remote-services, network-architecture, server-implementation, data-center-ops, structured-cabling, aws-management, azure-management, cloud-migration, hybrid-cloud)
- `/services/ai-automation/` — 7 child pages (workflow-automation, chatbots, chatbot-development, predictive-analytics, n8n, custom-ai, app-development)
- `/services/turnkey/` — 4 child pages (offshore-development, dedicated-teams, consultation, implementation)

Plus 8 industry pages (`/industries/{education, saas, startups, retail, healthcare, manufacturing, logistics, professional-services}`), 4 legal pages, `/handbook`, `/resources` with blog, case studies and downloads, `/careers` with job pages, `/login`, `/forgot-password`, and 4 service shortcut URLs (`/services/managed-it-amc`, `/services/cyber-security`, `/services/cloud-solutions`, `/services/remote-support`).

**Consequence:** the new information architecture collapses 60 service URLs into 9 pages. Every one of those 60 URLs is a redirect decision. A redirect to the nearest parent is acceptable; a redirect to the homepage is a soft 404 and throws away whatever ranking exists.

## 4. No structured data at all

The live homepage contains zero `application/ld+json` blocks. There is no Organization, WebSite, Service, Breadcrumb, Article, or FAQ schema anywhere reachable from the homepage. The new build's schema requirement is therefore net-new work, not an improvement.

## 5. Sitemap exposes non-indexable and possibly internal pages

`/login`, `/forgot-password` and `/handbook` are all listed in the public sitemap with `priority: 0.8`. Login and password-reset pages should not be in a sitemap. `/handbook` is publicly listed and returns a page; whether it contains internal material is **unverified** and should be read before anything is published.

## 6. The admin surface exists and its protection is unverified

`/admin/` returns HTTP 200 with a page containing a password field and login-related text. That is consistent with a login screen, but a client-side gate that renders the shell before authentication would look the same. **Unverified:** whether data access is enforced server-side, whether rate limiting exists, and whether any endpoint under `/admin/` or `/api/` is reachable without a session. This must be tested by hand before the old system is retired.

## 7. Brand assets

**Logo (`Logo.png`)** — 2172×724 PNG, transparent background. Wordmark "INFEARA" in blue, with the two letter "A"s cut by coral/orange triangles.

Sampled pixel: `#014E82`. The brief specifies Deep Editorial Blue `#226192`. Those are not the same colour; `#014E82` is darker and more saturated. Either the design token must follow the logo, or the logo must be recolored. If both are used as-is, the navigation, buttons and headings will visibly disagree with the logo sitting next to them.

On the dark navy `#101D2B`, `#014E82` has very low contrast. A light or inverted logo lockup is required for dark sections. No vector version exists in the workspace, so the logo will be soft at large hero sizes and at 1x DPR in the header.

**Favicon (`favicon.png`)** — 1258×973, not square. It will be distorted at every size it is used. A proper square icon set is needed (32, 180, 192, 512).

## 8. Positioning gap between the live site and the requested brief

The live site describes a Chennai IT support and consulting firm with "2+ Years Experience", "50+ Projects Delivered", "25+ Active Clients", "100% Client Satisfaction", "military-grade cybersecurity" and "digital fortresses".

The brief asks for positioning alongside TCS, Wipro, HCLTech, Infosys and Tech Mahindra, while also forbidding fabricated statistics and ungrounded promotional language.

A redesign cannot close that gap. Credibility at enterprise level comes from named clients, certifications held, SLAs met, audited processes and published case studies. Until those exist, the defensible position is "enterprise-grade standards and process, delivered from Chennai", evidenced by what is provable.

`100% Client Satisfaction` is a claim that cannot be substantiated as stated and should be removed or replaced with a measured figure.

## 9. Implications for a seven-day delivery

- Seed content on indexable pages contradicts the brief's own rule against placeholder content in production.
- The nine service URL slugs must be final before launch, because changing them after indexing forces a second migration.
- Local filesystem uploads are not possible on Vercel; uploaded media has to go to object storage (Supabase Storage is already in the stack).
- Google's website translator is client-side: it does not create crawlable localised pages, and Googlebot can render the translated output, which risks large-scale duplicate content. It also sends page text to Google, which is a third-party processing question under the DPDP Act 2023.

## Open questions

1. Is the source code of the live site owned by Infeara, and where is it?
2. Who controls the apex DNS records, and can they be changed this week?
3. Does seven days mean technical go-live or public launch with finished copy?
4. Must the 60 existing service URLs keep working, or may they be consolidated with 301s?
5. Where do contact-form submissions go today, and do any historical leads need exporting?
