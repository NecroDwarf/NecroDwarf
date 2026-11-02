import type { EntityId, PerkTeam } from "./types";
// Availability through the owning perk, not personal ownership by a character.
export const perkItemTeams: Readonly<
  Partial<Record<EntityId<"item">, PerkTeam>>
> = {
  "item:clarity": "ALL",
  "item:awakening-needle": "SURVIVOR",
  "item:paint-can": "ALL",
  "item:forget-me-not": "SURVIVOR",
  "item:rose-colored-glasses": "SURVIVOR",
  "item:pink-orchid": "SURVIVOR",
  "item:sber-sprout": "SURVIVOR",
  "item:red-color-card": "ALL",
  "item:blue-color-card": "ALL",
  "item:green-color-card": "ALL",
};
