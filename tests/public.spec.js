import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes.js";
import { mockApi } from "./auth.js";
import { checkPage, expectVisibleFocusIndicators } from "./helpers.js";

test.describe("Public pages", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  const pages = [
    ["home", ROUTES.home],
    ["sign-in", ROUTES.signIn],
    ["register", ROUTES.register],
    ["verify", ROUTES.verify],
    ["forgot-password", ROUTES.forgotPassword],
    ...ROUTES.publicExtra.map((p) => [p.replace("/", ""), p]),
  ];

  for (const [name, path] of pages) {
    test(`${name}: layout and accessibility`, async ({ page }, testInfo) => {
      await page.goto(path);
      await checkPage(page, testInfo, name);
    });

    test(`${name}: keyboard focus is visible`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectVisibleFocusIndicators(page);
    });
  }

  test("sign-in form can be completed with the keyboard", async ({ page }) => {
    await page.goto(ROUTES.signIn);
    const email = page.getByLabel(/email/i);
    const password = page.getByLabel(/password/i).first();

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();

    await email.focus();
    await page.keyboard.type("test@example.com");
    await page.keyboard.press("Tab");
    await expect(password).toBeFocused();
    await page.keyboard.type("Password123!");

    const requestPromise = page.waitForRequest(/\/api\/auth\/login/, {
      timeout: 5000,
    });
    await page.keyboard.press("Enter");
    await requestPromise;
  });

  test("sign-in shows an error that is announced", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid credentials" }),
      }),
    );
    await page.goto(ROUTES.signIn);
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page
      .getByLabel(/password/i)
      .first()
      .fill("wrong");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("successful sign-in as a student lands on the dashboard", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 1,
              name: "Test User",
              email: "test@example.com",
              role: "student",
            },
          },
        }),
      }),
    );
    await page.goto(ROUTES.signIn);
    await page.getByLabel(/email/i).fill("test@example.com");
    await page
      .getByLabel(/password/i)
      .first()
      .fill("Password123!");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("mobile menu opens and closes with the keyboard", async ({
    page,
    viewport,
  }) => {
    test.skip(viewport.width >= 768, "mobile menu only");
    await page.goto(ROUTES.home);
    const toggle = page.getByRole("button", { name: /menu/i });
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
