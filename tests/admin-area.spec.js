import { test } from "@playwright/test";
import { ROUTES } from "./routes.js";
import { loginAs } from "./auth.js";
import { checkPage, expectVisibleFocusIndicators } from "./helpers.js";

test.describe("Admin area", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  for (const path of ROUTES.admin) {
    test(`${path}: layout and accessibility`, async ({ page }, testInfo) => {
      await page.goto(path);
      await checkPage(page, testInfo, `admin${path.replace(/\//g, "-")}`);
    });

    test(`${path}: keyboard focus is visible`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectVisibleFocusIndicators(page);
    });
  }
});
