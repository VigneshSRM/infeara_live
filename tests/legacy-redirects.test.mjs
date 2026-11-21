// Unit tests for the old-address map (lib/redirects.ts) and for the Search Console "Not found (404)"
// report of 21 November 2026:
//
//   npm run test:unit
//
//   * the map is well formed: exact addresses only, one hop, 301, nothing sent to the home page by
//     accident, no rule that could never run;
//   * every one of the 49 addresses Google reported has an answer: a page that exists at that
//     address, a redirect to the closest page, or (the two .php addresses) an answer given by Vercel
//     itself before the site is reached;
//   * the answers are the ones the owner was told (notes/search-console-404.md);
//   * the bare domain's rule is wired in front of the map.
//
// No build, no server. lib/redirects.ts only imports a type, so it is compiled in memory with the
// project's own TypeScript. That every destination is a real page that answers 200 is checked
// against a build by tests/http-smoke.test.mjs.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { answeredByThePlatform, reportedNotFound, samePath } from "./fixtures/search-console-404-2026-11-21.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

async function load(path) {
  const { outputText } = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { legacyRedirects } = await load("lib/redirects.ts");
const bySource = new Map(legacyRedirects.map((redirect) => [redirect.source, redirect]));

const reportedPaths = [...new Set(reportedNotFound.map(([address]) => new URL(address).pathname))];

test("the report is the one that was pasted: 49 addresses, 44 on the bare domain and 5 on www, 46 paths", () => {
  assert.equal(reportedNotFound.length, 49);
  assert.equal(new Set(reportedNotFound.map(([address]) => address)).size, 49, "an address is listed twice");

  const hosts = reportedNotFound.map(([address]) => new URL(address).host);
  assert.equal(hosts.filter((host) => host === "infeara.com").length, 44);
  assert.equal(hosts.filter((host) => host === "www.infeara.com").length, 5);
  assert.equal(hosts.filter((host) => host !== "infeara.com" && host !== "www.infeara.com").length, 0);
  assert.ok(reportedNotFound.every(([address]) => address.startsWith("https://")));
  assert.ok(reportedNotFound.every(([, crawled]) => /^2026-\d\d-\d\d$/.test(crawled)));
  assert.equal(reportedPaths.length, 46, "apex and www share three paths");
});

test("every old address is an exact, lower-case path that goes to one place, with a 301", () => {
  assert.ok(legacyRedirects.length >= 66, "the map lost entries");
  assert.equal(bySource.size, legacyRedirects.length, "a source appears twice");

  for (const { source, destination, statusCode } of legacyRedirects) {
    // No ":" or "*": a pattern would send more than the address that was listed.
    assert.match(source, /^\/[a-z0-9][a-z0-9\-/.]*[a-z0-9]$/, `${source} is not an exact lower-case path`);
    assert.doesNotMatch(source, /\/\/|\/$/, `${source} has an empty segment or a trailing slash`);
    assert.ok(destination === "/" || /^\/[a-z0-9][a-z0-9\-/]*[a-z0-9]$/.test(destination), `${source} -> ${destination} is not a path`);
    assert.notEqual(source, destination, `${source} redirects to itself`);
    assert.equal(statusCode, 301, `${source} should be a 301`);
  }
});

test("no old address leads to another old address, so no redirect is more than one hop", () => {
  for (const { source, destination } of legacyRedirects) {
    assert.ok(!bySource.has(destination), `${source} -> ${destination}, which is itself redirected`);
  }
});

test("an old address goes to the home page only when it is the home page under another name", () => {
  const toHome = legacyRedirects.filter((redirect) => redirect.destination === "/").map((redirect) => redirect.source);
  assert.deepEqual(toHome, ["/index.html"], "a page that is gone should go to its closest topic, not the home page");
});

test("no rule is written for an address Vercel answers itself: nothing ending in .php can be redirected from here", () => {
  // Vercel returns 403 for every address that ends in .php, before the request reaches the site.
  // Checked live on 21 November 2026 on www.infeara.com and infeara-live.vercel.app, with a made-up
  // name too. A rule here would never run, so it would only mislead the next person.
  assert.deepEqual(
    legacyRedirects.filter((redirect) => /\.php$/.test(redirect.source)).map((redirect) => redirect.source),
    [],
  );
  for (const path of answeredByThePlatform) {
    assert.ok(path.endsWith(".php"), `${path} is listed as answered by the platform but is not a .php address`);
  }
});

test("pages that exist at the same address are not redirected", () => {
  for (const path of samePath) {
    assert.ok(!bySource.has(path), `${path} is a page and must not be redirected`);
  }
});

test("every address Google reported has an answer", () => {
  const answers = { page: [], redirect: [], platform: [] };
  for (const path of reportedPaths) {
    if (samePath.includes(path)) answers.page.push(path);
    else if (answeredByThePlatform.includes(path)) answers.platform.push(path);
    else if (bySource.has(path)) answers.redirect.push(path);
    else assert.fail(`${path} was reported by Search Console and has no answer: add a redirect, or say why it has none`);
  }
  assert.equal(answers.page.length, 9, "pages that exist at the same address");
  assert.equal(answers.platform.length, 2, "addresses ending in .php");
  assert.equal(answers.redirect.length, 35, "addresses redirected to their closest page");
});

test("the answers are the ones the owner was told", () => {
  const told = {
    "/index.html": "/",
    "/resources": "/insights",
    "/resources/blog": "/blogs",
    "/resources/downloads": "/insights",
    "/resources/case-studies": "/case-studies",
    "/legal/terms-of-service": "/legal/terms",
    "/legal/disclaimer": "/legal/terms",
    "/industries/retail": "/industries/retail-ecommerce",
    "/industries/logistics": "/industries/logistics-transportation",
    "/industries/saas": "/industries",
    "/industries/startups": "/industries",
    "/services/audit-compliance/iso-27001": "/services/cybersecurity",
    "/services/audit-compliance/cloud-audit": "/services/cloud-datacenter",
    "/services/infrastructure/managed-it": "/services/managed-it",
    "/services/infrastructure/network-infrastructure": "/services/network-engineering",
    "/services/infrastructure/outsourcing": "/services/outsourcing-remote-support",
    "/services/ai-automation/workflow-automation": "/services/ai-automations",
    "/services/turnkey/offshore-development": "/services/turnkey-projects",
  };
  for (const [source, destination] of Object.entries(told)) {
    assert.equal(bySource.get(source)?.destination, destination, `${source}`);
  }
});

test("the bare domain's rule comes first and keeps the path; the old addresses follow it", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes('import { legacyRedirects } from "./lib/redirects";'));

  const apex = config.indexOf('has: [{ type: "host", value: "infeara.com" }]');
  const legacy = config.indexOf("...legacyRedirects");
  assert.ok(apex > 0 && legacy > apex, "the bare domain's rule must come before the old addresses");

  const rule = config.slice(config.lastIndexOf("{", apex), config.indexOf("},", apex));
  assert.match(rule, /source: "\/:path\*"/, "the rule must match every path");
  assert.match(rule, /destination: "https:\/\/www\.infeara\.com\/:path\*"/, "the rule must keep the path");
  assert.match(rule, /permanent: true/);
});

test("the notes say what each reported address does, and what is left for DNS", () => {
  assert.ok(existsSync(new URL("../notes/search-console-404.md", import.meta.url)), "notes/search-console-404.md is missing");
  const note = read("notes/search-console-404.md");

  for (const path of reportedPaths) {
    assert.ok(note.includes(`\`${path}\``), `the note does not mention ${path}`);
  }
  assert.match(note, /Hostinger/);
  assert.match(note, /216\.198\.79\.1/);
  assert.match(note, /\.php/);
  assert.match(note, /TXT/);

  const readme = read("README.md");
  assert.ok(readme.includes("notes/search-console-404.md"), "the README does not point to the Search Console note");
  assert.ok(readme.includes("tests/legacy-redirects.test.mjs"), "the README does not name the redirect test");
});
