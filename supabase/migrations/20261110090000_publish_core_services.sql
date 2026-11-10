-- Infeara CMS — make sure AI Automations and Application Development are live.
--
-- What this repairs: the home page and /services showed four of the six core
-- services, and /services/ai-automations and /services/application-development
-- returned 404. The site reads its services from this database and only shows rows
-- that are published, so the two pages were missing because the database had no
-- published row for them: 20261106150000_split_automation_application_services.sql,
-- which adds them, had never been run on the project.
--
-- Run that migration first. (supabase/apply/04-core-services.sql runs both, in order,
-- as one statement.) It inserts both services as published. If a row with one of
-- those slugs already existed as a draft, archived or dated for later, for example
-- saved in the CMS before it was ready, it refreshes the text but leaves the status
-- alone, so the page would stay hidden. This file publishes them, then checks what a
-- visitor can see. If either is still hidden the run stops with an error that names it,
-- and nothing from the run is kept, instead of reporting success.
--
-- Safe to run again: with both services already live it changes nothing.

begin;

update public.services
set
  status = 'published',
  published_at = case when published_at > now() then now() else published_at end
where slug in ('ai-automations', 'application-development')
  and (status <> 'published' or published_at > now());

do $$
declare
  hidden text;
begin
  -- The same test the public read policy applies to visitors.
  select string_agg(core.slug, ', ' order by core.slug)
    into hidden
  from unnest(array['ai-automations', 'application-development']) as core(slug)
  where not exists (
    select 1
    from public.services s
    where s.slug = core.slug
      and s.status = 'published'
      and (s.published_at is null or s.published_at <= now())
  );

  if hidden is not null then
    raise exception 'Not visible to visitors after the update: %. Look at these rows in public.services.', hidden;
  end if;
end $$;

commit;
