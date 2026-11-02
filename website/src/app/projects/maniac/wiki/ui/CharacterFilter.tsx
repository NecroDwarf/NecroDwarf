import { characters } from "../data/characters";
import type { EntityId } from "../data/types";
import { CatalogSelect } from "./CatalogSelect";

export function CharacterFilter({
  entries,
  label,
  value,
  onChange,
}: {
  entries: readonly { characterIds: readonly EntityId<"character">[] }[];
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const availableIds = new Set(entries.flatMap((entry) => entry.characterIds));
  return (
    <CatalogSelect
      label="Персонаж"
      ariaLabel={label}
      value={value}
      onChange={onChange}
    >
      <option value="">Все персонажи</option>
      {characters
        .filter((character) => availableIds.has(character.id))
        .map((character) => (
          <option value={character.id} key={character.id}>
            {character.name}
          </option>
        ))}
    </CatalogSelect>
  );
}
