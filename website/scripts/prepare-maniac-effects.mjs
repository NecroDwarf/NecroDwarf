import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Read the agreed snapshot only. No writes or Git configuration changes in the game repository.
const source = resolve(process.argv[2] || "../../Maniac-mod-evolution");
const commit = "8692f66dc76582144be85d553d43a41f189b64e7";
const args = [
  "-c",
  `safe.directory=${source.replaceAll("\\", "/")}`,
  "-C",
  source,
];
const read = (path) =>
  execFileSync("git", [...args, "show", `${commit}:${path}`], {
    maxBuffer: 8e6,
  });
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const base = "src/main/java/org/example/maniacrevolution/";
const registryPath = `${base}effect/ModEffects.java`;
const languagePath = "src/main/resources/assets/maniacrev/lang/ru_ru.json";
const registry = read(registryPath);
const languageBytes = read(languagePath);
const language = JSON.parse(languageBytes.toString("utf8"));
const files = new Set(
  execFileSync("git", [...args, "ls-tree", "-r", "--name-only", commit], {
    encoding: "utf8",
    maxBuffer: 8e6,
  })
    .trim()
    .split("\n"),
);
const references = execFileSync(
  "git",
  [...args, "grep", "-n", "ModEffects\\.", commit, "--", "src/main/java"],
  { encoding: "utf8", maxBuffer: 8e6 },
).split("\n");
const metadata = [],
  audit = [];
const target = "src/app/projects/maniac/assets/wiki/effects";
await mkdir(target, { recursive: true });
for (const [, symbol, id, factory] of registry
  .toString("utf8")
  .matchAll(
    /RegistryObject<MobEffect>\s+(\w+)\s*=\s*MOB_EFFECTS\.register\(\s*"([^"]+)",([\s\S]*?)\);/g,
  )) {
  const className =
    factory.match(/(\w+)::new/)?.[1] ?? factory.match(/new (\w+)\(/)?.[1];
  if (!className) throw Error(`Missing effect implementation: ${id}`);
  const path = `${base}effect/${className}.java`;
  const implementation = read(path);
  const category = (factory + implementation.toString("utf8")).match(
    /MobEffectCategory\.(BENEFICIAL|HARMFUL|NEUTRAL)/,
  )?.[1];
  const name = language[`effect.maniacrev.${id}`];
  if (!category || !name) throw Error(`Missing category or translation: ${id}`);
  metadata.push({ id, name, category });
  const usages = references
    .filter((line) => new RegExp(`ModEffects\\.${symbol}\\b`).test(line))
    .map((line) => {
      const match = line.match(/^[^:]+:(.*?):(\d+):(.*)$/);
      return { path: match[1], line: Number(match[2]), code: match[3].trim() };
    });
  const texturePath = `src/main/resources/assets/maniacrev/textures/mob_effect/${id}.png`;
  let icon = null;
  if (files.has(texturePath)) {
    const bytes = read(texturePath);
    await writeFile(`${target}/${id}.png`, bytes);
    icon = { path: texturePath, sha256: sha(bytes) };
  }
  audit.push({
    id,
    symbol,
    implementation: { path, sha256: sha(implementation) },
    usages,
    icon,
  });
}
if (metadata.length !== 34)
  throw Error(`Unexpected registry size: ${metadata.length}`);
await writeFile(
  "src/app/projects/maniac/wiki/effect-route-metadata.ts",
  `// Generated from ModEffects.java and ru_ru.json at ${commit}.\nexport const effectRouteMeta = ${JSON.stringify(metadata, null, 2)} as const;\n`,
);
await writeFile(
  "src/app/projects/maniac/wiki/data/effect-sources.json",
  JSON.stringify(
    {
      commit,
      registry: { path: registryPath, sha256: sha(registry) },
      language: { path: languagePath, sha256: sha(languageBytes) },
      effects: audit,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Imported ${metadata.length} effects and ${audit.filter((entry) => entry.icon).length} original icons from ${commit}.`,
);
