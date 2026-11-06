import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  expect,
  withBrowserCheck,
  observePageErrors,
} from "./browser-check.mjs";

const base = "/projects/maniac/wiki";
await withBrowserCheck(
  "navigation",
  async ({ browser, origin, reportPath, screenshots }) => {
    // Primary links must work before hydration, including when scripts fail.
    for (const scriptsDisabled of [true, false]) {
      const context = await browser.newContext({
        javaScriptEnabled: !scriptsDisabled,
        viewport: { width: 390, height: 844 },
      });
      if (!scriptsDisabled)
        await context.route("**/assets/*.js", (route) => route.abort());
      const fallback = await context.newPage();
      await fallback.goto(origin + "/projects/novellmaker/docs/lua");
      for (const width of [320, 390, 600, 1440]) {
        await fallback.setViewportSize({ width, height: 844 });
        const nav = fallback.getByRole("navigation", {
          name: "Основная навигация",
          exact: true,
        });
        for (const name of ["Главная", "Проекты", "Хроники", "Команда"])
          await expect(
            nav.getByRole("link", { name, exact: true }),
          ).toBeVisible();
        await expect(
          fallback.getByRole("button", { name: "Меню +", exact: true }),
        ).toBeHidden();
        expect(
          await fallback.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      await fallback.setViewportSize({ width: 390, height: 844 });
      const projectsLink = fallback
        .locator("#main-navigation")
        .getByRole("link", { name: "Проекты", exact: true });
      await projectsLink.focus();
      await fallback.keyboard.press("Enter");
      await expect(fallback).toHaveURL(origin + "/projects");
      await expect(fallback.locator("main h1")).toHaveText(
        /Разные идеи\.\s*Общий характер\./,
      );
      await context.close();
    }
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    observePageErrors(page, errors);
    await page.goto(origin + "/");
    await page.getByRole("button", { name: "Меню +", exact: true }).click();
    await page
      .getByRole("button", { name: "Разделы Maniac", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Разделы Wiki", exact: true })
      .click();
    await page
      .locator("#project-navigation")
      .getByRole("link", { name: "Эффекты", exact: true })
      .click();
    await expect(page).toHaveURL(origin + base + "/effects");
    await expect(page.locator("#main-navigation")).toBeHidden();
    const effects = page.locator("[data-effect-id]");
    await expect(effects).toHaveCount(33);
    await page
      .getByRole("searchbox", { name: "Поиск по названию", exact: true })
      .fill("Тишина");
    await expect(effects).toHaveCount(1);
    await page
      .getByRole("combobox", { name: "Тип эффекта" })
      .selectOption("BENEFICIAL");
    await expect(effects).toHaveCount(0);
    await page
      .getByRole("button", { name: "Сбросить фильтры", exact: true })
      .click();
    await expect(effects).toHaveCount(33);
    await page.locator('a[href="#frozen"]').click();
    await expect(page.locator("#frozen")).toBeInViewport();
    await page.getByRole("button", { name: "Меню +", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Меню +", exact: true }),
    ).toBeFocused();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(origin + base + "/characters");
    const search = page.getByRole("searchbox", { name: "Поиск персонажа" });
    await search.fill("Шаман");
    await expect(page.locator("[data-character]")).toHaveCount(1);
    const catalogUrl = page.url();
    const card = page.locator('[data-character="character:shaman"]');
    await card.focus();
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    const position = await page.evaluate(() => scrollY);
    let releaseArticle;
    let articleRequested = false;
    const articleGate = new Promise((release) => {
      releaseArticle = release;
    });
    await page.route("**/assets/shaman-*.js", async (route) => {
      articleRequested = true;
      await articleGate;
      await route.continue();
    });
    try {
      await page.keyboard.press("Enter");
      await expect.poll(() => articleRequested).toBe(true);
      await expect(page).toHaveURL(origin + base + "/characters/shaman");
      await expect(search).toHaveValue("Шаман");
      await expect
        .poll(async () =>
          Math.abs((await page.evaluate(() => scrollY)) - position),
        )
        .toBeLessThan(2);
    } finally {
      releaseArticle();
    }
    await expect(page).toHaveURL(origin + base + "/characters/shaman");
    await expect(page.locator("#main")).toBeFocused();
    await page.unroute("**/assets/shaman-*.js");
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    const articlePosition = await page.evaluate(() => scrollY);
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goBack();
      await expect(page).toHaveURL(catalogUrl);
      await expect(search).toHaveValue("Шаман");
      await expect(page.locator("[data-character]")).toHaveCount(1);
      await expect
        .poll(async () =>
          Math.abs((await page.evaluate(() => scrollY)) - position),
        )
        .toBeLessThan(2);
      await page.goForward();
      await expect(page).toHaveURL(origin + base + "/characters/shaman");
      await expect(page.locator("main h1")).toHaveText("Шаман");
      await expect
        .poll(async () =>
          Math.abs((await page.evaluate(() => scrollY)) - articlePosition),
        )
        .toBeLessThan(2);
    }
    await page.goto(origin + "/projects/novellmaker");
    await page
      .getByRole("navigation", { name: "Основная навигация", exact: true })
      .getByRole("link", { name: "Проекты", exact: true })
      .hover();
    const quick = page.locator("#project-navigation");
    const maniacToggle = quick.getByRole("button", {
      name: "Разделы Maniac",
      exact: true,
    });
    await maniacToggle.hover();
    await quick.getByRole("link", { name: "Maniac", exact: true }).hover();
    await expect(maniacToggle).toHaveAttribute("aria-expanded", "true");
    const wikiToggle = quick.getByRole("button", {
      name: "Разделы Wiki",
      exact: true,
    });
    await wikiToggle.hover();
    await expect(wikiToggle).toHaveAttribute("aria-expanded", "true");
    await expect(
      quick.getByRole("link", { name: "Обзор", exact: true }),
    ).toBeVisible();
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.mouse.move(100, 200);
      await expect(quick).toBeHidden();
      await page
        .getByRole("navigation", { name: "Основная навигация", exact: true })
        .getByRole("link", { name: "Проекты", exact: true })
        .hover();
      await maniacToggle.hover();
      await expect(maniacToggle).toHaveAttribute("aria-expanded", "true");
    }
    await quick.getByRole("link", { name: "NovellMaker", exact: true }).hover();
    const documentation = quick.getByRole("link", {
      name: "Документация",
      exact: true,
    });
    await documentation.hover();
    const lua = quick.getByRole("link", { name: "Lua API", exact: true });
    await lua.hover();
    const execution = quick.locator(
      'a[href="/projects/novellmaker/docs/lua/execution-model"]',
    );
    await expect(execution).toBeVisible();
    await page.screenshot({
      path: resolve(screenshots, "novellmaker-quick-navigation-1440.png"),
    });
    await lua.focus();
    await page.keyboard.press("ArrowRight");
    await expect(execution).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(lua).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(origin + "/projects/novellmaker/docs/lua");
    await expect(quick).toBeHidden();

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.getByRole("button", { name: "Меню +", exact: true }).click();
      for (const name of ["NovellMaker", "Документация", "Lua API"])
        await quick
          .getByRole("button", { name: "Разделы " + name, exact: true })
          .click();
      const audio = quick.locator(
        'a[href="/projects/novellmaker/docs/lua/audio"]',
      );
      await expect(audio).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await audio.click();
      await expect(page).toHaveURL(
        origin + "/projects/novellmaker/docs/lua/audio",
      );
      await expect(page.locator("#main-navigation")).toBeHidden();
    }
    expect(errors).toEqual([]);
    await writeFile(
      reportPath,
      JSON.stringify(
        {
          checks: [
            "primary navigation without JS or with failed scripts at 320/390/600/1440px, including keyboard navigation",
            "mobile nested menu and Escape focus",
            "effect search/intersection/reset and anchor",
            "keyboard article navigation",
            "Delayed route module retains the catalog and its scroll until the article is ready",
            "Three Back/Forward round trips restore filtered catalog and long article scroll, including pending scroll events",
            "Maniac root/nested arrow hover and repeated re-entry",
            "NovellMaker nested desktop hover and keyboard navigation",
            "NovellMaker touch navigation at 320/390px and menu closes on selection",
          ],
          errors,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      "PASS: mobile menu, effect filters/anchor, keyboard focus and Back URL/search/scroll restoration",
    );
  },
);
