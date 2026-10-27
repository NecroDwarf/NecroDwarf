import type { Entity } from "./types";
import { verifiedSource } from "./snapshots";
import characterAbilities from "./character-abilities.json";
export const abilities: readonly Entity<"ability">[] = [
  ...(characterAbilities as readonly Entity<"ability">[]),
  {
    id: "ability:abyss-gaze",
    kind: "ability",
    slug: "abyss-gaze",
    name: "Взгляд бездны",
    revisions: {
      [verifiedSource]: {
        data: {
          description:
            "Долгий взгляд Хранителя снижает рассудок цели. При срыве начинается кошмарное испытание.",
          mechanicIds: ["mechanic:sanity", "mechanic:nightmare-trials"],
        },
        evidence: [
          {
            path: "src/main/java/org/example/maniacrevolution/character/maniac/KeeperOfNightmaresClass.java",
          },
        ],
      },
    },
  },
  {
    id: "ability:concentrated-nightmare",
    kind: "ability",
    slug: "concentrated-nightmare",
    name: "Концентрированный кошмар",
    revisions: {
      "release:1.1": {
        data: {
          description: "Сразу снимает часть рассудка с цели.",
          icon: "concentrated-nightmare",
          mechanicIds: [],
          stats: [
            {
              key: "sanity",
              label: "Доля рассудка",
              value: 10,
              unit: "percent",
            },
            { key: "range", label: "Поиск цели", value: 40, unit: "blocks" },
            {
              key: "cooldown",
              label: "Перезарядка",
              value: 45,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_1.html" },
        ],
      },
      [verifiedSource]: {
        data: {
          description: "Снимает часть максимального рассудка у выбранной цели.",
          icon: "concentrated-nightmare",
          mechanicIds: ["mechanic:sanity"],
          stats: [
            {
              key: "cooldown",
              label: "Перезарядка",
              value: 45,
              unit: "seconds",
            },
            { key: "range", label: "Поиск цели", value: 40, unit: "blocks" },
            {
              key: "sanity",
              label: "Доля рассудка",
              value: 10,
              unit: "percent",
            },
          ],
        },
        evidence: [
          {
            path: "src/main/java/org/example/maniacrevolution/nightmare/NightmareConfig.java",
            note: "CONCENTRATED_NIGHTMARE_*; 900 ticks / 20 = 45 s; 0.10 × 100 = 10%.",
          },
        ],
      },
    },
  },
];
