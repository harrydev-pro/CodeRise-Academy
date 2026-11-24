import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes.js";
import { loginAs } from "./auth.js";
import { checkPage, expectVisibleFocusIndicators } from "./helpers.js";

test.describe("Student area", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "student");
  });

  for (const path of ROUTES.student) {
    test(`${path}: layout and accessibility`, async ({ page }, testInfo) => {
      await page.goto(path);
      await checkPage(page, testInfo, `student${path.replace(/\//g, "-")}`);
    });

    test(`${path}: keyboard focus is visible`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectVisibleFocusIndicators(page);
    });
  }

  test("signing out returns home with public auth actions", async ({
    page,
    viewport,
  }) => {
    let authenticated = true;

    await page.route("**/api/auth/csrf", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ csrfToken: "test-csrf-token" }),
      }),
    );
    await page.route("**/api/auth/me", (route) =>
      authenticated
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                user: {
                  id: 1,
                  name: "Test Student",
                  fullName: "Test Student",
                  email: "student@example.com",
                  role: "student",
                },
              },
            }),
          })
        : route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ message: "Not authenticated" }),
          }),
    );
    await page.route("**/api/auth/logout", (route) => {
      authenticated = false;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/dashboard");
    if (viewport.width < 1024) {
      await page.getByRole("button", { name: "Open navigation" }).click();
    }
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");

    if (viewport.width < 1024) {
      await page.getByRole("button", { name: "Open menu" }).click();
    }
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create account", exact: true }),
    ).toBeVisible();
  });
});
