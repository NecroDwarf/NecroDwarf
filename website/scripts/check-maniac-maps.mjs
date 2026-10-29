import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";
import { measureMapLoading } from "./measure-map-loading.mjs";
const root = "src/app/projects/maniac/wiki/",
  json = async (p) => JSON.parse(await readFile(p, "utf8"));
const audit = await json("docs/maniac-3c2-maps-audit.json"),
  catalog = await json(root + "data/map-catalog.json"),
  manifest = await json("src/app/projects/maniac/assets/maps/imports.json");
const hash = (b) => createHash("sha256").update(b).digest("hex");
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
function webpSize(b) {
  for (let offset = 12; offset + 8 < b.length; ) {
    const tag = b.toString("ascii", offset, offset + 4),
      n = b.readUInt32LE(offset + 4),
      start = offset + 8;
    if (tag === "VP8X")
      return [b.readUIntLE(start + 4, 3) + 1, b.readUIntLE(start + 7, 3) + 1];
    if (tag === "VP8L") {
      const bits = b.readUInt32LE(start + 1);
      return [(bits & 16383) + 1, ((bits >>> 14) & 16383) + 1];
    }
    if (tag === "VP8 ")
      return [
        b.readUInt16LE(start + 6) & 16383,
        b.readUInt16LE(start + 8) & 16383,
      ];
    offset = start + n + (n % 2);
  }
  throw Error("Invalid WebP");
}
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  optimizeDeps: { noDiscovery: true, include: [] },
});
try {
  const { entities, getRevision } = await server.ssrLoadModule(
    "/" + root + "data/registry.ts",
  );
  const { publishedEntityRoutes } = await server.ssrLoadModule(
    "/" + root + "data/publication.ts",
  );
  const { relatedEntityIds } = await server.ssrLoadModule(
    "/" + root + "data/relations.ts",
  );
  assert.deepEqual(
    catalog.map((m) => [m.slug, m.numericId, m.name, m.difficulty, m.size]),
    [
      ["mansion", 1, "Особняк", 3, "Большая"],
      ["pizzeria", 4, "Пиццерия", 4, "Средняя"],
      ["fort", 5, "Форт", 4, "Средняя"],
    ],
  );
  assert.deepEqual(
    audit.maps.map((m) => m.detailCount),
    [8, 9, 3],
  );
  const paths = await json(".ssg/paths.json"),
    old = await json("docs/maniac-3c2-existing-routes.json");
  assert.equal(old.length, 185);
  assert.equal(paths.length, 189);
  for (const path of old) assert.ok(paths.includes(path), path);
  assert.equal(new Set(catalog.map((m) => m.id)).size, 3);
  assert.deepEqual((await readdir(root + "pages/maps")).sort(), [
    "fort.tsx",
    "mansion.tsx",
    "pizzeria.tsx",
  ]);
  for (const [kind, count] of Object.entries({
    character: 15,
    perk: 44,
    ability: 12,
    item: 69,
    mechanic: 28,
    map: 3,
  }))
    assert.equal(entities.filter((e) => e.kind === kind).length, count);
  const sourceLang = await readFile(
    "../.audit/maniac-source-8692f66/src/main/resources/assets/maniacrev/lang/ru_ru.json",
    "utf8",
  ).then(JSON.parse, () => null);
  const index = await readFile(
    "build/client/projects/maniac/wiki/maps.html",
    "utf8",
  );
  for (const map of catalog) {
    assert.equal(
      publishedEntityRoutes[map.id],
      `/projects/maniac/wiki/maps/${map.slug}`,
    );
    assert.ok(index.includes(`data-map-id="${map.id}"`));
    const article = await json(root + `data/map-articles/${map.slug}.json`),
      html = await readFile(
        "build/client" + publishedEntityRoutes[map.id] + ".html",
        "utf8",
      );
    assert.equal(
      article.details.length,
      audit.maps.find((m) => m.id === map.id).detailCount,
    );
    assert.ok(html.includes(`data-difficulty="${map.difficulty}"`));
    assert.ok(html.includes(escape(map.description)));
    assert.ok(html.includes(`srcSet=`) || html.includes(`srcset=`));
    for (const [i, detail] of article.details.entries()) {
      assert.ok(html.includes(escape(detail)));
      if (sourceLang)
        assert.equal(
          detail,
          sourceLang[`guide.maniacrev.map.${map.slug}.detail.${i}`],
        );
    }
    assert.deepEqual(getRevision(map.id).data.relatedIds, map.relatedIds);
    for (const target of map.relatedIds)
      assert.ok(relatedEntityIds(target).includes(map.id));
  }
  assert.equal(new Set(manifest.files.map((f) => f.source)).size, 3);
  for (const image of manifest.files) {
    const b = await readFile(
      "src/app/projects/maniac/assets/maps/" + image.local,
    );
    assert.equal(hash(b), image.sha256);
    assert.equal(b.length, image.bytes);
    assert.deepEqual(webpSize(b), image.size);
    assert.ok(image.size[0] <= image.sourceSize[0]);
    assert.ok(
      Math.abs(
        image.size[1] -
          (image.size[0] * image.sourceSize[1]) / image.sourceSize[0],
      ) <= 0.51,
    );
    assert.ok(image.transformation.includes("no crop"));
    assert.ok(
      audit.sourceFiles.some(
        (f) => f.path === image.source && f.sha256 === image.sourceSha256,
      ),
    );
  }
  const chronicle = await readFile(
    "build/client/projects/maniac/changelog/1.1.html",
    "utf8",
  );
  assert.ok(chronicle.includes('data-map-chronicle-link="map:fort"'));
  assert.ok(chronicle.includes('href="/projects/maniac/wiki/maps/fort"'));
  const before = await json("docs/maniac-3c2-loading-before.json"),
    after = await measureMapLoading();
  for (const b of before) {
    const a = after.find((a) => a.source === b.source);
    assert.ok(a);
    // A standalone map catalog splits map metadata/source helpers into small shared chunks.
    // Budget both requests and actual bytes instead of pinning Rollup's exact chunk count.
    assert.ok(a.jsCount <= b.jsCount + 2);
    assert.ok(a.bytes / b.bytes < 1.03, `${b.source} JS regression`);
    assert.ok(a.gzip / b.gzip < 1.03);
  }
  console.log(
    "PASS: 3 registered maps, IDs 1/4/5, guide sizes/difficulty and all 8/9/3 details, original art hashes/proportions, reverse/history links, 185 preserved routes and <3% shared-JS growth.",
  );
} finally {
  await server.close();
}
