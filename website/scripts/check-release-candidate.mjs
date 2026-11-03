import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { createServer } from "vite";
import { withBrowserCheck, observePageErrors } from "./browser-check.mjs";

const phase = process.argv[2] || "after";
assert.ok(["before", "after"].includes(phase));
const base = "/projects/maniac/wiki";
const modules = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const paths = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
const samples = [
  "/projects/maniac",
  base,
  ...[
    "characters",
    "perks",
    "abilities",
    "items",
    "mechanics",
    "maps",
    "effects",
  ].map((s) => `${base}/${s}`),
  ...[
    "characters/keeper-of-nightmares",
    "perks/rose-colored-glasses",
    "abilities/abyss-gaze",
    "items/death-scythe",
    "mechanics/sanity",
    "maps/mansion",
  ].map((s) => `${base}/${s}`),
  ...["1.0", "1.1", "1.2"].map((v) => `/projects/maniac/changelog/${v}`),
];
// Resolve representative slugs from the existing metadata, rather than guessing URLs.
for (let i = 9; i < 15; i++) {
  if (!paths.includes(samples[i])) {
    const section = samples[i].split("/").at(-2);
    samples[i] = paths.find((p) => p.startsWith(`${base}/${section}/`));
  }
}
await withBrowserCheck(
  `release-${phase}`,
  async ({ browser, origin, screenshots, reportPath }) => {
    const report = {
      phase,
      paths,
      network: [],
      responsive: [],
      images: [],
      dev: [],
      checks: [],
    };
    for (const path of samples) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      const page = await context.newPage();
      const errors = [],
        responses = [];
      observePageErrors(page, errors);
      page.on("response", (response) => responses.push(response));
      await page.addInitScript(() =>
        document.addEventListener("DOMContentLoaded", () => {
          window.originalHeading = document.querySelector("main h1");
        }),
      );
      assert.equal((await page.goto(origin + path)).status(), 200, path);
      await page.waitForLoadState("networkidle");
      assert.equal(
        await page.evaluate(
          () => window.originalHeading === document.querySelector("main h1"),
        ),
        true,
        path,
      );
      assert.deepEqual(errors, [], path);
      const resources = [];
      for (const response of responses) {
        const file = new URL(response.url()).pathname.slice(1);
        assert.equal(response.status(), 200, file);
        const body = await response.body();
        resources.push({
          file,
          bytes: body.length,
          gzipBytes: gzipSync(body).length,
        });
      }
      const scripts = resources.filter((r) => r.file.endsWith(".js"));
      const loaded = scripts.flatMap((r) => modules[r.file]?.modules || []);
      assert.ok(
        !loaded.some((m) =>
          /node_modules\/three\/|ModelCanvas|search-index/.test(m),
        ),
        path,
      );
      assert.ok(!resources.some((r) => r.file.endsWith(".glb")), path);
      if (!/changelog\/1\./.test(path))
        assert.ok(
          !loaded.some((m) => /changelogs\/content\/.*\.json/.test(m)),
          path,
        );
      report.network.push({
        path,
        js: scripts.reduce((n, r) => n + r.bytes, 0),
        gzipJS: scripts.reduce((n, r) => n + r.gzipBytes, 0),
        resources,
      });
      await context.close();
    }
    const page = await browser.newPage();
    const errors = [];
    observePageErrors(page, errors);
    const visual = [
      base,
      `${base}/characters`,
      `${base}/perks`,
      `${base}/items`,
      ...samples.slice(9, 15),
      `${base}/effects`,
    ];
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of visual) {
        await page.goto(origin + path);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        for (
          let y = 0;
          y < (await page.evaluate(() => document.body.scrollHeight));
          y += 800
        ) {
          await page.evaluate((y) => scrollTo(0, y), y);
          await page.waitForTimeout(50);
        }
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => scrollTo(0, 0));
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        assert.equal(overflow, false, `${path} ${width}px`);
        const broken = await page
          .locator("img")
          .evaluateAll((images) =>
            images
              .filter((img) => img.complete && !img.naturalWidth)
              .map((img) => img.src),
          );
        assert.deepEqual(broken, [], path);
        report.responsive.push({ path, width, overflow });
        if ([390, 1440].includes(width) || path === base) {
          const file = `${path.split("/").slice(3).join("-") || "wiki"}-${width}.png`;
          await page.screenshot({
            path: resolve(screenshots, file),
            fullPage: true,
          });
        }
      }
    }
    // Complex item assets must be tested inside their actual article presentation.
    const itemMeta = JSON.parse(
      await readFile(
        "src/app/projects/maniac/wiki/data/item-catalog.json",
        "utf8",
      ),
    );
    for (const name of [
      /коса/i,
      /лампа/i,
      /планшет агента/i,
      /розовые очки/i,
    ]) {
      const item = itemMeta.find((i) => name.test(i.name));
      assert.ok(item, String(name));
      await page.goto(origin + `${base}/items/${item.slug}`);
      await page.waitForLoadState("networkidle");
      report.images.push({
        name: item.name,
        images: await page.locator("main img").evaluateAll((imgs) =>
          imgs.map((i) => ({
            src: i.src.startsWith("data:")
              ? "inline original asset"
              : i.getAttribute("src"),
            width: i.naturalWidth,
            height: i.naturalHeight,
          })),
        ),
      });
      await page.screenshot({
        path: resolve(screenshots, `asset-${item.slug}.png`),
        fullPage: true,
      });
    }
    assert.deepEqual(errors, []);
    const dev = await createServer({
      server: { host: "127.0.0.1" },
      clearScreen: false,
    });
    try {
      await dev.listen();
      const devOrigin = `http://127.0.0.1:${dev.httpServer.address().port}`;
      for (const path of [base, `${base}/perks/independence`]) {
        const devPage = await browser.newPage({
          permissions: ["local-network-access"],
        });
        const errors = [];
        observePageErrors(devPage, errors);
        await devPage.goto(devOrigin + path);
        await devPage.locator("main h1").waitFor();
        await devPage.waitForLoadState("networkidle");
        report.dev.push({ path, errors });
        if (phase === "after") assert.deepEqual(errors, [], `dev: ${path}`);
        await devPage.close();
      }
    } finally {
      await dev.close();
    }
    if (phase === "after") {
      const oldPaths = JSON.parse(
        await readFile("docs/maniac-rc-existing-routes.json", "utf8"),
      );
      assert.ok(
        oldPaths.every((p) => paths.includes(p)),
        "Every previous public URL must remain",
      );
      report.checks.push(`Preserved all ${oldPaths.length} public URLs`);
      const before = await readFile(
        "build/browser-checks/release-before/report.json",
        "utf8",
      )
        .then(JSON.parse)
        .catch((error) => {
          if (error.code === "ENOENT") return null;
          throw error;
        });
      if (before)
        report.comparison = report.network.map((row) => ({
          path: row.path,
          beforeJS: before.network.find((p) => p.path === row.path).js,
          afterJS: row.js,
          gzipJS: row.gzipJS,
        }));
    }
    await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
    console.log(
      `PASS: release ${phase}, ${samples.length} network samples, ${report.responsive.length} responsive pages, complex assets and dev hydration`,
    );
  },
);
