import type { Entity } from "./types";
import { verifiedSource } from "./snapshots";
import { mechanicCatalog } from "./systems-catalog";
const source =
  "src/main/java/org/example/maniacrevolution/character/maniac/KeeperOfNightmaresClass.java";
const existingMechanics: readonly Entity<"mechanic">[] = [
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
export const mechanics: readonly Entity<"mechanic">[] = mechanicCatalog.map(
  (entry) => ({
    id: entry.id,
    kind: "mechanic",
    slug: entry.slug,
    name: entry.name,
    revisions: {
      ...existingMechanics.find((m) => m.id === entry.id)?.revisions,
      [verifiedSource]: {
        data: {
          description: entry.description,
          relatedIds: entry.relatedIds,
          stats: entry.stats,
        },
        evidence: entry.evidence,
      },
    },
  }),
);
