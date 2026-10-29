import catalog from "./map-catalog.json";
import { verifiedSource } from "./snapshots";
import type { Entity, EntityId, Evidence } from "./types";
export interface MapMeta {
  id: EntityId<"map">;
  slug: string;
  name: string;
  numericId: number;
  description: string;
  size: string;
  difficulty: number;
  features: readonly string[];
  relatedIds: readonly EntityId[];
  evidence: readonly Evidence[];
  chronicle?: { version: string; sectionId: string };
}
export const mapCatalog = catalog as readonly MapMeta[];
export const maps: readonly Entity<"map">[] = mapCatalog.map((map) => ({
  id: map.id,
  slug: map.slug,
  name: map.name,
  kind: "map",
  revisions: {
    [verifiedSource]: {
      data: {
        description: map.description,
        numericId: map.numericId,
        size: map.size,
        difficulty: map.difficulty,
        features: map.features,
        relatedIds: map.relatedIds,
      },
      evidence: map.evidence,
    },
  },
}));
