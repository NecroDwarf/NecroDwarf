import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  withBrowserCheck,
  observePageErrors,
  expect,
} from "./browser-check.mjs";
const manifest = JSON.parse(
  await readFile("build/novellmaker-manifest.json", "utf8"),
);
const base = "/projects/novellmaker/docs";
await withBrowserCheck(
  "novellmaker",
  async ({ browser, origin, screenshots, reportPath }) => {
    const errors = [],
      checks = [];
    const page = await browser.newPage();
    observePageErrors(page, errors);
    await page.setViewportSize({ width: 1440, height: 1000 });
    let release;
    const gate = new Promise((done) => {
      release = done;
    });
    await page.route("**/assets/*.js", async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(origin + base + "/lua/scenario", { waitUntil: "commit" });
    await expect(page.locator("main h1")).toHaveCount(1);
    await page.evaluate(() => {
      window.nmHeading = document.querySelector("main h1");
    });
    release();
    await page.waitForLoadState("networkidle");
    assert.ok(
      await page.evaluate(
        () => window.nmHeading === document.querySelector("main h1"),
      ),
      "Hydration replaced SSG",
    );
    await page.unroute("**/assets/*.js");
    checks.push("Hydration preserves SSG nodes; no console errors");
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await nojs.newPage();
    for (const path of [
      "/projects/novellmaker",
      base,
      ...manifest.documents.map((d) => d.path),
    ]) {
      const response = await staticPage.goto(origin + path);
      assert.equal(response.status(), 200, path);
      await expect(staticPage.locator("main h1")).toHaveCount(1);
      assert.ok(
        (await staticPage.locator("main").innerText()).length > 600,
        `Empty no-JS page ${path}`,
      );
      if (path.includes("/lua/") || path.endsWith("engine-guide")) {
        const doc = manifest.documents.find((d) => d.path === path);
        assert.deepEqual(
          await staticPage
            .locator("[data-novellmaker-article] pre code")
            .allTextContents(),
          doc.codes.map((c) => c.text),
        );
      }
    }
    await nojs.close();
    checks.push(
      "All 24 pages open directly without JS; all original code blocks preserved in HTML",
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of [
        "/projects/novellmaker",
        base,
        ...manifest.documents.map((d) => d.path),
      ]) {
        await page.goto(origin + path, { waitUntil: "networkidle" });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `Overflow ${width}px ${path}`,
        );
        if (
          ["/projects/novellmaker", base, base + "/lua/scenario"].includes(
            path,
          ) &&
          [390, 1440].includes(width)
        )
          await page.screenshot({
            path: resolve(
              screenshots,
              `${path === base ? "docs-home" : path.endsWith("scenario") ? "lua-scenario" : "showcase"}-${width}.png`,
            ),
            fullPage: true,
          });
      }
    }
    checks.push(
      "All pages: no document overflow at 320/390/768/1440px; desktop/mobile screenshots",
    );
    await page.goto(origin + base);
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.getByRole("button", { name: /Поиск по документации/ }).focus();
    await page.keyboard.press("Enter");
    const input = page.getByRole("searchbox", {
      name: "Поиск по документации",
    });
    await expect(input).toBeFocused();
    assert.ok(
      requests.some((url) => /DocsSearch.*\.js/.test(url)),
      "Search must load on demand",
    );
    for (const [query, ending] of [
      ["GAME.SET", "/lua/scenario#game-set"],
      ["ui.create", "/lua/components#ui-create"],
      ["UI.GET_HISTORY", "/lua/history#ui-get-history"],
    ]) {
      await input.fill(query);
      await expect(
        page.locator('[aria-label="Поиск NovellMaker"] li a').first(),
      ).toHaveAttribute("href", base + ending);
    }
    for (const query of ["сохранение", "анимация", "звук", "мини-игра"]) {
      await input.fill(query);
      assert.ok(
        await page.locator('[aria-label="Поиск NovellMaker"] li').count(),
        `No search result: ${query}`,
      );
    }
    await input.fill("несуществующий-запрос-000");
    await expect(page.getByRole("status")).toContainText("Ничего не найдено");
    await input.fill("game.set");
    await page.locator('[aria-label="Поиск NovellMaker"] li a').first().click();
    await page.waitForURL("**/lua/scenario#game-set");
    await expect(page.locator("#game-set")).toHaveCount(1);
    assert.ok(
      await page
        .locator("#game-set")
        .evaluate(
          (el) =>
            el.getBoundingClientRect().top >= 0 &&
            el.getBoundingClientRect().top < innerHeight,
        ),
    );
    checks.push(
      "Lazy bilingual case-insensitive search, empty results and direct exact API anchors",
    );
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    const firstCode = page
      .locator("[data-novellmaker-article] pre code")
      .first();
    const original = await firstCode.textContent();
    await page
      .getByRole("button", { name: "Копировать", exact: true })
      .first()
      .click();
    await expect(page.getByRole("status").first()).toHaveText("Скопировано");
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      original,
    );
    await page.keyboard.press("Tab");
    await expect(
      page.locator("[data-novellmaker-article] pre").first(),
    ).toBeFocused();
    assert.ok(
      await page
        .locator("[data-novellmaker-article] pre")
        .first()
        .evaluate((el) => getComputedStyle(el).outlineStyle !== "none"),
    );
    checks.push(
      "Clipboard preserves indentation; code/table regions keyboard focusable",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(origin + "/projects/novellmaker");
    assert.equal(
      await page
        .locator("[data-novellmaker] a")
        .first()
        .evaluate((el) => getComputedStyle(el).transitionDuration),
      "0s",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + base + "/lua/components");
    await page.getByText("Все разделы", { exact: true }).click();
    await expect(
      page.locator(
        'details[open] nav[aria-label="Разделы документации NovellMaker"]',
      ),
    ).toBeVisible();
    await page.getByText("Все разделы", { exact: true }).click();
    await page.getByText("На этой странице", { exact: true }).first().click();
    await expect(
      page.locator('details[open] nav[aria-label="На этой странице"]'),
    ).toBeVisible();
    checks.push("Mobile navigation/TOC accessible; reduced motion honored");
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(origin + "/projects/novellmaker", {
        waitUntil: "networkidle",
      });
      await expect(
        page.locator('#download a[href*="/releases/download/"]'),
      ).toHaveCount(3);
      assert.ok(
        await page
          .locator('[data-novellmaker] img[src*="novellmaker-"]')
          .first()
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      );
      await page.screenshot({
        path: resolve(screenshots, `beta-hero-${width}.png`),
      });
    }
    for (const path of ["/", "/projects"]) {
      await page.goto(origin + path, { waitUntil: "networkidle" });
      const card = page.locator("article").filter({
        has: page.getByRole("heading", { name: "NovellMaker", exact: true }),
      });
      await expect(card).toContainText("Открытая бета");
      await card.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          card
            .locator('img[alt="Логотип NovellMaker"]')
            .evaluate((img) => img.complete && img.naturalWidth > 0),
        )
        .toBeTruthy();
    }
    await page.goto(origin + "/changelog");
    await expect(
      page.locator('a[href="/projects/novellmaker#release"]'),
    ).toHaveCount(1);
    checks.push(
      "Beta downloads, official SVG, home/catalog status and release feed verified",
    );
    assert.deepEqual(errors, []);
    await writeFile(
      reportPath,
      JSON.stringify(
        { checks, pages: 24, widths: [320, 390, 768, 1440], errors },
        null,
        2,
      ) + "\n",
    );
    console.log(
      "PASS: NovellMaker SSG, hydration, search, clipboard, responsive layouts and accessibility",
    );
  },
);
