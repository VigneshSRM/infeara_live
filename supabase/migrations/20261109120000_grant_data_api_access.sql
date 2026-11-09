-- Infeara CMS — explicit Data API grants.
--
-- Supabase no longer grants new `public` tables to the API roles on its own
-- (changelog 45329: new projects from 2026-05-30, every project from
-- 2026-10-30). Without a grant, PostgREST answers "permission denied for table
-- ..." before row-level security is consulted. The CMS then cannot read a
-- signed-in person's profile, and the public site cannot read published
-- content or accept a lead.
--
-- Safe to re-run: GRANT does nothing for a privilege that is already held.
-- Every grant below matches a policy from 20261106090000_cms_schema.sql, so
-- this adds no access that row-level security did not already describe, and it
-- leaves closed what no policy uses: anon on profiles and audit_log, truncate,
-- references, trigger. Where a project still auto-exposes tables these
-- statements are no-ops.
--
-- Plain statements on purpose: the dashboard SQL editor can split a pasted
-- script, and nothing here needs a DO block.

-- Row-level security calls these helpers as the signed-in role. Only
-- `authenticated` evaluates a policy that uses them (the service key bypasses
-- row-level security, and anon's policies call no function).
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.can_edit() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- profiles: staff read the team and a super admin changes roles. Profiles are
-- created by the signup trigger or the service key, never by a visitor.
grant select, update, delete on public.profiles to authenticated;

-- Content and media: the public reads published rows, staff manage them. The
-- policies narrow both by status and by role.
grant select on public.services to anon;
grant select on public.industries to anon;
grant select on public.insights to anon;
grant select on public.legal_documents to anon;
grant select on public.faq_groups to anon;
grant select on public.media to anon;

grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.industries to authenticated;
grant select, insert, update, delete on public.insights to authenticated;
grant select, insert, update, delete on public.legal_documents to authenticated;
grant select, insert, update, delete on public.faq_groups to authenticated;
grant select, insert, update, delete on public.media to authenticated;

-- leads: a visitor can submit one and can never read one back.
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;

-- audit_log: staff read it; only database triggers write it.
grant select on public.audit_log to authenticated;

-- The service key bypasses row-level security but still needs table privileges
-- (creating accounts writes profiles).
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.services to service_role;
grant select, insert, update, delete on public.industries to service_role;
grant select, insert, update, delete on public.insights to service_role;
grant select, insert, update, delete on public.legal_documents to service_role;
grant select, insert, update, delete on public.faq_groups to service_role;
grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.media to service_role;
grant select, insert, update, delete on public.audit_log to service_role;
