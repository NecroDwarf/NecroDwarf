import type { EntityId, Stat } from "./types";

// Current verified snapshot only. Release snapshots are deliberately independent.
export const gameplayFacts = {
  football: { survivorSeconds: 60, maniacSeconds: 30 },
  glasses: { reductionPercent: 25, durability: 15, minimumDamage: 1 },
  clarity: { drinkSeconds: 1.6, effectSeconds: 6, manaPerSecond: 4 },
  plague: { accumulationSeconds: 5, damage: 3, auraBlocks: 5 },
  orchid: { recordSeconds: 6, mana: 10, cooldownSeconds: 45 },
  sprout: { preservedPercent: 75, mana: 5, minimumProgress: 1 },
  manaBreak: { amount: 10 },
  thorn: { seconds: 5, reflectedPercent: 50 },
  overclock: {
    seconds: 8,
    successPercent: 20,
    criticalPercent: 50,
    failurePoints: 0.8,
    silenceSeconds: 5,
  },
  flowerTrail: { intervalSeconds: 6, lifetimeSeconds: 12 },
  coins: {
    health: 4,
    elusiveSeconds: 10,
    elusiveSlowSeconds: 5,
    insightSeconds: 20,
    exposedSeconds: 15,
    shacklesSeconds: 7,
    blindSeconds: 10,
    debtSeconds: 60,
    fateDamage: 5,
    reviveHealthPercent: 50,
  },
  salt: { slowSeconds: 2, blindSeconds: 6 },
  roulette: {
    lifetimeSeconds: 45,
    computerPercent: 5,
    heal: 4,
    damagePerCharge: 1.5,
    guidanceSeconds: 15,
    computers: 3,
  },
  syringe: {
    initialLevel: 3,
    initialSeconds: 8,
    minimumSeconds: 1,
    levelLossEvery: 3,
    addictionReductionPercent: 70,
  },
  bandages: { allyHealth: 4, selfHealth: 2, seconds: 4.5, range: 3 },
  ancestor: { baseHealth: 2, bonusHealth: 2 },
  sanity: {
    maximum: 100,
    lossPerSecond: 31,
    regenPerSecond: 2.2,
    regenDelaySeconds: 16,
    range: 40,
  },
} as const;

const f = gameplayFacts;

type Facts = typeof gameplayFacts;
export type GameplayFactKey = {
  [Group in keyof Facts]: `${Group}.${keyof Facts[Group] & string}`;
}[keyof Facts];

/** Only current catalogs accept references; resolved and historical stats stay numeric. */
export type CurrentStat = Omit<Stat, "value"> &
  (
    | { value: number; valueRef?: never }
    | { valueRef: GameplayFactKey; value?: never }
  );
export type CurrentCatalogEntry<T extends { stats: readonly Stat[] }> = Omit<
  T,
  "stats"
> & { stats: readonly CurrentStat[] };

export function currentStats(
  id: EntityId,
  stats: readonly CurrentStat[],
): Stat[] {
  return stats.map(({ valueRef, value, ...stat }) => {
    if (valueRef !== undefined && value !== undefined)
      throw new Error(`Ambiguous stat value: ${id}/${stat.key}`);
    const resolved = valueRef === undefined ? value : factValues[valueRef];
    if (resolved === undefined || !Number.isFinite(resolved))
      throw new Error(`Invalid stat value: ${id}/${stat.key} (${valueRef})`);
    return { ...stat, value: resolved };
  });
}

export const currentDescriptions: Readonly<Partial<Record<EntityId, string>>> =
  {
    "perk:football-fan": `Обездвиживает вас на ${f.football.survivorSeconds} сек. за выжившего или ${f.football.maniacSeconds} сек. за маньяка. После полного ожидания выдаёт Балтику.`,
    "item:rose-colored-glasses": `Во второй руке снижает входящий урон на ${f.glasses.reductionPercent}%. Работает в фазах 1–2 и расходует прочность.`,
    "item:clarity": `Восстанавливает ${f.clarity.manaPerSecond} маны / сек. в течение ${f.clarity.effectSeconds} сек.`,
    "mechanic:plague": `Каждые ${f.plague.accumulationSeconds} сек. заражения наносят ${f.plague.damage} урона. Без эффекта накопление приостанавливается, но сохраняется.`,
    "ability:plague-orb": `При попадании в выжившего наносит ${f.plague.damage} магического урона и сбрасывает накопление чумы.`,
    "item:pink-orchid": `Записывает до ${f.orchid.recordSeconds} сек. маршрута для запуска иллюзии.`,
    "item:sber-sprout": `Переносит ${f.sprout.preservedPercent}% лично внесённого прогресса ремонта на другой компьютер.`,
  };

export function currentDescription(id: EntityId, fallback: string) {
  return formatGameText(currentDescriptions[id] ?? fallback);
}

const factValues: Readonly<Record<string, number>> = {
  "plague.percentPerSecond": 100 / f.plague.accumulationSeconds,
  ...Object.fromEntries(
    Object.entries(gameplayFacts).flatMap(([group, values]) =>
      Object.entries(values).map(([key, value]) => [`${group}.${key}`, value]),
    ),
  ),
};

/** Named facts are resolved at render time; unknown names fail the build. */
export function formatGameText(text: string) {
  return text.replace(/\{\{([a-zA-Z.]+)\}\}/g, (_, key: string) => {
    const value = factValues[key];
    if (value === undefined) throw new Error(`Unknown gameplay fact: ${key}`);
    return String(value).replace(".", ",");
  });
}
