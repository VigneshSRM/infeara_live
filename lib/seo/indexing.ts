// Whether search engines may index this deployment.
//
// This file deliberately has no imports, so tests/indexing.test.mjs can load it as it is.

export type IndexingEnv = {
  /** `true` opens the site and any other value closes it. Not set (or empty) leaves it to the default. */
  SITE_INDEXABLE?: string;
  /** Set by Vercel itself: `production`, `preview` or `development`. */
  VERCEL_ENV?: string;
};

/**
 * The site is open to search engines unless someone closes it:
 *
 *   SITE_INDEXABLE=true               open everywhere
 *   SITE_INDEXABLE=<anything else>    closed everywhere (`false`, `0`, `no`...): a value that was typed in is a decision
 *   not set                           open, except on a Vercel preview deployment, which stays closed
 *
 * Closed means `robots.txt` says `Disallow: /`, every page carries `noindex, nofollow` and the
 * sitemap is empty. The site was closed by default until 21 November 2026, when the owner asked for the
 * crawling problem to be fixed (see "Launch gate" in the README and "Indexing Gate" in
 * concepts_brief.md).
 */
export function isIndexable(env: IndexingEnv): boolean {
  const flag = env.SITE_INDEXABLE?.trim().toLowerCase();
  if (flag) return flag === "true";
  return env.VERCEL_ENV !== "preview";
}
