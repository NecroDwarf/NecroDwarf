import type { NavigationItem } from "../../../shared/content/navigation";
import { characterRouteMeta } from "./route-metadata";
import { perkRouteMeta } from "./perk-route-metadata";
import { abilityRouteMeta } from "./ability-route-metadata";
import { itemRouteMeta } from "./item-route-metadata";
import { mechanicRouteMeta } from "./mechanic-route-metadata";
import { mapRouteMeta } from "./map-route-metadata";
import { publishedEffectMeta } from "./published-effects";
import {
  isStandaloneMechanic,
  removedCatalogEntries,
} from "./mechanic-placement";

import { wikiSections } from "./sections";

const base = "/projects/maniac/wiki";
function articleLinks(
  section: string,
  entries: readonly { name: string; slug: string }[],
): readonly NavigationItem[] {
  return entries
    .map((entry) => ({
      label: entry.name,
      href: `${base}/${section}/${entry.slug}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));
}
const articleNavigation: Readonly<Record<string, readonly NavigationItem[]>> = {
  [base + "/characters"]: articleLinks("characters", characterRouteMeta),
  [base + "/perks"]: articleLinks("perks", perkRouteMeta),
  [base + "/abilities"]: articleLinks("abilities", abilityRouteMeta),
  [base + "/items"]: articleLinks(
    "items",
    itemRouteMeta.filter((item) => !removedCatalogEntries.has(item.id)),
  ),
  [base + "/mechanics"]: articleLinks(
    "mechanics",
    mechanicRouteMeta.filter((mechanic) => isStandaloneMechanic(mechanic.id)),
  ),
  [base + "/maps"]: articleLinks("maps", mapRouteMeta),
  [base + "/effects"]: publishedEffectMeta
    .map((effect) => ({
      label: effect.name,
      href: base + "/effects#" + effect.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru")),
};
export const wikiNavigation: readonly NavigationItem[] = wikiSections.map(
  (section) => ({ ...section, children: articleNavigation[section.href] }),
);
