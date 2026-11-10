import type { EntityId } from "./data/types";

// Editorial placement only. Source articles and balance stay in their own files.
export const mechanicOwners: Readonly<
  Record<string, EntityId<"character" | "perk">>
> = {
  "mechanic:sanity": "character:keeper-of-nightmares",
  "mechanic:nightmare-trials": "character:keeper-of-nightmares",
  "mechanic:addiction": "character:mefedronshchik",
  "mechanic:casino": "character:dodepovich",
  "mechanic:alchemy": "character:alchemist",
  "mechanic:resurrection": "character:necromancer",
  "mechanic:plague": "character:plague-doctor",
  "mechanic:ghost-states": "character:ghost",
  "mechanic:medical-care": "character:doctor",
  "mechanic:shaman-spirits": "character:shaman",
  "mechanic:freddy-generator": "character:freddy-bear",
  "mechanic:agent-shop": "character:agent",
  "mechanic:ursa-stacks": "character:ursa",
  "mechanic:flower-return": "perk:forget-me-not",
  "mechanic:paint": "perk:the-paint-thickens",
  "mechanic:orchid-illusion": "perk:pink-orchid",
  "mechanic:color-roulette": "perk:color-roulette",
};
export const removedCatalogEntries = new Set<string>([
  "item:recipe-book",
  "mechanic:traps",
]);
export const mechanicAnchor = (id: string) => id.replace(":", "-");
export function integratedMechanicHref(id: string) {
  const owner = mechanicOwners[id];
  if (!owner) return undefined;
  const [kind, slug] = owner.split(":");
  return `/projects/maniac/wiki/${kind === "character" ? "characters" : "perks"}/${slug}#${mechanicAnchor(id)}`;
}
export function isStandaloneMechanic(id: string) {
  return !mechanicOwners[id] && !removedCatalogEntries.has(id);
}
