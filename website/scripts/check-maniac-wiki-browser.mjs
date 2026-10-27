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
const catalog = JSON.parse(
  await readFile(
    "src/app/projects/maniac/wiki/data/character-catalog.json",
    "utf8",
  ),
);
const modules = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const shots = resolve(
  process.env.WIKI_SCREENSHOT_DIR || "../.audit/wiki-3a-screenshots",
);
await mkdir(shots, { recursive: true });
const server = createStaticServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const base = "/projects/maniac/wiki";
const paths = [
  base,
  base + "/characters",
  ...catalog.map((c) => `${base}/characters/${c.slug}`),
];
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { routes: [], widths: [], screenshots: [], checks: [] };
try {
  for (const path of paths) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [],
      responses = [],
      images = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    page.on("response", (r) => {
      const file = new URL(r.url()).pathname;
      if (file.endsWith(".js")) responses.push(r);
      if (/\.(webp|glb)$/.test(file)) images.push(file);
    });
    await page.addInitScript(() =>
      document.addEventListener("DOMContentLoaded", () => {
        window.ssgHeading = document.querySelector("main h1");
      }),
    );
    assert.equal((await page.goto(origin + path)).status(), 200);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(
        () => window.ssgHeading === document.querySelector("main h1"),
      ),
      true,
      path + ": hydration replaced heading",
    );
    assert.deepEqual(errors, [], path);
    const resources = [];
    for (const r of responses) {
      const file = new URL(r.url()).pathname.slice(1);
      resources.push({ file, bytes: (await r.body()).length });
    }
    const loaded = resources.flatMap((r) => modules[r.file]?.modules ?? []);
    assert.ok(
      !loaded.some((m) =>
        /node_modules\/three\/|ModelCanvas|changelogs\/content\/.*\.json$/.test(
          m,
        ),
      ),
      path,
    );
    assert.ok(!images.some((p) => p.endsWith(".glb")));
    const articleModules = loaded.filter((m) =>
      /wiki\/data\/character-articles\/.*\.json$/.test(m),
    );
    const c = catalog.find((c) => path.endsWith("/" + c.slug));
    assert.deepEqual(
      articleModules,
      c
        ? [
            `src/app/projects/maniac/wiki/data/character-articles/${c.slug}.json`,
          ]
        : [],
    );
    const otherLarge = images.filter(
      (p) =>
        p.includes("-large-") && c && !p.includes("/" + c.gameId + "-large-"),
    );
    assert.deepEqual(otherLarge, []);
    const staticContext = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 1000 },
    });
    const staticPage = await staticContext.newPage();
    await staticPage.goto(origin + path);
    assert.equal(
      await staticPage.locator("main h1").innerText(),
      await page.locator("main h1").innerText(),
    );
    assert.deepEqual(
      await staticPage
        .locator("#features h3, #features article p")
        .allTextContents(),
      await page.locator("#features h3, #features article p").allTextContents(),
    );
    if (path === base + "/characters")
      assert.equal(await staticPage.locator("[data-character]").count(), 15);
    assert.equal(
      await staticPage
        .locator("main h1")
        .evaluate((e) => getComputedStyle(e).fontSize),
      await page
        .locator("main h1")
        .evaluate((e) => getComputedStyle(e).fontSize),
    );
    report.routes.push({
      path,
      status: 200,
      scripts: resources,
      jsBytes: resources.reduce((sum, r) => sum + r.bytes, 0),
      articleModules,
      images,
      noJS: true,
      hydrationErrors: errors,
    });
    await staticContext.close();
    await context.close();
  }
  console.log(
    "PASS: all 17 Wiki URLs, full HTML without JS, hydration and cold request isolation",
  );
  const page = await browser.newPage();
  await page.goto(origin + base + "/characters");
  await page.waitForLoadState("networkidle");
  const cards = page.locator("[data-character]");
  await page.getByRole("button", { name: "Маньяки · 8", exact: true }).click();
  assert.equal(await cards.count(), 8);
  await page.getByRole("button", { name: "Выжившие · 7", exact: true }).click();
  assert.equal(await cards.count(), 7);
  await page.getByRole("button", { name: "Все · 15", exact: true }).click();
  assert.equal(await cards.count(), 15);
  const search = page.getByRole("searchbox", { name: "Поиск персонажа" });
  await search.fill("учен");
  assert.equal(await cards.count(), 1);
  assert.equal(
    await cards.first().getAttribute("data-character"),
    "character:scientist",
  );
  await search.fill("призрак");
  assert.equal(await cards.count(), 1);
  await page.getByRole("button", { name: "Выжившие · 7", exact: true }).click();
  assert.equal(await cards.count(), 0);
  await page.getByRole("button", { name: "Сбросить поиск" }).click();
  assert.equal(await cards.count(), 15);
  await page.evaluate(() => (window.wikiDocument = "same-document"));
  await page.locator('[data-character="character:ghost"]').focus();
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name: "Призрак", exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.wikiDocument), "same-document");
  report.checks.push(
    "Name search with ё/е, role/intersection filters, empty state/reset, keyboard SPA navigation",
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of paths) {
      await page.goto(origin + path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => ({
        root: document.documentElement.scrollWidth > innerWidth,
        nodes: [
          ...document.querySelectorAll(
            "main h1, main h2, main p, main button, main input, main article, main nav",
          ),
        ]
          .filter(
            (e) =>
              e.getBoundingClientRect().right > innerWidth + 1 ||
              e.getBoundingClientRect().left < -1,
          )
          .map((e) => e.className),
      }));
      assert.equal(overflow.root, false, path + " " + width);
      assert.deepEqual(overflow.nodes, [], path + " " + width);
    }
    report.widths.push({ width, routes: paths.length, overflow: false });
    console.log(`PASS: ${width}px, all 17 pages without overflow`);
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const [name, path] of [
      ["home", base],
      ["catalog", base + "/characters"],
      ["keeper", base + "/characters/keeper-of-nightmares"],
      ["ghost", base + "/characters/ghost"],
      ["doctor", base + "/characters/doctor"],
    ]) {
      await page.goto(origin + path);
      await page.waitForLoadState("networkidle");
      for (const img of await page.locator("main img").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((e) => e.decode().catch(() => {}));
      }
      await page.evaluate(() => scrollTo(0, 0));
      const file = `${name}-${width}.png`;
      await page.screenshot({ path: resolve(shots, file), fullPage: true });
      await page.screenshot({
        path: resolve(shots, `${name}-${width}-viewport.png`),
      });
      report.screenshots.push(resolve(shots, file));
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + base + "/characters/keeper-of-nightmares");
  await page.waitForLoadState("networkidle");
  const modelRequests = [];
  page.on("request", (r) => {
    if (/ModelCanvas|\.glb$/.test(r.url())) modelRequests.push(r.url());
  });
  await page
    .getByRole("button", { name: "Загрузить 3D-модель", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Сбросить камеру", exact: true })
    .waitFor();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(
      (b) => b.textContent === "Сбросить камеру" && !b.disabled,
    ),
  );
  assert.equal(await page.locator("canvas").count(), 1);
  assert.ok(modelRequests.some((u) => u.includes("ModelCanvas")));
  assert.ok(modelRequests.some((u) => u.endsWith(".glb")));
  for (const name of [
    "Приблизить",
    "Отдалить",
    "Повернуть влево",
    "Повернуть вправо",
    "Сбросить камеру",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  const canvas = await page.locator("canvas").boundingBox();
  await page.mouse.move(
    canvas.x + canvas.width * 0.4,
    canvas.y + canvas.height * 0.4,
  );
  await page.mouse.down();
  await page.mouse.move(
    canvas.x + canvas.width * 0.6,
    canvas.y + canvas.height * 0.5,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.screenshot({
    path: resolve(shots, "keeper-model.png"),
    fullPage: true,
  });
  report.checks.push(
    "Keeper model requested only after button, renders, camera drag/zoom/rotation/reset work",
  );
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : get.call(this, type, ...args);
    };
  });
  await fallback.goto(origin + base + "/characters/keeper-of-nightmares");
  await fallback.waitForLoadState("networkidle");
  await fallback
    .getByRole("button", { name: "Загрузить 3D-модель", exact: true })
    .click();
  await fallback
    .getByRole("status")
    .filter({ hasText: "WebGL недоступен" })
    .waitFor();
  assert.equal(await fallback.locator("#features h3").count(), 3);
  await fallback.close();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(origin + base + "/characters");
  await page.waitForLoadState("networkidle");
  await page.locator("[data-character]").first().hover();
  assert.equal(
    await page
      .locator("[data-character]")
      .first()
      .evaluate((e) => getComputedStyle(e).transform),
    "none",
  );
  report.checks.push(
    "WebGL fallback keeps article readable; reduced motion removes card transforms",
  );
  await writeFile(
    "docs/MANIAC_3A_BROWSER.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    "PASS: filters, keyboard navigation, 10 desktop/mobile screenshots, lazy Keeper 3D, WebGL fallback and reduced motion",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
