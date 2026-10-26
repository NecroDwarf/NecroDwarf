import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createServer } from "vite";
const hash = (text) =>
  createHash("sha256").update(text.replace(/\s/g, "")).digest("hex");
const decode = (text) =>
  text.replace(
    /&(?:amp|lt|gt|quot|#x27|#39);/g,
    (entity) =>
      ({
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#x27;": "'",
        "&#39;": "'",
      })[entity],
  );
const root = "/src/app/projects/maniac/";
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { chronicleContent, nodeText, cardTitle } = await server.ssrLoadModule(
    root + "changelogs/content/index.ts",
  );
  const { flowerPerkIds } = await server.ssrLoadModule(
    root + "changelogs/entity-map.ts",
  );
  const { getRevision } = await server.ssrLoadModule(
    root + "wiki/data/registry.ts",
  );
  const { entityAssets } = await server.ssrLoadModule(
    root + "wiki/data/assets.ts",
  );
  const { releases } = await server.ssrLoadModule(
    root + "changelogs/registry.ts",
  );
  const report = JSON.parse(
    await readFile("docs/maniac-chronicles-correspondence.json", "utf8"),
  );
  const provenance = JSON.parse(
    await readFile("src/app/projects/maniac/wiki/data/provenance.json", "utf8"),
  );
  let sectionCount = 0;
  const walk = function* (nodes) {
    for (const n of nodes)
      if (typeof n !== "string") {
        yield n;
        yield* walk(n.children);
      }
  };
  for (const release of report.releases) {
    assert.equal(
      release.sourceSha256,
      provenance.files.find((f) => f.path === release.source).sha256,
    );
    const data = chronicleContent[release.version];
    assert.equal(data.sections.length, release.sections.length);
    const html = await readFile(
      `build/client/projects/maniac/changelog/${release.version}.html`,
      "utf8",
    );
    for (const section of release.sections) {
      const content = data.sections.find((s) => s.id === section.id);
      assert.equal(content.title, section.title);
      assert.equal(
        hash(content.nodes.map(nodeText).join("")),
        section.originalCompactSha256,
        `Data completeness ${release.version}/${section.id}`,
      );
      const rendered = html.match(
        new RegExp(
          `data-source-section="${section.id}"[^>]*>([\\s\\S]*?)<\\/section>`,
        ),
      )?.[1];
      assert.ok(rendered, section.id);
      const original = [
        ...rendered.matchAll(/<span data-original-text="">([^<]*)<\/span>/g),
      ]
        .map((m) => decode(m[1]))
        .join("");
      assert.equal(
        hash(original),
        section.originalCompactSha256,
        `SSG completeness ${release.version}/${section.id}`,
      );
      sectionCount++;
    }
    for (const node of walk(data.sections.flatMap((s) => s.nodes))) {
      assert.ok(!["script", "style", "iframe", "img"].includes(node.tag));
      if (node.href)
        assert.match(
          node.href,
          /^(?:#|\/projects\/maniac\/changelog\/1\.[012]$)/,
        );
    }
    const meta = releases.find((r) => r.version === release.version);
    assert.equal(meta.href, `/projects/maniac/changelog/${release.version}`);
    assert.ok(html.includes(meta.title));
    assert.match(html, new RegExp(`data-release-decor="${release.version}"`));
  }
  assert.equal(Object.keys(flowerPerkIds).length, 15);
  assert.equal(new Set(Object.values(flowerPerkIds)).size, 15);
  const flowerCards = [
    ...walk(
      chronicleContent["1.2"].sections
        .filter((s) =>
          ["survivor-perks", "maniac-perks", "common-perks"].includes(s.id),
        )
        .flatMap((s) => s.nodes),
    ),
  ].filter((n) => n.role === "card");
  assert.equal(flowerCards.length, 15);
  for (const [sectionId, count] of [
    ["survivor-perks", 8],
    ["maniac-perks", 5],
    ["common-perks", 2],
  ])
    assert.equal(
      [
        ...walk(
          chronicleContent["1.2"].sections.find((s) => s.id === sectionId)
            .nodes,
        ),
      ].filter((n) => n.role === "card").length,
      count,
    );
  for (const card of flowerCards) {
    const id = flowerPerkIds[cardTitle(card)];
    assert.ok(id);
    const revision = getRevision(id, "release:1.2");
    assert.ok(revision);
    assert.equal(entityAssets[revision.data.icon].entityId, id);
  }
  assert.equal(
    getRevision("perk:forget-me-not", "release:1.2").data.stats.find(
      (s) => s.key === "cooldown",
    ),
    undefined,
  );
  assert.equal(getRevision("perk:pink-orchid", "release:1.0"), undefined);
  const paths = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
  for (const path of [
    "/changelog",
    "/projects/maniac/changelog",
    ...releases.map((r) => r.href),
  ])
    assert.ok(paths.includes(path));
  const { render: renderPage } = await import("../.ssg/entry-server.js");
  const titles = new Set();
  for (const path of [
    "/projects/maniac/changelog",
    ...releases.map((r) => r.href),
  ]) {
    const page = renderPage(path, "https://example.invalid");
    assert.ok(
      page.head.includes(
        `rel="canonical" href="https://example.invalid${path}"`,
      ),
    );
    const title = page.head.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!titles.has(title));
    titles.add(title);
    assert.match(page.head, /property="og:title"/);
    assert.doesNotMatch(page.head, /name="robots" content="noindex/);
  }
  console.log(
    `PASS: ${sectionCount} complete original sections in data and SSG, 15 historical perks/icons, four chronicle routes and isolated snapshots.`,
  );
} finally {
  await server.close();
}
