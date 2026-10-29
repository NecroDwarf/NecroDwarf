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
const root = "src/app/projects/maniac/wiki/data/",
  base = "/projects/maniac/wiki";
const items = JSON.parse(await readFile(root + "item-catalog.json", "utf8")),
  mechanics = JSON.parse(
    await readFile(root + "mechanic-catalog.json", "utf8"),
  );
const modules = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const paths = [
  { path: base + "/items" },
  { path: base + "/mechanics" },
  ...items.map((e) => ({
    ...e,
    kind: "item",
    path: base + "/items/" + e.slug,
  })),
  ...mechanics.map((e) => ({
    ...e,
    kind: "mechanic",
    path: base + "/mechanics/" + e.slug,
  })),
];
const out = resolve(
  process.env.WIKI_SCREENSHOT_DIR || "../.audit/wiki-3c-screenshots",
);
await mkdir(out, { recursive: true });
const server = createStaticServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { routes: [], responsive: [], screenshots: [], checks: [] };
try {
  for (const target of paths) {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      }),
      p = await context.newPage(),
      errors = [],
      responses = [],
      images = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    p.on("response", (r) => {
      if (new URL(r.url()).pathname.endsWith(".js")) responses.push(r);
      if (/\/assets\/.*\.(webp|png)$/.test(new URL(r.url()).pathname))
        images.push(r.url());
    });
    await p.addInitScript(() =>
      document.addEventListener(
        "DOMContentLoaded",
        () => (window.initialHeading = document.querySelector("main h1")),
      ),
    );
    assert.equal((await p.goto(origin + target.path)).status(), 200);
    await p.waitForLoadState("networkidle");
    assert.equal(
      await p.evaluate(
        () => window.initialHeading === document.querySelector("main h1"),
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
    const articleModules = loaded.filter((m) =>
      /wiki\/data\/(?:item|mechanic|perk|ability|character)-articles\/.*\.json$/.test(
        m,
      ),
    );
    assert.deepEqual(
      articleModules,
      target.kind
        ? [
            `src/app/projects/maniac/wiki/data/${target.kind}-articles/${target.slug}.json`,
          ]
        : [],
    );
    if (target.kind) {
      const imageSources = await p
        .locator("main img")
        .evaluateAll((nodes) => nodes.map((n) => n.src));
      assert.ok(
        images.every((src) => imageSources.includes(src)),
        target.path + " requested unrelated images",
      );
    }
    const nojs = await browser.newContext({ javaScriptEnabled: false }),
      staticPage = await nojs.newPage();
    await staticPage.goto(origin + target.path);
    assert.equal(
      await staticPage.locator("main h1").innerText(),
      await p.locator("main h1").innerText(),
    );
    if (target.kind) {
      const article = JSON.parse(
        await readFile(
          root + `${target.kind}-articles/${target.slug}.json`,
          "utf8",
        ),
      );
      for (const section of article.sections)
        for (const paragraph of section.paragraphs)
          assert.ok(
            (await staticPage.locator("main").innerText()).includes(paragraph),
          );
    } else
      assert.equal(
        await staticPage.locator("[data-system-id]").count(),
        target.path.endsWith("items") ? items.length : mechanics.length,
      );
    assert.deepEqual(errors, [], target.path);
    report.routes.push({
      path: target.path,
      jsCount: scripts.length,
      jsBytes: scripts.reduce((sum, r) => sum + r.bytes, 0),
      articleModules,
      scripts,
      images,
    });
    await nojs.close();
    await context.close();
  }
  console.log(
    `PASS: ${paths.length} new URLs, no-JS full text, hydration and own article/image requests without Three/GLB/chronicles`,
  );
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(origin + base + "/items");
  await p.waitForLoadState("networkidle");
  const category = p.getByRole("combobox", { name: "Категория", exact: true }),
    owner = p.getByRole("combobox", { name: "Персонаж предмета" });
  for (const c of new Set(items.map((e) => e.category))) {
    await category.selectOption(c);
    assert.equal(
      await p.locator("[data-system-id]").count(),
      items.filter((e) => e.category === c).length,
    );
  }
  await category.selectOption("");
  for (const o of new Set(items.flatMap((e) => e.characterIds))) {
    await owner.selectOption(o);
    assert.equal(
      await p.locator("[data-system-id]").count(),
      items.filter((e) => e.characterIds.includes(o)).length,
    );
  }
  await owner.selectOption("");
  await p.getByRole("searchbox").fill("кошмарная зажигалка");
  assert.equal(await p.locator("[data-system-id]").count(), 1);
  await category.selectOption("coin");
  assert.equal(await p.locator("[data-system-id]").count(), 0);
  await p.getByRole("heading", { name: "Ничего не найдено" }).waitFor();
  await p.getByRole("button", { name: "Сбросить фильтры" }).click();
  assert.equal(await p.locator("[data-system-id]").count(), items.length);
  await p.evaluate(() => (window.sameWikiDocument = "yes"));
  const link = p.locator('[data-system-id="item:hook"]');
  await link.focus();
  await p.keyboard.press("Enter");
  await p.waitForURL("**/items/hook");
  await p.getByRole("heading", { name: "Хук", exact: true }).waitFor();
  assert.equal(await p.evaluate(() => window.sameWikiDocument), "yes");
  await p
    .getByRole("link", { name: "И куда собрался?", exact: true })
    .first()
    .click();
  await p.waitForURL("**/abilities/hook-throw");
  await p.getByRole("link", { name: "Хук", exact: true }).first().click();
  await p.waitForURL("**/items/hook");
  await p.goto(origin + base + "/mechanics");
  await p.waitForLoadState("networkidle");
  for (const c of new Set(mechanics.map((e) => e.category))) {
    await p
      .getByRole("combobox", { name: "Категория", exact: true })
      .selectOption(c);
    assert.equal(
      await p.locator("[data-system-id]").count(),
      mechanics.filter((e) => e.category === c).length,
    );
  }
  const modelRequests = [];
  p.on("response", (response) => {
    if (/ModelCanvas|\.glb$/.test(response.url()))
      modelRequests.push(response.url());
  });
  await p.goto(origin + base + "/characters/keeper-of-nightmares");
  await p.waitForLoadState("networkidle");
  assert.equal(modelRequests.length, 0);
  await p
    .getByRole("button", { name: "Загрузить 3D-модель", exact: true })
    .click();
  await p.waitForFunction(() =>
    Array.from(document.querySelectorAll("button")).some(
      (button) => button.textContent === "Сбросить камеру" && !button.disabled,
    ),
  );
  assert.ok((await p.locator("canvas").count()) > 0);
  assert.ok(modelRequests.some((url) => url.endsWith(".glb")));
  await p.getByRole("button", { name: "Сбросить камеру", exact: true }).click();
  for (const version of ["1.0", "1.1", "1.2"]) {
    await p.goto(origin + "/projects/maniac/changelog/" + version);
    await p.waitForLoadState("networkidle");
    assert.equal(
      await p.locator(`[data-release-decor="${version}"]`).count(),
      1,
    );
    assert.ok(
      await p
        .locator(`[data-release-decor="${version}"] *`)
        .evaluateAll((nodes) =>
          nodes.some((node) => getComputedStyle(node).animationName !== "none"),
        ),
    );
  }
  await p.goto(origin + "/projects/maniac");
  await p.waitForLoadState("networkidle");
  assert.ok(
    (
      await p
        .getByRole("link", { name: /Скачать Maniac 1.2/ })
        .first()
        .getAttribute("href")
    ).includes("drive.usercontent.google.com/download"),
  );
  assert.ok(
    (
      await p
        .getByRole("link", { name: /Скачать с Яндекс Диска/ })
        .first()
        .getAttribute("href")
    ).includes("disk.yandex.ru"),
  );
  report.checks.push(
    "Keeper 3D loads on demand and renders; all three chronicle backgrounds retain animations; Drive/Yandex buttons preserved.",
  );
  report.checks.push(
    "All item/mechanic categories, all confirmed character filters, combined search/empty/reset, keyboard SPA, Hook ↔ ability.",
  );
  const samples = [
    "/items",
    "/mechanics",
    "/items/nightmare-lighter",
    "/items/medical-tablet",
    "/items/dead-staff",
    "/items/quantum-teleport",
    "/items/coin-fate",
    "/mechanics/nightmare-trials",
    "/mechanics/hacking",
    "/mechanics/map-interactions",
  ];
  for (const width of [320, 390, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const path of samples) {
      await p.goto(origin + base + path);
      await p.waitForLoadState("networkidle");
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        path + " overflow " + width,
      );
    }
    report.responsive.push({ width, pages: samples.length, overflow: false });
    console.log("PASS: responsive " + width);
  }
  for (const width of [1440, 390]) {
    await p.setViewportSize({ width, height: 900 });
    for (const [name, path] of [
      ["items", "/items"],
      ["mechanics", "/mechanics"],
      ["lighter", "/items/nightmare-lighter"],
      ["staff", "/items/dead-staff"],
      ["nightmare", "/mechanics/nightmare-trials"],
      ["hacking", "/mechanics/hacking"],
    ]) {
      await p.goto(origin + base + path);
      await p.waitForLoadState("networkidle");
      for (const img of await p.locator("main img").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((e) => e.decode());
      }
      await p.evaluate(() => scrollTo(0, 0));
      const file = resolve(out, `${name}-${width}.png`);
      await p.screenshot({ path: file, fullPage: true });
      await p.screenshot({
        path: resolve(out, `${name}-${width}-viewport.png`),
      });
      report.screenshots.push(file);
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/MANIAC_3C_BROWSER.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    "PASS: filters, SPA, 12 desktop/mobile screenshots and all browser checks",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
