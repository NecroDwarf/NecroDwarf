export const statLabels = {
  health: "HP",
  mana: "Мана",
  damage: "Урон",
  hacking: "Вклад во взлом",
  progress: "Прогресс",
  addiction: "Зависимость",
  strength: "Сила, уровень эффекта",
  speed: "Скорость передвижения",
  level: "Уровень эффекта",
  range: "Расстояние, блоки",
  cooldown: "Время, секунды",
  armor: "Броня",
  sanity: "Рассудок",
  durability: "Прочность",
  count: "Количество",
} as const;
export type StatSymbol = keyof typeof statLabels;
