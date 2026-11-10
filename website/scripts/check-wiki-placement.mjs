import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
const root = "src/app/projects/maniac/wiki/";
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const { mechanicOwners, mechanicAnchor, removedCatalogEntries } =
    await server.ssrLoadModule("/" + root + "mechanic-placement.ts");
  const { publishedEntityRoutes } = await server.ssrLoadModule(
    "/" + root + "data/publication.ts",
  );
  const { listedItems, listedMechanics } = await server.ssrLoadModule(
    "/" + root + "data/systems-catalog.ts",
  );
  const { searchMetadata } = await server.ssrLoadModule(
    "/" + root + "search-metadata.ts",
  );
  const mechanics = JSON.parse(
    await readFile(root + "data/mechanic-catalog.json", "utf8"),
  );
  const catalog = await readFile(
    "build/client/projects/maniac/wiki/mechanics.html",
    "utf8",
  );
  assert.equal(listedMechanics.length, 10);
  assert.ok(!listedItems.some((entry) => entry.id === "item:recipe-book"));
  assert.doesNotMatch(
    catalog,
    /Системы персонажей|Системы перков|data-system-id="mechanic:(sanity|traps)"/,
  );
  assert.equal(
    Object.values(mechanicOwners).filter((owner) =>
      owner.startsWith("character:"),
    ).length,
    13,
  );
  assert.equal(
    Object.values(mechanicOwners).filter((owner) => owner.startsWith("perk:"))
      .length,
    4,
  );
  for (const [id, owner] of Object.entries(mechanicOwners)) {
    const source = mechanics.find((entry) => entry.id === id);
    assert.ok(
      source.relatedIds.includes(owner),
      `${id}: owner must be backed by source relations`,
    );
    assert.ok(!listedMechanics.some((entry) => entry.id === id));
    const destination = publishedEntityRoutes[owner] + "#" + mechanicAnchor(id);
    assert.equal(publishedEntityRoutes[id], destination);
    const html = await readFile(
      "build/client" + destination.split("#")[0] + ".html",
      "utf8",
    );
    assert.equal(html.split(`data-mechanic-id="${id}"`).length - 1, 1, id);
    assert.ok(html.includes(`id="${mechanicAnchor(id)}"`), id);
    assert.equal(
      searchMetadata.find((entry) => entry.id === id).href,
      destination,
    );
    assert.equal(
      searchMetadata.find((entry) => entry.id === id).section,
      owner.startsWith("character:") ? "characters" : "perks",
    );
  }
  for (const id of removedCatalogEntries)
    assert.ok(!searchMetadata.some((entry) => entry.id === id));
  const alchemist = await readFile(
    "build/client/projects/maniac/wiki/characters/alchemist.html",
    "utf8",
  );
  assert.doesNotMatch(alchemist, /data-entity-card="item:recipe-book"/);
  console.log(
    "PASS: 13 character mechanics and 4 perk mechanics embedded once at their sourced owners; 10 common mechanics; recipe book and traps removed from discovery; search/links use owner anchors",
  );
} finally {
  await server.close();
}
