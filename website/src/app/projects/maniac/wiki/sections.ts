const base = "/projects/maniac/wiki";
// The toolbar needs section links only, not the complete article dropdown tree.
export const wikiSections = [
  { id: "overview", label: "Обзор", href: base },
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
