import { effectRouteMeta } from "./effect-route-metadata";

// Keep the complete source audit; this effect is intentionally omitted from Wiki.
export const publishedEffectMeta = effectRouteMeta.filter(
  (effect) => effect.id !== "weak_instant_health",
);
