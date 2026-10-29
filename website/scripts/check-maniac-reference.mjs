import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";
const base = "src/app/projects/maniac/wiki/";
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const audit = await json("docs/maniac-3b-perk-audit.json");
const protectedHistory = await json("docs/maniac-3b-historical-sha256.json");
const manifest = await json(
  "src/app/projects/maniac/assets/wiki/perks/imports.json",
);
const server = await createServer({
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
const hash = (text) => createHash("sha256").update(text).digest("hex");
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
try {
  const { perkCatalog, abilityCatalog } = await server.ssrLoadModule(
    "/" + base + "data/reference-catalog.ts",
  );
  const { entities, getRevision } = await server.ssrLoadModule(
    "/" + base + "data/registry.ts",
  );
  const { publishedEntityRoutes } = await server.ssrLoadModule(
    "/" + base + "data/publication.ts",
  );
  assert.equal(perkCatalog.length, 44);
  assert.equal(abilityCatalog.length, 12);
  assert.deepEqual(
    Object.fromEntries(
      ["SURVIVOR", "MANIAC", "ALL"].map((t) => [
        t,
        perkCatalog.filter((p) => p.team === t).length,
      ]),
    ),
    { SURVIVOR: 19, MANIAC: 15, ALL: 10 },
  );
  assert.deepEqual(
    Object.fromEntries(
      ["PASSIVE", "ACTIVE", "PASSIVE_COOLDOWN", "HYBRID", "CHARGED"].map(
        (t) => [t, perkCatalog.filter((p) => p.perkType === t).length],
      ),
    ),
    { PASSIVE: 17, ACTIVE: 11, PASSIVE_COOLDOWN: 10, HYBRID: 5, CHARGED: 1 },
  );
  assert.equal(new Set(perkCatalog.map((p) => p.gameId)).size, 44);
  assert.equal(new Set(perkCatalog.map((p) => p.slug)).size, 44);
  for (const e of entities)
    for (const [snapshot, revision] of Object.entries(e.revisions))
      if (snapshot.startsWith("release:"))
        assert.equal(
          hash(JSON.stringify(revision)),
          protectedHistory[e.id + "@" + snapshot],
          e.id + " historical revision changed",
        );
  assert.equal(Object.keys(protectedHistory).length, 21);
  assert.equal(manifest.files.length, 44);
  const index = await readFile(
    "build/client/projects/maniac/wiki/perks.html",
    "utf8",
  );
  assert.equal((index.match(/data-reference-id="perk:/g) ?? []).length, 44);
  const abilityIndex = await readFile(
    "build/client/projects/maniac/wiki/abilities.html",
    "utf8",
  );
  assert.equal(
    (abilityIndex.match(/data-reference-id="ability:/g) ?? []).length,
    12,
  );
  for (const p of perkCatalog) {
    const source = audit.perks.find((s) => s.id === p.id);
    assert.ok(source);
    assert.equal(source.gameId, p.gameId);
    assert.equal(source.team, p.team);
    assert.equal(source.type, p.perkType);
    assert.deepEqual(source.phases, p.phases);
    const asset = manifest.files.find((a) => a.entityId === p.id);
    assert.ok(asset.source.endsWith("/" + p.gameId + ".png"));
    const bytes = await readFile(
      "src/app/projects/maniac/assets/" + asset.local,
    );
    assert.equal(hash(bytes), asset.sha256);
  }
  for (const entry of [...perkCatalog, ...abilityCatalog]) {
    const kind = entry.id.startsWith("perk:") ? "perk" : "ability";
    const route = publishedEntityRoutes[entry.id];
    assert.ok(route);
    const html = await readFile("build/client" + route + ".html", "utf8");
    const article = await json(
      base + "data/" + kind + "-articles/" + entry.slug + ".json",
    );
    assert.equal(article.id, entry.id);
    assert.ok(
      html.includes(escape(article.description)),
      entry.id + " full SSG text",
    );
    assert.doesNotMatch(article.description, /%(?:[sd]|\.[0-9]+f)/);
    if (kind === "perk") {
      assert.ok(html.includes("Доступные фазы"));
      assert.ok(
        entry.phases.every((p) =>
          ["ANY", "START", "HUNT", "MIDGAME", "REVERSAL"].includes(p),
        ),
      );
    } else
      for (const id of entry.characterIds) {
        assert.ok(html.includes(publishedEntityRoutes[id]));
        assert.ok(getRevision(id).data.abilityIds.includes(entry.id));
      }
  }
  const charged = getRevision("perk:reality-anchor").data;
  assert.equal(charged.perkType, "CHARGED");
  assert.equal(charged.stats.find((s) => s.key === "game-charges").value, 2);
  assert.equal(
    getRevision("perk:football-fan").data.stats.some((s) => s.value === 9999),
    false,
  );
  assert.equal(
    getRevision("perk:forget-me-not", "release:1.2").data.stats.some(
      (s) => s.key === "cooldown",
    ),
    false,
  );
  assert.equal(
    getRevision("perk:forget-me-not").data.stats.find(
      (s) => s.key === "cooldown",
    ).value,
    60,
  );
  assert.equal(
    getRevision("ability:death-teleport").data.stats.find(
      (s) => s.key === "cooldown",
    ).value,
    60,
  );
  assert.equal(
    getRevision("ability:damage-transfer").data.stats.find(
      (s) => s.key === "share",
    ).value,
    50,
  );
  assert.ok(
    (await json(base + "data/perk-articles/mimic.json")).description.includes(
      "радиусе 2 блоков на 5 сек.",
    ),
  );
  assert.ok(
    (
      await json(base + "data/perk-articles/quick-reflexes.json")
    ).description.includes("+0.45 сек."),
  );
  console.log(
    "PASS: 44 registered perks (19/15/10), all five types/phases/icons, 12 audited abilities and bidirectional character links, full SSG, 21 immutable historical revisions and complex parameter cases.",
  );
} finally {
  await server.close();
}
