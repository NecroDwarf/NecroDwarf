import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import {
  expect,
  observePageErrors,
  withBrowserCheck,
} from "./browser-check.mjs";

const base = "/projects/maniac/wiki";
await withBrowserCheck(
  "search",
  async ({ browser, origin, screenshots, reportPath, loadWikiModule }) => {
    const { searchIndex, findWikiEntries } =
      await loadWikiModule("search-index.ts");
    const paths = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
    assert.equal(searchIndex.length, 204);
    assert.equal(new Set(searchIndex.map((e) => e.href)).size, 204);
    for (const entry of searchIndex) {
      assert.ok(paths.includes(entry.href.split("#")[0]), entry.href);
      assert.ok(
        findWikiEntries(entry.name).some((e) => e.href === entry.href),
        entry.name,
      );
      if (entry.href.includes("#")) {
        const [path, id] = entry.href.split("#");
        assert.ok(
          (await readFile(`build/client${path}.html`, "utf8")).includes(
            `id="${id}"`,
          ),
          entry.href,
        );
      }
    }
    assert.deepEqual(findWikiEntries("УЧЕНЫЙ"), findWikiEntries("учёный"));
    assert.equal(
      findWikiEntries("шаман")[0].name,
      "Шаман",
      "Exact title outranks mentions in longer titles",
    );
    assert.equal(
      findWikiEntries("мана")[0].name,
      "Мана",
      "Exact mechanic title outranks partial matches",
    );
    assert.equal(findWikiEntries("   ").length, 0);
    assert.equal(findWikiEntries("заведомоненайденнаястрока").length, 0);
    for (const [query, href] of [
      ["Разорвите контакт", `${base}/mechanics/sanity`],
      ["здравомыслие", `${base}/mechanics/sanity`],
      ["перевязка", `${base}/items/bandages`],
      ["кровавые следы", `${base}/effects#open_wound`],
      ["починка компьютера", `${base}/mechanics/hacking`],
    ]) {
      assert.ok(
        findWikiEntries(query).some((entry) => entry.href === href),
        query,
      );
    }
    assert.equal(
      findWikiEntries("здравомыслие")[0].href,
      `${base}/mechanics/sanity`,
    );
    assert.ok(
      findWikiEntries("карты")
        .slice(0, 3)
        .every((entry) => entry.section === "maps"),
    );
    assert.ok(
      findWikiEntries("механика здравомыслие").some(
        (entry) => entry.href === `${base}/mechanics/sanity`,
      ),
    );
    assert.ok(
      !searchIndex.some((e) => e.href.endsWith("#weak_instant_health")),
    );
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [],
      requests = [],
      responses = [];
    observePageErrors(page, errors);
    page.on("request", (r) => requests.push(r.url()));
    page.on("response", (r) => {
      if (r.url().includes("search-index"))
        responses.push(
          r.body().then((body) => ({
            file: new URL(r.url()).pathname,
            bytes: body.length,
            gzipBytes: gzipSync(body).length,
          })),
        );
    });
    await page.goto(origin + base);
    await page.waitForLoadState("networkidle");
    assert.ok(!requests.some((r) => r.includes("search-index")));
    await page.evaluate(() => {
      window.searchDocument = "same-document";
    });
    const headerInput = page.getByLabel("Поиск по всей Wiki", { exact: true });
    await headerInput.focus();
    await page.waitForLoadState("networkidle");
    assert.ok(
      !requests.some((r) => /search-index|HeaderSearchSuggestions/.test(r)),
      "Blank header must not load the suggestions UI or index",
    );
    await headerInput.fill("УЧЕНЫЙ");
    const options = page.getByRole("option");
    await expect(options).toHaveCount(
      Math.min(6, findWikiEntries("УЧЕНЫЙ").length),
    );
    await expect(options.first()).toContainText("Учёный");
    await expect(options.first()).toHaveAttribute(
      "data-category",
      "characters",
    );
    await expect(
      options.first().getByText("Персонажи", { exact: true }),
    ).toBeVisible();
    await expect(headerInput).toHaveAttribute("role", "combobox");
    await expect(headerInput).toHaveAttribute("aria-expanded", "true");
    await expect(page).toHaveURL(origin + base);
    await headerInput.press("Escape");
    await expect(headerInput).toHaveAttribute("aria-expanded", "false");
    await expect(headerInput).toHaveValue("УЧЕНЫЙ");
    await headerInput.press("Enter");
    const input = page.getByRole("searchbox", {
      name: "Название, категория или текст статьи",
    });
    await expect(input).toHaveValue("УЧЕНЫЙ");
    assert.equal(
      await page.evaluate(() => window.searchDocument),
      "same-document",
    );
    const results = page.locator('section[aria-labelledby^="search-"]');
    await expect(results.getByRole("link", { name: "Учёный" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Найдено:");
    await input.focus();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Очистить", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(results.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(origin + base + "/characters/scientist");
    await page.goBack();
    await expect(input).toHaveValue("УЧЕНЫЙ");
    await page.goForward();
    await expect(page).toHaveURL(origin + base + "/characters/scientist");
    await page.goBack();
    await expect(headerInput).toHaveValue("УЧЕНЫЙ");
    await input.fill("РОЗОВЫЕ ОЧКИ");
    for (const section of ["perks", "items"])
      await expect(
        results.locator(`a[href="${base}/${section}/rose-colored-glasses"]`),
      ).toBeVisible();
    await expect(
      results.locator(`a[href="${base}/effects#rose_colored_glasses"]`),
    ).toBeVisible();
    await input.fill("Разорвите контакт");
    await expect(
      results.getByRole("link", { name: "Рассудок", exact: true }),
    ).toBeVisible();
    await input.fill("здравомыслие");
    await expect(
      results.getByRole("link", { name: "Рассудок", exact: true }),
    ).toBeVisible();
    await input.fill("карты");
    await expect(
      page.locator('section[aria-labelledby="search-maps"] a'),
    ).toHaveCount(3);
    await input.fill("maniacrev:open_wound");
    await results.getByRole("link", { name: "Открытая рана" }).click();
    await expect(page.locator("#open_wound")).toBeInViewport();
    await page.goBack();
    await expect(input).toHaveValue("maniacrev:open_wound");
    await input.fill("заведомоненайденнаястрока");
    await expect(
      page.getByRole("heading", { name: "Ничего не найдено", exact: true }),
    ).toBeVisible();
    await input.press("Escape");
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await input.fill("е");
    await expect(results).toHaveCount(7);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await input.fill("розовые");
      await expect(results.getByRole("link")).toHaveCount(
        findWikiEntries("розовые").length,
      );
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.screenshot({
        path: resolve(screenshots, `search-${width}.png`),
        fullPage: true,
      });
      await input.fill("а".repeat(250));
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
    }
    await page.goto(origin + base);
    await page.evaluate(() => {
      window.dropdownDocument = "same-document";
    });
    await headerInput.fill("е");
    await expect(options).toHaveCount(6);
    for (const option of await options.all()) {
      const href = await option.getAttribute("href");
      const entry = searchIndex.find((entry) => entry.href === href);
      assert.ok(entry);
      await expect(option.locator("span").last()).toHaveText(entry.label);
    }
    const firstSuggestion = await options.first().getAttribute("href");
    await headerInput.press("ArrowUp");
    await expect(headerInput).toHaveAttribute(
      "aria-activedescendant",
      "wiki-header-option-5",
    );
    await headerInput.press("ArrowDown");
    await expect(headerInput).toHaveAttribute(
      "aria-activedescendant",
      "wiki-header-option-0",
    );
    await headerInput.press("Enter");
    await expect(page).toHaveURL(origin + firstSuggestion);
    assert.equal(
      await page.evaluate(() => window.dropdownDocument),
      "same-document",
    );
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await page.goto(origin + base);
    await headerInput.fill("розовые очки");
    await expect(options).toHaveCount(
      Math.min(6, findWikiEntries("розовые очки").length),
    );
    await page
      .locator(`[role="option"][href="${base}/items/rose-colored-glasses"]`)
      .click();
    await expect(page).toHaveURL(origin + base + "/items/rose-colored-glasses");
    await page.goto(origin + base);
    await headerInput.fill("шаман");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.locator("main h1").click();
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await headerInput.focus();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page
      .getByRole("link", { name: "Все результаты", exact: true })
      .click();
    await expect(input).toHaveValue("шаман");
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + base);
      await headerInput.fill("е");
      await expect(options).toHaveCount(6);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.screenshot({
        path: resolve(screenshots, `autocomplete-${width}.png`),
      });
      await headerInput.fill("несуществующее-название");
      await expect(page.getByRole("status")).toContainText("Ничего не найдено");
      await headerInput.fill("");
      await expect(page.getByRole("listbox")).toHaveCount(0);
    }
    // The global form must not overwrite catalog query/filter state while drafting.
    await page.goto(origin + base + "/items?q=бинты&team=survivor");
    const catalogURL = page.url();
    const catalogInput = page.getByRole("searchbox", {
      name: "Поиск по названию",
      exact: true,
    });
    await expect(catalogInput).toHaveValue("бинты");
    await headerInput.fill("Хранитель");
    await expect(headerInput).toHaveAttribute("aria-expanded", "true");
    expect(page.url()).toBe(catalogURL);
    await expect(catalogInput).toHaveValue("бинты");
    await headerInput.press("Escape");
    await expect(headerInput).toHaveValue("Хранитель");
    await headerInput.press("Escape");
    await expect(headerInput).toHaveValue("");
    await expect(headerInput).toBeFocused();
    await headerInput.fill("Шаман");
    await page
      .getByRole("search", { name: "Поиск по Wiki в шапке", exact: true })
      .getByRole("button", { name: "Найти", exact: true })
      .click();
    await expect(input).toHaveValue("Шаман");
    await page.goBack();
    await expect(page).toHaveURL(catalogURL);
    await expect(catalogInput).toHaveValue("бинты");
    const touchContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const touch = await touchContext.newPage();
    observePageErrors(touch, errors);
    await touch.goto(origin + base);
    await touch
      .getByLabel("Поиск по всей Wiki", { exact: true })
      .fill("Хранитель");
    await touch
      .getByRole("option")
      .filter({ hasText: "Хранитель кошмаров" })
      .first()
      .tap();
    await expect(touch).toHaveURL(
      origin + base + "/characters/keeper-of-nightmares",
    );
    await touchContext.close();
    const delayed = await browser.newPage({
      viewport: { width: 390, height: 420 },
    });
    observePageErrors(delayed, errors);
    let releaseIndex;
    const indexGate = new Promise((resolve) => {
      releaseIndex = resolve;
    });
    await delayed.route("**/assets/search-index-*.js", async (route) => {
      await indexGate;
      await route.continue();
    });
    await delayed.goto(origin + base);
    const delayedInput = delayed.getByLabel("Поиск по всей Wiki", {
      exact: true,
    });
    await delayedInput.fill("Шаман");
    await expect(delayed.getByRole("status")).toHaveText("Ищем…");
    await delayedInput.fill("Учёный");
    await delayedInput.press("Escape");
    releaseIndex();
    await delayed.waitForLoadState("networkidle");
    await expect(delayedInput).toHaveAttribute("aria-expanded", "false");
    await delayedInput.press("ArrowDown");
    await expect(delayed.getByRole("option")).toHaveCount(
      Math.min(6, findWikiEntries("Учёный").length),
    );
    await expect(delayed.getByRole("option").first()).toContainText("Учёный");
    const delayedURL = delayed.url();
    await delayedInput.evaluate((input) =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          isComposing: true,
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(delayed.url()).toBe(delayedURL);
    await delayedInput.fill("е");
    await expect(delayed.getByRole("option")).toHaveCount(6);
    await delayedInput.press("ArrowUp");
    await expect(delayed.getByRole("option").last()).toBeInViewport();
    const panel = await delayed
      .getByRole("listbox")
      .locator("..")
      .boundingBox();
    assert.ok(
      panel.y + panel.height <= 420,
      "Dropdown must fit a short/mobile keyboard viewport",
    );
    await delayedInput.press("Tab");
    await expect(
      delayed.getByRole("button", { name: "Найти", exact: true }),
    ).toBeFocused();
    await expect(delayed.getByRole("listbox")).toHaveCount(0);
    await delayed.close();

    const failedHeader = await browser.newPage();
    failedHeader.on("pageerror", (error) => errors.push(error.message));
    await failedHeader.route("**/assets/search-index-*.js", (route) =>
      route.abort(),
    );
    await failedHeader.goto(origin + base);
    await failedHeader
      .getByLabel("Поиск по всей Wiki", { exact: true })
      .fill("Учёный");
    await expect(failedHeader.getByRole("status")).toContainText(
      "Не удалось загрузить подсказки",
    );
    await failedHeader
      .getByRole("button", { name: "Найти", exact: true })
      .click();
    await expect(
      failedHeader.getByRole("searchbox", {
        name: "Название, категория или текст статьи",
        exact: true,
      }),
    ).toHaveValue("Учёный");
    await expect(failedHeader.getByRole("status")).toContainText(
      "Не удалось загрузить поиск",
    );
    await failedHeader.unroute("**/assets/search-index-*.js");
    await failedHeader.reload();
    await expect(
      failedHeader
        .locator('section[aria-labelledby="search-characters"]')
        .getByRole("link", { name: "Учёный" }),
    ).toBeVisible();
    await failedHeader.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(origin + base + "/characters/scientist");
    await staticPage
      .getByLabel("Поиск по всей Wiki", { exact: true })
      .fill("учёный");
    await staticPage
      .getByRole("button", { name: "Найти", exact: true })
      .click();
    assert.equal(new URL(staticPage.url()).pathname, base + "/search");
    assert.equal(new URL(staticPage.url()).searchParams.get("q"), "учёный");
    await expect(
      staticPage
        .getByRole("navigation", { name: "Разделы энциклопедии" })
        .getByRole("link"),
    ).toHaveCount(7);
    await expect(
      staticPage.getByText("Поиск требует JavaScript.", { exact: false }),
    ).toBeVisible();
    await noJS.close();
    const failure = await browser.newPage();
    failure.on("pageerror", (error) => errors.push(error.message));
    await failure.route("**/assets/search-index-*.js", (route) =>
      route.abort(),
    );
    await failure.goto(origin + base + "/search");
    await expect(failure.getByRole("status")).toContainText(
      "Не удалось загрузить поиск",
    );
    await expect(
      failure
        .getByRole("navigation", { name: "Разделы энциклопедии" })
        .getByRole("link"),
    ).toHaveCount(7);
    await failure.unroute("**/assets/search-index-*.js");
    await failure
      .getByRole("button", { name: "Перезагрузить поиск", exact: true })
      .click();
    await failure
      .getByRole("searchbox", {
        name: "Название, категория или текст статьи",
        exact: true,
      })
      .fill("учёный");
    await expect(
      failure
        .locator('section[aria-labelledby="search-characters"]')
        .getByRole("link", { name: "Учёный" }),
    ).toBeVisible();
    await failure.close();
    assert.ok(
      requests.some((r) => r.includes("search-index")),
      "Index loads after search interaction",
    );
    assert.deepEqual(errors, []);
    const indexResponses = await Promise.all(responses);
    await context.close();
    await writeFile(
      reportPath,
      JSON.stringify(
        {
          entries: searchIndex.length,
          indexResponses,
          errors,
          checks: [
            "Every published entity searchable; unpublished effect excluded",
            "Russian case/е/ё, multiple words, IDs, empty and missing queries",
            "Published article prose, effect descriptions, categories and editorial synonyms; exact titles outrank body mentions",
            "Grouping, keyboard, Escape, Back/Forward, effect anchors",
            "Touch entry and results; 320/390/768/1440; long queries",
            "SSG fallback without JavaScript; lazy index; failed index recovery",
            "Permanent header form: Enter/button, Escape, same-document navigation, catalog independence, touch and native no-JS GET",
            "Ranked live suggestions: six results, category labels, keyboard selection, pointer/touch, outside dismissal and empty state",
            "Delayed index uses the latest query, Escape stays closed, composition Enter, short viewport, Tab and load failure recovery",
          ],
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      "PASS: Wiki search: 204 entities, lazy index, SSG fallback, keyboard, touch, history, anchors and responsive layouts",
    );
  },
);
