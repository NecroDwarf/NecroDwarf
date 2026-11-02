import { gameplayFacts as f } from "./gameplay-facts";
import type { publishedEffectMeta } from "../published-effects";
import type { EntityId } from "./types";

type EffectId = (typeof publishedEffectMeta)[number]["id"];
import { statLabels as effectStatLabels } from "./stat-labels";
export { effectStatLabels };
type EffectStat = { readonly stat: keyof typeof effectStatLabels };
type EffectEntityLink = { readonly entity: EntityId; readonly label: string };
export type EffectDescriptionParts = readonly (
  | string
  | EffectStat
  | EffectEntityLink
)[];
const health = { stat: "health" } as const;
const mana = { stat: "mana" } as const;
const damage = { stat: "damage" } as const;
const hacking = { stat: "hacking" } as const;
const speed = { stat: "speed" } as const;
const level = { stat: "level" } as const;

export const effectDescriptions: Record<EffectId, EffectDescriptionParts> = {
  fear: ["Вынуждает отступать против направления взгляда в момент испуга."],
  open_wound: ["Оставляет кровавые следы. Не наносит урон со временем."],
  mana_flow: ["+2 ", mana, " / сек. за ", level, "."],
  slow_regeneration: ["+1 ", health, " / 12 сек."],
  weak_weakness: ["−2 ", damage, " на I ", level, "."],
  target: ["Вы — цель Агента 47."],
  death_race: ["+2 ", damage, " за ", level, "."],
  plague: [
    `За каждые ${f.plague.accumulationSeconds} сек. заражения: ${f.plague.damage} `,
    damage,
    ".\nБез чумы накопление сохраняется; после урона сбрасывается.",
  ],
  thorn: [
    `${f.thorn.reflectedPercent}% входящего `,
    damage,
    " → атакующему.\nВходящий ",
    damage,
    " не снижает.",
  ],
  frozen: [
    `Обездвиживает: выжившего на ${f.football.survivorSeconds} сек., маньяка на ${f.football.maniacSeconds} сек.\nПосле полного ожидания выдаёт `,
    { entity: "item:clarity", label: "Балтику" },
    ".",
  ],
  altruist_boost: ["+5% ", hacking, " после поднятия союзника."],
  silence: ["Запрещает активные перки."],
  possession_timer: ["Оставшееся время одержимости Призрака."],
  stun: ["Нельзя двигаться и атаковать."],
  full_invisibility: ["Полная невидимость Призрака. Нельзя атаковать."],
  dodepovich_insurance: [
    "Отменяет 1 плохой исход монетки.\nДо 60 сек. Снимается после срабатывания.",
  ],
  dodepovich_damage_block: [
    "Блокирует следующий урон.\nДо 60 сек. Снимается после срабатывания.",
  ],
  dodepovich_double_damage: [
    "×2 к следующему урону по вам.\nДо 60 сек. Снимается после срабатывания.",
  ],
  dodepovich_credit: [
    "За 30 сек.: +50% от макс. ",
    health,
    ".\nСледующие 30 сек.: магический урон = 115% лечения.",
  ],
  dodepovich_slot_cooldown: ["Казино-автомат недоступен 30 сек."],
  jackpot: [
    "+60% ",
    speed,
    ", +9 ",
    damage,
    ", +20 ",
    health,
    " / сек.\n75 сек.",
  ],
  acceleration: ["+1% ", speed, " за ", level, "."],
  scream: ["Крик: 1 сек.\nМетка для маньяков в том же измерении: 5 сек."],
  slowdown: ["−1% ", speed, " за ", level, "."],
  paint_protection: ["Защита от повторного испытания лужи краски."],
  bouquet: [
    "За цветок: −20% времени нока выжившего, +20% ",
    mana,
    " на самостоятельный подъём.\n1–3 цветка; расходуются при нокдауне.",
  ],
  shaken_memory: ["Блокирует возврат к Незабудке после удара маньяка."],
  forget_me_not_call: ["Подготовка телепортации к Незабудке."],
  rose_colored_glasses: [
    `−${f.glasses.reductionPercent}% входящего `,
    damage,
    ` (мин. ${f.glasses.minimumDamage}).\nВторая рука, фазы 1–2. Расходует прочность.`,
  ],
  orchid_recording: [
    `Запись до ${f.orchid.recordSeconds} сек. маршрута Розовой Орхидеей для создания копии.`,
  ],
  sber_sprout_session: [
    `СберРосток сохраняет ${f.sprout.preservedPercent}% вашего прогресса ремонта для переноса.`,
  ],
  red_guidance: [
    "Подсвечивает маньяку 3 незавершённых компьютера с наибольшим прогрессом.",
  ],
  green_charge: [
    `+${String(f.roulette.damagePerCharge).replace(".", ",")} `,
    damage,
    " за ",
    level,
    " к следующей прямой атаке маньяка.",
  ],
};
