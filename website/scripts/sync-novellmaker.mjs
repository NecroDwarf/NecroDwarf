import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { commit, repository } from "./novellmaker-reference.mjs";
const checkout = resolve(process.argv[2] || "../.audit/novellmaker-source");
const revision = execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
if (revision !== commit) throw new Error(`Expected ${commit}, got ${revision}`);
if (
  execFileSync("git", ["-C", checkout, "status", "--porcelain"], {
    encoding: "utf8",
  }).trim()
)
  throw new Error("Source checkout must be clean");
const source = "src/app/projects/novellmaker/docs/source";
await mkdir(source, { recursive: true });
const hashes = {};
for (const file of (await readdir(`${checkout}/docs/lua-reference`))
  .filter((f) => f.endsWith(".md"))
  .sort()) {
  // Canonical Git bytes keep hashes independent of checkout line endings.
  const data = execFileSync("git", [
    "-C",
    checkout,
    "show",
    `${commit}:docs/lua-reference/${file}`,
  ]);
  await writeFile(`${source}/${file}`, data);
  hashes[file] = createHash("sha256").update(data).digest("hex");
}
const paths = execFileSync(
  "git",
  ["-C", checkout, "ls-tree", "-r", "--name-only", commit],
  { encoding: "utf8" },
)
  .trim()
  .split(/\r?\n/);
const python = process.env.PYTHON || "python";
const verification = JSON.parse(
  execFileSync(python, ["scripts/check-lua-reference.py"], {
    cwd: checkout,
    encoding: "utf8",
  }),
);
const groups = JSON.parse(
  execFileSync(
    python,
    [
      "-c",
      "import runpy,json; m=runpy.run_path('scripts/check-lua-reference.py'); print(json.dumps({k:sorted(v) for k,v in m['inventory']().items()}))",
    ],
    { cwd: checkout, encoding: "utf8" },
  ),
);
await writeFile(
  `${source}/api-inventory.json`,
  JSON.stringify({ commit, verification, groups }, null, 2) + "\n",
);
await writeFile(
  `${source}/provenance.json`,
  JSON.stringify({ repository, commit, hashes, paths }, null, 2) + "\n",
);
const images = {
  "traveller.png": "examples/author-interface/Assets/Images/traveller.png",
  "mechanic.png":
    "examples/character-animation/Assets/Images/1235f1b448684f1ca50d54a483b84b61.png",
};
const assetRoot = "src/app/projects/novellmaker/assets/examples";
await mkdir(assetRoot, { recursive: true });
const assets = [];
for (const [file, path] of Object.entries(images)) {
  const data = await readFile(`${checkout}/${path}`);
  await writeFile(`${assetRoot}/${file}`, data);
  assets.push({
    file,
    path,
    sha256: createHash("sha256").update(data).digest("hex"),
  });
}
await writeFile(
  `${assetRoot}/sources.json`,
  JSON.stringify({ repository, commit, assets }, null, 2) + "\n",
);
console.log(
  `Copied ${Object.keys(hashes).length} original Markdown files from ${commit}; source unchanged.`,
);
