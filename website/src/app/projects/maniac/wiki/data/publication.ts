import type { EntityId, EntityKind } from "./types";
import { characterRouteMeta } from "../route-metadata";
import { perkRouteMeta } from "../perk-route-metadata";
import { abilityRouteMeta } from "../ability-route-metadata";
import { itemRouteMeta } from "../item-route-metadata";
import { mechanicRouteMeta } from "../mechanic-route-metadata";
import { mapRouteMeta } from "../map-route-metadata";
import { integratedMechanicHref } from "../mechanic-placement";
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
// Published SSG metadata only: links must not import gameplay data or snapshots.
const publishedEntries = (
  [
    ["map", mapRouteMeta],
    ["item", itemRouteMeta],
    ["mechanic", mechanicRouteMeta],
    ["character", characterRouteMeta],
    ["perk", perkRouteMeta],
    ["ability", abilityRouteMeta],
  ] as const
).flatMap(([kind, entries]) =>
  entries.map(
    (entry) =>
      [
        entry.id,
        {
          name: entry.name,
          href:
            integratedMechanicHref(entry.id) ??
            plannedEntityPath(kind, entry.slug),
        },
      ] as const,
  ),
);
export const publishedEntityMeta: Readonly<
  Partial<Record<EntityId, { name: string; href: string }>>
> = Object.fromEntries(publishedEntries);
export const publishedEntityRoutes: Readonly<
  Partial<Record<EntityId, string>>
> = Object.fromEntries(publishedEntries.map(([id, meta]) => [id, meta.href]));
