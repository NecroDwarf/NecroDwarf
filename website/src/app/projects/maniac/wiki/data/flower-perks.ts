import type { Entity } from "./types";
export const flowerPerks: readonly Entity<"perk">[] = [
  {
    id: "perk:pink-orchid",
    kind: "perk",
    slug: "pink-orchid",
    name: "Розовая Орхидея",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Запишите до 6 секунд своего маршрута, затем за 10 маны пустите по нему копию. Пусть маньяк потратит время на красивую подделку.",
          icon: "pink-orchid",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "record",
              label: "Запись маршрута",
              value: 6,
              unit: "seconds",
            },
            {
              key: "mana",
              label: "Стоимость",
              value: 10,
              unit: "mana",
            },
            {
              key: "cooldown",
              label: "Перезарядка",
              value: 45,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:sber-sprout",
    kind: "perk",
    slug: "sber-sprout",
    name: "СберРосток",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Перенесите часть своего труда с одного компьютера на другой. Росток извлекает лично внесённый за непрерывный ремонт прогресс и сохраняет 75% от него.",
          icon: "sber-sprout",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "retained",
              label: "Сохранённый прогресс",
              value: 75,
              unit: "percent",
            },
            {
              key: "mana-extract",
              label: "Извлечение",
              value: 5,
              unit: "mana",
            },
            {
              key: "mana-place",
              label: "Посадка",
              value: 5,
              unit: "mana",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:rose-colored-glasses",
    kind: "perk",
    slug: "rose-colored-glasses",
    name: "Розовые очки",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Держите очки во второй руке, чтобы смягчать урон на 25% в фазах 1–2. Розовый взгляд на мир теперь помогает пережить удар.",
          icon: "rose-colored-glasses",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "damage",
              label: "Смягчение урона",
              value: 25,
              unit: "percent",
            },
            {
              key: "durability",
              label: "Прочность",
              value: 15,
              unit: "count",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:reality-anchor",
    kind: "perk",
    slug: "reality-anchor",
    name: "Якорь реальности",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Критическое попадание в проверке реакции даёт заряд стабильности на 60 секунд. За матч можно заработать два заряда.",
          icon: "reality-anchor",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "charge",
              label: "Длительность заряда",
              value: 60,
              unit: "seconds",
            },
            {
              key: "charges",
              label: "Заряды за матч",
              value: 2,
              unit: "count",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:emergency-overclock",
    kind: "perk",
    slug: "emergency-overclock",
    name: "Аварийный разгон",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "На 8 секунд обычный вклад в ремонт отключается: всё решают проверки реакции. Бонус за успех выше на 20%, за критическое попадание — на 50%.",
          icon: "emergency-overclock",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "duration",
              label: "Длительность",
              value: 8,
              unit: "seconds",
            },
            {
              key: "silence",
              label: "Тишина при промахе",
              value: 5,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:fixed-it-im-out",
    kind: "perk",
    slug: "fixed-it-im-out",
    name: "Я починил, я ухожу",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "При начале третьей фазы восстанавливает 10 здоровья и даёт +20% скорости до конца матча.",
          icon: "fixed-it-im-out",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "health",
              label: "Восстановление здоровья",
              value: 10,
              unit: "count",
            },
            {
              key: "speed",
              label: "Скорость",
              value: 20,
              unit: "percent",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:magic-kick",
    kind: "perk",
    slug: "magic-kick",
    name: "Волшебный пендель",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Первый полученный урон от маньяка даёт +30% скорости на 20 секунд. Шанс разорвать дистанцию, пока погоня только начинается.",
          icon: "magic-kick",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "speed",
              label: "Скорость",
              value: 30,
              unit: "percent",
            },
            {
              key: "duration",
              label: "Длительность",
              value: 20,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:flowers-lead-the-investigation",
    kind: "perk",
    slug: "flowers-lead-the-investigation",
    name: "Следствие ведут цветы",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Каждые 6 секунд активный выживший оставляет цветочный след. Он живёт 12 секунд, а вид и цвет цветка закреплены за игроком на весь матч.",
          icon: "flowers-lead-the-investigation",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "interval",
              label: "Появление следа",
              value: 6,
              unit: "seconds",
            },
            {
              key: "duration",
              label: "Время жизни следа",
              value: 12,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:bouquet-to-the-other-side",
    kind: "perk",
    slug: "bouquet-to-the-other-side",
    name: "Букет на тот свет",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Первый удар по каждому уникальному выжившему добавляет его цветок в букет — до трёх цветов. Следующий нокдаун автоматически расходует собранное.",
          icon: "bouquet-to-the-other-side",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "flowers",
              label: "Максимум цветов",
              value: 3,
              unit: "count",
            },
            {
              key: "penalty",
              label: "Эффект каждого цветка",
              value: 20,
              unit: "percent",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:bud-dispatcher",
    kind: "perk",
    slug: "bud-dispatcher",
    name: "Диспетчер бутонов",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Девять компьютеров получают разные цветы, которые увядают каждые 20% прогресса. За 3 маны можно открыть сводку и увидеть, где работа зашла далеко.",
          icon: "bud-dispatcher",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "mana",
              label: "Стоимость сводки",
              value: 3,
              unit: "mana",
            },
            {
              key: "progress",
              label: "Увядание за прогресс",
              value: 20,
              unit: "percent",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:high-voltage",
    kind: "perk",
    slug: "high-voltage",
    name: "Высокое напряжение",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Компьютер с прогрессом от 80% даёт маньяку +20% скорости в радиусе 8 блоков по горизонтали и двух по вертикали.",
          icon: "high-voltage",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "threshold",
              label: "Порог прогресса",
              value: 80,
              unit: "percent",
            },
            {
              key: "speed",
              label: "Скорость",
              value: 20,
              unit: "percent",
            },
            {
              key: "horizontal",
              label: "Радиус по горизонтали",
              value: 8,
              unit: "blocks",
            },
            {
              key: "vertical",
              label: "По вертикали",
              value: 2,
              unit: "blocks",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:go-next",
    kind: "perk",
    slug: "go-next",
    name: "Го некст",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Отправили выжившего в нокдаун? Ближайший другой активный выживший в пределах 32 блоков по горизонтали и 12 по вертикали кричит и выдаёт свою позицию маньякам.",
          icon: "go-next",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "horizontal",
              label: "По горизонтали",
              value: 32,
              unit: "blocks",
            },
            {
              key: "vertical",
              label: "По вертикали",
              value: 12,
              unit: "blocks",
            },
            {
              key: "cooldown",
              label: "Перезарядка",
              value: 45,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:color-roulette",
    kind: "perk",
    slug: "color-roulette",
    name: "Кручу-верчу, цвет получить хочу",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Запустите рулетку за 10 маны и повторным нажатием клавиши перка остановите вращение. Карта живёт 45 секунд — успейте разыграть свой цвет.",
          icon: "color-roulette",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "mana",
              label: "Стоимость",
              value: 10,
              unit: "mana",
            },
            {
              key: "duration",
              label: "Время жизни карты",
              value: 45,
              unit: "seconds",
            },
            {
              key: "cooldown",
              label: "Перезарядка",
              value: 45,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
  {
    id: "perk:the-paint-thickens",
    kind: "perk",
    slug: "the-paint-thickens",
    name: "Краски сгущаются",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Общий перк выдаёт банку на три использования. Лужи остаются до конца матча, а наступившему выжившему приходится сделать три нажатия за две секунды. Плохой результат оглушает, средний замедляет, точный позволяет уйти без штрафа.",
          icon: "the-paint-thickens",
          effects: [],
          mechanicIds: [],
          stats: [
            {
              key: "uses",
              label: "Использования",
              value: 3,
              unit: "count",
            },
            {
              key: "reaction",
              label: "Проверка реакции",
              value: 2,
              unit: "seconds",
            },
            {
              key: "protection",
              label: "Защита от повторения",
              value: 30,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Исторические значения из полного текста 1.2; текущие значения кода не подставляются.",
          },
        ],
      },
    },
  },
];
