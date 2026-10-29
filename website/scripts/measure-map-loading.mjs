import { readFile, writeFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
export async function measureMapLoading() {
  const chunks = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
  const results = [];
  for (const source of [
    "src/main.tsx",
    "src/app/projects/maniac/pages/ManiacPage.tsx",
    "src/app/projects/maniac/wiki/pages/WikiHomePage.tsx",
    "src/app/projects/maniac/wiki/pages/CharactersPage.tsx",
  ]) {
    const entry = Object.keys(chunks).find((key) =>
      chunks[key].modules.includes(source),
    );
    if (!entry) throw Error("Missing " + source);
    const files = new Set();
    function visit(file) {
      if (files.has(file)) return;
      files.add(file);
      for (const next of chunks[file]?.imports ?? []) visit(next);
    }
    visit(entry);
    let bytes = 0,
      gzip = 0;
    for (const file of files) {
      const b = await readFile("build/client/" + file);
      bytes += b.length;
      gzip += gzipSync(b).length;
    }
    results.push({
      source,
      jsCount: files.size,
      bytes,
      gzip,
      files: [...files],
    });
  }
  return results;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const results = await measureMapLoading();
  const phase = process.argv[2];
  if (!["before", "after"].includes(phase)) throw Error("Use before or after");
  await writeFile(
    `docs/maniac-3c2-loading-${phase}.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  if (phase === "before") {
    const paths = (await readdir("build/client", { recursive: true }))
      .filter((path) => path.endsWith(".html") && path !== "404.html")
      .map((path) =>
        path === "index.html"
          ? "/"
          : "/" + path.replaceAll("\\", "/").slice(0, -5),
      )
      .sort();
    await writeFile(
      "docs/maniac-3c2-existing-routes.json",
      JSON.stringify(paths, null, 2) + "\n",
    );
  }
  console.log(
    results.map((r) => ({
      source: r.source,
      jsCount: r.jsCount,
      bytes: r.bytes,
      gzip: r.gzip,
    })),
  );
}
