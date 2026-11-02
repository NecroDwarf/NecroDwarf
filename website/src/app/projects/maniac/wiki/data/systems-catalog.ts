import { currentDescription, currentStats } from "./current-descriptions";
import type { CurrentCatalogEntry } from "./gameplay-facts";
import itemData from "./item-catalog.json";
import mechanicData from "./mechanic-catalog.json";
import type { EntityId, Evidence, Stat } from "./types";
import { withWeaponDamage } from "./weapon-damage";
interface SystemMeta {
  id: EntityId<"item" | "mechanic">;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  relatedIds: readonly EntityId[];
  stats: readonly Stat[];
  evidence: readonly Evidence[];
}
export interface ItemMeta extends SystemMeta {
  id: EntityId<"item">;
  registryIds: readonly string[];
  characterIds: readonly EntityId<"character">[];
  usage: string;
}
export interface MechanicMeta extends SystemMeta {
  id: EntityId<"mechanic">;
}
export const itemCatalog = (
  itemData as readonly CurrentCatalogEntry<ItemMeta>[]
).map((entry) => ({
  ...entry,
  description: currentDescription(entry.id, entry.description),
  stats: withWeaponDamage(entry.slug, currentStats(entry.id, entry.stats)),
}));
// Existing articles remain addressable through related material links.
const hiddenCatalogItems = new Set<EntityId<"item">>([
  "item:soul-essence",
  "item:slot-machine",
  "item:alchemy-kit",
  "item:dodepovich-coins",
  "item:computer",
]);
export const listedItems = itemCatalog.filter(
  (entry) => entry.category !== "armor" && !hiddenCatalogItems.has(entry.id),
);
export const mechanicCatalog = (
  mechanicData as readonly CurrentCatalogEntry<MechanicMeta>[]
).map((entry) => ({
  ...entry,
  description: currentDescription(entry.id, entry.description),
  stats: currentStats(entry.id, entry.stats),
}));
export const itemCategoryLabels: Record<string, string> = {
  weapon: "Оружие",
  armor: "Броня",
  consumable: "Расходники",
  tool: "Инструменты и устройства",
  resource: "Ресурсы и наборы",
  block: "Игровые блоки",
  "perk-item": "Предметы перков",
  coin: "Монетки",
  reference: "Игровые справочники",
};
export const mechanicCategoryLabels: Record<string, string> = {
  match: "Матч",
  core: "Основной геймплей",
  resource: "Ресурсы и состояния",
  "character-system": "Системы персонажей",
  "perk-system": "Системы перков",
};
