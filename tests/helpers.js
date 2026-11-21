import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Axe scan (WCAG 2.0/2.1 A + AA): names, labels, contrast, ARIA. */
export async function expectNoA11yViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const summary = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    elements: v.nodes.map((n) => n.target.join(" ")),
  }));
  expect(summary, "accessibility violations").toEqual([]);
}

/** No sideways scrolling at the current viewport width. */
export async function expectNoHorizontalOverflow(page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, "page is wider than the viewport").toBeLessThanOrEqual(
    innerWidth,
  );
}

/** No visible interactive control sticks out past the right edge of the viewport. */
export async function expectControlsInsideViewport(page) {
  const offenders = await page.evaluate(() => {
    const vw = window.innerWidth;
    const sel =
      "a[href], button, input, select, textarea, [role='button'], [tabindex]";
    return [...document.querySelectorAll(sel)]
      .filter((el) => {
        if (el.closest("[aria-hidden='true'], [inert]")) return false;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const visible =
          r.width > 0 &&
          r.height > 0 &&
          cs.visibility !== "hidden" &&
          cs.display !== "none";
        // Off the right edge = real overflow. Off the left edge = a closed drawer.
        return visible && r.right > vw + 1 && r.left < vw;
      })
      .map(
        (el) =>
          `${el.tagName.toLowerCase()} "${(
            el.innerText ||
            el.getAttribute("aria-label") ||
            ""
          )
            .trim()
            .slice(0, 30)}"`,
      );
  });
  expect(offenders, "controls sticking out past the right edge").toEqual([]);
}
/** Tab through the page; every focused element must show an outline or ring. */
export async function expectVisibleFocusIndicators(page, maxTabs = 40) {
  const missing = [];
  const seen = new Set();

  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const outline =
        cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
      const shadow = cs.boxShadow !== "none";
      const label = (
        el.innerText ||
        el.getAttribute("aria-label") ||
        el.getAttribute("name") ||
        ""
      )
        .trim()
        .slice(0, 30);
      return {
        id: `${el.tagName}|${label}|${el.className}`,
        desc: `${el.tagName.toLowerCase()} "${label}"`,
        ok: outline || shadow,
      };
    });
    if (!info) continue;
    if (seen.has(info.id)) break;
    seen.add(info.id);
    if (!info.ok) missing.push(info.desc);
  }
  expect(missing, "focused elements with no visible focus indicator").toEqual(
    [],
  );
}

/** Attach a full-page screenshot to the report. */
export async function attachScreenshot(page, testInfo, name) {
  const body = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body, contentType: "image/png" });
}

/** Run every layout + a11y check on the current page. */
/** Run every layout + a11y check on the current page. */
export async function checkPage(page, testInfo, name) {
  await page.waitForLoadState("networkidle");
  await page
    .locator("main")
    .first()
    .waitFor({ state: "visible", timeout: 10000 });

  const text = (await page.locator("body").innerText()).trim();
  expect(text.length, "page looks blank").toBeGreaterThan(20);

  const crashed = await page.getByText("This page could not load").count();
  expect(crashed, "page hit the error boundary (mock data problem)").toBe(0);

  await attachScreenshot(page, testInfo, name);
  await expectNoHorizontalOverflow(page);
  await expectControlsInsideViewport(page);
  await expectNoA11yViolations(page);
}
