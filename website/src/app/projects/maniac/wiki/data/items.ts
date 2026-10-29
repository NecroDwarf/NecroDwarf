import type { Entity } from "./types";
import { verifiedSource } from "./snapshots";
import characterItems from "./character-items.json";
import { itemCatalog } from "./systems-catalog";
const existingItems: readonly Entity<"item">[] = [
  ...([
    [
      "guardian-head",
      "Голова Хранителя",
      "Предмет брони для применения Концентрированного кошмара.",
      "ability:concentrated-nightmare",
      "item/GuardianHeadItem.java",
    ],
    [
      "medical-mask",
      "Медицинская маска",
      "Надетая маска позволяет активировать разделение урона.",
      "ability:damage-transfer",
      "item/armor/MedicalMaskItem.java",
    ],
  ].map(([slug, name, description, ability, path]) => ({
    id: `item:${slug}`,
    kind: "item",
    slug,
    name,
    revisions: {
      [verifiedSource]: {
        data: {
          description,
          usage: "Действие описано в связанной способности.",
          abilityIds: [ability],
          mechanicIds: [],
        },
        evidence: [
          { path: `src/main/java/org/example/maniacrevolution/${path}` },
        ],
      },
    },
  })) as Entity<"item">[]),
  ...(characterItems as readonly Entity<"item">[]),
  {
    id: "item:nightmare-lighter",
    kind: "item",
    slug: "nightmare-lighter",
    name: "Кошмарная зажигалка",
    revisions: {
      "release:1.1": {
        data: {
          description:
            "Предмет для кошмарных испытаний, который дает слабый переносной свет.",
          icon: "nightmare-lighter",
          usage:
            "Зажигалку можно включать и выключать, но топливо не бесконечное.",
          abilityIds: [],
          mechanicIds: [],
        },
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_1.html" },
        ],
      },
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
export const items: readonly Entity<"item">[] = itemCatalog.map((entry) => {
  const previous = existingItems.find((item) => item.id === entry.id);
  const oldData = previous?.revisions[verifiedSource]?.data;
  return {
    id: entry.id,
    kind: "item",
    slug: entry.slug,
    name: entry.name,
    revisions: {
      ...previous?.revisions,
      [verifiedSource]: {
        data: {
          ...oldData,
          description: entry.description,
          usage: entry.usage,
          icon: entry.icon ?? oldData?.icon,
          category: entry.category,
          registryIds: entry.registryIds,
          characterIds: entry.characterIds,
          relatedIds: entry.relatedIds,
          stats: [
            ...new Map(
              [...(oldData?.stats ?? []), ...entry.stats].map((stat) => [
                stat.key,
                stat,
              ]),
            ).values(),
          ],
          abilityIds: oldData?.abilityIds ?? [],
          mechanicIds: oldData?.mechanicIds ?? [],
        },
        evidence: entry.evidence,
      },
    },
  };
});
