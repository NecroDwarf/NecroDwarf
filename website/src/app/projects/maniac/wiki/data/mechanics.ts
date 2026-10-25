import type { Entity } from "./types";
import { verifiedSource } from "./snapshots";
const source =
  "src/main/java/org/example/maniacrevolution/character/maniac/KeeperOfNightmaresClass.java";
export const mechanics: readonly Entity<"mechanic">[] = [
  {
    id: "mechanic:sanity",
    kind: "mechanic",
    slug: "sanity",
    name: "Рассудок",
    revisions: {
      [verifiedSource]: {
        data: {
          description:
            "Ресурс выжившего в противостоянии Хранителю. Взгляд охотника снижает рассудок; срыв запускает испытание.",
        },
        evidence: [{ path: source }],
      },
    },
  },
  {
    id: "mechanic:nightmare-trials",
    kind: "mechanic",
    slug: "nightmare-trials",
    name: "Кошмарные испытания",
    revisions: {
      [verifiedSource]: {
        data: {
          description:
            "Отдельные испытания для похищенной цели. Число начальных лабиринтов требует согласования: описание класса расходится с конфигом.",
        },
        evidence: [
          { path: source },
          {
            path: "src/main/java/org/example/maniacrevolution/nightmare/NightmareConfig.java",
            note: "FORCED_MAZE_COUNT=2; описание класса говорит о трёх.",
          },
        ],
      },
    },
  },
  {
    id: "mechanic:flower-return",
    kind: "mechanic",
    slug: "flower-return",
    name: "Возврат к цветку",
    revisions: {
      "release:1.2": {
        data: {
          description:
            "Возврат к заранее установленной личной точке. Подготовка прерывается движением и уроном.",
        },
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_2.html" },
        ],
      },
      [verifiedSource]: {
        data: {
          description:
            "Возврат к заранее установленной личной точке. Подготовка прерывается движением и уроном.",
        },
        evidence: [
          {
            path: "src/main/java/org/example/maniacrevolution/perk/perks/survivor/ForgetMeNotPerk.java",
          },
        ],
      },
    },
  },
];
