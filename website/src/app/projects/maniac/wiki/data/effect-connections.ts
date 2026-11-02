import type { EntityId } from "./types";
import type { publishedEffectMeta } from "../published-effects";
export type EffectId = (typeof publishedEffectMeta)[number]["id"];

/** One edge list supplies both directions of Wiki navigation. */
export const effectConnections: Readonly<
  Partial<Record<EffectId, readonly EntityId[]>>
> = {
  mana_flow: ["item:clarity", "mechanic:mana"],
  frozen: ["perk:football-fan", "item:clarity"],
  plague: ["mechanic:plague", "item:plague-lantern"],
  thorn: ["perk:hedgehog-skin"],
  target: ["character:agent"],
  death_race: ["character:death"],
  full_invisibility: ["mechanic:ghost-states", "item:toy-knife"],
  possession_timer: ["mechanic:ghost-states", "item:ghost-hand"],
  rose_colored_glasses: [
    "item:rose-colored-glasses",
    "perk:rose-colored-glasses",
  ],
  orchid_recording: ["item:pink-orchid", "perk:pink-orchid"],
  sber_sprout_session: ["item:sber-sprout", "perk:sber-sprout"],
  forget_me_not_call: ["item:forget-me-not", "perk:forget-me-not"],
  shaken_memory: ["item:forget-me-not", "perk:forget-me-not"],
  bouquet: ["perk:bouquet-to-the-other-side"],
  red_guidance: ["perk:color-roulette", "item:red-color-card"],
  green_charge: ["perk:color-roulette", "item:green-color-card"],
  paint_protection: ["perk:the-paint-thickens", "item:paint-can"],
};
