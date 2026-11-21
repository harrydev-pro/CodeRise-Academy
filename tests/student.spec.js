import { test } from "@playwright/test";
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
});
