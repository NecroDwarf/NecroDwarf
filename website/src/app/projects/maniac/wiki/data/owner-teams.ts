import { perkItemTeams } from "./item-access";
import type { ItemMeta } from "./systems-catalog";
import { characters } from "./characters";
import { verifiedSource } from "./snapshots";
import type { EntityData, EntityId } from "./types";

type Team = EntityData["character"]["role"];
export type OwnerGroup = Team | "both" | "unassigned";
const characterTeams = new Map(
  characters.map((character) => [
    character.id,
    character.revisions[verifiedSource]!.data.role,
  ]),
);

function ownerTeams(ids: readonly EntityId<"character">[]) {
  const teams = new Set<Team>();
  for (const id of ids) {
    const team = characterTeams.get(id);
    if (team) teams.add(team);
  }
  return teams;
}

/** Each entry belongs to one visual group, even with owners on both teams. */
export function ownerGroup(ids: readonly EntityId<"character">[]): OwnerGroup {
  const teams = ownerTeams(ids);
  if (teams.size === 0) return "unassigned";
  if (teams.size === 2) return "both";
  return teams.has("maniac") ? "maniac" : "survivor";
}

export function matchesOwnerTeam(
  ids: readonly EntityId<"character">[],
  team: string,
) {
  if (team === "all") return true;
  if (team === "unassigned") return ownerGroup(ids) === "unassigned";
  return (
    (team === "maniac" || team === "survivor") && ownerTeams(ids).has(team)
  );
}

export function itemOwnerGroup(item: ItemMeta): OwnerGroup {
  const team = perkItemTeams[item.id];
  return team === "ALL"
    ? "both"
    : team === "SURVIVOR"
      ? "survivor"
      : team === "MANIAC"
        ? "maniac"
        : ownerGroup(item.characterIds);
}
export function matchesItemTeam(item: ItemMeta, team: string) {
  const group = itemOwnerGroup(item);
  return (
    team === "all" ||
    (team === "unassigned"
      ? group === "unassigned"
      : (team === "maniac" || team === "survivor") &&
        (group === team || group === "both"))
  );
}
