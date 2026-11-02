import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createServer as createModuleServer } from "vite";
import { createStaticServer } from "./serve.mjs";
export { expect } from "playwright/test";

export function observePageErrors(page, errors) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
}

/** Each suite owns its browser, ephemeral server and ignored output directory. */
export async function withBrowserCheck(name, run) {
  const output = resolve(
    process.env.BROWSER_OUTPUT_DIR || "build/browser-checks",
    name,
  );
  const screenshots = resolve(
    process.env.WIKI_SCREENSHOT_DIR || resolve(output, "screenshots"),
  );
  await mkdir(screenshots, { recursive: true });
  await mkdir(output, { recursive: true });
  await Promise.all(
    ["report.json", "failure.json"].map((file) =>
      rm(resolve(output, file), { force: true }),
    ),
  );
  const server = createStaticServer();
  let browser, moduleServer, failure;
  try {
    const { chromium } = await import(
      process.env.PLAYWRIGHT_MODULE
        ? pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)).href
        : "playwright"
    );
    await new Promise((done, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", done);
    });
    browser = await chromium.launch({
      headless: true,
      ...(process.env.BROWSER_CHANNEL
        ? { channel: process.env.BROWSER_CHANNEL }
        : {}),
    });
    await run({
      browser,
      origin: `http://127.0.0.1:${server.address().port}`,
      screenshots,
      reportPath: resolve(output, "report.json"),
      async loadWikiModule(path) {
        moduleServer ??= await createModuleServer({
          server: { middlewareMode: true, hmr: false, ws: false },
          optimizeDeps: { noDiscovery: true, include: [] },
          appType: "custom",
        });
        return moduleServer.ssrLoadModule(
          `/src/app/projects/maniac/wiki/${path}`,
        );
      },
    });
  } catch (error) {
    failure = error;
    await writeFile(
      resolve(output, "failure.json"),
      JSON.stringify({ message: error.message, stack: error.stack }, null, 2) +
        "\n",
    );
    throw error;
  } finally {
    const cleanup = await Promise.allSettled([
      browser?.close(),
      moduleServer?.close(),
      server.listening
        ? new Promise((done, reject) =>
            server.close((error) => (error ? reject(error) : done())),
          )
        : undefined,
    ]);
    if (!failure) {
      const failed = cleanup.find((result) => result.status === "rejected");
      if (failed) throw failed.reason;
    }
  }
}
