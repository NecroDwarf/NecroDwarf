import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { withBrowserCheck, observePageErrors } from "./browser-check.mjs";

await withBrowserCheck("hydration", async ({ browser, origin, reportPath }) => {
  const checks = [],
    errors = [];
  const dev = await createServer({
    server: { host: "127.0.0.1" },
    clearScreen: false,
  });
  try {
    await dev.listen();
    const devOrigin =
      process.env.DEV_ORIGIN ||
      `http://127.0.0.1:${dev.httpServer.address().port}`;
    // Reproduce real Vite template markup, plus empty and whitespace-only roots.
    for (const markup of [
      "<!--app-html-->",
      " \n<!--app-html-->\n ",
      "",
      " \n ",
    ]) {
      // Chromium requires this permission for the local Vite HMR WebSocket.
      const page = await browser.newPage({
        permissions: ["local-network-access"],
      });
      observePageErrors(page, errors);
      await page.route("**/projects/maniac/wiki", async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          body: (await response.text()).replace("<!--app-html-->", markup),
        });
      });
      await page.goto(devOrigin + "/projects/maniac/wiki");
      await page.locator("main h1").waitFor();
      await page.waitForLoadState("networkidle");
      assert.deepEqual(errors, [], `Dev root: ${JSON.stringify(markup)}`);
      checks.push({
        devMarkup: markup,
        result: "createRoot without hydration errors",
      });
      await page.close();
    }
  } finally {
    await dev.close();
  }
  for (const path of [
    "/projects/maniac/wiki",
    "/projects/maniac/wiki/perks/independence",
    "/projects/maniac/wiki/search?q=учёный",
  ]) {
    const page = await browser.newPage();
    observePageErrors(page, errors);
    // Hold JS to verify readable SSG before hydration, then compare node identity.
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/assets/*.js", async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(origin + path, { waitUntil: "commit" });
    await page.locator("main h1").waitFor();
    await page.evaluate(() => {
      window.originalHeading = document.querySelector("main h1");
      window.removedHeading = false;
      new MutationObserver(() => {
        if (!window.originalHeading.isConnected) window.removedHeading = true;
      }).observe(document.getElementById("root"), {
        childList: true,
        subtree: true,
      });
    });
    release();
    await page.waitForLoadState("networkidle");
    assert.equal(
      await page.evaluate(
        () =>
          window.originalHeading === document.querySelector("main h1") &&
          !window.removedHeading,
      ),
      true,
      path,
    );
    assert.deepEqual(errors, [], path);
    checks.push({
      path,
      result: "SSG node preserved throughout delayed hydration",
    });
    await page.close();
  }
  await writeFile(
    reportPath,
    JSON.stringify({ checks, errors }, null, 2) + "\n",
  );
  console.log(
    "PASS: comment/whitespace/empty dev roots use createRoot; delayed production hydration preserves static nodes; no console errors",
  );
});
