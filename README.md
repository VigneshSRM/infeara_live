# Infeara Technologies — website

Production website for Infeara Technologies (Chennai). One Next.js application serves the
public marketing site and the `/admin` CMS.

**Current state:** the public site is complete — 36 published routes plus a 404, a 410 for two
retired account routes, and a 301 for every legacy URL. The CMS is built: Supabase Auth,
Postgres with row-level security, three staff roles, an audit trail and a media library. The
build is still intentionally non-indexable (`SITE_INDEXABLE=false`) until the client signs off
the content swap. The database migration must be applied once (see [Content management](#content-management)).

## Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js 16.4.5 (App Router, Turbopack), React 19.3.1, TypeScript |
| Styling | Tailwind CSS v4, design tokens in `app/globals.css` |
| Fonts | Inter (body), Manrope (UI headings), Space Grotesk (display) via `next/font` |
| Data | Supabase — Auth, Postgres with RLS, Storage |
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
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public project URL and publishable key. Required for the CMS and for database-backed content. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Needed only to invite users from the CMS; never exposed to the browser. |
| `NEXT_PUBLIC_GA4_ID` | GA4 property, loaded only after analytics consent. |

Without the Supabase variables the public site renders the checked-in seed content and the
CMS shows a setup notice.

## Structure

```
app/
  page.tsx                 homepage (16 sections)
  services/[slug]          9 practice pages
  industries/[slug]        8 sector pages
  insights/[slug]          3 editorial articles
  legal/[slug]             privacy, terms, cookies
  about, approach, why-infeara, case-studies, partners, sla, faq, careers, contact
  api/contact              validated form; writes to the leads table
  admin/                   CMS (login, dashboard, content, leads, media, audit, users)
  login, forgot-password   route handlers returning 410 Gone
components/site/           shared layout, cards, figures, forms, consent
components/admin/          CMS form and navigation primitives
lib/content/               typed content + Supabase reads with seed fallback
lib/auth/dal.ts            session → staff identity and permission checks
lib/admin/                 server actions, form helpers, error mapping
lib/redirects.ts           legacy URL map (see below)
supabase/migrations/       schema, roles, RLS, audit triggers, storage policies
supabase/seed.sql          generated content parity seed
scripts/generate-seed.mjs  regenerates the seed from lib/content
notes/                     build log, live-site audit, QA evidence
```

Content accessors in `lib/content/index.ts` are async and read from Supabase. If the database
is unreachable or the schema has not been applied, they fall back to the checked-in TypeScript
seed so a build never fails. Once the tables exist, an empty table really is empty — the seed
is not resurrected.

### Images

`Figure` and `Schematic` render deterministic SVG illustrations with `role="img"` and
descriptive labels. They are deliberate stand-ins: every published page needs at least two
relevant images, and these carry descriptive alt text until licensed photography replaces
them. Swap the internals of those two components, not every page.

## Content management

### First setup (one-time)

1. Create a Supabase project, then copy the project URL and **publishable** key
   (`sb_publishable_…`) into `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If you want to create accounts from the CMS, also set
   `SUPABASE_SERVICE_ROLE_KEY` to the project's **secret** key (`sb_secret_…`, or the legacy
   `service_role` JWT). It is server-only and must never be exposed to the browser.
2. In the Supabase **SQL Editor**, run
   `supabase/migrations/20261106090000_cms_schema.sql`, then `supabase/seed.sql`.
   The migration creates the tables, roles, policies, audit triggers and the public `media`
   storage bucket. The seed copies the frontend content in and skips any table that already
   has rows, so it is safe to re-run.
   Alternatively, with a personal access token (`sbp_…`, not an API key):

   ```bash
   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-sql.mjs \
     supabase/migrations/20261106090000_cms_schema.sql supabase/seed.sql
   ```
3. Under **Authentication → Users**, create your own account.
4. Promote it once in the SQL editor:

   ```sql
   update public.profiles
   set role = 'super_admin'
   where email = 'you@infeara.com';
   ```

5. Sign in at `/admin/login`.

Regenerate the seed after editing `lib/content` with `node scripts/generate-seed.mjs`.

### Roles

| Role | Can do |
| :--- | :--- |
| Super admin | Everything, including user roles and deleting content. |
| Editor | Create, edit, publish and delete content, leads and media. |
| SEO manager | Edit SEO title, meta description and publish dates only. |
| Pending | No access. Every public signup lands here. |

Roles are enforced in the database, not just the UI. Content tables use RLS for staff reads
and editor writes; a trigger (`enforce_seo_manager_columns`) rejects any non-SEO column change
from an SEO manager. Public visitors can read published rows only, and can insert a lead but
not read one back.

### Publishing behaviour

- Public content pages revalidate every 5 minutes (`export const revalidate = 300`). Saving in
  the CMS also revalidates the affected paths immediately.
- Draft and archived rows never reach the public site. A `published_at` in the future keeps a
  published row hidden until that time; the admin picker treats input as IST (`+05:30`).
- Slugs are frozen after creation so published URLs do not break. The insights route allows
  new slugs without a deploy; services, sectors and legal pages are prebuilt from the database
  at build time.
- Every insert, update and delete on content and leads is written to `audit_log` with the
  actor and changed fields. The log is readable by staff and written only by the database.

### Contact form and leads

`/api/contact` validates the submission, ignores honeypot hits, applies a best-effort
per-instance rate limit and inserts into `leads` using the anonymous publishable key. Staff
see the enquiry at `/admin/leads`, where they can set a status (new, contacted, qualified,
closed, spam) and keep internal notes. Nothing on that screen is public.

### Invitations and email

There are two ways to add a colleague, both under `/admin/users`:

- **Create account** sets a temporary password directly and marks the email confirmed, so it
  works without any mail provider. Share the password over a channel you trust; the person can
  change it at `/admin/account` after signing in.
- **Send invitation** emails a Supabase invitation link to `/admin/accept-invite`. It needs a
  configured SMTP provider (the built-in sender is rate-limited and unreliable) and
  `SUPABASE_SERVICE_ROLE_KEY`.

Both paths require the service key. Without it, create the account in the Supabase dashboard
under **Authentication → Users** and assign the role in `/admin/users`. Because there is no
reliable reset email, `/admin/account` is also the supported way to rotate a password.

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

- `npm run build` — TypeScript clean; 36 public routes plus the `/admin` routes, `/api/contact`
  and the 410 handlers.
- Lighthouse 12, desktop preset: performance 97–100, accessibility 100, best practices 100.
  Mobile (throttled): accessibility 100, performance 71–93.
- axe-core WCAG 2.1 A/AA: zero violations on the 404, 410 and thank-you pages, which
  Lighthouse cannot audit directly.
- 390 px viewport: no horizontal overflow on any route, one `h1` per page, canonical present.

Evidence and the dated results are in `notes/`.
