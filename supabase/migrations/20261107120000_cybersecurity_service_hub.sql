-- Keep the published Cybersecurity core page aligned with its four focused
-- sub-service pages. The sub-services use explicit frontend routes and do not
-- replace or rename any existing service records.

update public.services
set
  tagline = 'Assess exposure, test defenses and understand threats.',
  summary = 'Four focused services for assessing vulnerabilities, testing defenses, modeling threats and analyzing suspicious activity.',
  intro = 'Cybersecurity brings together preventive assessment and practical response. Select a focused service for vulnerability assessment, penetration testing, threat modeling or threat analysis; each engagement is scoped to the environment and produces prioritized actions.',
  seo_description = 'Cybersecurity services for vulnerability assessment, penetration testing, threat modeling and threat analysis across business IT environments.',
  updated_at = now()
where slug = 'cybersecurity';
