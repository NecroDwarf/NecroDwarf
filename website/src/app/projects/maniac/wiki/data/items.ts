import type { Entity } from "./types";
import { verifiedSource } from "./snapshots";
export const items: readonly Entity<"item">[] = [
  {
    id: "item:nightmare-lighter",
    kind: "item",
    slug: "nightmare-lighter",
    name: "Кошмарная зажигалка",
    revisions: {
      [verifiedSource]: {
        data: {
          description:
            "Предмет Хранителя кошмаров, связанный с пространством испытаний.",
          icon: "nightmare-lighter",
          usage:
            "Освещает пространство вокруг владельца в кошмарных испытаниях.",
          abilityIds: ["ability:abyss-gaze"],
          mechanicIds: ["mechanic:nightmare-trials"],
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
    id: "item:forget-me-not",
    kind: "item",
    slug: "forget-me-not",
    name: "Цветок Незабудки",
    revisions: {
      [verifiedSource]: {
        data: {
          description: "Личный цветок выжившего для точки возврата.",
          icon: "forget-me-not-item",
          usage:
            "Установите цветок в безопасной точке перед активацией перка Незабудка.",
          abilityIds: [],
          mechanicIds: ["mechanic:flower-return"],
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
