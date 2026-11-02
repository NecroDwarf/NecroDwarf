import { characters } from "./characters";
import { verifiedSource } from "./snapshots";
import type { EntityId } from "./types";
export function characterSummaries(ids: readonly EntityId<"character">[]) {
  return ids.map((id) => {
    const entity = characters.find((character) => character.id === id),
      revision = entity?.revisions[verifiedSource];
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
