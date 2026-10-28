import type { GameEntity, GameVersion } from "./types";
import { snapshots } from "./snapshots";
export function validateGameData(
  entities: readonly GameEntity[],
  versions: readonly GameVersion[],
) {
  const byId = new Map<string, GameEntity>(),
    slugs = new Set<string>();
  function fail(message: string): never {
    throw new Error(message);
  }
  for (const entity of entities) {
    if (byId.has(entity.id)) fail(`Duplicate ID: ${entity.id}`);
    if (
      !entity.id.startsWith(`${entity.kind}:`) ||
      !/^[a-z]+:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entity.id) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entity.slug)
    )
      fail(`Invalid identity: ${entity.id}`);
    const slug = `${entity.kind}:${entity.slug}`;
    if (slugs.has(slug)) fail(`Duplicate slug: ${slug}`);
    slugs.add(slug);
    byId.set(entity.id, entity);
  }
  for (const entity of entities)
    for (const [snapshot, revision] of Object.entries(entity.revisions)) {
      if (!(snapshot in snapshots)) fail(`Unknown snapshot: ${snapshot}`);
      if (!revision || !revision.evidence.length || !revision.data.description)
        fail(`Unverified revision: ${entity.id}`);
      const { data } = revision;
      const relationIds = (key: string): readonly string[] => {
        const ids: unknown = Reflect.get(data, key);
        if (ids === undefined) return [];
        if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string"))
          fail(`Invalid relation list: ${entity.id}:${key}`);
        return ids;
      };
      const groups: readonly (readonly [string, readonly string[]])[] = [
        ["character", relationIds("characterIds")],
        ["ability", relationIds("abilityIds")],
        ["item", relationIds("itemIds")],
        ["mechanic", relationIds("mechanicIds")],
      ];
      for (const [expected, ids] of groups) {
        for (const id of ids) {
          const target = byId.get(id);
          if (!target || target.kind !== expected)
            fail(`Broken ${expected} reference: ${entity.id} -> ${id}`);
          if (!target.revisions[snapshot as keyof typeof target.revisions])
            fail(`Missing related snapshot: ${id} at ${snapshot}`);
        }
      }
      const stats = new Set<string>();
      for (const stat of data.stats ?? []) {
        if (stats.has(stat.key) || !Number.isFinite(stat.value))
          fail(`Invalid stat: ${entity.id}:${stat.key}`);
        stats.add(stat.key);
      }
    }
  const versionIds = new Set<string>();
  for (const version of versions) {
    if (versionIds.has(version.id)) fail(`Duplicate version: ${version.id}`);
    versionIds.add(version.id);
    if (!(version.snapshot in snapshots))
      fail(`Unknown version snapshot: ${version.snapshot}`);
    for (const change of version.changes) {
      if (!byId.has(change.id) || !change.editorial || !change.evidence.length)
        fail(`Invalid change: ${change.id}`);
      if (change.operation === "added" && (!change.after || change.before))
        fail(`Invalid addition: ${change.id}`);
      if (change.operation === "removed" && (!change.before || change.after))
        fail(`Invalid removal: ${change.id}`);
      if (change.operation === "changed" && (!change.before || !change.after))
        fail(`Invalid comparison: ${change.id}`);
      for (const ref of [change.before, change.after])
        if (ref) {
          if (
            ref.id !== change.id ||
            !byId.get(ref.id)?.revisions[ref.snapshot]
          )
            fail(`Broken change reference: ${ref.id}`);
        }
    }
  }
}
