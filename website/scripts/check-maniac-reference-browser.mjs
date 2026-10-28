import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createStaticServer } from "./serve.mjs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)).href
    : "playwright"
);
const root = "src/app/projects/maniac/wiki/data/";
const perks = JSON.parse(await readFile(root + "perk-catalog.json", "utf8"));
const abilities = JSON.parse(
  await readFile(root + "ability-catalog.json", "utf8"),
);
const modules = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const base = "/projects/maniac/wiki";
const targets = [
  { path: base + "/perks" },
  { path: base + "/abilities" },
  ...perks.map((e) => ({
    path: base + "/perks/" + e.slug,
    kind: "perk",
    ...e,
  })),
  ...abilities.map((e) => ({
    path: base + "/abilities/" + e.slug,
    kind: "ability",
    ...e,
  })),
];
const out = resolve(
  process.env.WIKI_SCREENSHOT_DIR || "../.audit/wiki-3b-screenshots",
);
await mkdir(out, { recursive: true });
const server = createStaticServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { routes: [], widths: [], screenshots: [], checks: [] };
try {
  for (const target of targets) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const p = await context.newPage();
    const errors = [],
      responses = [],
      images = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    p.on("response", (r) => {
      if (new URL(r.url()).pathname.endsWith(".js")) responses.push(r);
      if (/\/assets\/.*\.webp$/.test(new URL(r.url()).pathname))
        images.push(r.url());
    });
    await p.addInitScript(() =>
      document.addEventListener(
        "DOMContentLoaded",
        () => (window.initialWikiHeading = document.querySelector("main h1")),
      ),
    );
    assert.equal((await p.goto(origin + target.path)).status(), 200);
    await p.waitForLoadState("networkidle");
    assert.equal(
      await p.evaluate(
        () => window.initialWikiHeading === document.querySelector("main h1"),
      ),
      true,
      target.path,
    );
    const scripts = [];
    for (const response of responses)
      scripts.push({
        file: new URL(response.url()).pathname.slice(1),
        bytes: (await response.body()).length,
      });
    const loaded = scripts.flatMap((s) => modules[s.file]?.modules ?? []);
    assert.ok(
      !loaded.some((m) =>
        /node_modules\/three\/|ModelCanvas|\.glb|changelogs\/content\/.*\.json$/.test(
          m,
        ),
      ),
      target.path,
    );
    const articles = loaded.filter((m) =>
      /wiki\/data\/(?:perk|ability)-articles\/.*\.json$/.test(m),
    );
    assert.deepEqual(
      articles,
      target.kind
        ? [
            `src/app/projects/maniac/wiki/data/${target.kind}-articles/${target.slug}.json`,
          ]
        : [],
    );
    if (target.kind) {
      const ownImage = await p
        .locator("main [data-kind] img")
        .first()
        .getAttribute("src")
        .catch(() => null);
      assert.ok(
        images.every(
          (url) =>
            new URL(url).pathname === new URL(ownImage || "/", origin).pathname,
        ),
        target.path + " fetched another article image",
      );
      const article = JSON.parse(
        await readFile(
          root + target.kind + "-articles/" + target.slug + ".json",
          "utf8",
        ),
      );
      assert.equal(
        await p.locator("#effect > p").last().textContent(),
        article.description,
      );
    }
    const staticContext = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 1000 },
    });
    const staticPage = await staticContext.newPage();
    await staticPage.goto(origin + target.path);
    assert.equal(
      await staticPage.locator("main h1").innerText(),
      await p.locator("main h1").innerText(),
    );
    if (target.kind)
      assert.equal(
        await staticPage.locator("#effect > p").last().textContent(),
        await p.locator("#effect > p").last().textContent(),
      );
    else
      assert.equal(
        await staticPage.locator("[data-reference-id]").count(),
        target.path.endsWith("/perks") ? 44 : 12,
      );
    assert.deepEqual(errors, [], target.path);
    report.routes.push({
      path: target.path,
      jsCount: scripts.length,
      jsBytes: scripts.reduce((n, s) => n + s.bytes, 0),
      scripts,
      articleModules: articles,
      images,
      noJS: true,
      errors,
    });
    await staticContext.close();
    await context.close();
  }
  console.log(
    "PASS: 58 new direct URLs, full no-JS HTML, hydration, isolated article text/art and no eager 3D/chronicles",
  );
  const p = await browser.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  await p.goto(origin + base + "/perks");
  await p.waitForLoadState("networkidle");
  const cards = p.locator("[data-reference-id]");
  const team = p.getByRole("combobox", { name: "Сторона перка" });
  const type = p.getByRole("combobox", { name: "Тип перка" });
  const search = p.getByRole("searchbox", { name: "Поиск по названию" });
  for (const [value, count] of [
    ["SURVIVOR", 19],
    ["MANIAC", 15],
    ["ALL", 10],
  ]) {
    await team.selectOption(value);
    assert.equal(await cards.count(), count);
  }
  await team.selectOption("ALL_FILTER");
  for (const [value, count] of [
    ["PASSIVE", 17],
    ["ACTIVE", 11],
    ["HYBRID", 5],
    ["PASSIVE_COOLDOWN", 10],
    ["CHARGED", 1],
  ]) {
    await type.selectOption(value);
    assert.equal(await cards.count(), count);
  }
  await search.fill("якорь");
  assert.equal(await cards.count(), 1);
  await team.selectOption("MANIAC");
  assert.equal(await cards.count(), 0);
  await p.getByRole("button", { name: "Сбросить фильтры" }).click();
  assert.equal(await cards.count(), 44);
  await p.evaluate(() => (window.sameWikiDocument = true));
  await p.locator('[data-reference-id="perk:reality-anchor"]').focus();
  await p.keyboard.press("Enter");
  await p.waitForURL("**/reality-anchor");
  await p.locator("#effect").waitFor();
  assert.equal(await p.evaluate(() => window.sameWikiDocument), true);
  await p.goto(origin + base + "/abilities");
  await p.waitForLoadState("networkidle");
  await p
    .getByRole("combobox", { name: "Персонаж способности" })
    .selectOption("character:keeper-of-nightmares");
  assert.equal(await p.locator("[data-reference-id]").count(), 2);
  await p.goto(origin + base + "/characters/pudge");
  await p.waitForLoadState("networkidle");
  await p
    .getByRole("link", { name: "И куда собрался?", exact: true })
    .first()
    .click();
  await p.waitForURL("**/abilities/hook-throw");
  await p.getByRole("link", { name: "Мясник", exact: true }).first().click();
  await p.getByRole("heading", { name: "Мясник", exact: true }).waitFor();
  report.checks.push(
    "All team/type counts, combined search/empty/reset, keyboard SPA navigation, ability owner filter and Pudge → Hook → Pudge",
  );
  const examples = [
    base + "/perks",
    base + "/abilities",
    base + "/perks/reality-anchor",
    base + "/perks/forget-me-not",
    base + "/perks/color-roulette",
    base + "/perks/the-paint-thickens",
    base + "/perks/mana-break",
    base + "/abilities/death-teleport",
    base + "/abilities/hook-throw",
    base + "/characters/keeper-of-nightmares",
  ];
  for (const width of [320, 390, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const path of examples) {
      await p.goto(origin + path);
      await p.waitForLoadState("networkidle");
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        path + " " + width,
      );
      const bad = await p.evaluate(() =>
        [
          ...document.querySelectorAll(
            "main h1,main h2,main p,main select,main input,main nav",
          ),
        ]
          .filter(
            (e) =>
              e.getBoundingClientRect().right > innerWidth + 1 ||
              e.getBoundingClientRect().left < -1,
          )
          .map((e) => e.className),
      );
      assert.deepEqual(bad, [], path + " " + width);
    }
    report.widths.push({ width, pages: examples.length, overflow: false });
    console.log(
      "PASS: " +
        width +
        "px complex perks/catalogs/abilities/character navigation",
    );
  }
  const shots = [
    ["perks", base + "/perks"],
    ["abilities", base + "/abilities"],
    ["charged", base + "/perks/reality-anchor"],
    ["hybrid", base + "/perks/forget-me-not"],
    ["roulette", base + "/perks/color-roulette"],
    ["hook", base + "/abilities/hook-throw"],
    ["death", base + "/abilities/death-teleport"],
  ];
  for (const width of [1440, 390]) {
    await p.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const [name, path] of shots) {
      await p.goto(origin + path);
      await p.waitForLoadState("networkidle");
      for (const image of await p.locator("main img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((e) => e.decode());
      }
      await p.evaluate(() => scrollTo(0, 0));
      const file = resolve(out, name + "-" + width + ".png");
      await p.screenshot({ path: file, fullPage: true });
      await p.screenshot({
        path: resolve(out, name + "-" + width + "-viewport.png"),
      });
      report.screenshots.push(file);
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/MANIAC_3B_BROWSER.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log("PASS: 14 desktop/mobile screenshots and all browser checks");
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
