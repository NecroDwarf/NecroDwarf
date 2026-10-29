import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";
import { ImageUtils } from "@gltf-transform/core";
const root = "src/app/projects/maniac/wiki/";
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const audit = await json("docs/maniac-3c-items-audit.json");
const itemCatalog = await json(root + "data/item-catalog.json");
const mechanicCatalog = await json(root + "data/mechanic-catalog.json");
const hash = (b) => createHash("sha256").update(b).digest("hex");
function webpSize(bytes) {
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  for (let offset = 12; offset + 8 < bytes.length; ) {
    const tag = bytes.toString("ascii", offset, offset + 4),
      size = bytes.readUInt32LE(offset + 4),
      start = offset + 8;
    if (tag === "VP8X")
      return [
        bytes.readUIntLE(start + 4, 3) + 1,
        bytes.readUIntLE(start + 7, 3) + 1,
      ];
    if (tag === "VP8L") {
      const bits = bytes.readUInt32LE(start + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    if (tag === "VP8 ")
      return [
        bytes.readUInt16LE(start + 6) & 0x3fff,
        bytes.readUInt16LE(start + 8) & 0x3fff,
      ];
    offset = start + size + (size % 2);
  }
  throw Error("Missing WebP image header");
}
const server = await createServer({
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
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
  const source = await readFile(
    "../.audit/maniac-source-8692f66/src/main/java/org/example/maniacrevolution/ModItems.java",
    "utf8",
  ).catch(() => null);
  const provenance = await json(root + "data/provenance.json");
  if (source) {
    const ids = [...source.matchAll(/ITEMS\.register\("([^"]+)"/g)].map(
      (m) => m[1],
    );
    assert.deepEqual(
      audit.registrations.map((r) => r.gameId),
      ids,
    );
    assert.equal(
      hash(Buffer.from(source)),
      provenance.files.find((f) => f.path.endsWith("/ModItems.java")).sha256,
    );
  }
  assert.equal(audit.registrationCount, audit.registrations.length);
  assert.equal(
    new Set(audit.registrations.map((r) => r.gameId)).size,
    audit.registrationCount,
  );
  assert.equal(audit.publishedEntityCount, itemCatalog.length);
  assert.ok(
    audit.additionalRegistrations.some(
      (r) => r.gameId === "computer" && r.registry === "ModHackRegistry",
    ),
  );
  assert.equal(
    itemCatalog.filter((item) =>
      item.registryIds.includes("maniacrev:computer"),
    ).length,
    1,
  );
  for (const r of audit.registrations) {
    assert.ok(
      r.reason && r.purpose && r.category && r.name && r.evidence.length,
    );
    assert.equal(
      itemCatalog.filter((item) =>
        item.registryIds.includes("maniacrev:" + r.gameId),
      ).length,
      r.publish ? 1 : 0,
      r.gameId,
    );
    if (r.publish)
      assert.equal(
        itemCatalog.find((item) =>
          item.registryIds.includes("maniacrev:" + r.gameId),
        ).id,
        r.entityId,
      );
  }
  for (const id of [
    "item:dead-staff",
    "item:medical-tablet",
    "item:bandages",
    "item:adrenaline-syringe",
    "item:ancestral-totem",
    "item:quantum-teleport",
  ]) {
    assert.ok(itemCatalog.some((item) => item.id === id));
  }
  const legacy = await json(root + "data/character-items.json");
  for (const item of legacy)
    assert.ok(itemCatalog.some((row) => row.id === item.id));
  assert.equal(new Set(entities.map((e) => e.id)).size, entities.length);
  assert.equal(entities.filter((e) => e.kind === "character").length, 15);
  assert.equal(entities.filter((e) => e.kind === "perk").length, 44);
  assert.equal(entities.filter((e) => e.kind === "ability").length, 12);
  for (const [kind, rows] of [
    ["item", itemCatalog],
    ["mechanic", mechanicCatalog],
  ]) {
    const html = await readFile(
      `build/client/projects/maniac/wiki/${kind === "item" ? "items" : "mechanics"}.html`,
      "utf8",
    );
    assert.equal(
      (html.match(new RegExp(`data-system-id="${kind}:`, "g")) ?? []).length,
      rows.length,
    );
    for (const row of rows) {
      const path = publishedEntityRoutes[row.id];
      assert.ok(path);
      const article = await json(
        root + `data/${kind}-articles/${row.slug}.json`,
      );
      assert.equal(article.id, row.id);
      assert.ok(article.sections.length >= 1);
      const text = await readFile("build/client" + path + ".html", "utf8");
      assert.ok(text.includes(row.name.replaceAll("&", "&amp;")));
      for (const section of article.sections)
        for (const paragraph of section.paragraphs)
          assert.ok(
            text.includes(
              paragraph
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;"),
            ),
            row.id,
          );
      for (const ev of article.evidence)
        assert.ok(
          provenance.files.some((f) => f.path === ev.path),
          ev.path,
        );
      for (const other of relatedEntityIds(row.id))
        assert.ok(
          relatedEntityIds(other).includes(row.id),
          `${row.id} reverse ${other}`,
        );
    }
  }
  for (const filename of ["imports.json", "guide-imports.json"]) {
    const manifest = await json(
      "src/app/projects/maniac/assets/wiki/systems/" + filename,
    );
    assert.equal(manifest.commit, audit.commit);
    for (const file of manifest.files) {
      const bytes = await readFile(
        "src/app/projects/maniac/assets/wiki/systems/" + file.local,
      );
      assert.equal(hash(bytes), file.sha256, file.local);
      const size = file.local.endsWith("png")
        ? ImageUtils.getSize(bytes, "image/png")
        : webpSize(bytes);
      assert.deepEqual(size, [file.width, file.height]);
      assert.ok(size[0] > 0 && size[1] > 0);
      assert.ok(file.transformation);
      assert.ok(
        provenance.files.some(
          (f) => f.path === file.source && f.sha256 === file.sourceSha256,
        ),
      );
    }
  }
  const staff = getRevision("item:dead-staff").data.stats;
  assert.equal(staff.find((s) => s.key === "mana").value, 60);
  assert.equal(staff.find((s) => s.key === "cast").value, 5);
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
    getRevision("item:clarity").data.stats.find((s) => s.key === "duration")
      .value,
    6,
  );
  const nightmare = await json(
    root + "data/mechanic-articles/nightmare-trials.json",
  );
  assert.ok(
    nightmare.notes.some(
      (n) => n.includes("расхождение") || n.includes("Расхождение"),
    ),
  );
  assert.equal(publishedEntityRoutes["item:shop-token"], undefined);
  console.log(
    `PASS: all ${audit.registrationCount} registrations classified, ${itemCatalog.length} stable item articles, ${mechanicCatalog.length} sourced mechanics, source/art hashes, full SSG, reverse links and complex values.`,
  );
} finally {
  await server.close();
}
