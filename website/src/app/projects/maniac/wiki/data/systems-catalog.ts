import itemData from "./item-catalog.json";
import mechanicData from "./mechanic-catalog.json";
import type { EntityId, Evidence, Stat } from "./types";
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
export const itemCatalog = itemData as readonly ItemMeta[];
export const mechanicCatalog = mechanicData as readonly MechanicMeta[];
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
