import { currentDescription, currentStats } from "./current-descriptions";
import type { CurrentCatalogEntry } from "./gameplay-facts";
import perks from "./perk-catalog.json";
import abilities from "./ability-catalog.json";
import type {
  AbilityKind,
  EntityId,
  Evidence,
  PerkPhase,
  PerkTeam,
  PerkType,
  Stat,
} from "./types";
interface ReferenceMeta {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  stats: readonly Stat[];
  evidence: readonly Evidence[];
}
export interface PerkMeta extends ReferenceMeta {
  id: EntityId<"perk">;
  gameId: string;
  team: PerkTeam;
  perkType: PerkType;
  phases: readonly PerkPhase[];
}
export interface AbilityMeta extends ReferenceMeta {
  id: EntityId<"ability">;
  abilityKind: AbilityKind;
  characterIds: readonly EntityId<"character">[];
  itemIds: readonly EntityId<"item">[];
}
export const perkCatalog = (
  perks as readonly CurrentCatalogEntry<PerkMeta>[]
).map((entry) => ({
  ...entry,
  description: currentDescription(entry.id, entry.description),
  stats: currentStats(entry.id, entry.stats),
}));
export const abilityCatalog = (
  abilities as readonly CurrentCatalogEntry<AbilityMeta>[]
).map((entry) => ({
  ...entry,
  description: currentDescription(entry.id, entry.description),
  stats: currentStats(entry.id, entry.stats),
}));
