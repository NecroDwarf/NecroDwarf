import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Marked } from "marked";
import {
  compile,
  commit,
  repository,
  resolveLink,
  sourceLinkErrors,
} from "./novellmaker-reference.mjs";
const root = "src/app/projects/novellmaker/docs";
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const manifest = await readJson("build/novellmaker-manifest.json");
const provenance = await readJson(`${root}/source/provenance.json`);
const inventory = await readJson(`${root}/source/api-inventory.json`);
const search = await readJson(`${root}/search-index.json`);
assert.equal(manifest.commit, commit);
assert.equal(provenance.commit, commit);
assert.equal(inventory.commit, commit);
assert.equal(manifest.documents.length, 22);
assert.equal(Object.keys(provenance.hashes).length, 22);
assert.deepEqual(inventory.verification.errors, sourceLinkErrors);
const documents = new Map(manifest.documents.map((d) => [d.path, d]));
const allowedTags = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "strong",
  "em",
  "del",
  "code",
  "span",
  "pre",
  "a",
  "br",
  "hr",
  "blockquote",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
]);
const allowedProps = new Set([
  "id",
  "href",
  "target",
  "rel",
  "className",
  "start",
  "scope",
  "tabIndex",
  "role",
  "aria-label",
]);
let linkCount = 0,
  codeCount = 0,
  luaCount = 0;
function verifyHref(href, from) {
  if (href.startsWith("#") || href.startsWith("/projects/novellmaker/docs")) {
    const [path, fragment] = href.split("#"),
      target = documents.get(path || from);
    assert.ok(target, `Missing route ${from} → ${href}`);
    if (fragment)
      assert.ok(
        target.ids.includes(decodeURIComponent(fragment)),
        `Missing anchor ${from} → ${href}`,
      );
  } else if (href.startsWith(`${repository}/blob/${commit}/`)) {
    const path = href
      .slice(`${repository}/blob/${commit}/`.length)
      .split("#")[0];
    assert.ok(
      provenance.paths.includes(path),
      `GitHub file absent at pinned commit: ${path}`,
    );
  }
  linkCount++;
}
for (const doc of manifest.documents) {
  const source = await readFile(`${root}/source/${doc.file}`, "utf8");
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    provenance.hashes[doc.file],
    `Original changed: ${doc.file}`,
  );
  const compiled = compile(source, doc.file);
  const data = await readJson(`${root}/data/${doc.file.slice(0, -3)}.json`);
  assert.deepEqual(
    data,
    {
      title: compiled.title,
      headings: compiled.headings,
      nodes: compiled.nodes,
    },
    `Stale generated data: ${doc.file}`,
  );
  const originalCodes = [];
  const parser = new Marked();
  parser.walkTokens(parser.lexer(source), (t) => {
    if (t.type === "code")
      originalCodes.push({
        language: t.lang?.split(/\s/)[0] || "text",
        text: t.text,
      });
  });
  assert.deepEqual(
    doc.codes,
    originalCodes,
    `Lost code or indentation: ${doc.file}`,
  );
  codeCount += originalCodes.length;
  luaCount += originalCodes.filter((c) => c.language === "lua").length;
  function checkNodes(nodes) {
    for (const node of nodes) {
      if (typeof node === "string") continue;
      assert.ok(allowedTags.has(node.tag), `Unsafe tag: ${node.tag}`);
      for (const key of Object.keys(node.props ?? {}))
        assert.ok(allowedProps.has(key), `Unsafe prop: ${key}`);
      if (node.tag === "pre") {
        const text = (nodes) =>
          nodes
            .map((n) => (typeof n === "string" ? n : text(n.children ?? [])))
            .join("");
        assert.equal(
          text(node.children),
          node.text,
          "Highlight must preserve code exactly",
        );
      }
      checkNodes(node.children ?? []);
    }
  }
  checkNodes(data.nodes);
  for (const href of doc.links) verifyHref(href, doc.path);
  const html = await readFile(`build/client${doc.path}.html`, "utf8");
  const escapedTitle = data.title
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  assert.ok(
    html.includes(`<title>${escapedTitle} — NovellMaker · NecroDwarf</title>`),
    `Incorrect SSG SEO title: ${doc.path}`,
  );
  assert.ok(
    html.includes("data-novellmaker-article"),
    `Missing SSG article ${doc.path}`,
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(
    ids.length,
    new Set(ids).size,
    `Duplicate HTML IDs: ${doc.path}`,
  );
  for (const id of doc.ids)
    assert.ok(ids.includes(id), `Missing rendered ID: ${id}`);
}
const indexedNames = [
  ...(await readFile(`${root}/source/index.md`, "utf8"))
    .split("## Полный алфавитный указатель")[1]
    .matchAll(/^- \[([^\]]+)\]\(([^)]+)\)/gm),
];
const registered = Object.values(inventory.groups).flat().sort();
assert.deepEqual(indexedNames.map((m) => m[1]).sort(), registered);
for (const [, name, originalHref] of indexedNames) {
  const href = resolveLink(originalHref, "index.md");
  assert.ok(
    search.some((e) => e.title === name && e.href === href),
    `API missing in search: ${name}`,
  );
  verifyHref(href, "/projects/novellmaker/docs/lua");
}
for (const entry of search) verifyHref(entry.href);
assert.throws(() => resolveLink("javascript:alert(1)", "index.md"));
assert.throws(() => resolveLink("//evil.example", "index.md"));
const unsafe = compile("<script>alert(1)</script>\n", "unsafe.md");
assert.equal(unsafe.nodes[0], "<script>alert(1)</script>\n");
const assets = await readJson(
  "src/app/projects/novellmaker/assets/examples/sources.json",
);
for (const a of assets.assets)
  assert.equal(
    createHash("sha256")
      .update(
        await readFile(
          `src/app/projects/novellmaker/assets/examples/${a.file}`,
        ),
      )
      .digest("hex"),
    a.sha256,
  );
const chunks = await readJson(".ssg/client-modules.json");
const brand = await readJson(
  "src/app/projects/novellmaker/assets/branding-source.json",
);
assert.equal(brand.commit, commit);
assert.equal(
  createHash("sha256")
    .update(
      await readFile("src/app/projects/novellmaker/assets/novellmaker.svg"),
    )
    .digest("hex"),
  brand.sha256,
);
const showcase = await readFile(
  "build/client/projects/novellmaker.html",
  "utf8",
);
for (const suffix of [
  "win-x64-Setup.exe",
  "win-x64-portable.zip",
  "linux-x64-experimental.tar.gz",
])
  assert.ok(
    showcase.includes(
      `/releases/download/v0.1.0-beta.1/NovellMaker-0.1.0-beta.1-${suffix}`,
    ),
  );
assert.ok(showcase.includes('id="release"'));
assert.ok(showcase.includes("экспериментальная сборка"));
for (const path of ["index", "projects", "changelog"])
  assert.ok(
    (await readFile(`build/client/${path}.html`, "utf8")).includes(
      "Открытая бета",
    ),
    `${path}: beta missing`,
  );
const chunkFor = (source) => {
  const c = Object.entries(chunks).find(([, c]) => c.modules.includes(source));
  assert.ok(c, source);
  return c[0];
};
function dependencies(...roots) {
  const seen = new Set();
  function visit(id) {
    if (seen.has(id)) return;
    seen.add(id);
    chunks[id].imports.forEach(visit);
  }
  roots.forEach(visit);
  return [...seen].flatMap((id) => chunks[id].modules);
}
const main = chunkFor("src/main.tsx");
for (const source of ["pages/NovellMakerPage.tsx", "docs/DocsHome.tsx"]) {
  const loaded = dependencies(
    main,
    chunkFor(`src/app/projects/novellmaker/${source}`),
  );
  assert.ok(
    !loaded.some((m) =>
      /novellmaker\/docs\/(data|source|search-index)|node_modules\/(three|marked|highlight.js)\/|maniac\/wiki\/data/.test(
        m,
      ),
    ),
    `Unexpected content in ${source}`,
  );
}
assert.ok(
  !dependencies(main).some((m) =>
    /novellmaker\/docs\/(data|source|search-index)/.test(m),
  ),
  "Content in initial JS",
);
for (const d of manifest.documents) {
  const slug = d.file.slice(0, -3);
  const loaded = dependencies(
    main,
    chunkFor(`src/app/projects/novellmaker/docs/articles/${slug}.tsx`),
  );
  assert.deepEqual(
    loaded.filter((m) => /novellmaker\/docs\/data\/.*\.json$/.test(m)),
    [`src/app/projects/novellmaker/docs/data/${slug}.json`],
  );
  assert.ok(
    !loaded.some((m) =>
      /node_modules\/(three|marked|highlight.js)\/|maniac\/wiki\/data|novellmaker\/docs\/search-index/.test(
        m,
      ),
    ),
    `Unrelated runtime in ${slug}`,
  );
}
console.log(
  `NovellMaker: 22/22 originals, ${registered.length} registered APIs, ${codeCount} code blocks (${luaCount} Lua), ${linkCount} links/anchors, pinned GitHub paths, SSG and isolated route chunks OK`,
);
