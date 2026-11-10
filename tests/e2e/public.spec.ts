import { expect, test } from "@playwright/test";
import { formatPostDate, listBlogPosts } from "../../lib/content/blogs";

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
  // Read from the content module, so replacing the starter posts does not break this list.
  ...listBlogPosts().map((post) => `/blogs/${post.slug}`),
  "/white-papers",
  "/legal/privacy-policy",
  "/legal/terms",
  "/legal/cookies",
];

for (const route of publicRoutes) {
  test(`public page renders: ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test("service header exposes the new AI and application subservice links", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.locator('nav[aria-label="Primary"]');
  const servicesSummary = primaryNav.locator(":scope > details > summary").filter({ hasText: /^Services$/ });
  const servicesMenu = servicesSummary.locator("xpath=..");
  await servicesSummary.click();

  const aiSummary = servicesMenu.locator("details > summary").filter({ hasText: /^AI Automations/ });
  const aiMenu = aiSummary.locator("xpath=..");
  await aiSummary.click();
  await expect(aiMenu.getByRole("link", { name: "AI ChatBot Development" })).toBeVisible();
  await expect(aiMenu.getByRole("link", { name: "AI Callers Development" })).toBeVisible();
  await expect(aiMenu.getByRole("link", { name: "LLM Development" })).toBeVisible();
  await expect(aiMenu.getByRole("link", { name: "IT Infrastructure AI Automations" })).toBeVisible();

  const appSummary = servicesMenu.locator("details > summary").filter({ hasText: /^Application Development/ });
  const appMenu = appSummary.locator("xpath=..");
  await appSummary.click();
  await expect(appMenu.getByRole("link", { name: "Web Application Development" })).toBeVisible();
  await expect(appMenu.getByRole("link", { name: "Website Development" })).toBeVisible();
  await expect(appMenu.getByRole("link", { name: "Mobile Application Development" })).toBeVisible();
});

test("Technical resources opens a menu of Insights, Blogs, Case Studies and White Papers", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.locator('nav[aria-label="Primary"]');
  const summary = primaryNav.locator(":scope > details > summary").filter({ hasText: /^Technical resources$/ });
  const menu = summary.locator("xpath=..");
  await summary.click();

  const expected = [
    ["Insights", "/insights"],
    ["Blogs", "/blogs"],
    ["Case Studies", "/case-studies"],
    ["White Papers", "/white-papers"],
  ];
  for (const [name, href] of expected) {
    const link = menu.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }
  // Exactly those four: no closing "overview" link, because there is no hub page to open.
  await expect(menu.getByRole("link")).toHaveCount(expected.length);

  await menu.getByRole("link", { name: "Blogs", exact: true }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.locator("h1")).toHaveText("Short posts on IT, security and software.");
});

test("the other menus keep their closing link", async ({ page }) => {
  await page.goto("/");
  const primaryNav = page.locator('nav[aria-label="Primary"]');
  for (const [label, closing, href] of [
    ["About", "About Infeara", "/about"],
    ["Services", "All services", "/services"],
    ["Industries", "All industries", "/industries"],
  ]) {
    const summary = primaryNav.locator(":scope > details > summary").filter({ hasText: new RegExp(`^${label}$`) });
    await summary.click();
    await expect(summary.locator("xpath=..").getByRole("link", { name: closing, exact: true })).toHaveAttribute("href", href);
  }
});

test("on a phone, the menu lists the Technical resources pages and each one opens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuSummary = page.locator("header summary").filter({ hasText: "Open menu" });
  const menu = menuSummary.locator("xpath=..");
  await menuSummary.click();
  await menu.locator("summary").filter({ hasText: /^Technical resources/ }).click();

  for (const name of ["Insights", "Blogs", "Case Studies", "White Papers"]) {
    await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
  }

  await menu.getByRole("link", { name: "White Papers", exact: true }).click();
  await expect(page).toHaveURL(/\/white-papers$/);
  await expect(page.locator("h1")).toHaveText("In-depth papers, published when they are ready.");
});

test("the blog lists its posts, and a post shows its date, services and a way back", async ({ page }) => {
  const [latest, ...others] = listBlogPosts();

  await page.goto("/blogs");
  await expect(page.getByRole("link", { name: "Read post" })).toHaveAttribute("href", `/blogs/${latest.slug}`);
  for (const post of others) {
    await expect(page.locator(`main a[href="/blogs/${post.slug}"]`)).toBeVisible();
  }

  await page.getByRole("link", { name: "Read post" }).click();
  await expect(page).toHaveURL(new RegExp(`/blogs/${latest.slug}$`));
  await expect(page.locator("h1")).toHaveText(latest.title);
  await expect(page.locator("time").first()).toHaveAttribute("datetime", latest.publishedAt);
  await expect(page.locator("time").first()).toHaveText(formatPostDate(latest.publishedAt));
  await expect(page.locator("main a[href^='/services/']").first()).toBeVisible();
  await expect(page.locator('nav[aria-label="Breadcrumb"]').getByRole("link", { name: "Blogs" })).toHaveAttribute("href", "/blogs");
});

test("an address under /blogs that is not a post is a 404", async ({ page }) => {
  const response = await page.goto("/blogs/this-post-does-not-exist");
  expect(response?.status()).toBe(404);
});

test("the white papers page says plainly that none are published, and offers somewhere to read", async ({ page }) => {
  await page.goto("/white-papers");
  await expect(page.locator("main")).toContainText("We have not published any white papers yet");
  for (const href of ["/insights", "/blogs", "/case-studies"]) {
    await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
  }
});

test("contact form validates required fields and offers all new service interests", async ({ page }) => {
  await page.goto("/contact");
  const consentDialog = page.getByRole("dialog", { name: "Analytics cookies are optional" });
  if (await consentDialog.isVisible()) await consentDialog.getByRole("button", { name: "Essential only" }).click();

  const form = page.locator("form").filter({ has: page.getByLabel("What are you running, and what needs to change?") });
  const submittedRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/contact") && request.method() === "POST") submittedRequests.push(request.url());
  });

  await form.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Please add a little more detail (at least 20 characters)." )).toBeVisible();
  await expect(page.getByText("Please confirm you understand how your details are used.")).toBeVisible();
  expect(submittedRequests).toHaveLength(0);

  const interest = form.getByLabel("What is this about?");
  for (const label of [
    "AI ChatBot Development",
    "AI Callers Development",
    "LLM Development",
    "IT Infrastructure AI Automations",
    "Web Application Development",
    "Website Development",
    "Mobile Application Development",
  ]) {
    await interest.selectOption({ label });
    await expect(interest).toHaveValue(label);
  }
});

test("cookie consent choice is stored and can be changed", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Analytics cookies are optional" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Essential only" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("infeara-consent"))).toBe("essential");

  await page.goto("/legal/cookies");
  await page.getByRole("button", { name: "Change my choice" }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Allow analytics" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("infeara-consent"))).toBe("granted");
});

test("public contact surfaces use forms, not a published company email", async ({ page }) => {
  for (const route of ["/", "/contact", "/about", "/sla", "/careers", "/careers/opportunities", "/legal/privacy-policy", "/legal/cookies"]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText("contact@infeara.com");
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  }
});
