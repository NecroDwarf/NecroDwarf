import { normalizeSearch } from "../../../shared/lib/search";
const base = "/projects/maniac/wiki";
// The toolbar needs section links only, not the complete article dropdown tree.
export const wikiSections = [
  { id: "overview", label: "Обзор", href: base },
  { id: "search", label: "Поиск", href: `${base}/search` },
  { id: "characters", label: "Персонажи", href: `${base}/characters` },
  { id: "perks", label: "Перки", href: `${base}/perks` },
  { id: "abilities", label: "Способности", href: `${base}/abilities` },
  { id: "items", label: "Предметы", href: `${base}/items` },
  { id: "mechanics", label: "Механики", href: `${base}/mechanics` },
  { id: "maps", label: "Карты", href: `${base}/maps` },
  { id: "effects", label: "Эффекты", href: `${base}/effects` },
] as const;

export function wikiSectionPath(id: (typeof wikiSections)[number]["id"]) {
  return wikiSections.find((section) => section.id === id)!.href;
}

// Reuse the entry chunk's preload helper; the UI still waits for interaction.
export function loadWikiSuggestions(query: string) {
  if (normalizeSearch(query))
    return import("./ui/HeaderSearchSuggestions").then(
      (module) => module.HeaderSearchSuggestions,
    );
}
