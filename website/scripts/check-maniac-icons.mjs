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
