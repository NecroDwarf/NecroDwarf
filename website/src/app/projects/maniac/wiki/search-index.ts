import { searchMetadata } from "./search-metadata";
import { searchAliases, sectionTerms } from "./search-vocabulary";
import content from "./search-content.json";
import { normalizeSearch } from "../../../shared/lib/search";

// Generated plain text only: no article renderers, gameplay catalogs or assets.
const articleTerms: Readonly<Record<string, string>> = content;
export const searchIndex = searchMetadata.map((entry) => {
  const text = articleTerms[entry.href];
  if (!text) throw new Error(`Missing generated search text: ${entry.href}`);
  const aliases = normalizeSearch(searchAliases[entry.id] ?? "");
  const category = normalizeSearch(
    `${entry.label} ${sectionTerms[entry.section]}`,
  );
  const identity = normalizeSearch(`${entry.name} ${entry.id} ${entry.slug}`);
  return {
    ...entry,
    aliases,
    category,
    identity,
    terms: `${identity} ${aliases} ${category} ${text}`,
  };
});

export function findWikiEntries(query: string) {
  const normalized = normalizeSearch(query).replace(/\s+/g, " ");
  if (!normalized) return [];
  const words = normalized.split(" ");
  const matches = (text: string) => words.every((word) => text.includes(word));
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
    if (matches(name)) return 3;
    if (matches(entry.identity)) return 4;
    if (matches(entry.aliases)) return 5;
    if (matches(entry.category)) return 6;
    return 7;
  };
  return searchIndex
    .filter((entry) => matches(entry.terms))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "ru"));
}
