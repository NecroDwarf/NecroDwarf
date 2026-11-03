import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  withBrowserCheck,
  observePageErrors,
  expect,
} from "./browser-check.mjs";

const base = "/projects/maniac/wiki";
await withBrowserCheck(
  "journeys",
  async ({ browser, origin, screenshots, reportPath }) => {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [],
      checks = [],
      images = new Set();
    observePageErrors(page, errors);
    await page.goto(origin + base + "/characters/keeper-of-nightmares");
    const journey = [
      "abilities/abyss-gaze",
      "items/nightmare-lighter",
      "mechanics/nightmare-trials",
      "characters/keeper-of-nightmares",
    ];
    for (const target of journey) {
      await page.locator(`main a[href="${base}/${target}"]`).first().click();
      await expect(page).toHaveURL(origin + base + "/" + target);
      await expect(page.locator("main h1")).toBeVisible();
      const section = target.split("/")[0];
      await expect(
        page
          .getByRole("navigation", { name: "Maniac Wiki", exact: true })
          .locator(`a[href="${base}/${section}"]`),
      ).toHaveAttribute("aria-current", "page");
    }
    checks.push(
      "Character → ability → item → mechanic → character; active Wiki sections",
    );
    await page.goBack();
    await expect(page).toHaveURL(origin + base + "/mechanics/nightmare-trials");
    await page.goForward();
    await expect(page).toHaveURL(
      origin + base + "/characters/keeper-of-nightmares",
    );
    await page.goto(origin + base);
    assert.match(
      await page
        .getByText("У каждой охоты есть две стороны.", { exact: true })
        .textContent(),
      /охоты есть/,
    );
    assert.match(
      await page.locator("#featured-character").textContent(),
      /смотри слишком/,
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const grid = page.locator("[data-wiki-categories]");
      const rows = await grid
        .locator(":scope > a")
        .evaluateAll((links) =>
          links.map((a) => Math.round(a.getBoundingClientRect().y)),
        );
      assert.equal(rows.length, 6);
      assert.equal(new Set(rows).size, width > 1000 ? 1 : width > 700 ? 2 : 3);
    }
    checks.push(
      "Word separation at hidden line breaks; six category cards form complete rows at four widths",
    );
    for (const version of ["1.0", "1.1", "1.2"]) {
      await page.goto(origin + `/projects/maniac/changelog/${version}`);
      await page.waitForLoadState("networkidle");
      const decor = page.locator("[data-release-decor]");
      assert.ok(
        await decor.evaluate(
          (e) => e.getAnimations({ subtree: true }).length > 0,
        ),
        version,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await decor.evaluate((e) => e.getAnimations({ subtree: true }).length),
        0,
        version,
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.screenshot({
        path: resolve(screenshots, `chronicle-${version}.png`),
      });
    }
    checks.push(
      "All three chronicle animations run; reduced motion stops them",
    );
    // Decode every unique published image, including inline icons and srcset variants.
    const paths = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
    for (const path of paths.filter((path) => path.startsWith(base))) {
      const html = await readFile(`build/client${path}.html`, "utf8");
      for (const [, src] of html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g))
        images.add(src);
      for (const [, set] of html.matchAll(/<img[^>]*\ssrc[Ss]et="([^"]+)"/g))
        for (const part of set.split(","))
          images.add(part.trim().split(/\s+/)[0]);
    }
    await page.goto(origin + base);
    const imageResults = await page.evaluate(
      async (sources) => {
        const results = [];
        for (const src of sources) {
          const img = new Image();
          const decoder = document.createElement("textarea");
          decoder.innerHTML = src;
          img.src = decoder.value;
          try {
            await img.decode();
            results.push({
              src: src.startsWith("data:") ? "inline original asset" : src,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          } catch {
            throw new Error(`Image decode failed: ${src.slice(0, 150)}`);
          }
        }
        return results;
      },
      [...images],
    );
    checks.push(
      `All ${imageResults.length} unique published Wiki images decode, including srcset and inline assets`,
    );
    assert.deepEqual(errors, []);
    await writeFile(
      reportPath,
      JSON.stringify({ checks, images: imageResults, errors }, null, 2) + "\n",
    );
    console.log(
      `PASS: related-entity journey, active menu, Back/Forward, word spacing, balanced grids, chronicle animations and ${imageResults.length} image decodes`,
    );
  },
);
