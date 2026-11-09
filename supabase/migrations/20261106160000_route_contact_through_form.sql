-- Public contact details are handled through the website form only.
-- Remove the published company email address from legal-document content already
-- stored in Supabase so database-backed pages match the frontend copy.
update public.legal_documents
set sections = replace(sections::text, 'contact@infeara.com', 'the website contact form')::jsonb
where sections::text like '%contact@infeara.com%';
