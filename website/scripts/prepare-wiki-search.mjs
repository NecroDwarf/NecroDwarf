import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { articleText } from "./wiki-search-text.mjs";

const output = "src/app/projects/maniac/wiki/search-content.json";
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const { paths, render } = await server.ssrLoadModule("/src/entry-server.tsx");
  const { searchMetadata } = await server.ssrLoadModule(
    "/src/app/projects/maniac/wiki/search-metadata.ts",
  );
  const { searchAliases } = await server.ssrLoadModule(
    "/src/app/projects/maniac/wiki/search-vocabulary.ts",
  );
  for (const id of Object.keys(searchAliases))
    if (!searchMetadata.some((entry) => entry.id === id))
      throw new Error(`Unpublished search alias: ${id}`);
  const pages = new Map(),
    content = {};
  for (const entry of searchMetadata) {
    const path = entry.href.split("#")[0];
    if (!paths.includes(path))
      throw new Error(`Unpublished search route: ${path}`);
    if (!pages.has(path)) pages.set(path, (await render(path)).html);
    const text = articleText(pages.get(path), entry.href);
    if (!text) throw new Error(`Empty search article: ${entry.href}`);
    content[entry.href] = text;
  }
  const json = JSON.stringify(content, null, 2) + "\n";
  if ((await readFile(output, "utf8")) !== json) await writeFile(output, json);
  console.log(
    `Wiki search: ${searchMetadata.length} published articles, ${Buffer.byteLength(json)} bytes of derived text`,
  );
} finally {
  await server.close();
}
