import { StatText } from "./StatText";
import { Link } from "react-router";
import { EntityLink } from "./EntityLink";
import type { EntityId } from "../data/types";
import s from "./EntityLink.module.css";

const entities: Readonly<Record<string, EntityId>> = {
  Балтика: "item:clarity",
  Балтику: "item:clarity",
  "Балтика 9": "item:clarity",
  Незабудка: "item:forget-me-not",
  Незабудке: "item:forget-me-not",
  Незабудки: "item:forget-me-not",
  "Розовая Орхидея": "item:pink-orchid",
  "Розовой Орхидеей": "item:pink-orchid",
  "Розовой Орхидеи": "item:pink-orchid",
  СберРосток: "item:sber-sprout",
  СберРостка: "item:sber-sprout",
  СберРостком: "item:sber-sprout",
  "Розовые очки": "item:rose-colored-glasses",
  "Розовых очков": "item:rose-colored-glasses",
  "Игла пробуждения": "item:awakening-needle",
  "Иглой пробуждения": "item:awakening-needle",
  "Футбольный фанат": "perk:football-fan",
  "Футбольным фанатом": "perk:football-fan",
  "Краски сгущаются": "perk:the-paint-thickens",
  "Цветная рулетка": "perk:color-roulette",
  "Спасибо, доктор": "ability:damage-transfer",
  "Концентрированный кошмар": "ability:concentrated-nightmare",
};
const effectAnchors: Readonly<Record<string, string>> = {
  "Восстановление маны": "mana_flow",
  Тишина: "silence",
  Страх: "fear",
  Стан: "stun",
};
const names = [...Object.keys(entities), ...Object.keys(effectAnchors)].sort(
  (a, b) => b.length - a.length,
);
const mentions = new RegExp(
  `(?<![\\p{L}\\p{N}])(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}])`,
  "gu",
);

/** Shared linking for plain editorial prose; no HTML or Markdown parsing in data. */
export function WikiText({ text }: { text: string }) {
  return text.split(mentions).map((part, index) =>
    entities[part] ? (
      <EntityLink key={index} id={entities[part]}>
        {part}
      </EntityLink>
    ) : effectAnchors[part] ? (
      <Link
        key={index}
        className={s.link}
        to={`/projects/maniac/wiki/effects#${effectAnchors[part]}`}
      >
        {part}
      </Link>
    ) : (
      <StatText key={index} text={part} />
    ),
  );
}
