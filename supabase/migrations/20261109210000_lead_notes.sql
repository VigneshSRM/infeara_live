-- Infeara CMS — internal notes on a lead, as a chat thread.
--
-- Until now a lead had one `notes` text box that every save overwrote. This adds
-- `public.lead_notes`: one row per message, with who sent it and when, so staff
-- can read the whole history of a conversation about an enquiry.
--
-- Rules, enforced here rather than only in the screen:
--   * Every staff role (super admin, editor, SEO manager) can read and send.
--     Pending accounts and visitors cannot do either.
--   * A message is never edited. There is no UPDATE grant and no UPDATE policy.
--   * Only a super admin can delete a message (a mistake, or something that
--     should not be on file). Deleting a lead removes its thread with it.
--   * The author and the time are stamped by the database from the signed-in
--     account, so nobody can post under another name or backdate a message.
--   * Deletions are written to the audit log. Sending is not: the thread is
--     already the record, and a log line per message would bury real changes.
--
-- Run it once, in the Supabase SQL editor, with Role = postgres (the default).
-- Safe to re-run. It needs 20261106090000_cms_schema.sql to have been applied,
-- and it keeps the old `leads.notes` column untouched as a safety copy.
--
-- Existing notes are copied in as the first message of their lead, labelled
-- "Earlier note". The copy has a fixed id per lead, so a second run adds nothing.

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text,
  author_email text,
  -- The screen allows 4,000 characters; the table is a little wider so a long
  -- note written in the old single box still fits when it is copied in below.
  -- btrim() alone only removes spaces, so tabs and line breaks are named too:
  -- a message of nothing but a newline is empty.
  body text not null check (char_length(btrim(body, E' \t\r\n')) between 1 and 10000),
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_idx on public.lead_notes (lead_id, created_at);

alter table public.lead_notes enable row level security;

-- ── Author and time come from the session, never from the request ────────────

create or replace function public.lead_notes_stamp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  me_email text;
  me_name text;
begin
  -- No signed-in account means a trusted server-side write (this migration, the
  -- service key): keep exactly what it supplied.
  if me is null then
    return new;
  end if;

  select email, nullif(btrim(full_name), '') into me_email, me_name
  from public.profiles where id = me;

  new.author_id := me;
  new.author_email := me_email;
  new.author_name := coalesce(me_name, nullif(split_part(coalesce(me_email, ''), '@', 1), ''));
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists lead_notes_stamp on public.lead_notes;
create trigger lead_notes_stamp before insert on public.lead_notes
  for each row execute function public.lead_notes_stamp();

-- ── Access ───────────────────────────────────────────────────────────────────

drop policy if exists lead_notes_select_staff on public.lead_notes;
create policy lead_notes_select_staff on public.lead_notes
  for select to authenticated using (public.is_staff());

drop policy if exists lead_notes_insert_staff on public.lead_notes;
create policy lead_notes_insert_staff on public.lead_notes
  for insert to authenticated
  with check (public.is_staff() and author_id = auth.uid());

drop policy if exists lead_notes_delete_super_admin on public.lead_notes;
create policy lead_notes_delete_super_admin on public.lead_notes
  for delete to authenticated using (public.is_super_admin());

-- Explicit grants (Supabase no longer grants new public tables to the API roles,
-- see 20261109120000_grant_data_api_access.sql). No update for `authenticated`:
-- a message cannot be changed once sent. The service key keeps full access.
grant select, insert, delete on public.lead_notes to authenticated;
grant select, insert, update, delete on public.lead_notes to service_role;

-- ── Audit: deletions only ────────────────────────────────────────────────────

-- `pg_trigger_depth() = 0` skips the rows removed when a whole lead is deleted;
-- that deletion is already audited on the lead itself.
drop trigger if exists lead_notes_audit on public.lead_notes;
create trigger lead_notes_audit after delete on public.lead_notes
  for each row when (pg_trigger_depth() = 0)
  execute function public.log_audit();

-- ── Keep what staff already wrote ────────────────────────────────────────────

insert into public.lead_notes (id, lead_id, author_name, body, created_at)
select
  md5('legacy-note:' || l.id::text)::uuid,
  l.id,
  'Earlier note',
  left(btrim(l.notes, E' \t\r\n'), 10000),
  coalesce(l.updated_at, l.created_at)
from public.leads l
where l.notes is not null and btrim(l.notes, E' \t\r\n') <> ''
on conflict (id) do nothing;
