import { test } from "@playwright/test";
import { loginAs } from "./auth.js";

test("debug: what does /dashboard show?", async ({ page }, testInfo) => {
  const logs = [];
  page.on("console", (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
  page.on("requestfailed", (r) => logs.push(`[requestfailed] ${r.url()}`));
  page.on("response", (r) => {
    if (r.url().includes("/api/"))
      logs.push(`[api] ${r.status()} ${r.request().method()} ${r.url()}`);
  });

  await loginAs(page, "student");
  await page.goto("/dashboard");
  await page.waitForTimeout(4000);

  console.log("FINAL URL:", page.url());
  console.log(
    "BODY TEXT:",
    (await page.locator("body").innerText()).slice(0, 300),
  );
  console.log("HAS <main>:", await page.locator("main").count());
  console.log(logs.join("\n"));

  await testInfo.attach("debug", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});
