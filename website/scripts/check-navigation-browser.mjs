import { writeFile } from "node:fs/promises";
import {
  expect,
  withBrowserCheck,
  observePageErrors,
} from "./browser-check.mjs";

const base = "/projects/maniac/wiki";
await withBrowserCheck(
  "navigation",
  async ({ browser, origin, reportPath }) => {
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
    await page.getByRole("searchbox").fill("Тишина");
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
    await page.mouse.wheel(0, 350);
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    const position = await page.evaluate(() => scrollY);
    await card.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(origin + base + "/characters/shaman");
    await expect(page.locator("#main")).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(catalogUrl);
    await expect(search).toHaveValue("Шаман");
    await expect(page.locator("[data-character]")).toHaveCount(1);
    await expect
      .poll(async () =>
        Math.abs((await page.evaluate(() => scrollY)) - position),
      )
      .toBeLessThan(2);
    expect(errors).toEqual([]);
    await writeFile(
      reportPath,
      JSON.stringify(
        {
          checks: [
            "mobile nested menu and Escape focus",
            "effect search/intersection/reset and anchor",
            "keyboard article navigation",
            "Back restores URL/search/scroll",
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
