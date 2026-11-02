import { publishedEffectMeta } from "../published-effects";
import { effectDescriptions } from "./effect-descriptions";
import audit from "./effect-sources.json";

const icons = import.meta.glob<string>("../../assets/wiki/effects/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
export const effects = publishedEffectMeta.map((effect) => {
  const source = audit.effects.find((entry) => entry.id === effect.id)!;
  return {
    ...effect,
    description: effectDescriptions[effect.id],
    icon: source.icon
      ? icons[`../../assets/wiki/effects/${effect.id}.png`]
      : undefined,
    evidence: [
      ...new Set([
        source.implementation.path,
        ...source.usages.map((usage) => usage.path),
      ]),
    ],
  };
});
