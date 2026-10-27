import type { EntityId } from "./types";
export interface CharacterChronicle {
  version: "1.0" | "1.1" | "1.2";
  anchor: string;
  label: string;
}
const appearance: readonly CharacterChronicle[] = [
  {
    version: "1.1",
    anchor: "section-01",
    label: "Появление в «Кошмарном додепе»",
  },
];
const equipment: readonly CharacterChronicle[] = [
  {
    version: "1.0",
    anchor: "section-07",
    label: "Изменения снаряжения в Reforge",
  },
];
export const characterChronicles: Partial<
  Record<EntityId<"character">, readonly CharacterChronicle[]>
> = {
  "character:keeper-of-nightmares": appearance,
  "character:ghost": appearance,
  "character:dodepovich": appearance,
  "character:death": [
    {
      version: "1.2",
      anchor: "death",
      label: "Смерть · Объятия перед встречей",
    },
  ],
  "character:pudge": equipment,
  "character:ursa": equipment,
  "character:shaman": equipment,
  "character:freddy-bear": equipment,
  "character:scientist": equipment,
  "character:necromancer": equipment,
  "character:mefedronshchik": [
    {
      version: "1.0",
      anchor: "section-02",
      label: "Система зависимости в Reforge",
    },
    ...equipment,
  ],
  "character:plague-doctor": [
    { version: "1.0", anchor: "section-02", label: "Переработка системы чумы" },
  ],
};
