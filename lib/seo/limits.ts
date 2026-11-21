// Search-result budgets. Import-free, so the unit tests can load it.
//
// A results page shows about 600 px of a title (roughly 60 characters) and about 160 characters
// of a description, and audit tools flag anything longer. The root layout appends
// SITE_TITLE_SUFFIX to every page title, so an editor has TITLE_ROOM characters of their own, not
// TITLE_MAX. The admin hint, the title template and the tests all read these constants, so they
// cannot drift apart.

/** Added after every page title by the root layout. The home page sets its own full title. */
export const SITE_TITLE_SUFFIX = " — Infeara";

/** Longest title worth writing, suffix included. */
export const TITLE_MAX = 60;

/** Longest meta description worth writing. */
export const DESCRIPTION_MAX = 160;

/** What is left of TITLE_MAX once the site name has been added. */
export const TITLE_ROOM = TITLE_MAX - SITE_TITLE_SUFFIX.length;

/** Shown under every "SEO title" field in the admin. */
export const SEO_TITLE_HINT = `Up to ${TITLE_ROOM} characters. “${SITE_TITLE_SUFFIX.trim()}” is added after it.`;

/** Shown under every "Meta description" field in the admin. */
export const SEO_DESCRIPTION_HINT = "Aim for 120–155 characters.";
