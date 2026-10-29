import type { EntityId, EntityKind } from "./types";
import { characterRouteMeta } from "../route-metadata";
import { perkRouteMeta } from "../perk-route-metadata";
import { abilityRouteMeta } from "../ability-route-metadata";
import { itemRouteMeta } from "../item-route-metadata";
import { mechanicRouteMeta } from "../mechanic-route-metadata";
import { mapRouteMeta } from "../map-route-metadata";
const sections: Record<EntityKind, string> = {
  character: "characters",
  ability: "abilities",
  perk: "perks",
  item: "items",
  mechanic: "mechanics",
  map: "maps",
};
export function plannedEntityPath(kind: EntityKind, slug: string) {
  return `/projects/maniac/wiki/${sections[kind]}/${slug}`;
}
// Only existing SSG articles: characters, registered perks and verified abilities.
export const publishedEntityRoutes: Readonly<
  Partial<Record<EntityId, string>>
> = Object.fromEntries([
  ...mapRouteMeta.map((m) => [m.id, plannedEntityPath("map", m.slug)]),
  ...itemRouteMeta.map((item) => [
    item.id,
    plannedEntityPath("item", item.slug),
  ]),
  ...mechanicRouteMeta.map((m) => [
    m.id,
    plannedEntityPath("mechanic", m.slug),
  ]),
  ...characterRouteMeta.map((c) => [
    c.id,
    plannedEntityPath("character", c.slug),
  ]),
  ...perkRouteMeta.map((p) => [p.id, plannedEntityPath("perk", p.slug)]),
  ...abilityRouteMeta.map((a) => [a.id, plannedEntityPath("ability", a.slug)]),
]);
