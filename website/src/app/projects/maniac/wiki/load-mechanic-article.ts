import type { ComponentType } from "react";

// Keep compatibility-page dependencies out of the site's initial route registry.
const articles = import.meta.glob<{ default: ComponentType }>(
  "./pages/mechanics/*.tsx",
);
export async function loadMechanicArticle(slug: string) {
  return (await articles[`./pages/mechanics/${slug}.tsx`]()).default;
}
