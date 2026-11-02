import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const { ownerGroup, matchesOwnerTeam, itemOwnerGroup, matchesItemTeam } =
    await server.ssrLoadModule(
      "/src/app/projects/maniac/wiki/data/owner-teams.ts",
    );
  const { characters } = await server.ssrLoadModule(
    "/src/app/projects/maniac/wiki/data/characters.ts",
  );
  const { verifiedSource } = await server.ssrLoadModule(
    "/src/app/projects/maniac/wiki/data/snapshots.ts",
  );
  const maniac = characters.find(
    (character) => character.revisions[verifiedSource].data.role === "maniac",
  ).id;
  const survivor = characters.find(
    (character) => character.revisions[verifiedSource].data.role === "survivor",
  ).id;
  assert.equal(ownerGroup([maniac, maniac]), "maniac");
  assert.equal(ownerGroup([survivor]), "survivor");
  assert.equal(ownerGroup([maniac, survivor, maniac]), "both");
  assert.equal(ownerGroup([]), "unassigned");
  assert.equal(matchesOwnerTeam([maniac, survivor], "maniac"), true);
  assert.equal(matchesOwnerTeam([maniac, survivor], "survivor"), true);
  assert.equal(matchesOwnerTeam([maniac], "survivor"), false);
  assert.equal(matchesOwnerTeam([], "maniac"), false);
  assert.equal(matchesOwnerTeam([], "survivor"), false);
  assert.equal(matchesOwnerTeam([], "unassigned"), true);
  assert.equal(matchesOwnerTeam([], "all"), true);

  const { itemCatalog } = await server.ssrLoadModule(
    "/src/app/projects/maniac/wiki/data/systems-catalog.ts",
  );
  const glasses = itemCatalog.find(
    (item) => item.id === "item:rose-colored-glasses",
  );
  assert.equal(itemOwnerGroup(glasses), "survivor");
  assert.equal(matchesItemTeam(glasses, "survivor"), true);
  assert.equal(matchesItemTeam(glasses, "maniac"), false);
  const drink = itemCatalog.find((item) => item.id === "item:clarity");
  assert.equal(matchesItemTeam(drink, "maniac"), true);
  assert.equal(matchesItemTeam(drink, "survivor"), true);
  for (const [page, attribute, expected] of [
    ["characters", "data-character", { maniacs: 8, survivors: 7 }],
    ["perks", "data-reference-id", { maniacs: 15, survivors: 19, common: 10 }],
    ["abilities", "data-reference-id", { maniacs: 9, survivors: 3 }],
    [
      "items",
      "data-system-id",
      { maniacs: 13, survivors: 33, "both-teams": 5 },
    ],
    [
      "mechanics",
      "data-system-id",
      {
        match: 5,
        core: 4,
        resource: 3,
        "character-system": 12,
        "perk-system": 4,
      },
    ],
  ]) {
    const html = await readFile(
      `build/client/projects/maniac/wiki/${page}.html`,
      "utf8",
    );
    const sections = [
      ...html.matchAll(
        /<section\b[^>]*data-catalog-group="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g,
      ),
    ];
    assert.equal(sections.length, Object.keys(expected).length, page);
    const ids = [];
    for (const [, group, content] of sections) {
      assert.ok(group in expected, `${page}: unexpected group ${group}`);
      const groupIds = [
        ...content.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g")),
      ].map((match) => match[1]);
      assert.equal(groupIds.length, expected[group], `${page}/${group}`);
      assert.match(content, /<h2\b/, `${page}: missing group heading`);
      assert.match(content, /<h3\b/, `${page}: missing card heading`);
      ids.push(...groupIds);
    }
    const allIds = [
      ...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g")),
    ].map((match) => match[1]);
    assert.equal(ids.length, allIds.length, `${page}: cards outside groups`);
    assert.equal(new Set(ids).size, ids.length, `${page}: duplicate cards`);
  }
  console.log(
    "PASS: catalog team groups preserve every card once; item owner filter handles one team, mixed owners and missing owners.",
  );
} finally {
  await server.close();
}
