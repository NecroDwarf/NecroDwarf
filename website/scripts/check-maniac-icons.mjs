import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";
import { ImageUtils } from "@gltf-transform/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const root = "/src/app/projects/maniac/wiki/";
const server = await createServer({
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const { entities, getRevision } = await server.ssrLoadModule(
    root + "data/registry.ts",
  );
  const { equipmentAssets } = await server.ssrLoadModule(
    root + "data/equipment-assets.ts",
  );
  const { ItemCard, AbilityCard } = await server.ssrLoadModule(
    root + "ui/EntityCards.tsx",
  );
  const { MemoryRouter } = await import("react-router");
  const render = (Card, id) =>
    renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Card, { id })),
    );
  const manifest = JSON.parse(
    await readFile(
      "src/app/projects/maniac/assets/wiki/equipment/imports.json",
      "utf8",
    ),
  );
  assert.equal(manifest.minecraftVersion, "1.20.1");
  for (const file of manifest.files) {
    const asset = equipmentAssets[file.entityId.slice(5)];
    assert.ok(asset && entities.some((e) => e.id === file.entityId));
    const b = await readFile(
      "src/app/projects/maniac/assets/wiki/equipment/" + file.local,
    );
    assert.equal(createHash("sha256").update(b).digest("hex"), file.sha256);
    assert.deepEqual(ImageUtils.getSize(b, "image/png"), file.size);
    assert.deepEqual([asset.width, asset.height], file.size);
    assert.equal(asset.entityId, file.entityId);
  }
  for (const e of entities.filter((e) => e.kind === "item")) {
    const html = render(ItemCard, e.id);
    assert.match(
      html,
      /data-kind="(?:pixel-texture|illustration|item-render|symbol)"/,
      e.id,
    );
  }
  const { mechanicIconAssets, systemIconAsset } = await server.ssrLoadModule(
    root + "data/system-icons.ts",
  );
  const { mechanicCatalog } = await server.ssrLoadModule(
    root + "data/systems-catalog.ts",
  );
  assert.equal(Object.keys(mechanicIconAssets).length, mechanicCatalog.length);
  const distinct = new Set();
  for (const mechanic of mechanicCatalog) {
    assert.equal(systemIconAsset(mechanic.id)?.entityId, mechanic.id);
    const svg = await readFile(
      `src/app/projects/maniac/assets/wiki/mechanics/${mechanic.slug}.svg`,
      "utf8",
    );
    assert.match(svg, /viewBox="0 0 64 64"/);
    assert.doesNotMatch(svg, /<script|<image|href=/);
    distinct.add(createHash("sha256").update(svg).digest("hex"));
    const article = await readFile(
      `build/client/projects/maniac/wiki/mechanics/${mechanic.slug}.html`,
      "utf8",
    );
    assert.ok(article.includes(`data-entity="${mechanic.id}"`), mechanic.id);
  }
  assert.equal(
    distinct.size,
    mechanicCatalog.length,
    "Mechanics need distinct semantic artwork",
  );
  const restored = JSON.parse(
    await readFile(
      "src/app/projects/maniac/assets/wiki/restored/imports.json",
      "utf8",
    ),
  );
  const { sourceCommit } = await server.ssrLoadModule(
    root + "data/snapshots.ts",
  );
  assert.equal(restored.commit, sourceCommit);
  for (const file of restored.files) {
    const bytes = await readFile(
      `src/app/projects/maniac/assets/wiki/restored/${file.slug}.png`,
    );
    assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
    assert.deepEqual(ImageUtils.getSize(bytes, "image/png"), [
      file.width,
      file.height,
    ]);
    assert.equal(
      systemIconAsset(`item:${file.slug}`)?.entityId,
      `item:${file.slug}`,
    );
  }
  assert.ok(
    restored.sources.some((s) =>
      s.path.endsWith("models/item/death_scythe.json"),
    ),
  );
  assert.ok(
    restored.sources.some((s) =>
      s.path.endsWith("textures/item/scythe_texture.png"),
    ),
  );
  for (const [page, attribute, count] of [
    ["items", "data-system-id", 50],
    ["mechanics", "data-system-id", 10],
    ["perks", "data-reference-id", 44],
    ["abilities", "data-reference-id", 12],
    ["characters", "data-character", 15],
    ["maps", "data-map-id", 3],
  ]) {
    const html = await readFile(
      `build/client/projects/maniac/wiki/${page}.html`,
      "utf8",
    );
    const cards = [
      ...html.matchAll(
        new RegExp(
          `<a[^>]*${attribute}="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>`,
          "g",
        ),
      ),
    ];
    assert.equal(cards.length, count, page);
    for (const [, id, body] of cards) {
      const heading = body.split(/<h[23]\b/)[0];
      assert.match(
        heading,
        /<(?:img|svg)\b/,
        `${page}/${id}: missing heading icon`,
      );
    }
  }
  assert.match(
    render(ItemCard, "item:agent-armor"),
    /data-kind="pixel-texture"/,
  );
  assert.match(render(ItemCard, "item:agent-pistol"), /data-glyph="pistol"/);
  assert.match(render(ItemCard, "item:ancestor-soul"), /data-glyph="health"/);
  assert.match(
    render(AbilityCard, "ability:beast-leap"),
    /data-glyph="damage"/,
  );
  assert.equal(
    getRevision("item:ancestor-soul").data.stats.find(
      (s) => s.key === "base-heal",
    ).value,
    2,
  );
  assert.equal(
    getRevision("item:beast-claw").data.stats.find(
      (s) => s.key === "base-damage",
    ).value,
    1,
  );
  assert.equal(
    getRevision("ability:beast-leap").data.stats.find(
      (s) => s.key === "landing-damage",
    ).value,
    2.5,
  );
  assert.equal(getRevision("item:ancestor-soul", "release:1.2"), undefined);
  const catalog = JSON.parse(
    await readFile(
      "src/app/projects/maniac/wiki/data/character-catalog.json",
      "utf8",
    ),
  );
  for (const c of catalog) {
    const html = await readFile(
      `build/client/projects/maniac/wiki/characters/${c.slug}.html`,
      "utf8",
    );
    assert.ok(html.includes(`aria-label="Сложность: ${c.difficulty} из 5"`));
  }
  console.log(
    "PASS: authentic equipment sprite hashes/dimensions, visual for every item, health/damage symbols, verified values and accessible source-based difficulty stars.",
  );
} finally {
  await server.close();
}
