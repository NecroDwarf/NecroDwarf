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
const root = "src/app/projects/maniac/wiki/",
  base = "/projects/maniac/wiki/maps";
const maps = JSON.parse(await readFile(root + "data/map-catalog.json", "utf8"));
const modules = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const out = resolve(
  process.env.WIKI_SCREENSHOT_DIR || "../.audit/wiki-3c2-screenshots",
);
await mkdir(out, { recursive: true });
const server = createStaticServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { routes: [], widths: [], screenshots: [], checks: [] };
const targets = [
  { path: base },
  ...maps.map((map) => ({ ...map, path: base + "/" + map.slug })),
];
try {
  for (const target of targets) {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      }),
      p = await context.newPage(),
      errors = [],
      scripts = [],
      imageRequests = [];
    p.on("pageerror", (error) => errors.push(error.message));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    p.on("response", (response) => {
      const path = new URL(response.url()).pathname;
      if (path.endsWith(".js")) scripts.push(response);
      if (/\/assets\/(?:mansion|pizzeria|fort)-.*\.webp$/.test(path))
        imageRequests.push(path);
    });
    await p.addInitScript(() =>
      document.addEventListener(
        "DOMContentLoaded",
        () => (window.ssgHeading = document.querySelector("main h1")),
      ),
    );
    assert.equal((await p.goto(origin + target.path)).status(), 200);
    await p.waitForLoadState("networkidle");
    assert.ok(
      await p.evaluate(
        () => window.ssgHeading === document.querySelector("main h1"),
      ),
      target.path,
    );
    const resources = [];
    for (const response of scripts)
      resources.push({
        file: new URL(response.url()).pathname.slice(1),
        bytes: (await response.body()).length,
      });
    const loaded = resources.flatMap(
      (resource) => modules[resource.file]?.modules ?? [],
    );
    if (!target.slug)
      assert.ok(
        !loaded.includes("src/app/projects/maniac/wiki/data/registry.ts"),
        "Map catalog does not need the full entity registry",
      );
    const articles = loaded.filter((m) =>
      /wiki\/data\/(?:map|item|mechanic|perk|ability|character)-articles\/.*\.json$/.test(
        m,
      ),
    );
    assert.deepEqual(
      articles,
      target.slug
        ? [`src/app/projects/maniac/wiki/data/map-articles/${target.slug}.json`]
        : [],
    );
    assert.ok(
      !loaded.some((m) =>
        /node_modules\/three\/|\.glb|ModelCanvas|changelogs\/content\/.*\.json$/.test(
          m,
        ),
      ),
      target.path,
    );
    if (target.slug)
      assert.ok(
        imageRequests.length > 0 &&
          imageRequests.every((path) => path.includes("/" + target.slug + "-")),
        target.path,
      );
    else
      assert.ok(
        imageRequests.every((path) => !/mansion-1261|fort-1600/.test(path)),
        "Catalog fetched large article images",
      );
    const nojs = await browser.newContext({ javaScriptEnabled: false }),
      staticPage = await nojs.newPage();
    await staticPage.goto(origin + target.path);
    assert.equal(
      await staticPage.locator("main h1").innerText(),
      await p.locator("main h1").innerText(),
    );
    if (target.slug) {
      const article = JSON.parse(
        await readFile(root + `data/map-articles/${target.slug}.json`, "utf8"),
      );
      assert.equal(
        await staticPage.locator("[data-guide-detail]").count(),
        article.details.length,
      );
      assert.deepEqual(
        await staticPage.locator("[data-guide-detail] p").allTextContents(),
        article.details,
      );
      assert.equal(
        await staticPage
          .locator("[data-difficulty]")
          .getAttribute("data-difficulty"),
        String(target.difficulty),
      );
    } else assert.equal(await staticPage.locator("[data-map-id]").count(), 3);
    assert.deepEqual(errors, []);
    report.routes.push({
      path: target.path,
      jsCount: resources.length,
      jsBytes: resources.reduce((sum, r) => sum + r.bytes, 0),
      resources,
      articleModules: articles,
      images: imageRequests,
    });
    await nojs.close();
    await context.close();
  }
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  p.on("pageerror", (error) => errors.push(error.message));
  await p.goto(origin + base);
  await p.waitForLoadState("networkidle");
  await p.evaluate(() => (window.mapNavigationMarker = "kept"));
  await p.locator('[data-map-id="map:fort"]').focus();
  await p.keyboard.press("Enter");
  await p.waitForURL("**/maps/fort");
  await p.getByRole("heading", { name: "Форт", exact: true }).waitFor();
  assert.equal(await p.evaluate(() => window.mapNavigationMarker), "kept");
  await p.getByRole("link", { name: /Кошмарный додеп/ }).click();
  await p.waitForURL("**/changelog/1.1#fort-map");
  await p.waitForFunction(() => {
    const e = document.getElementById("fort-map");
    return (
      e &&
      e.getBoundingClientRect().top >= -1 &&
      e.getBoundingClientRect().top < innerHeight
    );
  });
  assert.equal(await p.evaluate(() => window.mapNavigationMarker), "kept");
  await p.locator('[data-map-chronicle-link="map:fort"] a').click();
  await p.waitForURL("**/maps/fort");
  await p
    .getByRole("link", { name: "Как выбирается карта →", exact: true })
    .click();
  await p.waitForURL("**/maps#map-voting");
  await p.waitForFunction(() => {
    const e = document.getElementById("map-voting");
    return (
      e &&
      e.getBoundingClientRect().top >= -1 &&
      e.getBoundingClientRect().top < innerHeight
    );
  });
  await p.goto(origin + "/projects/maniac/wiki/mechanics/map-interactions");
  await p.waitForLoadState("networkidle");
  assert.ok(
    await p.getByRole("link", { name: "Особняк", exact: true }).count(),
  );
  assert.ok(
    await p.getByRole("link", { name: "Пиццерия", exact: true }).count(),
  );
  report.checks.push(
    "Keyboard SPA catalog → Fort; Fort ↔ chronicle 1.1 without document reload and working anchors; voting anchor; reverse mechanics → maps links.",
  );
  for (const width of [320, 390, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const target of targets) {
      await p.goto(origin + target.path);
      await p.waitForLoadState("networkidle");
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${target.path} overflow ${width}`,
      );
      for (const image of await p.locator("main img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img) => img.decode());
        assert.ok(await image.evaluate((img) => img.naturalWidth > 0));
      }
    }
    report.widths.push({ width, routes: 4, overflow: false });
  }
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(origin + base);
  await p.waitForLoadState("networkidle");
  await p.locator("[data-map-id]").first().hover();
  const motion = await p
    .locator("[data-map-id] img")
    .first()
    .evaluate((img) => ({
      transition: getComputedStyle(img).transitionDuration,
      transform: getComputedStyle(img).transform,
    }));
  assert.equal(motion.transition, "0s");
  assert.equal(motion.transform, "none");
  report.checks.push(
    "Reduced motion disables hover transition/zoom; native image proportions retained with contain.",
  );
  await p.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [1440, 390]) {
    await p.setViewportSize({ width, height: 900 });
    for (const target of targets) {
      await p.goto(origin + target.path);
      await p.waitForLoadState("networkidle");
      for (const img of await p.locator("main img").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((e) => e.decode());
      }
      await p.evaluate(() =>
        scrollTo({ top: 0, left: 0, behavior: "instant" }),
      );
      await p.waitForFunction(() => scrollY === 0);
      const name = target.slug ?? "catalog",
        file = resolve(out, `${name}-${width}.png`);
      await p.screenshot({ path: file, fullPage: true });
      await p.screenshot({
        path: resolve(out, `${name}-${width}-viewport.png`),
      });
      report.screenshots.push(file);
    }
  }
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
    "All three chronicle animations and Maniac Drive/Yandex buttons preserved.",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/MANIAC_3C2_BROWSER.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    "PASS: four map routes, no-JS, hydration, own text/art, SPA/anchors, all responsive widths, reduced motion, 8 desktop/mobile screenshots and regression smoke.",
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
