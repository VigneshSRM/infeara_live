-- Put the existing service catalog into the new core/sub-service structure.
-- Remote IT remains one page and includes both remote support and dedicated
-- engineer capacity; no service rows or slugs are added or removed.

update public.services
set
  name = 'IT Infrastructure',
  tagline = 'The core practice for operating and improving business IT.',
  summary = 'The core practice for operating and improving business IT, delivered through managed IT, facility management, remote support, network engineering and infrastructure modernisation.',
  intro = 'IT Infrastructure brings together the services that keep a business technology estate running and ready to change. Choose a focused service below for managed operations, facility management, remote support or network engineering; the core team coordinates them to one operating standard.',
  seo_description = 'Managed IT services, facility management, remote support, network engineering and infrastructure modernisation from one core practice.',
  updated_at = now()
where slug = 'it-infrastructure';

update public.services
set
  name = 'Remote IT Services',
  short_name = 'Remote IT Services',
  tagline = 'Remote support with dedicated capacity when needed.',
  summary = 'Remote administration, tiered helpdesk coverage and dedicated engineers, from first-line response to senior engineering.',
  intro = 'Remote IT services provide capacity and continuity when an internal team is small, overloaded or between hires. We combine remote administration, tiered helpdesk cover and dedicated engineer capacity, with responsibilities and decision rights agreed up front.',
  seo_title = 'Remote IT Services & Dedicated Support',
  seo_description = 'Remote IT administration, tiered helpdesk and dedicated engineering capacity from Infeara Technologies.',
  updated_at = now()
where slug = 'outsourcing-remote-support';
