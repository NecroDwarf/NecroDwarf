import type { EntityId, EntityKind } from "./types";
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
// Only actual, published routes may be registered here. No articles in stage 2B-0.
export const publishedEntityRoutes: Readonly<
  Partial<Record<EntityId, string>>
> = {};
