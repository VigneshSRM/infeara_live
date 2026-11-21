// Calendar days as the site shows them: India days. Import-free, so the unit tests can load it.
//
// A day such as "12 October" is stored as a moment (midnight at the start of that day in India,
// 18:30 UTC the evening before). Reading the day off the UTC text of that moment gives the day
// before, so an insight dated 12 October showed as 11 October in the sitemap and in its Article
// data. Every public date goes through here instead.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The calendar date in India (the operating timezone) of a stored moment, as YYYY-MM-DD. */
export function istDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const at = new Date(value).getTime();
  if (Number.isNaN(at)) return null;
  return new Date(at + IST_OFFSET_MS).toISOString().slice(0, 10);
}
