import { characters } from "./characters";
import { abilities } from "./abilities";
import { perks } from "./perks";
import { items } from "./items";
import { mechanics } from "./mechanics";
import { maps } from "./maps";
import { verifiedSource } from "./snapshots";
import type {
  Entity,
  EntityId,
  EntityKind,
  GameEntity,
  SnapshotId,
} from "./types";
export const entities: readonly GameEntity[] = [
  ...characters,
  ...abilities,
  ...perks,
  ...items,
  ...mechanics,
  ...maps,
];
export const entityById = new Map(
  entities.map((entity) => [entity.id, entity]),
);
export function getEntity<K extends EntityKind>(id: EntityId<K>) {
  return entityById.get(id) as Entity<K> | undefined;
}
export function getRevision<K extends EntityKind>(
  id: EntityId<K>,
  snapshot: SnapshotId = verifiedSource,
) {
  return getEntity(id)?.revisions[snapshot];
}
export function characterSummaries(ids: readonly EntityId<"character">[]) {
  return ids.map((id) => {
    const entity = getEntity(id),
      revision = getRevision(id);
    if (!entity || !revision)
      throw new Error(`Missing verified character: ${id}`);
    return {
      name: entity.name,
      role: revision.data.role === "maniac" ? "Маньяк" : "Выживший",
      style: revision.data.style,
      description: revision.data.description,
    };
  });
}
