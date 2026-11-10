import { characterRouteMeta } from "./route-metadata";
import { perkRouteMeta } from "./perk-route-metadata";
import { abilityRouteMeta } from "./ability-route-metadata";
import { itemRouteMeta } from "./item-route-metadata";
import { mechanicRouteMeta } from "./mechanic-route-metadata";
import { mapRouteMeta } from "./map-route-metadata";
import { publishedEffectMeta } from "./published-effects";
import {
  integratedMechanicHref,
  mechanicOwners,
  removedCatalogEntries,
} from "./mechanic-placement";

const base = "/projects/maniac/wiki";
const catalogs = [
  ["characters", "Персонажи", characterRouteMeta],
  ["perks", "Перки", perkRouteMeta],
  ["abilities", "Способности", abilityRouteMeta],
  ["items", "Предметы", itemRouteMeta],
  ["mechanics", "Механики", mechanicRouteMeta],
  ["maps", "Карты", mapRouteMeta],
] as const;

export const searchMetadata = [
  ...catalogs.flatMap(([section, label, entries]) =>
    entries
      .filter((entry) => !removedCatalogEntries.has(entry.id))
      .map((entry) => ({
        ...entry,
        section: mechanicOwners[entry.id]?.startsWith("character:")
          ? ("characters" as const)
          : mechanicOwners[entry.id]?.startsWith("perk:")
            ? ("perks" as const)
            : section,
        label: mechanicOwners[entry.id]?.startsWith("character:")
          ? "Персонажи"
          : mechanicOwners[entry.id]?.startsWith("perk:")
            ? "Перки"
            : label,
        href:
          integratedMechanicHref(entry.id) ??
          `${base}/${section}/${entry.slug}`,
      })),
  ),
  ...publishedEffectMeta.map((entry) => ({
    ...entry,
    id: `maniacrev:${entry.id}`,
    slug: entry.id,
    section: "effects" as const,
    label: "Эффекты",
    href: `${base}/effects#${entry.id}`,
  })),
];
