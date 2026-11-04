import type { ComponentType } from "react";
import metadata from "./metadata.json";
const articles = import.meta.glob<{ default: ComponentType }>(
  "./articles/*.tsx",
);
export function loadArticle(slug: string) {
  return articles[`./articles/${slug}.tsx`]().then((m) => m.default);
}
export const articleTitle = (slug: string) =>
  metadata.find(([id]) => id === slug)![1];
