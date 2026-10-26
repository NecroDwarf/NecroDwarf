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
console.log(
  "PASS: route chunks isolated; initial JS has no chronicle text/Wiki database; lists use metadata; each chronicle loads exactly its own JSON.",
);
