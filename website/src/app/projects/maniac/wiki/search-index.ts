import { characterRouteMeta } from "./route-metadata";
import { perkRouteMeta } from "./perk-route-metadata";
import { abilityRouteMeta } from "./ability-route-metadata";
import { itemRouteMeta } from "./item-route-metadata";
import { mechanicRouteMeta } from "./mechanic-route-metadata";
import { mapRouteMeta } from "./map-route-metadata";
import { publishedEffectMeta } from "./published-effects";
import { normalizeSearch } from "../../../shared/lib/search";

const base = "/projects/maniac/wiki";
const catalogs = [
  ["characters", "Персонажи", characterRouteMeta],
  ["perks", "Перки", perkRouteMeta],
  ["abilities", "Способности", abilityRouteMeta],
  ["items", "Предметы", itemRouteMeta],
  ["mechanics", "Механики", mechanicRouteMeta],
  ["maps", "Карты", mapRouteMeta],
] as const;

// Names, IDs and destinations only. No article text, balance data or images.
export const searchIndex = [
  ...catalogs.flatMap(([section, label, entries]) =>
    entries.map((entry) => ({
      name: entry.name,
      section,
      label,
      href: `${base}/${section}/${entry.slug}`,
      terms: normalizeSearch(`${entry.name} ${entry.id} ${entry.slug}`),
    })),
  ),
  ...publishedEffectMeta.map((entry) => ({
    name: entry.name,
    section: "effects",
    label: "Эффекты",
    href: `${base}/effects#${entry.id}`,
    terms: normalizeSearch(`${entry.name} maniacrev:${entry.id}`),
  })),
];

export function findWikiEntries(query: string) {
  const normalized = normalizeSearch(query).replace(/\s+/g, " ");
  if (!normalized) return [];
  const words = normalized.split(" ");
  const rank = (entry: (typeof searchIndex)[number]) => {
    const name = normalizeSearch(entry.name);
    if (name === normalized) return 0;
    if (name.startsWith(normalized)) return 1;
    if (
      words.every((word) =>
        name.split(/[\s:—-]+/).some((part) => part.startsWith(word)),
      )
    )
      return 2;
    if (words.every((word) => name.includes(word))) return 3;
    return 4;
  };
  return searchIndex
    .filter((entry) => words.every((word) => entry.terms.includes(word)))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "ru"));
}
