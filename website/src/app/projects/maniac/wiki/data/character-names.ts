import { characters } from "./characters";
import type { EntityId } from "./types";

const names = new Map(
  characters.map((character) => [character.id, character.name]),
);

export function characterNames(ids: readonly EntityId<"character">[]) {
  return ids.map((id) => names.get(id)).join(", ");
}
