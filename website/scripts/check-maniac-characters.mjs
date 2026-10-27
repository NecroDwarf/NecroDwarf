import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";
const dataRoot = "src/app/projects/maniac/wiki/data/";
const artRoot = "src/app/projects/maniac/assets/characters/";
const catalog = JSON.parse(
  await readFile(dataRoot + "character-catalog.json", "utf8"),
);
const manifest = JSON.parse(await readFile(artRoot + "imports.json", "utf8"));
const routes = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
const expectedManiacs = [
  "agent",
  "pudge",
  "death",
  "ursa",
  "plague_doctor",
  "ghost",
  "freddy_bear",
  "keeper_of_nightmares",
];
assert.equal(catalog.length, 15);
assert.deepEqual(
  catalog
    .filter((c) => c.role === "maniac")
    .map((c) => c.gameId)
    .sort(),
  expectedManiacs.sort(),
);
assert.equal(catalog.filter((c) => c.role === "survivor").length, 7);
assert.equal(new Set(manifest.files.map((f) => f.sourceSha256)).size, 15);
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
function webpSize(bytes) {
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  const kind = bytes.toString("ascii", 12, 16);
  if (kind === "VP8X")
    return [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
  assert.equal(kind, "VP8 ");
  assert.equal(bytes.toString("hex", 23, 26), "9d012a");
  return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
}
try {
  const { characters } = await server.ssrLoadModule(
    "/" + dataRoot + "characters.ts",
  );
  const { characterRouteMeta } = await server.ssrLoadModule(
    "/src/app/projects/maniac/wiki/route-metadata.ts",
  );
  const { sourceCommit, verifiedSource } = await server.ssrLoadModule(
    "/" + dataRoot + "snapshots.ts",
  );
  const { characterChronicles } = await server.ssrLoadModule(
    "/" + dataRoot + "character-chronicles.ts",
  );
  assert.equal(manifest.commit, sourceCommit);
  assert.deepEqual(
    characterRouteMeta,
    catalog.map(({ id, slug, name }) => ({ id, slug, name })),
  );
  const index = await readFile(
    "build/client/projects/maniac/wiki/characters.html",
    "utf8",
  );
  assert.equal((index.match(/data-character="character:/g) ?? []).length, 15);
  for (const c of catalog) {
    const entity = characters.find((entry) => entry.id === c.id);
    const data = entity.revisions[verifiedSource].data;
    assert.equal(data.gameId, c.gameId);
    assert.equal(data.role, c.role);
    assert.equal(data.difficulty, c.difficulty);
    assert.ok(c.difficulty >= 1 && c.difficulty <= 5);
    assert.deepEqual(data.tags, c.tags);
    const path = `/projects/maniac/wiki/characters/${c.slug}`;
    assert.ok(routes.includes(path));
    assert.ok(index.includes(`href="${path}"`));
    const html = await readFile(`build/client${path}.html`, "utf8");
    const article = JSON.parse(
      await readFile(dataRoot + `character-articles/${c.slug}.json`, "utf8"),
    );
    assert.equal(article.gameId, c.gameId);
    assert.ok(article.features.length);
    for (const feature of article.features) {
      assert.ok(html.includes(escape(feature.name)), feature.name);
      assert.ok(
        html.includes(escape(feature.description)),
        feature.description,
      );
      assert.doesNotMatch(
        feature.description,
        /%[sd]/,
        "Unresolved localization argument",
      );
    }
    for (const id of data.abilityIds.concat(data.itemIds))
      assert.ok(html.includes(`data-entity-card="${id}"`));
    const asset = manifest.files.find((f) => f.gameId === c.gameId);
    assert.ok(asset.source.endsWith(`/frescos/${c.gameId}.png`));
    for (const v of Object.values(asset.variants)) {
      const bytes = await readFile(artRoot + v.local);
      assert.equal(bytes.length, v.bytes);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), v.sha256);
      assert.deepEqual(webpSize(bytes), v.size);
      assert.ok(
        Math.abs(
          v.size[0] / v.size[1] - asset.originalSize[0] / asset.originalSize[1],
        ) < 0.003,
        "Fresco aspect ratio changed",
      );
    }
    assert.equal(
      html.includes("Загрузить 3D-модель"),
      c.slug === "keeper-of-nightmares",
    );
    assert.ok(html.includes("скачиваемой сборки Flower Cleaning 1.2"));
    for (const entry of characterChronicles[c.id] ?? []) {
      assert.ok(
        html.includes(
          `/projects/maniac/changelog/${entry.version}#${entry.anchor}`,
        ),
      );
      const chronicle = await readFile(
        `build/client/projects/maniac/changelog/${entry.version}.html`,
        "utf8",
      );
      assert.ok(chronicle.includes(`id="${entry.anchor}"`));
    }
  }
  for (const historic of ["keeper-of-nightmares", "ghost", "dodepovich"])
    assert.ok(
      characters.find((c) => c.slug === historic).revisions["release:1.1"],
    );
  console.log(
    "PASS: 15 character articles, 8/7 actual roles, matching ID/fresco hashes and proportions, complete SSG features/equipment, unique Keeper viewer and explicit data-version boundary.",
  );
} finally {
  await server.close();
}
