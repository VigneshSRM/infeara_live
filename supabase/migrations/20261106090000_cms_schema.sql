-- Infeara CMS — schema, roles, row-level security, audit.
--
-- Apply with the Supabase SQL editor or `supabase db push`.
-- The migration is idempotent enough to re-run during development: types are
-- created behind exception guards, tables use IF NOT EXISTS, policies are
-- dropped before being recreated.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.staff_role as enum ('super_admin', 'editor', 'seo_manager', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'qualified', 'closed', 'spam');
exception when duplicate_object then null; end $$;

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- A signup creates a *pending* profile, never a staff one. Public signup can be
-- left enabled without handing anyone access: is_staff() ignores pending.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.staff_role not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Role helpers ─────────────────────────────────────────────────────────────

create or replace function public.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_staff_role() in ('super_admin', 'editor', 'seo_manager'), false)
$$;

create or replace function public.can_edit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_staff_role() in ('super_admin', 'editor'), false)
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_staff_role() = 'super_admin', false)
$$;

-- ── Shared trigger functions ─────────────────────────────────────────────────

create or replace function public.touch_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- SEO managers may change SEO fields only. The allowlist is per table because
-- the content tables do not share an identical column set.
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

create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid,
  actor_email text,
  action text not null,
  table_name text not null,
  row_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_table_idx on public.audit_log (table_name, created_at desc);

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_email text;
  row_key text;
  payload jsonb;
begin
  select email into actor_email from public.profiles where id = actor;

  if tg_op = 'DELETE' then
    row_key := to_jsonb(old) ->> 'id';
    payload := to_jsonb(old);
  elsif tg_op = 'UPDATE' then
    row_key := to_jsonb(new) ->> 'id';
    payload := (
      select coalesce(jsonb_object_agg(key, jsonb_build_object('from', to_jsonb(old) -> key, 'to', to_jsonb(new) -> key)), '{}'::jsonb)
      from jsonb_each(to_jsonb(new)) n
      where to_jsonb(new) -> key is distinct from to_jsonb(old) -> key
    );
  else
    row_key := to_jsonb(new) ->> 'id';
    payload := to_jsonb(new);
  end if;

  insert into public.audit_log (actor_id, actor_email, action, table_name, row_id, diff)
  values (actor, actor_email, lower(tg_op), tg_table_name, row_key, payload);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Attach audit + SEO guard to a table in one call.
create or replace function public.attach_content_triggers(target text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  execute format('drop trigger if exists a_enforce_seo_manager on public.%I', target);
  execute format(
    'create trigger a_enforce_seo_manager before update on public.%I for each row execute function public.enforce_seo_manager_columns()',
    target
  );
  execute format('drop trigger if exists b_touch_row on public.%I', target);
  execute format(
    'create trigger b_touch_row before update on public.%I for each row execute function public.touch_row()',
    target
  );
  execute format('drop trigger if exists c_audit on public.%I', target);
  execute format(
    'create trigger c_audit after insert or update or delete on public.%I for each row execute function public.log_audit()',
    target
  );
end;
$$;

-- ── Content tables ───────────────────────────────────────────────────────────

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order int not null default 0,
  name text not null,
  short_name text not null,
  tagline text not null,
  summary text not null,
  intro text not null,
  deliverables jsonb not null default '[]'::jsonb,
  outcomes text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  related text[] not null default '{}',
  figure jsonb not null default '{}'::jsonb,
  seo_title text not null,
  seo_description text not null,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text not null,
  summary text not null,
  challenges text[] not null default '{}',
  capabilities text[] not null default '{}',
  services text[] not null default '{}',
  figure jsonb not null default '{}'::jsonb,
  seo_title text not null,
  seo_description text not null,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null,
  category text not null,
  reading_minutes int not null default 5 check (reading_minutes between 1 and 60),
  published_at timestamptz,
  body jsonb not null default '[]'::jsonb,
  seo_title text not null,
  seo_description text not null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null,
  updated_label text not null,
  intro text not null,
  sections jsonb not null default '[]'::jsonb,
  seo_title text not null,
  seo_description text not null,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.faq_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  intro text not null default '',
  sort_order int not null default 0,
  items jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index if not exists services_status_idx on public.services (status, sort_order);
create index if not exists industries_status_idx on public.industries (status);
create index if not exists insights_status_idx on public.insights (status, published_at desc);
create index if not exists legal_status_idx on public.legal_documents (status);

-- ── Leads ────────────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  topic text,
  message text not null,
  source_page text,
  status public.lead_status not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status, created_at desc);

-- ── Media ────────────────────────────────────────────────────────────────────

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket_path text not null unique,
  alt text not null,
  caption text,
  mime_type text not null,
  size_bytes bigint not null,
  width int,
  height int,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

-- ── Row-level security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.industries enable row level security;
alter table public.insights enable row level security;
alter table public.legal_documents enable row level security;
alter table public.faq_groups enable row level security;
alter table public.leads enable row level security;
alter table public.media enable row level security;
alter table public.audit_log enable row level security;

-- profiles: staff can see the team; only a super admin changes roles.
drop policy if exists profiles_select_staff on public.profiles;
create policy profiles_select_staff on public.profiles
  for select to authenticated using (public.is_staff());

drop policy if exists profiles_update_super_admin on public.profiles;
create policy profiles_update_super_admin on public.profiles
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists profiles_delete_super_admin on public.profiles;
create policy profiles_delete_super_admin on public.profiles
  for delete to authenticated using (public.is_super_admin());

-- Content: public sees published rows whose publish time has arrived.
do $$
declare t text;
begin
  foreach t in array array['services', 'industries', 'insights', 'legal_documents', 'faq_groups']
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

-- Leads: anonymous insert only; staff read and manage.
drop policy if exists leads_insert_anyone on public.leads;
create policy leads_insert_anyone on public.leads
  for insert to anon, authenticated with check (true);

drop policy if exists leads_select_staff on public.leads;
create policy leads_select_staff on public.leads
  for select to authenticated using (public.is_staff());

drop policy if exists leads_update_staff on public.leads;
create policy leads_update_staff on public.leads
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists leads_delete_editors on public.leads;
create policy leads_delete_editors on public.leads
  for delete to authenticated using (public.can_edit());

-- Media: public read (images are public), staff manage.
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media
  for select to anon, authenticated using (true);

drop policy if exists media_insert_staff on public.media;
create policy media_insert_staff on public.media
  for insert to authenticated with check (public.can_edit());

drop policy if exists media_update_staff on public.media;
create policy media_update_staff on public.media
  for update to authenticated
  using (public.can_edit())
  with check (public.can_edit());

drop policy if exists media_delete_staff on public.media;
create policy media_delete_staff on public.media
  for delete to authenticated using (public.can_edit());

-- Audit: readable by staff, written only by the security-definer trigger.
drop policy if exists audit_select_staff on public.audit_log;
create policy audit_select_staff on public.audit_log
  for select to authenticated using (public.is_staff());

-- ── Storage policies for the media bucket ────────────────────────────────────

drop policy if exists media_objects_public_read on storage.objects;
create policy media_objects_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists media_objects_staff_insert on storage.objects;
create policy media_objects_staff_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.can_edit());

drop policy if exists media_objects_staff_update on storage.objects;
create policy media_objects_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.can_edit())
  with check (bucket_id = 'media' and public.can_edit());

drop policy if exists media_objects_staff_delete on storage.objects;
create policy media_objects_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.can_edit());

-- ── Triggers ─────────────────────────────────────────────────────────────────

select public.attach_content_triggers('services');
select public.attach_content_triggers('industries');
select public.attach_content_triggers('insights');
select public.attach_content_triggers('legal_documents');
select public.attach_content_triggers('faq_groups');

drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_row();

drop trigger if exists leads_audit on public.leads;
create trigger leads_audit after insert or update or delete on public.leads
  for each row execute function public.log_audit();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_row();
