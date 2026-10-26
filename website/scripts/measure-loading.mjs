import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createStaticServer } from "./serve.mjs";

// Optional external QA runtime; no browser automation dependency ships to users.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)).href
    : "playwright"
);
const phase = process.argv[2] ?? "after";
assert.ok(["before", "after"].includes(phase));
const modules = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const server = createStaticServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const paths = [
  "/",
  "/projects/maniac",
  "/projects/maniac/changelog/1.0",
  "/projects/maniac/changelog/1.1",
  "/projects/maniac/changelog/1.2",
  "/changelog",
  "/projects/maniac/changelog",
];
const results = [];
try {
  for (const path of paths) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    const responses = [];
    page.on("response", (r) => {
      if (new URL(r.url()).pathname.endsWith(".js")) responses.push(r);
    });
    await page.addInitScript(() => {
      window.blankFrames = 0;
      let hadHeading = false;
      new MutationObserver(() => {
        const heading = document.querySelector("main h1");
        if (hadHeading && !heading) window.blankFrames++;
        if (heading) hadHeading = true;
      }).observe(document, { childList: true, subtree: true });
      document.addEventListener("DOMContentLoaded", () => {
        window.initialHeading = document.querySelector("main h1");
      });
    });
    await page.goto(origin + path);
    await page.waitForLoadState("networkidle");
    const heading = await page.locator("main h1").innerText();
    assert.ok(
      await page.evaluate(
        () => window.initialHeading === document.querySelector("main h1"),
      ),
      "Hydration must preserve the SSG heading node",
    );
    const resources = [];
    for (const response of responses) {
      assert.equal(response.status(), 200);
      const body = await response.body();
      const file = new URL(response.url()).pathname.slice(1);
      resources.push({
        file,
        bytes: body.length,
        gzipBytes: gzipSync(body).length,
        modules: modules[file]?.modules ?? [],
      });
    }
    const loadedModules = resources.flatMap((r) => r.modules);
    const jsonVersions = loadedModules.filter((m) =>
      /changelogs\/content\/1\.[012]\.json$/.test(m),
    );
    if (phase === "after") {
      const version = path.match(/changelog\/(1\.[012])$/)?.[1];
      assert.deepEqual(
        jsonVersions,
        version
          ? [`src/app/projects/maniac/changelogs/content/${version}.json`]
          : [],
      );
      if (!version)
        assert.ok(!loadedModules.some((m) => m.endsWith("/ChroniclePage.tsx")));
    }
    assert.deepEqual(errors, [], path);
    assert.equal(
      await page.evaluate(() => window.blankFrames),
      0,
      "No empty content while hydrating",
    );
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(origin + path);
    assert.equal(await staticPage.locator("main h1").innerText(), heading);
    assert.equal(
      await staticPage.locator("[data-source-section]").count(),
      await page.locator("[data-source-section]").count(),
    );
    assert.deepEqual(
      await staticPage.locator("[data-original-text]").allTextContents(),
      await page.locator("[data-original-text]").allTextContents(),
    );
    assert.equal(
      await staticPage
        .locator("main h1")
        .evaluate((e) => getComputedStyle(e).fontSize),
      await page
        .locator("main h1")
        .evaluate((e) => getComputedStyle(e).fontSize),
      "SSG CSS must work without JS",
    );
    await noJS.close();
    results.push({
      path,
      count: resources.length,
      bytes: resources.reduce((n, r) => n + r.bytes, 0),
      gzipBytes: resources.reduce((n, r) => n + r.gzipBytes, 0),
      jsonVersions,
      resources,
      errors,
    });
    await context.close();
  }
  const page = await browser.newPage();
  const navigationErrors = [];
  page.on("pageerror", (e) => navigationErrors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") navigationErrors.push(e.text());
  });
  await page.goto(origin + "/projects/maniac/changelog/1.2");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => (window.documentMarker = "same-document"));
  await page.route("**/assets/*.js", async (route) => {
    await new Promise((r) => setTimeout(r, 350));
    await route.continue();
  });
  await page
    .getByRole("navigation", { name: "Переходы между выпусками" })
    .getByRole("link")
    .first()
    .click();
  await page.waitForURL("**/1.1");
  if (phase === "after") {
    assert.equal(
      await page.locator("main h1").innerText(),
      "Flower Cleaning",
      "Previous page remains while the new chunk loads",
    );
  }
  await page
    .getByRole("heading", { name: "Кошмарный додеп", exact: true })
    .waitFor();
  await page
    .getByRole("navigation", { name: "Переходы между выпусками" })
    .getByRole("link")
    .first()
    .click();
  await page
    .getByRole("heading", { name: "Maniac Reforge", exact: true })
    .waitFor();
  await page.goBack();
  await page
    .getByRole("heading", { name: "Кошмарный додеп", exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(() => window.documentMarker),
    "same-document",
  );
  assert.deepEqual(navigationErrors, []);
  assert.match(await page.title(), /Кошмарный додеп/);
  // Rapid navigation cancels a stale load rather than overwriting the latest page.
  await page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("link", { name: "Главная", exact: true })
    .click();
  await page.goBack();
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator("main h1").innerText(), "Кошмарный додеп");
  if (phase === "after") {
    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const mobileErrors = [];
    mobile.on("pageerror", (e) => mobileErrors.push(e.message));
    for (const version of ["1.0", "1.1", "1.2"]) {
      await mobile.goto(origin + `/projects/maniac/changelog/${version}`);
      await mobile.waitForLoadState("networkidle");
      assert.equal(
        await mobile.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      const decor = mobile.locator("[data-release-decor]");
      assert.ok(
        await decor.evaluate(
          (e) => e.getAnimations({ subtree: true }).length > 0,
        ),
      );
      await mobile.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await decor.evaluate((e) => e.getAnimations({ subtree: true }).length),
        0,
      );
      await mobile.emulateMedia({ reducedMotion: "no-preference" });
    }
    await mobile.goto(origin + "/projects/maniac");
    await mobile.waitForLoadState("networkidle");
    for (const download of await mobile
      .getByRole("link", {
        name: "Скачать Maniac 1.2 с Google Drive",
      })
      .all()) {
      assert.match(
        await download.getAttribute("href"),
        /drive\.usercontent\.google\.com\/download\?id=1Pe_mgHtMvoVIn5-FwG5Nj_sG0xuDvY6D/,
      );
      assert.equal(await download.getAttribute("target"), "_blank");
    }
    for (const mirror of await mobile
      .getByRole("link", { name: /Скачать с Яндекс Диска/ })
      .all()) {
      assert.equal(
        await mirror.getAttribute("href"),
        "https://disk.yandex.ru/d/z7mqmWDD3k9OTg",
      );
    }
    assert.deepEqual(mobileErrors, []);
    await mobile.close();
    // A missing route chunk keeps readable content and offers an explicit retry.
    const failure = await browser.newPage();
    await failure.goto(origin + "/projects/maniac/changelog/1.2");
    await failure.waitForLoadState("networkidle");
    await failure.route("**/assets/HomePage-*.js", (route) => route.abort());
    await failure
      .getByRole("navigation", { name: "Основная навигация" })
      .getByRole("link", { name: "Главная", exact: true })
      .click();
    await failure.getByRole("alert").waitFor();
    assert.equal(
      await failure.locator("main h1").innerText(),
      "Flower Cleaning",
    );
    await failure.close();
  }
  await writeFile(
    `docs/loading-${phase}.json`,
    JSON.stringify(
      {
        phase,
        measurement:
          "Cold browser context per URL; static production preview without HTTP compression; bytes = response bodies, gzip = local gzip estimate (no headers/cache).",
        results,
        navigation: "1.2 → 1.1 → 1.0 → Back, same document",
        checks:
          phase === "after"
            ? [
                "SSG heading node retained",
                "No blank hydration frames",
                "Full original text and CSS without JS",
                "Delayed SPA navigation and race cancellation",
                "Chunk failure retains content",
                "Mobile overflow/animations/reduced motion",
                "Google Drive and Yandex links preserved",
              ]
            : [
                "SSG heading node retained",
                "Full HTML without JS",
                "SPA version navigation",
              ],
        bundles: modules,
      },
      null,
      2,
    ) + "\n",
  );
  console.table(
    results.map(({ path, count, bytes, gzipBytes, jsonVersions }) => ({
      path,
      count,
      bytes,
      gzipBytes,
      jsonVersions: jsonVersions.length,
    })),
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
