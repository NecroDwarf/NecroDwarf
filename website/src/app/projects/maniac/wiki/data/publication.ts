import type { EntityId, EntityKind } from "./types";
import { characterRouteMeta } from "../route-metadata";
const sections: Record<EntityKind, string> = {
  character: "characters",
  ability: "abilities",
  perk: "perks",
  item: "items",
  mechanic: "mechanics",
};
export function plannedEntityPath(kind: EntityKind, slug: string) {
  return `/projects/maniac/wiki/${sections[kind]}/${slug}`;
}
// Only the character articles are published in stage 3A.
export const publishedEntityRoutes: Readonly<
  Partial<Record<EntityId, string>>
> = Object.fromEntries(
  characterRouteMeta.map((c) => [c.id, plannedEntityPath("character", c.slug)]),
);
