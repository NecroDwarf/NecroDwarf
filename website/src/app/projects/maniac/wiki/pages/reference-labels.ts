import type { AbilityKind, PerkPhase, PerkTeam, PerkType } from "../data/types";
export const teamLabels: Record<PerkTeam, string> = {
  SURVIVOR: "Выжившие",
  MANIAC: "Маньяки",
  ALL: "Общий",
};
export const typeLabels: Record<PerkType, string> = {
  PASSIVE: "Пассивный",
  ACTIVE: "Активный",
  HYBRID: "Гибридный",
  PASSIVE_COOLDOWN: "Пассивный с перезарядкой",
  CHARGED: "Заряжаемый",
};
export const phaseLabels: Record<PerkPhase, string> = {
  ANY: "Любая игровая фаза",
  START: "Старт",
  HUNT: "Охота",
  MIDGAME: "Фаза компьютеров",
  REVERSAL: "Переворот",
};
export const abilityLabels: Record<AbilityKind, string> = {
  "passive-character": "Пассивная способность персонажа",
  "item-action": "Действие предмета",
  "armor-action": "Способность снаряжения",
};
export const typeDescriptions: Record<PerkType, string> = {
  PASSIVE: "Пассивный эффект — не требует отдельного нажатия клавиши перка.",
  ACTIVE:
    "Активное действие — применяется клавишей перка при выполнении игровых условий.",
  HYBRID:
    "Сочетает пассивную часть и активное действие. Условия каждой части описаны в эффекте.",
  PASSIVE_COOLDOWN:
    "Срабатывает автоматически при подходящем событии. Повторное срабатывание ограничено перезарядкой.",
  CHARGED:
    "Получает и расходует временные заряды. Лимит зарядов и события их расходования указаны в описании.",
};
