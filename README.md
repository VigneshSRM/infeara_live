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
| Fonts | Inter (body), Manrope (UI headings), Space Grotesk (display), self-hosted variable faces in `app/fonts` via `next/font/local` |
| Data | Supabase — Auth, Postgres with RLS, Storage |
| Hosting | Vercel |

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:3000
npm run build && npm run start
```

The three variable faces are checked into `app/fonts`, so a build needs no network access. To
refresh them from the `@fontsource-variable` packages, run `node scripts/sync-fonts.mjs`.

## Environment

| Variable | Purpose |
| :--- | :--- |
| `SITE_URL` | Canonical origin used by metadata, sitemap, Open Graph and JSON-LD. |
| `SITE_INDEXABLE` | `"true"` to allow indexing. Anything else emits `noindex, nofollow`, an empty sitemap and `Disallow: /`. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public project URL and publishable key. Required for the CMS and for database-backed content. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Needed only to invite users from the CMS; never exposed to the browser. |
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement ID (`G-…`). Loaded in the visitor's browser only after they press **Allow analytics**. It is baked into the build, so changing it needs a new deployment. |
| `GA4_PROPERTY_ID` | Server-only. The numeric **Property ID** of the same GA4 property (not the `G-…` ID). With the next variable it lets the CMS Overview read visitor numbers back. |
| `GA4_SERVICE_ACCOUNT_JSON` | Server-only secret. The whole JSON key of a Google service account that is a Viewer on that property. In Vercel mark it **Sensitive**. |

Without the Supabase variables the public site renders the checked-in seed content and the
CMS shows a setup notice. Without the two `GA4_…` server variables the CMS Overview shows a
setup card in place of visitor numbers; nothing else changes.

## Structure

```
app/
  page.tsx                 homepage (16 sections)
  services/<hub>/[slug]    the 18 sub-services under Cybersecurity, Cloud & Datacenter,
                           AI Automations and Application Development (database-managed)
  industries/[slug]        8 sector pages
  insights/[slug]          editorial guides
  blogs/[slug]             short posts (database-managed)
  case-studies/[slug]      case studies (database-managed)
  white-papers/[slug]      PDF white papers (database-managed)
  legal/[slug]             privacy, terms, cookies
  about, approach, why-infeara, partners, sla, faq, careers, contact
  api/contact              validated form; writes to the leads table
  admin/                   CMS (login, dashboard, content, leads, media, audit, users)
  login, forgot-password   route handlers returning 410 Gone
components/site/           shared layout, cards, figures, forms, consent
components/admin/          CMS form and navigation primitives
lib/content/               typed content + Supabase reads with seed fallback; nav.ts builds the header menu
lib/auth/dal.ts            session → staff identity and permission checks
lib/admin/                 server actions, form helpers, error mapping
lib/redirects.ts           legacy URL map (see below)
supabase/migrations/       schema, roles, RLS, audit triggers, storage policies
supabase/seed.sql          generated content parity seed
supabase/apply/            single-statement copies of the SQL you paste by hand (03, 04, 05 are committed)
scripts/generate-seed.mjs  regenerates the seed from lib/content
scripts/generate-resource-seed.mjs  the same for sub-services, blogs and case studies (script 05)
scripts/sync-fonts.mjs     refreshes app/fonts from @fontsource-variable
notes/                     build log, live-site audit, QA evidence
```

Content accessors in `lib/content/index.ts` are async and read from Supabase. If the database
is unreachable or the schema has not been applied, they fall back to the checked-in TypeScript
seed so a build never fails. Once the tables exist, an empty table really is empty — the seed
is not resurrected.

### Images

`Figure` and `Schematic` render photography from `public/site/` through
`next/image`, in the 1200x760 frame the original placeholder drawings used, so no page layout
changed. Which photograph a placeholder gets is decided in one place, `lib/site-images.ts`:

- a `Figure` is picked by the numeric `seed` its page already passes (1-9 are the practice
  pages, 11-18 the sector pages, the rest are the fixed pages);
- a `Schematic` is picked by its `label`, with the eight sector "Service map" frames resolved
  from the caption, which names the sector.

Every page therefore shows two different photographs, and each one carries descriptive alt text
taken from the library entry while the caption stays in the `figcaption`. To change a picture,
drop the file in `public/site/`, add it to `siteImages`, and repoint the seed or label — no page
needs editing. Licensed photography can replace any entry the same way.

### The Technical resources menu

The **Technical resources** item in the header is a dropdown of four pages: Insights
(`/insights`), Blogs (`/blogs`), Case Studies (`/case-studies`) and White Papers
(`/white-papers`). The menu is the `nav` array in `lib/content/site.ts`, and the footer's
Resources column is `footerColumns` in the same file. A menu that has a hub page sets
`overviewLabel` to get a closing link to its own `href` ("All services"); Technical resources has
no hub page, so it has no closing link. Case Studies is also still listed under About.

The four service groups in the **Services** dropdown (Cybersecurity, Cloud & Datacenter, AI
Automations, Application Development) are the one part of the menu that is not written in
`site.ts`: their sub-services come from the database, so the menu always matches the pages (see
[Sub-services, blogs, case studies and white papers](#sub-services-blogs-case-studies-and-white-papers)).

## Content management

### First setup (one-time)

1. Create a Supabase project, then copy the project URL and **publishable** key
   (`sb_publishable_…`) into `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If you want to create accounts from the CMS, also set
   `SUPABASE_SERVICE_ROLE_KEY` to the project's **secret** key (`sb_secret_…`, or the legacy
   `service_role` JWT). It is server-only and must never be exposed to the browser.
2. Apply the schema, then the seed. The migration creates the tables, roles, policies, audit
   triggers and the public `media` storage bucket. The seed copies the frontend content in and
   skips any table that already has rows, so it is safe to re-run. That also means it only ever
   fills an empty table: it never adds a page that is missing from a table that already has
   rows, so a database seeded before a page existed does not get it by re-running the seed (see
   [Core services missing from the site](#core-services-missing-from-the-site)).

   The dashboard SQL editor splits a pasted script into statements and can cut a
   `create policy … for update …` statement in half (`syntax error at or near "for"`). If that
   happens, use the single-statement wrappers instead - each file is one `do $$ … $$` block
   holding the real script as base64, so nothing can split it:

   ```bash
   node scripts/make-apply-blobs.mjs
   ```

   Then paste `supabase/apply/01-schema.sql` into a **new** SQL editor tab and run it, followed
   by `supabase/apply/02-seed.sql`. Both should report "Success. No rows returned."

   Alternatively, with a personal access token (`sbp_…`, not an API key):

   ```bash
   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-sql.mjs \
     supabase/migrations/20261106090000_cms_schema.sql supabase/seed.sql
   ```

   The internal notes chat on leads has its own file,
   `supabase/migrations/20261109210000_lead_notes.sql`. Run it in the SQL editor with
   **Role: postgres**, after the schema. It is safe to run again. If the editor splits it and
   reports a syntax error, paste `supabase/apply/03-lead-notes.sql` instead: the same SQL as a
   single statement, committed to the repository (the unit tests fail if the two ever differ;
   regenerate it with `node scripts/make-apply-blobs.mjs`). Until the file is applied the CMS
   keeps working: lead pages show the old single notes box and a short notice.

   A database that was seeded before AI Automations and Application Development existed needs
   one more file, `supabase/apply/04-core-services.sql` (readable copies:
   `20261106150000_split_automation_application_services.sql` and
   `20261110090000_publish_core_services.sql`). Run it with **Role: postgres**. A database made
   from the current seed already has both services, so skip the file there: it would only reset
   their text to the version in the repository. The symptom and the check are under
   [Core services missing from the site](#core-services-missing-from-the-site).

   Sub-services, blog posts, case studies and white papers are managed from the CMS once one more
   script has been run: `supabase/apply/05-resource-modules.sql` (readable copies:
   `20261110200000_resource_modules.sql` and `20261110200100_resource_modules_seed.sql`). Run it
   in the SQL editor with **Role: postgres**, after the schema. It creates the four tables, their
   grants, policies and audit triggers, and the `documents` storage bucket for white-paper PDFs,
   then copies in what the site shows today (18 sub-services, 3 blog posts, 3 case studies) so
   nothing disappears. It is safe to run again: it never overwrites anything, and it adds the starter
   rows only to a table that is completely empty. Until it
   has been run, the four new CMS screens show a notice that says so, and the site keeps showing
   its built-in copy of that content. Details are under
   [Sub-services, blogs, case studies and white papers](#sub-services-blogs-case-studies-and-white-papers).

   Supabase no longer exposes new `public` tables to the API on its own: that is the default for
   projects created since 30 May 2026 and applies to every project from 30 October 2026. On such
   a project, also run `supabase/migrations/20261109120000_grant_data_api_access.sql` after the
   schema. It only adds the grants the policies already describe, so it is safe to run on any
   project and to repeat. Without it a correct sign-in cannot read its staff profile.
3. Under **Authentication → Users**, create your own account.
4. Promote it once in the SQL editor:

   ```sql
   update public.profiles
   set role = 'super_admin'
   where email = 'you@infeara.com';
   ```

   If it reports `UPDATE 0`, the address matched no profile: either it is spelled differently
   from the account you created, or the account was created before the schema was applied, so
   the signup trigger never made its profile. Use the statements under
   [Signed in, but the CMS will not open](#signed-in-but-the-cms-will-not-open), which create the
   missing profile as well.

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
- Slugs are frozen after creation so published URLs do not break. Insights, sub-services, blog
  posts, case studies and white papers allow new slugs without a deploy (a new page is built the
  first time it is visited); services, sectors and legal pages are prebuilt from the database
  at build time.
- Every insert, update and delete on content and leads is written to `audit_log` with the
  actor and changed fields. The log is readable by staff and written only by the database.

### Sub-services, blogs, case studies and white papers

Four content types are edited in the CMS, next to Insights, and shown at their usual addresses:

| CMS screen | Public pages | Notes |
| :--- | :--- | :--- |
| Sub-services | `/services/<service>/<slug>` and the lists on each service page and on `/services` | 18 to start: Cybersecurity 4, Cloud & Datacenter 7, AI Automations 4, Application Development 3. The service group is chosen on creation and fixed afterwards. |
| Blogs | `/blogs`, `/blogs/<slug>` | Short posts: a title, an excerpt, sections, related service links and a picture. |
| Case studies | `/case-studies`, `/case-studies/<slug>` | Three representative studies to start. |
| White papers | `/white-papers`, `/white-papers/<slug>` | A PDF uploaded in the CMS, or a link to a file kept elsewhere. |

Insights (`/insights`) stays the place for longer guides; a blog post is the short form.

**Setup.** Run `supabase/apply/05-resource-modules.sql` once (see First setup). Until then each new
screen explains what to run and the website uses its built-in copy. Existing content is
database-first: once the tables exist, a page that is not published is not shown, and the built-in
copy never brings it back. The built-in copy is used only when Supabase is not configured, a table
is missing, or a read fails.

**Lists.** Every table in the CMS that holds content (these four, and Insights) searches, filters
and pages in the database: 20 rows a page, with the search, status and page number in the address
(`?q=…&status=…&page=…`) so a view can be bookmarked or shared. Status is All, Published, Scheduled
(published, with a date still ahead), Draft or Archived; sub-services also filter by service and case
studies by kind. Changing a filter starts again at page 1, and a page number past the end shows the
last page. The audit log pages in the same way (40 rows a page); leads, users, services, industries,
legal pages and FAQs do not page yet.

**Rules, enforced by the database and not only by the screens.**

- Visitors see only rows that are published and whose publish date has arrived.
- Super admins and editors create, change and delete. An SEO manager can read everything and change
  only the SEO title and description. They cannot create or delete.
- The address (slug) of a page is fixed once it exists; a sub-service's service group is fixed too.
- A **representative** case study names no client and carries no figures. A **client** case study needs
  the client's name and recorded approval before it can be published. Nothing on these pages invents
  a client, a figure or an outcome.
- A published white paper must have a PDF or a link to one.
- A post or paper published with no date is dated the moment it is published, so its date on the site
  is the day it went live. Dates are shown as the Indian calendar day.
- Every create, change and delete is written to the audit log.

**White-paper PDFs.** Choose the PDF in the editor: it is uploaded from the browser straight to
Supabase Storage (the `documents` bucket, PDF only, up to 25 MB) and attached when the paper is
saved. The upload does not pass through the app, because a CMS form is limited to 1 MB. Readers open
the file from the paper's page with no form in front of it; the bucket is public, so anyone with the
link can open the file. A replaced PDF, a removed PDF and a deleted paper all delete the stored file.

**Pictures.** Sub-services and blog posts pick one of the site's photographs by number
(`lib/site-images.ts`, shown in the editor as a preview). Uploading a cover image is not built yet.

**Header menu and contact form.** The sub-services under each service in the header menu, and the
service choices in the contact form, are the published sub-services, in their saved order, so adding,
renaming, reordering, unpublishing or deleting one needs no code change and cannot leave a dead
link behind. Saving or deleting a sub-service refreshes every page. The rest of the menu is still
`nav` in `lib/content/site.ts`, and so is the 404 page's copy of it, which is rebuilt at each deploy.

**Changing the starter content in code.** The starter content is in `lib/content/` (`subservices.ts`
with its older source files, `blogs.ts`, `case-studies.ts`). After editing any of it, regenerate the
scripts: `node scripts/generate-resource-seed.mjs`, then `node scripts/make-apply-blobs.mjs`. The unit
tests fail if the committed SQL no longer matches. A database that already has rows is not changed by
re-running script 05; edit those rows in the CMS.

### Contact form and leads

`/api/contact` validates the submission, ignores honeypot hits, applies a best-effort
per-instance rate limit and inserts into `leads` using the anonymous publishable key. Staff
see the enquiry at `/admin/leads`, where they can set a status (new, contacted, qualified,
closed, spam) and keep internal notes as a chat (see below). Nothing on that screen is public.

### Overview: visitors and leads

`/admin` shows two live sections under the quick numbers.

**Website visitors** is read from Google Analytics through the Data API: active now, visitors,
new visitors, sessions, page views, average engagement time and engagement rate (each against
the previous period), a bar per day, and the top pages, channels, sources, countries, cities
and devices. The tabs switch between 7, 30 and 90 days (`?range=7|30|90`); days follow
Asia/Kolkata. Reports are cached for ten minutes (the "active now" figure for one minute, a
failure for 30 seconds), so a reload is cheap and the numbers can lag a little. Only visitors
who press **Allow analytics** on the cookie banner are counted. The consent rule is unchanged,
so these figures are lower than real traffic.

**Leads overview** comes from the database, so it works without Google: enquiries today, in the
last 7 and 30 days against the period before, how many are still **new** after a day, a bar per
day, the split by status, and the topics and pages people wrote from.

One-time Google setup (about ten minutes):

1. In Google Cloud (any project), open **APIs & Services › Library** and enable **Google
   Analytics Data API**.
2. In **IAM & Admin › Service accounts**, create a service account (it needs no roles), then
   **Keys › Add key › JSON**. Copy the account's email address.
3. In Google Analytics, open **Admin › Property access management** and add that email as a
   **Viewer**.
4. In **Admin › Property details**, copy the numeric **Property ID**.
5. In Vercel add `GA4_PROPERTY_ID` (the number) and `GA4_SERVICE_ACCOUNT_JSON` (the whole key
   file, marked **Sensitive**) for Production, then redeploy.

Until that is done the Overview shows a setup card that lists what is set and what is missing.
When Google refuses a request the card names the likely cause and the fix. It never prints
Google's own error text.

| The card says | What to do |
| :--- | :--- |
| `GA4_PROPERTY_ID holds the G-… tracking id` | Use the numeric Property ID from **Admin › Property details**. |
| The Google Analytics Data API is switched off | Enable it in the same Google Cloud project as the service account (step 1). |
| The service account cannot read this property | Add the account's email as a Viewer (step 3) and check the Property ID. |
| Google rejected the service account key | Create a new JSON key and update `GA4_SERVICE_ACCOUNT_JSON`. |
| Google Analytics is limiting requests | The property's allowance is used up. Reports are cached, so it clears by itself. |

Check that tracking works with a private window: open the public site, press **Allow
analytics**, and look for yourself in Google Analytics under **Reports › Realtime**. The
measurement ID is read at build time and only in the Vercel environments it is added to
(Production, in this project), so preview deployments do not track.

### Internal notes on leads

Each lead has a private chat for staff, under `/admin/leads/<id>`. A note is sent with **Send**
(Enter on a keyboard, Shift+Enter for a new line) and becomes its own message with the author's
name and the time. Everyone on staff can read the whole history, and an open page picks up a
colleague's message within a few seconds without a reload.

- Messages are up to 4,000 characters and cannot be edited.
- Every staff role (super admin, editor, SEO manager) can read and send. Only a **super admin**
  can delete a message, after a confirmation, and the deletion is written to the audit log.
- The author and the time are stamped by the database, not trusted from the browser.
- The old single notes field is kept: its text appears as the first message ("Earlier note").
- `supabase/migrations/20261109210000_lead_notes.sql` creates the table, its policies and
  grants (paste-ready copy: `supabase/apply/03-lead-notes.sql`). If the lead page says the notes
  are not switched on, that file has not been applied yet (see First setup, step 2).

### Invitations and email

There are two ways to add a colleague, both under `/admin/users`:

- **Create account** sets a temporary password directly and marks the email confirmed, so it
  works without any mail provider. Share the password over a channel you trust; the person can
  change it at `/admin/account` after signing in.
- **Send invitation** emails a Supabase invitation link to `/admin/accept-invite`. It needs a
  configured SMTP provider (the built-in sender is rate-limited and unreliable) and
  `SUPABASE_SERVICE_ROLE_KEY`.

Both paths require the service key. Without it, create the account in the Supabase dashboard
under **Authentication → Users** and assign the role in `/admin/users`. Staff who know their
password can change it at `/admin/account`; staff who have forgotten it use the reset page
below.

### Password reset

`/admin/reset-password` is the one page for a forgotten password. The sign-in page links to it
("Forgot password?"), and like `/admin/login` it is reachable without a session.

1. The person enters their email address and Supabase emails a link back to the same page. The
   page gives the same answer whether or not the address has an account.
2. The link opens a "Choose a new password" form (12 characters minimum, entered twice).
   Saving signs them in, signs out every other session on the account, and opens `/admin`.

It needs working SMTP, for the same reason as invitations (the built-in sender is rate-limited
and unreliable). It does not need `SUPABASE_SERVICE_ROLE_KEY`.

**One-time setup** in the Supabase dashboard, under **Authentication → URL Configuration**: add
`https://<your-domain>/admin/reset-password` to **Redirect URLs**, once for each origin that
serves the CMS (production, any preview domain you test on, `http://localhost:3000`). An address
that is not listed is ignored and Supabase sends the link to the **Site URL** instead.

**Which browser opens the link.** Supabase's default "Reset Password" email uses PKCE, so the
link only works in the browser that requested it. Opened on another device, or after clearing
cookies, the page says so and offers a new request. To make the link work anywhere, set the
**Reset Password** template under **Authentication → Emails** to link to:

```text
{{ .SiteURL }}/admin/reset-password#token_hash={{ .TokenHash }}&type=recovery
```

`{{ .SiteURL }}` is the Site URL in Supabase, not this app's `SITE_URL` variable, so the link
always opens that origin. The token sits in the URL fragment, which keeps it out of server logs
and `Referer` headers, and a mail scanner that only fetches the link does not use it up.
`?token_hash=…&type=recovery` in the query string works as well.

### Troubleshooting the Supabase dashboard

**"Unable to load rows from `auth.users`. Please try again or contact support."**
This is the Table Editor's foreign-key picker. It opens when you insert a row into
`public.profiles` or edit its `id`, which references `auth.users`. The picker reads `auth.users`
as the role chosen in the **Role** selector at the top of the Table Editor, and `anon` and
`authenticated` cannot read that table, so it fails whenever the selector is on one of them (or
on an impersonated user).

1. Set **Role** back to `postgres` and reopen the picker.
2. Or skip the picker. The `on_auth_user_created` trigger creates profiles, so set a role in
   the SQL editor instead of the row editor. The statements are safe to re-run. The first does
   nothing unless `profiles` predates the `updated_by` column (without it every update fails
   with `record "new" has no field "updated_by"`); the second adds a `pending` profile for any
   account that existed before the schema was applied.

   ```sql
   alter table public.profiles
     add column if not exists updated_by uuid references public.profiles (id) on delete set null;

   insert into public.profiles (id, email, full_name, role)
   select u.id, coalesce(u.email, ''), nullif(u.raw_user_meta_data ->> 'full_name', ''), 'pending'
   from auth.users u
   on conflict (id) do nothing;

   update public.profiles set role = 'super_admin' where email = 'you@infeara.com';
   ```

If the picker still fails with **Role** on `postgres`, run `select count(*) from auth.users;` in
the SQL editor. If that fails too, the fault is in the database rather than the dashboard: keep
the exact error text and look at it before changing anything.

### Signed in, but the CMS will not open

Signing in checks the password. Opening the CMS also needs a staff role on the account's
`public.profiles` row. If a correct password brings you back to `/admin/login`, the page says
why above the form and shows which account is signed in, with a **Sign out** button:

| The page says | What it means | What to do |
| :--- | :--- | :--- |
| "…this account has no CMS role yet" | The account has no profile row, or its role is `pending`. | Give it a role, below. |
| "…the database blocked the staff lookup" | Postgres answered `permission denied` when the CMS read `profiles`: the API roles have no table grants on this project. | Run `supabase/migrations/20261109120000_grant_data_api_access.sql` in the SQL editor. |
| "…the staff lookup did not complete" | Any other failure: project paused, schema not applied, network. | Check the project is running and the schema is applied. The server log has the database's own message under `[auth] staff profile lookup failed`. |

**Giving an account a role.** In the SQL editor, list the accounts and their roles (the role is
empty where there is no profile row), then promote the one you sign in with. Replace the
address; an address that matches nobody changes nothing, so run the list again to check.

```sql
select u.email, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at, u.email;

insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'super_admin'
from auth.users
where lower(email) = lower('you@infeara.com')
on conflict (id) do update set role = 'super_admin';
```

Then reload `/admin/login`. The session is still valid, so the CMS opens without signing in again.

### Core services missing from the site

The home page and `/services` show six core services: IT Infrastructure, Cybersecurity,
Cloud & Datacenter, Turnkey Projects, AI Automations and Application Development. If a grid
shows fewer cards than its heading says, and the missing service's own page (for example
`/services/ai-automations`) answers "That page is not on the map", the database has no
**published** row for it.

The site reads services from the database and the database wins. A service that is not there,
or is a draft, archived or dated for later, is left out of the grid without a message, and its
page is a 404. The checked-in seed is not a fallback for this: the site uses it only when
Supabase is not configured or a read fails outright (for example, the schema has not been
applied). That is deliberate, so that unpublishing a page in the CMS can never bring it back.

**How you find out.** `/admin/services` shows a notice that names each core service visitors
cannot see and why: not in the database, a draft, archived, or dated for later. It stays quiet
when all six are live, and while the table is empty (the empty state already says to run the
seed).

**Not in the database.** This is what happens to a project that was seeded before the page
existed: the seed skips a table that already has rows, and the content migrations below are not
part of it. In the SQL editor, with **Role: postgres**, paste and run
`supabase/apply/04-core-services.sql`. It renames the old combined "Automation & Custom
Software" row in place if there is one, adds whichever of AI Automations and Application
Development is missing, publishes both, then checks what a visitor can see. If either is still
hidden it stops with an error that names it and keeps none of its changes. Success reads
"Success. No rows returned." If the two services already exist and someone has edited them in the
CMS, the file puts their text back to the version in the repository (the earlier wording stays in
`audit_log`), so in that case use **Exists but hidden**, below, instead. To check:

```sql
select slug, status
from public.services
where slug in ('it-infrastructure', 'cybersecurity', 'cloud-datacenter',
               'turnkey-projects', 'ai-automations', 'application-development')
order by sort_order;
```

All six rows should say `published`. The public pages are cached for up to five minutes
(`revalidate = 300`) and a SQL run does not clear the cache, so allow five to ten minutes
before judging the site, or redeploy. Saving in the CMS does refresh straight away.

**Exists but hidden.** Open the service under `/admin/services` and set **Status** to
**Published**, and clear a publish date that is still in the future.

**Other content migrations.** Each of these rewrites page text in an existing database. A
database made from the current seed already has their result, so they matter only for one made
earlier, and each is safe to run again. They overwrite the wording they set, so look at the
CMS first if anyone has edited those pages there.

| Migration | What it does to an existing database |
| :--- | :--- |
| `20261106120000_service_hierarchy.sql` | Rewrites the wording of IT Infrastructure and Remote IT Services. |
| `20261106150000_split_automation_application_services.sql` | Replaces the old combined Automation & Custom Software service with AI Automations and Application Development. Included in `04`. |
| `20261106160000_route_contact_through_form.sql` | Replaces the published email address in the legal documents with "the website contact form". |
| `20261107120000_cybersecurity_service_hub.sql` | Rewrites the wording of the Cybersecurity page. |
| `20261110090000_publish_core_services.sql` | Publishes AI Automations and Application Development if they exist as drafts, and checks they are visible. Included in `04`. |

When a change needs a new row or a new page in the database, not just new wording, it ships as
a migration like these, and it has to be run on the live project: merging and deploying the code
does not change the database.

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
`SITE_INDEXABLE=true` the same pages score 100, and the sitemap lists 63 URLs with the starter content
(each published sub-service, blog post, case study and white paper adds one; a white paper's page is
listed once the first one is published).

## Browser and integration tests

The Playwright MCP server is configured in `.mcp.json` for MCP-compatible clients. Install the local browser binary once with `npx playwright install chromium` before running browser tests.

- `npm run test:e2e` — full Playwright browser suite: public route rendering, navigation, contact validation, cookie choices, admin authentication and role permissions.
- `npm run test:e2e:list` — list discovered browser tests without launching a browser.
- `npm run test:http` — HTTP/API smoke tests against a running app (defaults to `http://127.0.0.1:3000`).
- `npm run test:unit` — unit tests for the rule that decides who the CMS lets in (`lib/auth/access.ts`), the Overview analytics and lead notes chat, and the core services (the CMS notice, and the check that `supabase/apply/04-core-services.sql` still matches its migrations), the blog posts and the Technical resources menu (`tests/blogs.test.mjs`), the list search, filters and page numbers of every admin table (`tests/admin-lists.test.mjs`), and the sub-service, blog, case-study and white-paper modules: the SQL, the content copied in, the PDF helpers, the admin wiring and the header menu (`tests/resource-modules.test.mjs`). No server or Supabase needed.

The browser suite starts an isolated, non-Supabase Next dev server on port 3100 by default. Set `PLAYWRIGHT_PORT` to change it or `PLAYWRIGHT_BASE_URL` to target a test deployment. Optional staff-role checks require an isolated test deployment identified by `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_ADMIN_TEST_HOST` (exact hostname match), and `PLAYWRIGHT_ADMIN_ISOLATED_TEST=true`, plus the relevant credentials: `PLAYWRIGHT_SUPER_ADMIN_EMAIL` / `PLAYWRIGHT_SUPER_ADMIN_PASSWORD`, `PLAYWRIGHT_EDITOR_EMAIL` / `PLAYWRIGHT_EDITOR_PASSWORD`, and `PLAYWRIGHT_SEO_MANAGER_EMAIL` / `PLAYWRIGHT_SEO_MANAGER_PASSWORD`. Known Infeara production hostnames are blocked. The create/edit/delete CMS workflow has an additional `PLAYWRIGHT_ADMIN_ALLOW_MUTATIONS=true` opt-in; point the test deployment at an isolated Supabase project only.

## Quality checks

- `npm run build` — TypeScript clean; public routes plus the `/admin` routes, `/api/contact`
  and the 410 handlers.
- Lighthouse 12, desktop preset: performance 97–100, accessibility 100, best practices 100.
  Mobile (throttled): accessibility 100, performance 71–93.
- axe-core WCAG 2.1 A/AA: zero violations on the 404, 410 and thank-you pages, which
  Lighthouse cannot audit directly.
- 390 px viewport: no horizontal overflow on any route, one `h1` per page, canonical present.

Evidence and the dated results are in `notes/`.
