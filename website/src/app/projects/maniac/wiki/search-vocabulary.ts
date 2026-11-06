// Editorial search vocabulary only; gameplay names and facts remain unchanged.
export const sectionTerms = {
  characters: "персонаж персонажи герой герои",
  perks: "перк перки талант таланты",
  abilities: "способность способности умение умения скилл скиллы",
  items: "предмет предметы снаряжение экипировка",
  mechanics: "механика механики правило правила",
  maps: "карта карты локация локации",
  effects: "эффект эффекты статус статусы",
} as const;

export const searchAliases: Readonly<Record<string, string>> = {
  "mechanic:sanity": "здравомыслие sanity",
  "mechanic:hacking": "ремонт компьютера починка компьютера",
  "mechanic:medical-care": "лечение медицинская помощь",
  "item:bandages": "бинт перевязка bandages",
  "character:pudge": "pudge",
  "character:scientist": "scientist",
};
