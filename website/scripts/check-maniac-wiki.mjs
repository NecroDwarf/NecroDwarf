import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { NodeIO, ImageUtils } from "@gltf-transform/core";
import { faceUVs, cubeGeometry } from "./convert-maniac-model.mjs";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const root = "/src/app/projects/maniac/wiki/";
try {
  const { entities, getRevision, characterSummaries } =
    await server.ssrLoadModule(root + "data/registry.ts");
  const { validateGameData } = await server.ssrLoadModule(
    root + "data/validate.ts",
  );
  const { gameVersions } = await server.ssrLoadModule(
    root + "data/versions.ts",
  );
  const { verifiedSource } = await server.ssrLoadModule(
    root + "data/snapshots.ts",
  );
  const { entityAssets } = await server.ssrLoadModule(root + "data/assets.ts");
  const { characterModels } = await server.ssrLoadModule(
    root + "model/models.ts",
  );
  const { publishedEntityRoutes, plannedEntityPath } =
    await server.ssrLoadModule(root + "data/publication.ts");
  const { releases } = await server.ssrLoadModule(
    "/src/app/projects/maniac/changelogs/registry.ts",
  );
  const { routes } = await server.ssrLoadModule("/src/app/routes.ts");
  validateGameData(entities, gameVersions);
  assert.throws(
    () => validateGameData([...entities, entities[0]], gameVersions),
    /Duplicate ID/,
  );
  const broken = structuredClone(entities);
  broken[0].revisions[verifiedSource].data.abilityIds.push("ability:missing");
  assert.throws(
    () => validateGameData(broken, gameVersions),
    /Broken ability reference/,
  );
  const badChange = structuredClone(gameVersions);
  badChange[2].changes[0].after.snapshot = "release:unverified";
  assert.throws(
    () => validateGameData(entities, badChange),
    /Broken change reference/,
  );
  // Exercise changed/removed relationships without inventing a public 1.3.
  const fixture = {
    ...gameVersions[2],
    id: "test-only",
    changes: [
      {
        ...gameVersions[2].changes[0],
        operation: "changed",
        before: { id: "perk:forget-me-not", snapshot: "release:1.2" },
        after: { id: "perk:forget-me-not", snapshot: verifiedSource },
      },
    ],
  };
  validateGameData(entities, [fixture]);
  validateGameData(entities, [
    {
      ...fixture,
      changes: [
        { ...fixture.changes[0], operation: "removed", after: undefined },
      ],
    },
  ]);
  for (const version of gameVersions)
    assert.ok(releases.some((r) => r.id === version.releaseId));
  assert.equal(routes.length, 28);
  assert.ok(routes.every((r) => !/lab/.test(r.path)));
  assert.equal(Object.keys(publishedEntityRoutes).length, 15);
  assert.ok(
    Object.keys(publishedEntityRoutes).every((id) =>
      id.startsWith("character:"),
    ),
  );
  for (const [id, path] of Object.entries(publishedEntityRoutes)) {
    assert.ok(entities.some((entity) => entity.id === id));
    assert.ok(
      routes.some((route) => route.path === path),
      `Unpublished entity route: ${path}`,
    );
  }
  assert.equal(
    plannedEntityPath("character", "keeper-of-nightmares"),
    "/projects/maniac/wiki/characters/keeper-of-nightmares",
  );

  const historical = getRevision("perk:forget-me-not", "release:1.2");
  const current = getRevision("perk:forget-me-not");
  assert.equal(
    historical.data.stats.find((s) => s.key === "cooldown"),
    undefined,
  );
  assert.equal(current.data.stats.find((s) => s.key === "cooldown").value, 60);
  assert.equal(getRevision("perk:forget-me-not", "release:1.3"), undefined);
  assert.equal(getRevision("perk:forget-me-not", "release:1.0"), undefined);
  assert.equal(getRevision("character:ghost").data.model, undefined);
  assert.equal(getRevision("character:dodepovich").data.model, undefined);
  assert.deepEqual(Object.keys(characterModels), ["keeper-nightmares"]);
  assert.equal(
    characterSummaries(["character:keeper-of-nightmares"])[0].name,
    "Хранитель кошмаров",
  );

  const assetFolder = "src/app/projects/maniac/assets/";
  const manifest = JSON.parse(
    await readFile(assetFolder + "imports.json", "utf8"),
  );
  const provenance = JSON.parse(
    await readFile("src/app/projects/maniac/wiki/data/provenance.json", "utf8"),
  );
  const sourcePaths = new Set(provenance.files.map((source) => source.path));
  for (const entity of entities)
    for (const revision of Object.values(entity.revisions))
      for (const evidence of revision.evidence)
        assert.ok(sourcePaths.has(evidence.path), evidence.path);
  for (const asset of manifest.files) {
    assert.ok(
      entities.some((entity) => entity.id === asset.entityId),
      asset.local,
    );
    const bytes = await readFile(assetFolder + asset.local);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
    );
    if (asset.size) {
      let size;
      if (asset.local.endsWith(".webp")) {
        // Curated thumbnails are lossless VP8L (WebP lossless spec, image header).
        assert.equal(bytes.toString("ascii", 12, 16), "VP8L");
        assert.equal(bytes[20], 0x2f);
        const header = bytes.readUInt32LE(21);
        size = [(header & 0x3fff) + 1, ((header >>> 14) & 0x3fff) + 1];
      } else size = ImageUtils.getSize(bytes, "image/png");
      assert.deepEqual(size, asset.size, asset.local);
    }
  }
  for (const entity of entities)
    for (const revision of Object.values(entity.revisions)) {
      const { data } = revision;
      if (data.icon) {
        const asset = entityAssets[data.icon];
        assert.ok(asset, data.icon);
        assert.equal(asset.entityId, entity.id);
        assert.ok(!/^https?:/.test(asset.src));
      }
      if (data.model) assert.ok(characterModels[data.model]);
    }
  for (const asset of Object.values(entityAssets)) {
    assert.ok(
      ["illustration", "pixel-texture", "item-render"].includes(asset.kind),
    );
    const file = manifest.files.find((file) => asset.src.endsWith(file.local));
    assert.ok(file, `No provenance for ${asset.src}`);
    assert.deepEqual([asset.width, asset.height], file.size);
    assert.equal(asset.entityId, file.entityId);
    const presentation = asset.presentation ?? {};
    assert.ok(Number.isFinite(presentation.scale ?? 1));
    assert.ok((presentation.scale ?? 1) > 0);
    assert.ok((presentation.position ?? [50, 50]).every(Number.isFinite));
    assert.ok(["normal", "screen"].includes(presentation.blend ?? "normal"));
  }
  assert.equal(entityAssets["concentrated-nightmare"].width, 256);
  assert.equal(entityAssets["concentrated-nightmare"].height, 256);
  assert.equal(entityAssets["nightmare-lighter"].kind, "item-render");
  assert.doesNotMatch(entityAssets["nightmare-lighter"].src, /source|\.glb/);

  const itemFolder = assetFolder + "models/nightmare-lighter/";
  const lighter = await new NodeIO().read(itemFolder + "nightmare_lighter.glb");
  const itemRoot = lighter.getRoot();
  assert.equal(itemRoot.listNodes().length, 40);
  assert.equal(itemRoot.getExtras().cubes, 49);
  assert.equal(itemRoot.getExtras().planes, 5);
  assert.equal(itemRoot.listAnimations().length, 0);
  for (const name of ["fire", "fire_side"])
    assert.deepEqual(
      itemRoot
        .listNodes()
        .find((n) => n.getName() === name)
        .getScale(),
      [1, 1, 1],
    );
  const lid = itemRoot.listNodes().find((n) => n.getName() === "group");
  const expectedLidPosition = [-3 / 16, 14.6 / 16, -11 / 16];
  lid
    .getTranslation()
    .forEach((value, index) =>
      assert.ok(Math.abs(value - expectedLidPosition[index]) < 1e-6),
    );
  assert.ok(
    Math.abs(lid.getRotation()[0] + Math.sin((40 * Math.PI) / 180)) < 1e-6,
  );
  assert.deepEqual(
    Buffer.from(itemRoot.listTextures()[0].getImage()),
    await readFile(itemFolder + "source/nightmare-lighter.png"),
  );
  assert.equal(
    itemRoot.listMaterials()[0].getBaseColorTextureInfo().getMagFilter(),
    9728,
  );
  const renderReport = JSON.parse(
    await readFile(itemFolder + "render.json", "utf8"),
  );
  assert.equal(
    renderReport.modelSha256,
    createHash("sha256")
      .update(await readFile(itemFolder + "nightmare_lighter.glb"))
      .digest("hex"),
  );
  assert.equal(
    renderReport.sha256,
    createHash("sha256")
      .update(await readFile(renderReport.output))
      .digest("hex"),
  );

  const folder = assetFolder + "models/keeper/";
  const geoBytes = await readFile(folder + "source/windigo.geo.json");
  const geometry = JSON.parse(geoBytes)["minecraft:geometry"][0];
  const model = await new NodeIO().read(folder + "keeper.glb");
  assert.equal(
    model.getRoot().getExtras().sourceSha256,
    createHash("sha256").update(geoBytes).digest("hex"),
  );
  assert.deepEqual(
    model
      .getRoot()
      .listNodes()
      .map((n) => n.getName())
      .sort(),
    geometry.bones.map((b) => b.name).sort(),
  );
  assert.equal(model.getRoot().getExtras().cubes, 84);
  assert.equal(model.getRoot().getExtras().planes, 18);
  assert.equal(model.getRoot().listAnimations().length, 0);
  assert.equal(model.getRoot().listMaterials()[0].getDoubleSided(), true);
  assert.equal(
    model.getRoot().listMaterials()[0].getBaseColorTextureInfo().getMagFilter(),
    9728,
  );
  assert.deepEqual(
    Buffer.from(model.getRoot().listTextures()[0].getImage()),
    await readFile(folder + "source/windigo.png"),
  );
  for (const mesh of model.getRoot().listMeshes())
    for (const primitive of mesh.listPrimitives()) {
      const positions = primitive.getAttribute("POSITION");
      assert.ok([...positions.getArray()].every(Number.isFinite));
      assert.ok(
        [...primitive.getIndices().getArray()].every(
          (index) => index < positions.getCount(),
        ),
      );
      assert.equal(
        primitive.getAttribute("TEXCOORD_0").getCount(),
        positions.getCount(),
      );
    }
  const cube = { origin: [0, 0, 0], size: [2, 3, 4], uv: [0, 0] };
  assert.deepEqual(faceUVs(cube).north, [4, 4, 6, 7]);
  assert.deepEqual(
    faceUVs({ ...cube, uv: { up: { uv: [2, 3], uv_size: [4, 5] } } }).up,
    [6, 8, 2, 3],
  );
  assert.equal(
    cubeGeometry(cube, { pivot: [0, 0, 0] }, 16, 16).indices.length,
    36,
  );
  assert.equal(
    cubeGeometry(
      { ...cube, size: [2, 0, 4], uv: { up: { uv: [0, 0], uv_size: [2, 4] } } },
      { pivot: [0, 0, 0] },
      16,
      16,
    ).indices.length,
    6,
  );

  const { MemoryRouter } = await server.ssrLoadModule("react-router");
  const cards = await server.ssrLoadModule(root + "ui/EntityCards.tsx");
  const { EntityLink } = await server.ssrLoadModule(root + "ui/EntityLink.tsx");
  const { EntityIcon } = await server.ssrLoadModule(root + "ui/EntityIcon.tsx");
  const { ReleaseEntityChange } = await server.ssrLoadModule(
    root + "ui/ReleaseEntityChange.tsx",
  );
  const { CharacterModelViewer } = await server.ssrLoadModule(
    root + "model/CharacterModelViewer.tsx",
  );
  const render = (Component, props) =>
    renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Component, props)),
    );
  for (const variant of ["compact", "detail"]) {
    const iconHTML = render(EntityIcon, {
      asset: entityAssets["nightmare-lighter"],
      variant,
    });
    assert.match(iconHTML, new RegExp(`data-variant="${variant}"`));
    assert.match(iconHTML, /data-kind="item-render"/);
    assert.match(iconHTML, /aria-hidden="true"/);
    assert.match(iconHTML, /alt=""/);
    assert.doesNotMatch(iconHTML, /<canvas/);
  }
  const customIcon = render(EntityIcon, {
    asset: {
      ...entityAssets["forget-me-not-item"],
      presentation: { scale: 1.1, position: [45, 55] },
    },
  });
  assert.match(customIcon, /--icon-scale:1.1/);
  assert.match(customIcon, /--icon-x:45%/);
  assert.match(customIcon, /--icon-y:55%/);
  assert.doesNotMatch(render(EntityLink, { id: "perk:forget-me-not" }), /<a/);
  assert.doesNotMatch(
    render(cards.PerkCard, {
      id: "perk:forget-me-not",
      snapshot: "release:1.2",
      variant: "compact",
    }),
    /Перезарядка возврата/,
  );
  const changeHTML = render(ReleaseEntityChange, {
    change: gameVersions[2].changes[0],
  });
  assert.ok(changeHTML.includes(gameVersions[2].changes[0].editorial));
  assert.doesNotMatch(changeHTML, /Перезарядка возврата/);
  assert.equal(render(CharacterModelViewer, {}), "");
  assert.match(
    render(CharacterModelViewer, {
      model: characterModels["keeper-nightmares"],
    }),
    /Загрузить 3D-модель/,
  );
  const publicFiles = await readdir("build/client/assets");
  assert.equal(publicFiles.filter((path) => /\.glb$/.test(path)).length, 1);
  assert.equal(
    publicFiles.filter((path) => /ModelCanvas.*\.js$/.test(path)).length,
    1,
  );
  assert.equal(
    (await readFile("maniac-lab.html", "utf8")).includes(
      'content="noindex, nofollow"',
    ),
    true,
  );
  console.log(
    `PASS: ${entities.length} entity IDs, 15 published characters, historical isolation, ${manifest.files.length} local assets, GLB hierarchy/UV/texture and isolated 3D chunk.`,
  );
} finally {
  await server.close();
}
