import { expect, test } from "@playwright/test";

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
