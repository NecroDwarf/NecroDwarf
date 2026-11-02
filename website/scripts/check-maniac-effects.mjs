import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";

const base = "src/app/projects/maniac/";
const audit = JSON.parse(
  await readFile(`${base}wiki/data/effect-sources.json`, "utf8"),
);
const html = await readFile(
  "build/client/projects/maniac/wiki/effects.html",
  "utf8",
);
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const { effects } = await server.ssrLoadModule(
    `/${base}wiki/data/effects.ts`,
  );
  const { sourceCommit } = await server.ssrLoadModule(
    `/${base}wiki/data/snapshots.ts`,
  );
  const { wikiNavigation } = await server.ssrLoadModule(
    `/${base}wiki/navigation.ts`,
  );
  const { effectStatLabels } = await server.ssrLoadModule(
    `/${base}wiki/data/effect-descriptions.ts`,
  );
  const { publishedEntityRoutes } = await server.ssrLoadModule(
    `/${base}wiki/data/publication.ts`,
  );
  const { effectConnections } = await server.ssrLoadModule(
    `/${base}wiki/data/effect-connections.ts`,
  );
  let connections = 0;
  for (const [effectId, entityIds] of Object.entries(effectConnections)) {
    const effectCard = html.match(
      new RegExp(
        `<article[^>]*data-effect-id="${effectId}"[^>]*>([\\s\\S]*?)<\\/article>`,
      ),
    )?.[1];
    assert.ok(effectCard, `Missing effect card: ${effectId}`);
    for (const entityId of entityIds) {
      const route = publishedEntityRoutes[entityId];
      assert.ok(route, `${effectId}: unpublished entity ${entityId}`);
      assert.ok(
        effectCard.includes(`href="${route}"`),
        `${effectId} → ${entityId}`,
      );
      const article = await readFile(`build/client${route}.html`, "utf8");
      assert.ok(
        article.includes(`href="/projects/maniac/wiki/effects#${effectId}"`),
        `${entityId} → ${effectId}`,
      );
      connections++;
    }
  }
  const descriptionText = (effect) =>
    effect.description
      .map((part) =>
        typeof part === "string"
          ? part
          : "entity" in part
            ? part.label
            : effectStatLabels[part.stat],
      )
      .join("");
  assert.equal(audit.commit, sourceCommit);
  assert.equal(effects.length, 33);
  assert.equal(new Set(effects.map((effect) => effect.id)).size, 33);
  assert.equal(audit.effects.length, 34);
  assert.deepEqual(
    audit.effects
      .filter((source) => !effects.some((effect) => effect.id === source.id))
      .map((source) => source.id),
    ["weak_instant_health"],
  );
  assert.ok(!html.includes('data-effect-id="weak_instant_health"'));
  assert.ok(!html.includes("Слабое исцеление"));
  assert.equal([...html.matchAll(/data-effect-id="/g)].length, effects.length);
  let icons = 0;
  for (const effect of effects) {
    const source = audit.effects.find((entry) => entry.id === effect.id);
    assert.ok(source, effect.id);
    assert.ok(source.usages.length > 0, `${effect.id}: no registered use`);
    assert.ok(descriptionText(effect).trim().length > 0, effect.id);
    for (const part of effect.description) {
      if (typeof part === "string") continue;
      if ("entity" in part) {
        const route = publishedEntityRoutes[part.entity];
        assert.ok(route, `${effect.id}: missing linked article`);
        assert.ok(html.includes(`href="${route}"`));
        continue;
      }
      assert.ok(effectStatLabels[part.stat], effect.id);
      assert.ok(html.includes(`aria-label="${effectStatLabels[part.stat]}"`));
      assert.ok(html.includes(`data-glyph="${part.stat}"`));
    }
    assert.ok(["BENEFICIAL", "HARMFUL", "NEUTRAL"].includes(effect.category));
    assert.equal(
      [...html.matchAll(new RegExp(`data-effect-id="${effect.id}"`, "g"))]
        .length,
      1,
    );
    assert.ok(html.includes(`id="${effect.id}"`));
    assert.ok(effect.evidence.includes(source.implementation.path));
    if (source.icon) {
      const bytes = await readFile(
        `${base}assets/wiki/effects/${effect.id}.png`,
      );
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        source.icon.sha256,
        effect.id,
      );
      assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0);
      assert.ok(effect.icon);
      icons++;
    } else assert.equal(effect.icon, undefined);
  }
  assert.equal(icons, 33);
  assert.equal((await readdir(`${base}assets/wiki/effects`)).length, icons);
  const navigation = wikiNavigation.find((entry) =>
    entry.href.endsWith("/effects"),
  );
  assert.equal(navigation.children.length, effects.length);
  for (const entry of navigation.children)
    assert.ok(effects.some((effect) => entry.href.endsWith(`#${effect.id}`)));
  assert.match(
    descriptionText(effects.find((effect) => effect.id === "open_wound")),
    /Не наносит урон со временем/,
  );
  assert.match(
    descriptionText(effects.find((effect) => effect.id === "scream")),
    /1 сек\./,
  );
  assert.match(
    descriptionText(effects.find((effect) => effect.id === "scream")),
    /5 сек\./,
  );
  assert.match(
    descriptionText(
      effects.find((effect) => effect.id === "dodepovich_credit"),
    ),
    /50% от макс\. HP/,
  );
  assert.match(
    effects.find((effect) => effect.id === "frozen").name,
    /Покупка Балтики/,
  );
  console.log(
    `PASS: 33 published effects have sourced descriptions, complete SSG and navigation; ${connections} effect/entity connections work both ways; weak healing is excluded; 34 source registrations preserved; 33 original icon hashes match.`,
  );
} finally {
  await server.close();
}
