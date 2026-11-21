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
