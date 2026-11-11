-- Infeara CMS — sub-services, blog posts, case studies and white papers, managed in the admin.
--
-- Until now only services, industries, insights, legal pages and FAQs lived in the
-- database. The 18 sub-services (Cybersecurity 4, Cloud & Datacenter 7, AI Automations 4,
-- Application Development 3), the blog, the case studies and the white papers were code,
-- so changing a word, publishing something new or taking something down needed a developer
-- and a deploy. This adds one table for each, plus a storage bucket for white-paper PDFs.
--
-- Rules, enforced here rather than only in the screens (same shape as the other content):
--   * Visitors read only rows that are published and whose publish time has arrived.
--     Drafts, archived rows and rows scheduled for later stay private.
--   * Super admins and editors create, change and delete. SEO managers can read everything
--     and change the SEO title and description only; the database refuses anything else.
--   * Every create, change and delete is written to the audit log by the database.
--   * A case study about a named client cannot be published until the client's approval
--     is recorded, and a "representative" one can never carry a client name.
--   * A white paper cannot be published without a file or a link to one.
--
-- Run it once in the Supabase SQL editor with Role = postgres (the default). The wrapper
-- supabase/apply/05-resource-modules.sql runs this file and the seed that follows it
-- (20261110200100_resource_modules_seed.sql) as one statement, so it either all happens or
-- none of it does. Safe to run again: tables, policies and grants are re-stated, and the
-- seed adds rows only to a table that is still empty.
--
-- It needs 20261106090000_cms_schema.sql (profiles, the role helpers and the trigger
-- functions) to be in place already. It does not touch any existing table.

-- ── Tables ───────────────────────────────────────────────────────────────────

-- One row per sub-service page: /services/<parent_slug>/<slug>. The four parents are
-- the core services that have a hub page of their own; a fifth would need a hub page in
-- the code first, so the list is a constraint rather than free text.
create table if not exists public.sub_services (
  id uuid primary key default gen_random_uuid(),
  parent_slug text not null
    check (parent_slug in ('cybersecurity', 'cloud-datacenter', 'ai-automations', 'application-development')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order int not null default 0,
  name text not null,
  tagline text not null default '',
  summary text not null,
  intro text not null default '',
  deliverables jsonb not null default '[]'::jsonb,
  outcomes text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  -- null, or { "title": "...", "steps": [{ "title": "...", "description": "..." }], "image": "/site/..." }.
  -- With an image the page shows that picture; without one it lists the steps.
  infographic jsonb,
  figure jsonb not null default '{}'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  unique (parent_slug, slug)
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null,
  category text not null default 'General',
  -- Empty means "work it out from the text".
  reading_minutes int check (reading_minutes between 1 and 60),
  body jsonb not null default '[]'::jsonb,
  figure_seed int not null default 1,
  -- [{ "label": "...", "href": "/services/..." }]
  related_services jsonb not null default '[]'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  sector text not null,
  -- "representative": the shape of an engagement, no client named, no figures.
  -- "client": a named study, published only with the client's recorded approval.
  kind text not null default 'representative' check (kind in ('representative', 'client')),
  client_name text,
  client_approved boolean not null default false,
  situation text not null,
  work text[] not null default '{}',
  result text not null,
  -- Slugs from public.services, shown as links to those pages.
  services text[] not null default '{}',
  sort_order int not null default 0,
  seo_title text not null default '',
  seo_description text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  constraint case_studies_representative_is_unnamed
    check (kind <> 'representative' or client_name is null),
  constraint case_studies_client_is_named
    check (kind <> 'client' or nullif(btrim(client_name), '') is not null),
  constraint case_studies_client_needs_approval_to_publish
    check (kind <> 'client' or status <> 'published' or client_approved)
);

create table if not exists public.white_papers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  topic text not null default 'General',
  -- The PDF in the "documents" bucket, or a link to a file kept elsewhere.
  file_path text,
  file_name text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  external_url text check (external_url is null or external_url ~ '^https?://'),
  sort_order int not null default 0,
  seo_title text not null default '',
  seo_description text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,
  constraint white_papers_published_needs_a_file
    check (status <> 'published' or file_path is not null or external_url is not null)
);

create index if not exists sub_services_parent_idx on public.sub_services (parent_slug, status, sort_order);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);
create index if not exists case_studies_status_idx on public.case_studies (status, sort_order);
create index if not exists white_papers_status_idx on public.white_papers (status, sort_order);

-- ── White-paper files ────────────────────────────────────────────────────────

-- Public bucket: a published paper is meant to be opened by anyone with its link. Only PDFs,
-- up to 25 MB. An existing bucket keeps its place but gets these limits restated.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', true, 26214400, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Deliberately no anonymous read policy, unlike the media bucket. A public bucket serves a
-- file to anyone who has its link without one, and leaving it out means nobody can list
-- the bucket and find a draft paper's file before it is published. Staff can read (the
-- admin checks that an upload arrived); editors can add, replace and remove.
drop policy if exists documents_objects_staff_read on storage.objects;
create policy documents_objects_staff_read on storage.objects
  for select to authenticated using (bucket_id = 'documents' and public.is_staff());

drop policy if exists documents_objects_staff_insert on storage.objects;
create policy documents_objects_staff_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'documents' and public.can_edit());

drop policy if exists documents_objects_staff_update on storage.objects;
create policy documents_objects_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and public.can_edit())
  with check (bucket_id = 'documents' and public.can_edit());

drop policy if exists documents_objects_staff_delete on storage.objects;
create policy documents_objects_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'documents' and public.can_edit());

-- ── Row-level security ───────────────────────────────────────────────────────

alter table public.sub_services enable row level security;
alter table public.blog_posts enable row level security;
alter table public.case_studies enable row level security;
alter table public.white_papers enable row level security;

do $$
declare t text;
begin
  foreach t in array array['sub_services', 'blog_posts', 'case_studies', 'white_papers']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (status = ''published'' and (published_at is null or published_at <= now()))',
      t || '_public_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_staff())',
      t || '_staff_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_insert_editors', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.can_edit())',
      t || '_insert_editors', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_update_staff', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_staff()) with check (public.is_staff())',
      t || '_update_staff', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_delete_editors', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.can_edit())',
      t || '_delete_editors', t
    );
  end loop;
end $$;

-- Explicit grants (Supabase no longer grants new public tables to the API roles, see
-- 20261109120000_grant_data_api_access.sql). Each one matches a policy above: visitors read,
-- staff manage, and the service key keeps full access.
grant select on public.sub_services to anon;
grant select on public.blog_posts to anon;
grant select on public.case_studies to anon;
grant select on public.white_papers to anon;

grant select, insert, update, delete on public.sub_services to authenticated;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant select, insert, update, delete on public.case_studies to authenticated;
grant select, insert, update, delete on public.white_papers to authenticated;

grant select, insert, update, delete on public.sub_services to service_role;
grant select, insert, update, delete on public.blog_posts to service_role;
grant select, insert, update, delete on public.case_studies to service_role;
grant select, insert, update, delete on public.white_papers to service_role;

-- ── SEO managers: SEO fields only ────────────────────────────────────────────

-- The same function as in 20261106090000_cms_schema.sql with the four new tables added to
-- its per-table list. Without these lines a table not named in the list falls through to
-- "no columns allowed", and an SEO manager could not save even the SEO fields.
create or replace function public.enforce_seo_manager_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed text[];
  offending text;
begin
  if public.current_staff_role() is distinct from 'seo_manager' then
    return new;
  end if;

  allowed := case tg_table_name
    when 'services' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'industries' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'insights' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'legal_documents' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'sub_services' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'blog_posts' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'case_studies' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'white_papers' then array['seo_title', 'seo_description', 'updated_at', 'updated_by']
    when 'faq_groups' then array['updated_at', 'updated_by']
    else array['updated_at', 'updated_by']
  end;

  select key into offending
  from jsonb_each(to_jsonb(new)) n
  where to_jsonb(new) -> key is distinct from to_jsonb(old) -> key
    and key <> all (allowed)
  limit 1;

  if offending is not null then
    raise exception 'Role seo_manager cannot change column % on %', offending, tg_table_name
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- ── Triggers: SEO guard, updated_at/updated_by, audit log ────────────────────

select public.attach_content_triggers('sub_services');
select public.attach_content_triggers('blog_posts');
select public.attach_content_triggers('case_studies');
select public.attach_content_triggers('white_papers');
