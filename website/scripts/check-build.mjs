import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createStaticServer } from "./serve.mjs";
const paths = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
const server = createStaticServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  const documents = new Map();
  for (const path of paths) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    documents.set(path, html);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${path}: h1`);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /name="description"/);
    assert.doesNotMatch(html, /<!--app-(html|head)-->/);
    assert.doesNotMatch(
      html,
      /Kingdoms of Chat|Die Dice Paradise|The Ancient Guardians|Dota: Legend of Creeps/,
    );
    assert.doesNotMatch(html, /href="(?:#|)"/);
    const redirect = await fetch(
      origin + (path === "/" ? "/projects/" : path + "/"),
      { redirect: "manual" },
    );
    assert.equal(redirect.status, 301);
  }
  const assets = new Set();
  for (const [path, html] of documents) {
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (url.startsWith("#")) {
        assert.ok(html.includes(`id="${url.slice(1)}"`), `${path}: ${url}`);
        continue;
      }
      if (!url.startsWith("/")) continue;
      if (paths.includes(url)) continue;
      assets.add(url);
    }
  }
  for (const asset of assets)
    assert.equal(
      (await fetch(origin + asset)).status,
      200,
      `Missing asset or route: ${asset}`,
    );
  for (const path of [
    "/does-not-exist",
    "/projects/maniac/wiki/perks/not-registered",
    "/projects/maniac/wiki/abilities/not-registered",
    "/projects/maniac/wiki/items/not-registered",
    "/projects/maniac/wiki/mechanics/not-registered",
    "/projects/maniac/wiki/maps/not-registered",
    "/projects/maniac/wiki/characters/unknown",
    "/projects/maniac/changelog/1.3",
    "/neo-tech-v2",
  ]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 404, path);
    assert.match(await response.text(), /404 \/ НЕИЗВЕСТНЫЙ МАРШРУТ/);
  }
  assert.match(
    await (await fetch(origin + "/robots.txt")).text(),
    /User-agent/,
  );
  const canonical = documents.get("/").match(/rel="canonical" href="([^"]+)"/);
  if (canonical) {
    const site = canonical[1].replace(/\/$/, "");
    const sitemap = await fetch(origin + "/sitemap.xml");
    assert.equal(sitemap.status, 200);
    const xml = await sitemap.text();
    assert.equal((xml.match(/<loc>/g) || []).length, paths.length);
    for (const [path, html] of documents) {
      assert.ok(xml.includes(`<loc>${site}${path}</loc>`));
      assert.ok(html.includes(`rel="canonical" href="${site}${path}"`));
      assert.doesNotMatch(html, /name="robots" content="noindex/);
    }
  } else {
    assert.equal((await fetch(origin + "/sitemap.xml")).status, 404);
    for (const html of documents.values())
      assert.match(html, /name="robots" content="noindex/);
  }
  console.log(
    `PASS: ${paths.length} direct HTML routes, metadata, links, ${assets.size} assets, trailing slashes, unpublished routes and HTTP 404.`,
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
