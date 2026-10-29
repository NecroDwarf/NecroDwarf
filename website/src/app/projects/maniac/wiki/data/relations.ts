import { entities, getRevision } from "./registry";
import type { EntityId } from "./types";
// Current source edges only. Reverse navigation is derived, never hand-copied.
function targets(data: object): EntityId[] {
  return [
    "characterIds",
    "itemIds",
    "abilityIds",
    "mechanicIds",
    "relatedIds",
  ].flatMap((key) => (Reflect.get(data, key) ?? []) as EntityId[]);
}
export function relatedEntityIds(id: EntityId): EntityId[] {
  const own = getRevision(id)?.data;
  const result = new Set<EntityId>(own ? targets(own) : []);
  for (const entity of entities) {
    const data = getRevision(entity.id)?.data;
    if (data && targets(data).includes(id)) result.add(entity.id);
  }
  result.delete(id);
  return [...result];
}
