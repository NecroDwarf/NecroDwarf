const entries = [
  {
    slug: "match-preparation",
    name: "Подготовка и начало матча",
  },
  {
    slug: "match-phases",
    name: "Фазы матча",
  },
  {
    slug: "match-timer",
    name: "Таймер раунда",
  },
  {
    slug: "objectives-and-escape",
    name: "Цели, побег и завершение",
  },
  {
    slug: "hacking",
    name: "Компьютеры и взлом",
  },
  {
    slug: "qte",
    name: "Проверки реакции",
  },
  {
    slug: "downed",
    name: "Нокдаун и подъём",
  },
  {
    slug: "map-interactions",
    name: "Двери, люки и вентиляция",
  },
  {
    slug: "mana",
    name: "Мана",
  },
  {
    slug: "sanity",
    name: "Рассудок",
  },
  {
    slug: "nightmare-trials",
    name: "Кошмарные испытания",
  },
  {
    slug: "flower-return",
    name: "Возврат к цветку",
  },
  {
    slug: "addiction",
    name: "Зависимость и передозировка",
  },
  {
    slug: "casino",
    name: "Монетки и казино",
  },
  {
    slug: "alchemy",
    name: "Алхимия и рецепты",
  },
  {
    slug: "resurrection",
    name: "Воскрешение Некроманта",
  },
  {
    slug: "plague",
    name: "Чума",
  },
  {
    slug: "ghost-states",
    name: "Невидимость и одержимость",
  },
  {
    slug: "medical-care",
    name: "Лечение и медицинские устройства",
  },
  {
    slug: "shaman-spirits",
    name: "Тотемы и души предков",
  },
  {
    slug: "paint",
    name: "Лужи краски",
  },
  {
    slug: "orchid-illusion",
    name: "Запись маршрута и иллюзия",
  },
  {
    slug: "color-roulette",
    name: "Цветная рулетка",
  },
  {
    slug: "freddy-generator",
    name: "Фредди и генератор",
  },
  {
    slug: "traps",
    name: "Соль и размещаемые ловушки",
  },
  {
    slug: "status-effects",
    name: "Статусные эффекты и ограничения",
  },
  {
    slug: "agent-shop",
    name: "Магазин Агента 47",
  },
  {
    slug: "ursa-stacks",
    name: "Урса: атаки и ярость",
  },
] as const;

export const mechanicRouteMeta = entries.map((entry) => ({
  ...entry,
  id: `mechanic:${entry.slug}` as const,
}));
