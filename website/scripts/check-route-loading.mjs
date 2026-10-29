import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const chunks = JSON.parse(await readFile(".ssg/client-modules.json", "utf8"));
const chunkFor = (source) => {
  const entry = Object.entries(chunks).find(([, chunk]) =>
    chunk.modules.includes(source),
  );
  assert.ok(entry, `Missing module: ${source}`);
  return entry[0];
};
function staticModules(...entries) {
  const visited = new Set();
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(chunks[file], `Unknown imported chunk: ${file}`);
    chunks[file].imports.forEach(visit);
  }
  entries.forEach(visit);
  return [...visited].flatMap((file) => chunks[file].modules);
}
const main = chunkFor("src/main.tsx");
const initial = staticModules(main);
assert.ok(
  !initial.some((m) => /changelogs\/content\/1\.[012]\.json$/.test(m)),
  "Chronicle JSON in initial JS",
);
assert.ok(
  !initial.some((m) => /\/wiki\/data\//.test(m)),
  "Wiki database in initial JS",
);
assert.ok(
  !initial.some((m) =>
    /(?:HomePage|ManiacPage|ChroniclePage|ChangelogPage)\.tsx$/.test(m),
  ),
  "Page implementations must remain dynamic",
);
for (const source of [
  "pages/home/HomePage.tsx",
  "pages/changelog/ChangelogPage.tsx",
  "projects/maniac/pages/ManiacPage.tsx",
  "projects/maniac/changelogs/ManiacChangelogPage.tsx",
]) {
  const loaded = staticModules(main, chunkFor(`src/app/${source}`));
  assert.ok(
    !loaded.some((m) => /changelogs\/content\/1\.[012]\.json$/.test(m)),
    `${source} loads full chronicles`,
  );
  assert.ok(
    !loaded.some((m) => m.endsWith("/ChroniclePage.tsx")),
    `${source} loads the chronicle renderer`,
  );
}
for (const version of ["1.0", "1.1", "1.2"]) {
  const loaded = staticModules(
    main,
    chunkFor(`src/app/projects/maniac/changelogs/content/${version}.page.tsx`),
  );
  const texts = loaded.filter((m) =>
    /changelogs\/content\/1\.[012]\.json$/.test(m),
  );
  assert.deepEqual(texts, [
    `src/app/projects/maniac/changelogs/content/${version}.json`,
  ]);
}
const characters = JSON.parse(
  await readFile(
    "src/app/projects/maniac/wiki/data/character-catalog.json",
    "utf8",
  ),
);
const articleJson = (m) => /wiki\/data\/character-articles\/.*\.json$/.test(m);
const modelRuntime = (m) =>
  /node_modules\/three\/|wiki\/model\/ModelCanvas/.test(m);
assert.ok(!initial.some(articleJson), "Wiki articles in initial JS");
assert.ok(!initial.some(modelRuntime), "3D runtime in initial JS");
for (const page of ["WikiHomePage", "CharactersPage"]) {
  const loaded = staticModules(
    main,
    chunkFor(`src/app/projects/maniac/wiki/pages/${page}.tsx`),
  );
  assert.ok(!loaded.some(articleJson), `${page} loads full articles`);
  assert.ok(!loaded.some(modelRuntime), `${page} loads Three.js`);
  assert.ok(!loaded.some((m) => m.includes(".glb")), `${page} references GLB`);
  assert.ok(
    !loaded.some((m) => /changelogs\/content\/.*\.json$/.test(m)),
    `${page} loads chronicle text`,
  );
}
for (const c of characters) {
  const loaded = staticModules(
    main,
    chunkFor(`src/app/projects/maniac/wiki/pages/characters/${c.slug}.tsx`),
  );
  assert.deepEqual(loaded.filter(articleJson), [
    `src/app/projects/maniac/wiki/data/character-articles/${c.slug}.json`,
  ]);
  assert.ok(
    !loaded.some(modelRuntime),
    `${c.slug}: 3D must require an explicit user action`,
  );
  const largeArt = loaded.filter((m) =>
    /assets\/characters\/.*-large\.webp$/.test(m),
  );
  assert.deepEqual(largeArt, [
    `src/app/projects/maniac/assets/characters/${c.gameId}-large.webp`,
  ]);
  assert.ok(
    !loaded.some((m) => /changelogs\/content\/.*\.json$/.test(m)),
    `${c.slug} loads chronicle text`,
  );
  if (c.slug !== "keeper-of-nightmares")
    assert.ok(!loaded.some((m) => m.includes(".glb")));
}
const referenceArticle = (m) =>
  /wiki\/data\/(?:perk|ability|item|mechanic)-articles\/.*\.json$/.test(m);
assert.ok(!initial.some(referenceArticle));
for (const page of [
  "PerksPage",
  "AbilitiesPage",
  "ItemsPage",
  "MechanicsPage",
]) {
  const loaded = staticModules(
    main,
    chunkFor(`src/app/projects/maniac/wiki/pages/${page}.tsx`),
  );
  assert.ok(!loaded.some(referenceArticle));
  assert.ok(!loaded.some(modelRuntime));
  assert.ok(
    !loaded.some(
      (m) => m.includes(".glb") || /changelogs\/content\/.*\.json$/.test(m),
    ),
  );
}
for (const kind of ["perk", "ability", "item", "mechanic"]) {
  const entries = JSON.parse(
    await readFile(
      `src/app/projects/maniac/wiki/data/${kind}-catalog.json`,
      "utf8",
    ),
  );
  for (const entry of entries) {
    const loaded = staticModules(
      main,
      chunkFor(
        `src/app/projects/maniac/wiki/pages/${{ perk: "perks", ability: "abilities", item: "items", mechanic: "mechanics" }[kind]}/${entry.slug}.tsx`,
      ),
    );
    assert.deepEqual(loaded.filter(referenceArticle), [
      `src/app/projects/maniac/wiki/data/${kind}-articles/${entry.slug}.json`,
    ]);
    assert.ok(!loaded.some(modelRuntime));
    assert.ok(
      !loaded.some(
        (m) => m.includes(".glb") || /changelogs\/content\/.*\.json$/.test(m),
      ),
    );
  }
}
console.log(
  "PASS: route chunks isolated; initial JS has no chronicle text/Wiki database; each chronicle/article loads only its own JSON/art; Wiki/catalog/characters have no eager 3D.",
);
