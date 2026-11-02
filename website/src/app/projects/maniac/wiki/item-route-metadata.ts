const entries = [
  {
    slug: "salt",
    name: "Соль",
  },
  {
    slug: "generator",
    name: "Генератор Фредди",
  },
  {
    slug: "clarity",
    name: "Балтика 9",
  },
  {
    slug: "hook",
    name: "Хук",
  },
  {
    slug: "death-scythe",
    name: "Коса смерти",
  },
  {
    slug: "dead-staff",
    name: "Посох Мёртвых",
  },
  {
    slug: "necromancer-helmet",
    name: "Шлем некроча",
  },
  {
    slug: "necromancer-chestplate",
    name: "Нагрудник некроча",
  },
  {
    slug: "necromancer-leggings",
    name: "Штаны некроча",
  },
  {
    slug: "necromancer-boots",
    name: "Ботинки некроча",
  },
  {
    slug: "soul-essence",
    name: "Материал ремонта брони",
  },
  {
    slug: "maniac-regen-fragment",
    name: "Часть философского камня",
  },
  {
    slug: "maniac-strength-fragment",
    name: "Грязь",
  },
  {
    slug: "maniac-speed-fragment",
    name: "Колесо маквина",
  },
  {
    slug: "maniac-slowness-fragment",
    name: "Сердце Лича",
  },
  {
    slug: "maniac-slow-falling-fragment",
    name: "Перо петуха",
  },
  {
    slug: "maniac-weakness-fragment",
    name: "Увядший цветок",
  },
  {
    slug: "maniac-healing-fragment",
    name: "Святая вода",
  },
  {
    slug: "maniac-blindness-fragment",
    name: "Пепел свечи",
  },
  {
    slug: "maniac-glowing-fragment",
    name: "Светлячок в банке",
  },
  {
    slug: "recipe-book",
    name: "Список рецептов",
  },
  {
    slug: "bandages",
    name: "Бинты",
  },
  {
    slug: "medical-tablet",
    name: "Медицинский планшет",
  },
  {
    slug: "medical-mask",
    name: "Медицинская маска",
  },
  {
    slug: "agent47-tablet",
    name: "Планшет агента",
  },
  {
    slug: "microphone",
    name: "Микрофон",
  },
  {
    slug: "toy-knife",
    name: "Игрушечный нож",
  },
  {
    slug: "ghost-hand",
    name: "Призрачная рука",
  },
  {
    slug: "beast-claw",
    name: "Коготь зверя",
  },
  {
    slug: "beehive-food",
    name: "Улей",
  },
  {
    slug: "plague-lantern",
    name: "Чумная лампа",
  },
  {
    slug: "bong",
    name: "Бонг",
  },
  {
    slug: "adrenaline-syringe",
    name: "Шприц адреналина",
  },
  {
    slug: "ancestor-soul",
    name: "Душа предков",
  },
  {
    slug: "ancestral-totem",
    name: "Тотем",
  },
  {
    slug: "quantum-teleport",
    name: "Квантовый телепорт",
  },
  {
    slug: "coin-elusiveness",
    name: "Монетка Неуловимости",
  },
  {
    slug: "coin-insight",
    name: "Монетка Прозрения",
  },
  {
    slug: "coin-shackles",
    name: "Монетка Оков",
  },
  {
    slug: "coin-health",
    name: "Монетка ЗОЖ",
  },
  {
    slug: "coin-eagle",
    name: "Монетка Орла",
  },
  {
    slug: "coin-debt",
    name: "Монетка Долга",
  },
  {
    slug: "coin-reroll",
    name: "Монетка Реролла",
  },
  {
    slug: "coin-fate",
    name: "Монеточка Судьбы",
  },
  {
    slug: "slot-machine",
    name: "Казино-автомат",
  },
  {
    slug: "nightmare-lighter",
    name: "Кошмарная зажигалка",
  },
  {
    slug: "awakening-needle",
    name: "Игла пробуждения",
  },
  {
    slug: "paint-can",
    name: "Банка краски",
  },
  {
    slug: "forget-me-not",
    name: "Незабудка",
  },
  {
    slug: "rose-colored-glasses",
    name: "Розовые очки",
  },
  {
    slug: "pink-orchid",
    name: "Розовая Орхидея",
  },
  {
    slug: "sber-sprout",
    name: "Заполненный СберРосток",
  },
  {
    slug: "guardian-head",
    name: "Голова Хранителя",
  },
  {
    slug: "red-color-card",
    name: "Красная карта",
  },
  {
    slug: "blue-color-card",
    name: "Синяя карта",
  },
  {
    slug: "green-color-card",
    name: "Зелёная карта",
  },
  {
    slug: "alchemy-kit",
    name: "Набор алхимика",
  },
  {
    slug: "brewing-stand",
    name: "Зельеварка",
  },
  {
    slug: "dodepovich-coins",
    name: "Монетки",
  },
  {
    slug: "agent-pistol",
    name: "Пистолет",
  },
  {
    slug: "agent-knife",
    name: "Нож",
  },
  {
    slug: "agent-armor",
    name: "Кожаная броня",
  },
  {
    slug: "pudge-armor",
    name: "Кожаная броня",
  },
  {
    slug: "death-armor",
    name: "Броня смерти",
  },
  {
    slug: "ursa-armor",
    name: "Кожаная броня",
  },
  {
    slug: "plague-armor",
    name: "Кожаная броня",
  },
  {
    slug: "ghost-armor",
    name: "Белая кожаная броня",
  },
  {
    slug: "freddy-armor",
    name: "Кожаная броня",
  },
  {
    slug: "computer",
    name: "Компьютер",
  },
] as const;

export const itemRouteMeta = entries.map((entry) => ({
  ...entry,
  id: `item:${entry.slug}` as const,
}));
