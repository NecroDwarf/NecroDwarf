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
export const perkCatalog = perks as readonly PerkMeta[];
export const abilityCatalog = abilities as readonly AbilityMeta[];
