const NOTICE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Page retired — Infeara Technologies</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #eae6de;
        color: #202832;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        padding: 2rem;
      }
      main { max-width: 34rem; }
      p.eyebrow {
        font-size: 0.7rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #9e451e;
        margin: 0 0 1rem;
      }
      h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.15; margin: 0 0 1rem; }
      p { line-height: 1.65; margin: 0 0 1rem; }
      a { color: #226192; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">410 Gone</p>
      <h1>This page has been retired.</h1>
      <p>
        The client portal and account sign-in for this site are no longer in service.
        Infeara delivers support through its service desk rather than a public login.
      </p>
      <p>
        To reach the team, use the <a href="/contact">contact form</a>.
      </p>
      <p><a href="/">Return to the homepage</a></p>
    </main>
  </body>
</html>`;

/**
 * 410 Gone response for retired account routes.
 *
 * A 410 is permanent and explicit: crawlers drop the URL rather than retrying it
 * as they would a 404, and nobody is redirected to a page that implies sign-in
 * still exists. Served as HTML so a person who follows an old link gets an
 * explanation and a route back into the site.
 */
export function goneResponse(): Response {
  return new Response(NOTICE, {
    status: 410,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
