import type { StatSymbol } from "./stat-labels";

const units: readonly [StatSymbol, readonly string[]][] = [
  ["health", ["HP", "ОЗ", "здоровья"]],
  [
    "progress",
    [
      "очка прогресса",
      "очков прогресса",
      "очко прогресса",
      "прогресса",
      "прогресс",
      "прогрессом",
    ],
  ],
  ["addiction", ["зависимость", "зависимости"]],
  ["strength", ["Сила", "силы", "силу"]],
  ["mana", ["единиц маны", "ед. маны", "маны", "ману", "мана"]],
  ["damage", ["единиц урона", "ед. урона", "очков урона", "урона", "урон"]],
  ["range", ["блоков", "блока", "блок", "бл."]],
  ["cooldown", ["секунды", "секунд", "секунду", "сек.", "сек", "с.", "с"]],
  [
    "speed",
    [
      "к скорости передвижения",
      "скорости передвижения",
      "к скорости",
      "скорости",
      "скорость передвижения",
      "скорость",
    ],
  ],
  [
    "hacking",
    [
      "к скорости взлома",
      "скорости взлома",
      "к вкладу во взлом",
      "вклада во взлом",
      "вклад во взлом",
      "взлома",
      "вклада",
      "вклад",
    ],
  ],
  ["level", ["уровней", "уровня", "уровень", "уровне", "УР."]],
  ["armor", ["очков брони", "брони", "броня"]],
  ["sanity", ["рассудка", "рассудок"]],
  ["durability", ["единиц прочности", "прочности", "прочность", "прочностью"]],
];
const symbolByUnit = new Map(
  units.flatMap(([symbol, names]) =>
    names.map((name) => [name.toLowerCase(), symbol] as const),
  ),
);
const escaped = [...symbolByUnit.keys()]
  .sort((a, b) => b.length - a.length)
  .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const number = "[+−-]?\\d+(?:[.,]\\d+)?(?:[–−-]\\d+(?:[.,]\\d+)?)?%?";
const modifiers =
  "(?:(?:от|макс\\.|максимального|максимальной|полученного|нанесённого|входящего|базового|магического|физического|текущей)\\s+)*";
const numericUnit = new RegExp(
  `(?<![\\p{L}\\p{N}.,])${number}\\s*${modifiers}(${escaped})(?![\\p{L}\\p{N}])`,
  "giu",
);
const namedValue = new RegExp(
  `(?<![\\p{L}\\p{N}])(${escaped})(?=\\s*(?:[:—=]|на|до)\\s*${number})`,
  "giu",
);
const perLevel = /за (?:каждый )?(уровень)(?![\p{L}\p{N}])/giu;
const leadingValue = new RegExp(
  `(?<![\\p{L}\\p{N}])(${escaped})(?=\\s+(?:${number}|[IVX]+)(?![\\p{L}\\p{N}]))`,
  "giu",
);
const progressThreshold =
  /(прогрессом|прогресс)\s+не\s+(?:ниже|выше)\s+\d+(?:[.,]\d+)?%/giu;
const perSecond = /\/\s*(секунду|сек\.|сек|с\.)(?![\p{L}\p{N}])/giu;
const damageValue = new RegExp(
  `(?:наносит|наносят|нанесёт)\\s+(?:по\\s+)?${number}\\s*$`,
  "iu",
);

export type StatTextPart = string | { symbol: StatSymbol; original: string };

/** Replace only explicit units attached to values; keep every original number and word. */
export function statTextParts(text: string): StatTextPart[] {
  const matches: {
    start: number;
    end: number;
    symbol: StatSymbol;
    original: string;
  }[] = [];
  for (const pattern of [
    numericUnit,
    namedValue,
    leadingValue,
    perLevel,
    perSecond,
    progressThreshold,
  ]) {
    for (const match of text.matchAll(pattern)) {
      let original = match[1];
      const start = match.index! + match[0].lastIndexOf(original);
      // Keep a sentence-ending period visible when its abbreviation becomes
      // an icon. The original text still round-trips without adding punctuation.
      if (
        original.endsWith(".") &&
        /^(?:\s+\p{Lu}|\s*$)/u.test(text.slice(start + original.length))
      )
        original = original.slice(0, -1);
      // Bare «с» denotes seconds only after a number, never before a value
      // («с 5 HP»). A following word also makes it a preposition («1 с союзниками»).
      if (
        match[1].toLowerCase() === "с" &&
        (pattern !== numericUnit ||
          /^\s+\p{L}/u.test(text.slice(start + original.length)))
      )
        continue;
      let symbol = symbolByUnit.get(match[1].toLowerCase())!;
      if (symbol === "health" && damageValue.test(text.slice(0, start)))
        symbol = "damage";
      matches.push({ start, end: start + original.length, original, symbol });
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const parts: StatTextPart[] = [];
  let end = 0;
  for (const match of matches) {
    if (match.start < end) continue;
    if (match.start > end) parts.push(text.slice(end, match.start));
    parts.push({ symbol: match.symbol, original: match.original });
    end = match.end;
  }
  if (end < text.length) parts.push(text.slice(end));
  return parts;
}
