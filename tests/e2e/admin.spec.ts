import { expect, test, type Page } from "@playwright/test";

function isExplicitIsolatedAdminTarget() {
  const configuredURL = process.env.PLAYWRIGHT_BASE_URL;
  const expectedHost = process.env.PLAYWRIGHT_ADMIN_TEST_HOST?.toLowerCase();
  if (!configuredURL || process.env.PLAYWRIGHT_ADMIN_ISOLATED_TEST !== "true" || !expectedHost) return false;

  try {
    const actualHost = new URL(configuredURL).hostname.toLowerCase();
    const isProductionHost = actualHost === "infeara.com" || actualHost.endsWith(".infeara.com");
    return !isProductionHost && actualHost === expectedHost;
  } catch {
    return false;
  }
}

const protectedRoutes = [
  "/admin",
  "/admin/account",
  "/admin/audit",
  "/admin/blogs",
  "/admin/blogs/new",
  "/admin/case-studies",
  "/admin/case-studies/new",
  "/admin/faqs",
  "/admin/industries",
  "/admin/insights",
  "/admin/leads",
  "/admin/legal",
  "/admin/media",
  "/admin/services",
  "/admin/subservices",
  "/admin/subservices/new",
  "/admin/users",
  "/admin/white-papers",
  "/admin/white-papers/new",
];

for (const route of protectedRoutes) {
  test(`admin access is protected when signed out: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login(?:\?.*)?$/);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
}

test("admin login shows a safe setup state when Supabase is not configured", async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), "This check targets the isolated local test server.");
  await page.goto("/admin/login");
  await expect(page.getByText("Supabase is not configured for this environment.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
});

test("admin login links to the password reset page, which opens without a session", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/admin\/reset-password$/);
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to sign in" })).toBeVisible();
});

test("password reset shows a safe setup state when Supabase is not configured", async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), "This check targets the isolated local test server.");
  await page.goto("/admin/reset-password");
  await expect(page.getByText("Supabase is not configured for this environment.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeDisabled();
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
}

const roles = [
  {
    role: "super admin",
    email: process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL,
    password: process.env.PLAYWRIGHT_SUPER_ADMIN_PASSWORD,
  },
  {
    role: "editor",
    email: process.env.PLAYWRIGHT_EDITOR_EMAIL,
    password: process.env.PLAYWRIGHT_EDITOR_PASSWORD,
  },
  {
    role: "SEO manager",
    email: process.env.PLAYWRIGHT_SEO_MANAGER_EMAIL,
    password: process.env.PLAYWRIGHT_SEO_MANAGER_PASSWORD,
  },
];

for (const account of roles) {
  test(`authenticated admin navigation and permissions: ${account.role}`, async ({ page }) => {
    test.skip(
      !isExplicitIsolatedAdminTarget() || !account.email || !account.password,
      `Requires an explicitly identified isolated test host (PLAYWRIGHT_BASE_URL, PLAYWRIGHT_ADMIN_TEST_HOST, PLAYWRIGHT_ADMIN_ISOLATED_TEST=true) and ${account.role} credentials. Production Infeara hosts are blocked.`,
    );

    await signIn(page, account.email!, account.password!);
    const adminNav = page.getByRole("navigation", { name: "Admin" });
    await expect(adminNav.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: "Leads" })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: "Services" })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: "Audit log" })).toBeVisible();

    if (account.role === "super admin") {
      await expect(adminNav.getByRole("link", { name: "Users" })).toBeVisible();
      await page.goto("/admin/users");
      await expect(page).toHaveURL(/\/admin\/users$/);
    } else {
      await expect(adminNav.getByRole("link", { name: "Users" })).toHaveCount(0);
      await page.goto("/admin/users");
      await expect(page).toHaveURL(/\/admin\?denied=super_admin$/);
      await expect(page.getByRole("status")).toContainText("Only a super admin can manage users");
    }

    await page.goto("/admin/services");
    if (account.role === "editor") {
      await expect(page.getByRole("link", { name: "New practice" })).toBeVisible();
    }
    if (account.role === "SEO manager") {
      await expect(page.getByRole("link", { name: "New practice" })).toHaveCount(0);
      const firstPractice = page.locator("tbody tr a").first();
      await expect(firstPractice).toBeVisible();
      await firstPractice.click();
      await expect(page.getByLabel("SEO title")).toBeVisible();
      await expect(page.getByLabel("Name")).toHaveCount(0);
    }
  });
}

test("super admin can create, edit and delete an isolated draft practice", async ({ page }) => {
  const email = process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL;
  const password = process.env.PLAYWRIGHT_SUPER_ADMIN_PASSWORD;
  test.skip(
    !isExplicitIsolatedAdminTarget() || !email || !password || process.env.PLAYWRIGHT_ADMIN_ALLOW_MUTATIONS !== "true",
    "Requires an explicitly identified isolated Supabase test host, super-admin credentials, and PLAYWRIGHT_ADMIN_ALLOW_MUTATIONS=true. Production Infeara hosts are blocked.",
  );

  await signIn(page, email!, password!);
  const slug = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const name = `Playwright draft ${slug}`;
  let created = false;

  try {
    await page.goto("/admin/services/new");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Summary").fill("Temporary draft created by the opt-in Playwright admin test.");
    await page.getByRole("button", { name: "Create practice" }).click();
    await expect(page).toHaveURL(/\/admin\/services\?saved=created$/);
    created = true;

    await page.getByRole("link", { name }).click();
    await page.getByLabel("Tagline").fill("Edited by the Playwright test.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/admin\/services\?saved=updated$/);

    await page.getByRole("link", { name }).click();
    await expect(page.getByLabel("Tagline")).toHaveValue("Edited by the Playwright test.");
  } finally {
    if (created) {
      await page.goto("/admin/services");
      const createdLink = page.getByRole("link", { name });
      if (await createdLink.count()) {
        await createdLink.click();
        page.once("dialog", (dialog) => dialog.accept());
        await page.getByRole("button", { name: "Delete practice" }).click();
        await expect(page).toHaveURL(/\/admin\/services\?deleted=1$/);
      }
    }
  }
});
