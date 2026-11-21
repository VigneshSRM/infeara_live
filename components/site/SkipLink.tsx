/**
 * The first thing a keyboard or screen-reader visitor reaches on a page: a link past the menu to
 * the content. It is hidden until it has focus. Every public page has one, so a page that builds
 * its own frame (the home page, the 404 page) places it itself, ahead of <Header />.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-navy focus:px-5 focus:py-2 focus:font-heading focus:text-sm focus:text-ivory"
    >
      Skip to main content
    </a>
  );
}
