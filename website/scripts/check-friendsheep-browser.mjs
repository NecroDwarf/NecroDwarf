import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import {
  withBrowserCheck,
  observePageErrors,
  expect,
} from "./browser-check.mjs";

const path = "/projects/friendsheep";
const sectionIds = [
  "why",
  "how-it-works",
  "features",
  "interface",
  "roadmap",
  "team",
];

await withBrowserCheck(
  "friendsheep",
  async ({ browser, origin, screenshots, reportPath }) => {
    const errors = [],
      checks = [],
      requests = [];
    const page = await browser.newPage();
    observePageErrors(page, errors);
    page.on("request", (request) => requests.push(request.url()));
    // Текст SSG должен появиться до загрузки JS, а гидратация — сохранить узел.
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/assets/*.js", async (route) => {
      await gate;
      await route.continue();
    });
    const response = await page.goto(origin + path, { waitUntil: "commit" });
    assert.equal(response.status(), 200);
    await expect(page.locator("main h1")).toHaveCount(1);
    await page.evaluate(() => {
      window.ssgHeading = document.querySelector("main h1");
    });
    release();
    await page.waitForLoadState("networkidle");
    assert.equal(
      await page.evaluate(
        () => window.ssgHeading === document.querySelector("main h1"),
      ),
      true,
    );
    await page.unroute("**/assets/*.js");
    await expect(page).toHaveTitle("FriendSheep — NecroDwarf");
    assert.match(
      await page.locator('meta[name="description"]').getAttribute("content"),
      /встречи друзей, концерты, лекции и учебные события/,
    );
    for (const id of sectionIds)
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator('img[alt^="Логотип FriendSheep"]')).toBeVisible();
    assert.equal(
      await page
        .locator('img[alt^="Логотип FriendSheep"]')
        .evaluate((img) => img.complete && img.naturalWidth === 160),
      true,
    );
    const imageSources = JSON.parse(
      await readFile(
        "src/app/projects/friendsheep/assets/screenshots/sources.json",
        "utf8",
      ),
    );
    let previewBytes = 0;
    for (const source of imageSources.images) {
      const full = await readFile(
        `src/app/projects/friendsheep/assets/screenshots/${source.full}`,
      );
      const preview = await readFile(
        `src/app/projects/friendsheep/assets/screenshots/${source.preview}`,
      );
      assert.equal(
        createHash("sha256").update(full).digest("hex"),
        source.sourceSha256,
      );
      assert.equal(
        createHash("sha256").update(preview).digest("hex"),
        source.previewSha256,
      );
      previewBytes += preview.length;
    }
    assert.ok(
      previewBytes < 150000,
      "Превью скриншотов должны оставаться лёгкими",
    );
    await expect(page.locator("[data-project-screenshot]")).toHaveCount(5);
    await expect(
      page.locator("#interface [data-project-screenshot]"),
    ).toHaveCount(3);
    const imageLinks = await page
      .locator("[data-project-screenshot]")
      .evaluateAll((links) =>
        links.map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
      );
    for (const link of imageLinks) {
      assert.equal(new URL(link.href).origin, origin);
      assert.equal(link.target, "_blank");
      assert.ok(
        link.rel.includes("noopener") && link.rel.includes("noreferrer"),
      );
    }
    for (const url of new Set(imageLinks.map((link) => link.href))) {
      const response = await page.request.get(url);
      assert.equal(response.status(), 200);
      assert.match(response.headers()["content-type"], /image\/png/);
    }
    checks.push(
      "Подлинные PNG из диплома, совпадение хешей, лёгкие WebP-превью и просмотр полного размера",
    );
    const externals = await page
      .locator("[data-friendsheep] a[href^='https:']")
      .evaluateAll((anchors) =>
        anchors.map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
      );
    assert.equal(externals.length, 3);
    assert.equal(
      externals.filter((link) => link.href === "https://friendsheep.ru/")
        .length,
      2,
    );
    const roadmapLinks = externals.filter(
      (link) => new URL(link.href).hostname === "github.com",
    );
    assert.equal(roadmapLinks.length, 1);
    assert.equal(
      new URL(roadmapLinks[0].href).pathname,
      "/doflare123/FriendSheep/blob/main-v2/backend/docs/ROUTES_EXPANSION_PLAN.ru.md",
    );
    for (const link of externals) {
      assert.ok(
        ["github.com", "friendsheep.ru"].includes(new URL(link.href).hostname),
      );
      assert.equal(link.target, "_blank");
      assert.ok(
        link.rel.includes("noopener") && link.rel.includes("noreferrer"),
      );
    }
    await expect(
      page.locator(
        "[data-friendsheep] input, [data-friendsheep] form, [data-friendsheep] button",
      ),
    ).toHaveCount(0);
    assert.ok(
      !requests.some((url) => /friendsheep\.ru|\/api\//.test(url)),
      "Страница не должна обращаться к API продукта",
    );
    checks.push(
      "Прямой URL, SEO, настоящий логотип, внешние ссылки, SSG и гидратация без замены h1",
    );

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
      await page.goto(origin + path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page
        .locator("[data-project-screenshot] img")
        .all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img) => img.decode());
      }
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${width}px: горизонтальное переполнение`,
      );
      const clipped = await page
        .locator("[data-friendsheep] a")
        .evaluateAll((anchors) =>
          anchors
            .filter((a) => a.getBoundingClientRect().height < 44)
            .map((a) => a.textContent),
        );
      assert.deepEqual(clipped, [], `${width}px: области нажатия`);
      await page.screenshot({
        path: resolve(screenshots, `${width}.png`),
        fullPage: true,
      });
      await page.screenshot({
        path: resolve(screenshots, `${width}-hero.png`),
      });
      checks.push(`${width}px: нет переполнения, ссылки от 44px, скриншот`);
    }
    for (const id of ["why", "features", "interface", "roadmap"]) {
      await page
        .getByRole("navigation", { name: "Разделы FriendSheep" })
        .locator(`a[href$="#${id}"]`)
        .click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
    await page.goto(origin + path);
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "К содержанию", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.locator('[data-friendsheep] a[href="/projects"]').first(),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Как это работает", exact: true }),
    ).toBeFocused();
    assert.equal(
      await page
        .locator(":focus")
        .evaluate((a) => getComputedStyle(a).outlineColor),
      "rgb(131, 197, 237)",
    );
    await page.keyboard.press("Enter");
    await expect(page.locator("#how-it-works")).toBeInViewport();
    checks.push(
      "Якоря, skip-link, клавиатурный фокус и локальный синий outline",
    );

    // Переходы SPA проверяют удаление локальных стилей вместе со страницей.
    await page
      .locator('[data-friendsheep] a[href="/projects"]')
      .first()
      .click();
    await page.locator('main a[href="/projects/novellmaker"]').click();
    await expect(page.locator("main h1")).toHaveText(
      "Создавайте истории, которые оживают.",
    );
    await expect(page.locator("[data-friendsheep]")).toHaveCount(0);
    assert.equal(
      await page
        .locator(":root")
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue("--jade").trim(),
        ),
      "#00a86b",
    );
    assert.equal(
      await page.locator("body").evaluate((el) => getComputedStyle(el).color),
      "rgb(231, 226, 212)",
    );
    await page.goto(origin + "/projects/maniac");
    await expect(page.locator("main h1")).toHaveText("Maniac");
    await expect(page.locator("[data-friendsheep]")).toHaveCount(0);
    assert.equal(
      await page
        .locator(":root")
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue("--jade").trim(),
        ),
      "#00a86b",
    );
    checks.push(
      "Навигация SPA в NovellMaker и прямой Maniac: тема студии сохранена",
    );

    const noJS = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const staticPage = await noJS.newPage();
    await staticPage.goto(origin + path);
    for (const id of sectionIds)
      await expect(staticPage.locator(`#${id} h2`).first()).toBeVisible();
    await expect(staticPage.getByText(/Серверная основа готова/)).toBeVisible();
    await expect(
      staticPage.getByRole("heading", { name: "Лента событий", exact: true }),
    ).toBeVisible();
    assert.doesNotMatch(
      await staticPage.locator("[data-friendsheep]").innerText(),
      /Из диплома|из диплома|Рисунок (?:20|П1\.)|Реальные изображения интерфейса|возможности подтверждены|не означает публичного выпуска/,
    );
    await staticPage
      .getByRole("link", { name: "Как это работает", exact: true })
      .click();
    await expect(staticPage.locator("#how-it-works")).toBeInViewport();
    await noJS.close();
    checks.push("Все основные тексты и якоря доступны без JavaScript");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(origin + path);
    assert.equal(
      await page
        .locator("[data-friendsheep] a")
        .first()
        .evaluate((el) => getComputedStyle(el).transitionDuration),
      "0s",
    );
    checks.push("prefers-reduced-motion");

    const chunks = JSON.parse(
      await readFile(".ssg/client-modules.json", "utf8"),
    );
    const main = Object.keys(chunks).find((file) =>
      chunks[file].modules.includes("src/main.tsx"),
    );
    const entry = Object.keys(chunks).find((file) =>
      chunks[file].modules.some((m) =>
        m.endsWith("friendsheep/pages/FriendSheepPage.tsx"),
      ),
    );
    const initial = new Set();
    function visit(file) {
      if (initial.has(file)) return;
      initial.add(file);
      chunks[file].imports.forEach(visit);
    }
    visit(main);
    assert.ok(
      !initial.has(entry),
      "Презентация должна оставаться в отдельном отложенном чанке",
    );
    assert.ok(
      ![...initial]
        .flatMap((file) => chunks[file].modules)
        .some((m) => /friendsheep\/(?:ui|content)/.test(m)),
    );
    const sizes = await Promise.all(
      [main, entry].map(async (file) => {
        const data = await readFile(`build/client/${file}`);
        return { file, bytes: data.length, gzipBytes: gzipSync(data).length };
      }),
    );
    assert.ok(
      sizes[1].gzipBytes < 15000,
      "Презентация не должна значительно увеличивать JS",
    );
    assert.deepEqual(errors, []);
    await writeFile(
      reportPath,
      JSON.stringify({ checks, sizes, errors }, null, 2) + "\n",
    );
    await page.close();
    console.log(
      "PASS: FriendSheep SSG/гидратация, SEO, 4 viewport, клавиатура, ссылки, изоляция темы, no-JS и размеры чанков.",
    );
  },
);
