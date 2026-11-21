import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// The title and description budgets are held in one module that the title template and the admin
// hints read too, so the test measures against the same numbers instead of copies of them.
const limits = await (async () => {
  const source = readFileSync(new URL("../lib/seo/limits.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
})();

const baseURL = (process.env.PLAYWRIGHT_BASE_URL ?? process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const publicRoutes = [
  "/",
  "/about",
  "/approach",
  "/why-infeara",
  "/case-studies",
  "/partners",
  "/careers",
  "/careers/opportunities",
  "/contact",
  "/faq",
  "/sla",
  "/thank-you",
  "/services",
  "/services/managed-it",
  "/services/it-infrastructure",
  "/services/it-facility-management",
  "/services/outsourcing-remote-support",
  "/services/network-engineering",
  "/services/cybersecurity",
  "/services/cybersecurity/vulnerability-assessment",
  "/services/cybersecurity/penetration-testing",
  "/services/cybersecurity/threat-modeling",
  "/services/cybersecurity/threat-analysis",
  "/services/cloud-datacenter",
  "/services/cloud-datacenter/cloud-ai-data-services",
  "/services/cloud-datacenter/managed-cloud-support-msp",
  "/services/cloud-datacenter/cloud-cost-optimization",
  "/services/cloud-datacenter/cloud-disaster-recovery-business-continuity",
  "/services/cloud-datacenter/cloud-monitoring-management",
  "/services/cloud-datacenter/cloud-application-hosting",
  "/services/cloud-datacenter/cloud-devops-automation",
  "/services/turnkey-projects",
  "/services/ai-automations",
  "/services/ai-automations/ai-chatbot-development",
  "/services/ai-automations/ai-callers-development",
  "/services/ai-automations/llm-development",
  "/services/ai-automations/it-infrastructure-ai-automations",
  "/services/application-development",
  "/services/application-development/web-application-development",
  "/services/application-development/website-development",
  "/services/application-development/mobile-application-development",
  "/industries",
  "/industries/banking-financial-services",
  "/industries/healthcare",
  "/industries/manufacturing",
  "/industries/retail-ecommerce",
  "/industries/education",
  "/industries/logistics-transportation",
  "/industries/professional-services",
  "/industries/enterprise-offices",
  "/insights",
  "/insights/what-managed-it-actually-covers",
  "/insights/three-questions-before-a-cloud-migration",
  "/insights/a-backup-is-not-a-recovery-plan",
  "/blogs",
  "/white-papers",
  "/legal/privacy-policy",
  "/legal/terms",
  "/legal/cookies",
];

test("all public pages return 200 and contain one primary heading", async () => {
  for (const path of publicRoutes) {
    const response = await fetch(`${baseURL}${path}`);
    const body = await response.text();
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
    assert.equal((body.match(/<h1\b/g) ?? []).length, 1, `${path} should have one h1`);
  }
});

/** Turns the entities Next writes into attribute and title text back into characters, so lengths are real. */
function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** The content of the first <meta> whose `attr` is `key`, e.g. metaContent(html, "property", "og:locale"). */
function metaContent(html, attr, key) {
  for (const tag of html.match(/<meta\b[^>]*>/g) ?? []) {
    if (tag.includes(`${attr}="${key}"`)) {
      const content = tag.match(/\bcontent="([^"]*)"/);
      return content ? decodeEntities(content[1]) : undefined;
    }
  }
  return undefined;
}

test("every public page names itself the way a search result and a shared link need", async () => {
  for (const path of publicRoutes) {
    const html = await (await fetch(`${baseURL}${path}`)).text();

    const title = decodeEntities(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    assert.ok(title, `${path} has no <title>`);
    assert.ok(
      title.length <= limits.TITLE_MAX,
      `${path}: the title is ${title.length} characters (limit ${limits.TITLE_MAX}): ${title}`,
    );

    const description = metaContent(html, "name", "description");
    assert.ok(description, `${path} has no meta description`);
    assert.ok(
      description.length <= limits.DESCRIPTION_MAX,
      `${path}: the description is ${description.length} characters (limit ${limits.DESCRIPTION_MAX})`,
    );

    // One name per page, wherever it is shown: the tab and search result, a shared link and a post on X.
    assert.equal(metaContent(html, "property", "og:title"), title, `${path}: og:title differs from <title>`);
    assert.equal(metaContent(html, "name", "twitter:title"), title, `${path}: twitter:title differs from <title>`);

    // One canonical address, absolute, on this page's own path.
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(canonicals.length, 1, `${path} should have one canonical link`);
    const canonical = new URL(canonicals[0]);
    assert.equal(canonical.pathname, path, `${path}: canonical points at ${canonicals[0]}`);

    // A page's own Open Graph block replaces the layout's, so the site name and locale must be
    // repeated on every page or they vanish from all of them.
    assert.equal(metaContent(html, "property", "og:site_name"), "Infeara Technologies", `${path}: og:site_name`);
    assert.equal(metaContent(html, "property", "og:locale"), "en_IN", `${path}: og:locale`);
    assert.equal(metaContent(html, "property", "og:url"), canonicals[0], `${path}: og:url should equal the canonical`);
    assert.match(metaContent(html, "property", "og:image") ?? "", /^https?:\/\//, `${path}: og:image should be an absolute URL`);
  }
});

/** Every <loc> address in a sitemap body. */
function sitemapAddresses(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeEntities(match[1]));
}

// The three things a crawler reads (robots.txt, the sitemap, the robots tag on a page) come from one
// value, so they must say the same thing. This holds for an open site and for a closed one.
test("robots.txt, the sitemap and the pages agree on whether search engines are let in", async () => {
  const robots = await (await fetch(`${baseURL}/robots.txt`)).text();
  const sitemapResponse = await fetch(`${baseURL}/sitemap.xml`);
  const addresses = sitemapAddresses(await sitemapResponse.text());
  const robotsTag = metaContent(await (await fetch(`${baseURL}/`)).text(), "name", "robots") ?? "";
  assert.equal(sitemapResponse.status, 200, "sitemap.xml should always answer");

  const closed = /^disallow:\s*\/\s*$/im.test(robots);
  if (closed) {
    assert.match(robotsTag, /noindex/, "robots.txt closes the site, but the home page can be indexed");
    assert.equal(addresses.length, 0, "robots.txt closes the site, but the sitemap lists pages");
    return;
  }

  assert.match(robots, /^allow:\s*\/\s*$/im, "an open robots.txt allows /");
  assert.match(robots, /^disallow:\s*\/admin\/\s*$/im, "the staff area stays disallowed");
  assert.match(robots, /^disallow:\s*\/api\/\s*$/im, "the API stays disallowed");
  assert.match(robots, /^sitemap:\s*https?:\/\/\S+\/sitemap\.xml\s*$/im, "an open robots.txt names the sitemap");
  assert.doesNotMatch(robots, /^host\s*:/im, "Host is Yandex-only and withdrawn");
  assert.equal(robotsTag, "index, follow", "an open site's pages say index, follow");
  assert.ok(addresses.length >= 50, `an open site's sitemap lists its pages, found ${addresses.length}`);
});

test("every address in an open site's sitemap is a real page that can be indexed", async (t) => {
  const robots = await (await fetch(`${baseURL}/robots.txt`)).text();
  if (/^disallow:\s*\/\s*$/im.test(robots)) {
    t.skip("the site is closed to search engines, so its sitemap is empty by design");
    return;
  }

  const addresses = sitemapAddresses(await (await fetch(`${baseURL}/sitemap.xml`)).text());
  assert.equal(new Set(addresses).size, addresses.length, "an address is listed twice");

  // The addresses carry the public host; the pages are fetched from this server by path.
  const hosts = new Set(addresses.map((address) => new URL(address).origin));
  assert.equal(hosts.size, 1, `the sitemap mixes hosts: ${[...hosts].join(", ")}`);

  for (const address of addresses) {
    const path = new URL(address).pathname;
    const response = await fetch(`${baseURL}${path}`, { redirect: "manual" });
    const html = await response.text();
    assert.equal(response.status, 200, `${path} is in the sitemap but returned ${response.status}`);
    assert.doesNotMatch(metaContent(html, "name", "robots") ?? "", /noindex/, `${path} is in the sitemap but says noindex`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    // Compared as addresses, so "https://host" and "https://host/" (the home page) are the same one.
    assert.equal(new URL(canonical ?? "about:blank").href, new URL(address).href, `${path}: the sitemap and the canonical address differ`);
  }

  // Every public page is listed, except the two that are meant to stay out: the thank-you page,
  // and the white-paper list while nothing is published.
  const listed = new Set(addresses.map((address) => new URL(address).pathname));
  for (const path of publicRoutes) {
    if (path === "/thank-you" || path === "/white-papers") continue;
    assert.ok(listed.has(path), `${path} is a public page but is missing from the sitemap`);
  }
  assert.ok(!listed.has("/thank-you"), "the thank-you page should not be in the sitemap");
  assert.ok(![...listed].some((path) => path.startsWith("/admin") || path.startsWith("/api")), "the staff area or the API is in the sitemap");
});

test("pages that must stay out of search results say so, even when the site is open", async () => {
  for (const path of ["/admin/login", "/thank-you", "/this-page-does-not-exist"]) {
    const response = await fetch(`${baseURL}${path}`, { redirect: "manual" });
    const html = await response.text();
    assert.match(metaContent(html, "name", "robots") ?? "", /noindex/, `${path} can be indexed`);
  }
  const gone = await fetch(`${baseURL}/login`);
  assert.equal(gone.status, 410);
  assert.match(gone.headers.get("x-robots-tag") ?? "", /noindex/, "the retired login route can be indexed");
});

test("every blog post the blog page links to returns 200, and other addresses under /blogs do not", async () => {
  const index = await (await fetch(`${baseURL}/blogs`)).text();
  const posts = [...new Set([...index.matchAll(/href="(\/blogs\/[a-z0-9-]+)"/g)].map((match) => match[1]))];
  assert.ok(posts.length > 0, "/blogs links to no posts");

  for (const path of posts) {
    const response = await fetch(`${baseURL}${path}`);
    const body = await response.text();
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
    assert.equal((body.match(/<h1\b/g) ?? []).length, 1, `${path} should have one h1`);
    assert.match(body, /"@type":"BlogPosting"/, `${path} has no BlogPosting data`);
  }

  const missing = await fetch(`${baseURL}/blogs/this-post-does-not-exist`);
  assert.equal(missing.status, 404);
});

test("the header's Technical resources menu links to Insights, Blogs, Case Studies and White Papers", async () => {
  for (const path of ["/", "/contact", "/blogs"]) {
    const page = await (await fetch(`${baseURL}${path}`)).text();
    // Only the header counts: the footer links to some of the same pages and would hide a gap.
    const header = page.slice(page.indexOf("<header"), page.indexOf("</header>"));
    const start = header.indexOf("Technical resources");
    assert.ok(start > 0, `${path}: no Technical resources menu in the header`);
    const menu = header.slice(start, header.indexOf("</details>", start));
    for (const href of ["/insights", "/blogs", "/case-studies", "/white-papers"]) {
      assert.ok(menu.includes(`href="${href}"`), `${path}: the menu has no link to ${href}`);
    }
  }
});

test("public contact surfaces do not expose a company mailbox or mailto link", async () => {
  for (const path of ["/", "/contact", "/about", "/sla", "/careers", "/careers/opportunities", "/legal/privacy-policy", "/legal/cookies"]) {
    const response = await fetch(`${baseURL}${path}`);
    const body = (await response.text()).toLowerCase();
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
    assert.doesNotMatch(body, /contact@infeara\.com|careers@infeara\.com|mailto:/, `${path} exposes an email contact`);
  }
});

/** The paths a page links to under `prefix` (for example "/blogs"), from the list page that links to each one. */
async function linkedUnder(listPath, prefix) {
  const html = await (await fetch(`${baseURL}${listPath}`)).text();
  const pattern = new RegExp(`href="(${prefix}/[a-z0-9-]+)"`, "g");
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]))];
}

const isOpen = async () => !/^disallow:\s*\/\s*$/im.test(await (await fetch(`${baseURL}/robots.txt`)).text());

// The audit of 21 November 2026 found titles with no place in them. The wording is in the database for
// the live site (supabase/apply/07-seo-audit-copy.sql) and in code for a build without one.
test("every service and focused service says where the company is in its title", async () => {
  const servicePages = publicRoutes.filter((path) => /^\/services\/[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(path));
  assert.ok(servicePages.length >= 28, `expected 28 service pages, found ${servicePages.length}`);
  for (const path of servicePages) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    const title = decodeEntities(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    assert.match(title, /Chennai|India/, `${path}: "${title}" does not say where the company is. If this is the live database, run supabase/apply/07-seo-audit-copy.sql`);
  }
});

test("a shared link to a service, guide, post, case study or industry page shows a picture of its own", async () => {
  const cardPages = [
    ...publicRoutes.filter((path) => /^\/(services\/[a-z0-9-]+(\/[a-z0-9-]+)?|insights\/[a-z0-9-]+|industries\/[a-z0-9-]+)$/.test(path)),
    ...(await linkedUnder("/blogs", "/blogs")),
    ...(await linkedUnder("/case-studies", "/case-studies")),
  ];
  assert.ok(cardPages.length > 40, `only ${cardPages.length} pages with a card`);

  const seen = new Set();
  for (const path of cardPages) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    const image = metaContent(html, "property", "og:image") ?? "";
    assert.equal(new URL(image).pathname, `/og${path}.png`, `${path}: og:image is ${image}`);
    assert.equal(metaContent(html, "name", "twitter:image"), image, `${path}: twitter:image differs from og:image`);
    assert.equal(metaContent(html, "property", "og:image:width"), "1200");
    assert.equal(metaContent(html, "property", "og:image:height"), "630");
    assert.ok(!seen.has(image), `${path}: shares its picture with another page`);
    seen.add(image);
  }

  // The picture itself is a real PNG, 1200 by 630, that a CDN may keep.
  for (const path of [cardPages[0], cardPages.find((p) => p.startsWith("/insights/")), cardPages.find((p) => p.startsWith("/blogs/"))]) {
    const response = await fetch(`${baseURL}/og${path}.png`);
    assert.equal(response.status, 200, `/og${path}.png`);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.match(response.headers.get("cache-control") ?? "", /s-maxage=\d+/, "a picture is cacheable at the CDN");
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "not a PNG");
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
    assert.ok(bytes.length > 5_000, `${path}: the picture is only ${bytes.length} bytes`);
  }

  // Every other page keeps the shared picture.
  for (const path of ["/", "/about", "/contact", "/services", "/insights", "/blogs"]) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    assert.equal(new URL(metaContent(html, "property", "og:image") ?? "").pathname, "/brand/og-image.png", path);
  }
});

test("a picture is drawn only for a page that exists, and never from text in the address", async () => {
  for (const path of [
    "/og/services/not-a-service.png",
    "/og/services/managed-it",
    "/og/services/managed-it.jpg",
    "/og/about.png",
    "/og/services/a-parent/that-is-not-one.png",
    "/og/blogs/this-post-does-not-exist.png",
    "/og/services/Managed%20IT%20is%20the%20best.png",
    "/og/services/managed-it.png?title=Free%20money",
  ]) {
    const response = await fetch(`${baseURL}${path}`);
    const known = path.startsWith("/og/services/managed-it.png?");
    // A query string is ignored, not printed: the picture for a real page is the same with or without it.
    assert.equal(response.status, known ? 200 : 404, `${path} returned ${response.status}`);
    if (known) {
      const plain = Buffer.from(await (await fetch(`${baseURL}/og/services/managed-it.png`)).arrayBuffer());
      assert.ok(plain.equals(Buffer.from(await response.arrayBuffer())), "text in the query string changed the picture");
    }
  }
});

test("guides and posts say they are articles, with the day they were published and their author", async () => {
  const articles = [...(await linkedUnder("/insights", "/insights")), ...(await linkedUnder("/blogs", "/blogs"))];
  assert.ok(articles.length >= 7, `only ${articles.length} articles`);

  for (const path of articles) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    assert.equal(metaContent(html, "property", "og:type"), "article", `${path}: og:type`);
    assert.match(metaContent(html, "property", "article:published_time") ?? "", /^\d{4}-\d{2}-\d{2}T00:00:00\+05:30$/, `${path}: article:published_time`);
    assert.match(metaContent(html, "property", "article:author") ?? "", /^https?:\/\/[^/]+\/about$/, `${path}: article:author`);
    assert.ok(metaContent(html, "property", "article:section"), `${path}: article:section`);

    // The date and the byline are on the page, not only in the tags, and the date is the same day.
    const day = html.match(/<time dateTime="(\d{4}-\d{2}-\d{2})"/)?.[1] ?? html.match(/<time datetime="(\d{4}-\d{2}-\d{2})"/)?.[1];
    assert.ok(day, `${path}: no <time> with a date`);
    assert.equal(metaContent(html, "property", "article:published_time")?.slice(0, 10), day, `${path}: the tag and the page give different days`);
    assert.match(html, /By(?:<!-- -->)? ?(?:<!-- -->)?<a[^>]*rel="author"[^>]*>Infeara Technologies<\/a>/, `${path}: no byline`);

    const types = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) => JSON.parse(match[1])["@type"]);
    assert.ok(types.includes("Article") || types.includes("BlogPosting"), `${path}: no Article data`);
  }

  // No other page calls itself an article.
  for (const path of ["/", "/about", "/services/managed-it", "/blogs", "/insights", "/industries/healthcare"]) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    assert.equal(metaContent(html, "property", "og:type"), "website", path);
    assert.equal(metaContent(html, "property", "article:published_time"), undefined, path);
  }
});

test("a guide's day in the sitemap, on the page and in its Article data is the same India day", async (t) => {
  if (!(await isOpen())) return t.skip("the site is closed, so the sitemap is empty by design");
  const sitemap = await (await fetch(`${baseURL}/sitemap.xml`)).text();
  for (const path of await linkedUnder("/insights", "/insights")) {
    const entry = sitemap.match(new RegExp(`<loc>[^<]*${path}</loc>\\s*<lastmod>([^<]+)</lastmod>`));
    assert.ok(entry, `${path}: no lastmod in the sitemap`);
    const html = await (await fetch(`${baseURL}${path}`)).text();
    const published = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1])).find((d) => d["@type"] === "Article")?.datePublished;
    assert.match(published ?? "", /T00:00:00\+05:30$/, `${path}: datePublished`);
    // The sitemap writes the day as midnight UTC; the page and the Article data write the India day. Same calendar day.
    assert.equal(entry[1].slice(0, 10), published.slice(0, 10), `${path}: sitemap ${entry[1]} and Article ${published} give different days`);
  }
});

test("every public page starts with a skip link that leads to its main content", async () => {
  for (const path of [...publicRoutes, "/this-page-does-not-exist"]) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    const link = html.indexOf('href="#main"');
    assert.ok(link > -1, `${path}: no skip link`);
    assert.match(html.slice(link, link + 400), /Skip to main content/, `${path}: the skip link has no text`);
    assert.ok(link < html.indexOf("<header"), `${path}: the skip link comes after the menu`);
    assert.equal((html.match(/<main\b[^>]*id="main"/g) ?? []).length, 1, `${path}: expected one main landmark with id="main"`);
  }
});

test("no question is asked on the home page and on a service page", async () => {
  const questionsOf = (html) =>
    [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
      .map((match) => JSON.parse(match[1]))
      .filter((data) => data["@type"] === "FAQPage")
      .flatMap((data) => data.mainEntity.map((entry) => entry.name.trim().toLowerCase()));

  const home = questionsOf(await (await fetch(`${baseURL}/`)).text());
  assert.ok(home.length >= 6, `the home page lists ${home.length} questions`);
  for (const path of publicRoutes.filter((p) => p.startsWith("/services/"))) {
    const own = questionsOf(await (await fetch(`${baseURL}${path}`)).text());
    for (const question of own) assert.ok(!home.includes(question), `"${question}" is on the home page and on ${path}`);
    assert.equal(new Set(own).size, own.length, `${path} repeats a question`);
  }
});

test("the thin pages are full pages", async () => {
  // Words in the page's own text, with the menu, footer and scripts left out.
  const wordsOnPage = (html) => {
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    const plain = main.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
    return decodeEntities(plain).split(/\s+/).filter(Boolean).length;
  };
  for (const [path, minimum, questions] of [
    ["/services/managed-it", 1100, 8],
    ["/services/cybersecurity/penetration-testing", 1000, 8],
    ["/services/cybersecurity/vulnerability-assessment", 1000, 8],
    ["/services/cloud-datacenter/cloud-disaster-recovery-business-continuity", 1000, 8],
  ]) {
    const html = await (await fetch(`${baseURL}${path}`)).text();
    const count = wordsOnPage(html);
    assert.ok(count >= minimum, `${path} has ${count} words, expected at least ${minimum}. If this is the live database, run supabase/apply/07-seo-audit-copy.sql`);
    const faq = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1])).find((d) => d["@type"] === "FAQPage");
    assert.ok((faq?.mainEntity.length ?? 0) >= questions, `${path} lists ${faq?.mainEntity.length} questions`);
  }
});

test("llms.txt describes the site for AI tools, and every page it links to exists", async (t) => {
  const response = await fetch(`${baseURL}/llms.txt`);
  if (!(await isOpen())) {
    assert.equal(response.status, 404, "a closed site advertises nothing");
    return t.skip("the site is closed to search engines, so llms.txt is withdrawn");
  }

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/plain/);
  const body = await response.text();
  assert.match(body, /^# Infeara Technologies\n\n> .+/, "a name and a one-paragraph summary open the file");
  assert.match(body, /Chennai, Tamil Nadu, India/);
  assert.doesNotMatch(body, /mailto:|tel:|@[a-z0-9-]+\.(com|in)\b/i, "the site publishes no mailbox or phone number, so llms.txt does not");

  const links = [...body.matchAll(/^- \[[^\]]+\]\((https?:\/\/[^)\s]+)\)/gm)].map((match) => new URL(match[1]));
  assert.ok(links.length >= 50, `only ${links.length} links`);
  assert.equal(new Set(links.map((url) => url.origin)).size, 1, "the links mix hosts");
  for (const required of ["/services/managed-it", "/services/cybersecurity/penetration-testing", "/contact", "/faq", "/sla"]) {
    assert.ok(links.some((url) => url.pathname === required), `llms.txt does not link to ${required}`);
  }
  for (const url of links) {
    const page = await fetch(`${baseURL}${url.pathname}`);
    assert.equal(page.status, 200, `llms.txt links to ${url.pathname}, which returned ${page.status}`);
  }
});

test("admin dashboard pages redirect signed-out visitors to login", async () => {
  const paths = [
    "/admin",
    "/admin/leads",
    "/admin/services",
    "/admin/industries",
    "/admin/users",
    "/admin/audit",
    // Sub-services, blog posts, case studies and white papers, each with its editor, and a filtered list.
    "/admin/subservices",
    "/admin/subservices/new",
    "/admin/blogs",
    "/admin/blogs/new",
    "/admin/blogs?q=zero&status=draft&page=2",
    "/admin/case-studies",
    "/admin/case-studies/new",
    "/admin/white-papers",
    "/admin/white-papers/new",
    "/admin/insights?q=zero&page=2",
  ];
  for (const path of paths) {
    const response = await fetch(`${baseURL}${path}`, { redirect: "manual" });
    assert.ok([307, 308].includes(response.status), `${path} should redirect, got ${response.status}`);
    assert.match(response.headers.get("location") ?? "", /\/admin\/login/);
  }
});

test("admin password reset page opens without a session and stays out of search indexes", async () => {
  const response = await fetch(`${baseURL}/admin/reset-password`, { redirect: "manual" });
  assert.equal(response.status, 200, "the reset page must not redirect signed-out visitors to login");
  const body = await response.text();
  assert.match(body, /<meta name="robots" content="[^"]*noindex/);
  assert.match(body, /<meta name="referrer" content="no-referrer"/);
  assert.match(body, /Reset your password/);
});

test("only the exact password reset path is public under /admin", async () => {
  for (const path of ["/admin/reset-password/extra", "/admin/reset-passwordx"]) {
    const response = await fetch(`${baseURL}${path}`, { redirect: "manual" });
    assert.ok([307, 308].includes(response.status), `${path} should redirect, got ${response.status}`);
    assert.match(response.headers.get("location") ?? "", /\/admin\/login/);
  }
});

test("retired public login route stays gone and contains no mailbox", async () => {
  const response = await fetch(`${baseURL}/login`);
  const body = (await response.text()).toLowerCase();
  assert.equal(response.status, 410);
  assert.match(body, /contact form/);
  assert.doesNotMatch(body, /contact@infeara\.com|mailto:/);
});

test("contact API rejects malformed JSON and invalid fields without writing a lead", async () => {
  const malformed = await fetch(`${baseURL}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.31" },
    body: "not-json",
  });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: "invalid_request" });

  const invalid = await fetch(`${baseURL}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.32" },
    body: JSON.stringify({ name: "X", email: "bad", message: "short", consent: false }),
  });
  assert.equal(invalid.status, 422);
  assert.deepEqual(await invalid.json(), { error: "invalid_fields" });
});

test("contact API silently accepts honeypot hits without attempting delivery", async () => {
  const response = await fetch(`${baseURL}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.33" },
    body: JSON.stringify({ website: "spam bot" }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
