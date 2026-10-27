export type EntityKind = "character" | "ability" | "perk" | "item" | "mechanic";
export type EntityId<K extends EntityKind = EntityKind> = `${K}:${string}`;
export type SnapshotId = `release:${string}` | `source:${string}`;
export interface EntityAsset {
  src: string;
  width: number;
  height: number;
  entityId: EntityId;
  kind: "illustration" | "pixel-texture" | "item-render";
  presentation?: {
    scale?: number;
    position?: readonly [number, number];
    blend?: "normal" | "screen";
  };
}
export interface Evidence {
  path: string;
  note?: string;
}
export interface Stat {
  key: string;
  label: string;
  value: number;
  unit:
    | "seconds"
    | "mana"
    | "blocks"
    | "percent"
    | "count"
    | "health"
    | "damage"
    | "armor";
}
interface BaseData {
  description: string;
  stats?: readonly Stat[];
  icon?: string;
}
export interface EntityData {
  character: BaseData & {
    role: "maniac" | "survivor";
    style: string;
    abilityIds: readonly EntityId<"ability">[];
    itemIds: readonly EntityId<"item">[];
    model?: string;
    gameId?: string;
    sourceDescription?: string;
    difficulty?: number;
    tags?: readonly string[];
  };
  ability: BaseData & { mechanicIds: readonly EntityId<"mechanic">[] };
  perk: BaseData & {
    effects: readonly string[];
    mechanicIds: readonly EntityId<"mechanic">[];
  };
  item: BaseData & {
    usage: string;
    abilityIds: readonly EntityId<"ability">[];
    mechanicIds: readonly EntityId<"mechanic">[];
  };
  mechanic: BaseData;
}
export interface Revision<T> {
  data: T;
  evidence: readonly Evidence[];
}
export interface Entity<K extends EntityKind> {
  id: EntityId<K>;
  kind: K;
  slug: string;
  name: string;
  revisions: Readonly<Partial<Record<SnapshotId, Revision<EntityData[K]>>>>;
}
export type GameEntity = { [K in EntityKind]: Entity<K> }[EntityKind];
export interface EntityRef {
  id: EntityId;
  snapshot: SnapshotId;
}
export interface EntityChange {
  id: EntityId;
  operation: "added" | "changed" | "removed";
  before?: EntityRef;
  after?: EntityRef;
  // Editorial text stays independent of current descriptions and balance.
  editorial: string;
  evidence: readonly Evidence[];
}
export interface GameVersion {
  id: string;
  releaseId: string;
  snapshot: SnapshotId;
  coverage: "partial" | "complete";
  changes: readonly EntityChange[];
}
