import type { Stat } from "./types";

// Verified snapshot 8692f66. Base attack attribute, before armor, critical hits,
// perks and custom combat combos. SwordItem: player base 1 + tier bonus 4
// (NETHERITE) + constructor modifier. Agent values are guide text only.
export const weaponDamage = {
  hook: { value: 1 + 4 - 1, guide: false },
  "death-scythe": { value: 1 + 4 - 3, guide: false },
  microphone: { value: 1 + 4 - 3, guide: false },
  "toy-knife": { value: 2, guide: false },
  "beast-claw": { value: 1, guide: false },
  "plague-lantern": { value: 1 - 0.5, guide: false },
  "agent-pistol": { value: 6.75, guide: true },
  "agent-knife": { value: 2, guide: true },
} as const;

export function withWeaponDamage(
  slug: string,
  stats: readonly Stat[],
): readonly Stat[] {
  const damage = weaponDamage[slug as keyof typeof weaponDamage];
  if (!damage) return stats;
  return [
    ...stats.filter((stat) => stat.key !== "base-damage"),
    {
      key: "base-damage",
      label: damage.guide ? "Урон по справочнику" : "Базовый урон",
      value: damage.value,
      unit: "damage",
    },
  ];
}
