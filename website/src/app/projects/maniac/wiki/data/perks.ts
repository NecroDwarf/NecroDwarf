import type { Entity, EntityData } from "./types";
import { verifiedSource } from "./snapshots";
import { flowerPerks } from "./flower-perks";
import { perkCatalog } from "./reference-catalog";
// Prose is checked in both sources; numeric snapshots are explicitly separate.
const common: Omit<EntityData["perk"], "stats"> = {
  description:
    "Личная точка возврата: установите цветок и вернитесь к нему после подготовки. Движение и урон прерывают возврат; маньяк может уничтожить цветок.",
  icon: "forget-me-not-perk",
  effects: ["Возврат к установленному цветку"],
  mechanicIds: ["mechanic:flower-return"],
};
const historicalPerks: readonly Entity<"perk">[] = [
  ...flowerPerks,
  {
    id: "perk:forget-me-not",
    kind: "perk",
    slug: "forget-me-not",
    name: "Незабудка",
    revisions: {
      "release:1.2": {
        data: {
          ...common,
          stats: [
            { key: "mana", label: "Стоимость", value: 10, unit: "mana" },
            { key: "channel", label: "Подготовка", value: 3, unit: "seconds" },
            {
              key: "damage-lock",
              label: "Запрет после удара",
              value: 10,
              unit: "seconds",
            },
          ],
        },
        evidence: [
          {
            path: "docs/changelogs/maniac/changelog_maniac_1_2.html",
            note: "Перезарядка успешного возврата в хронике не указана; поле отсутствует.",
          },
        ],
      },
      [verifiedSource]: {
        data: {
          ...common,
          stats: [
            { key: "mana", label: "Стоимость", value: 10, unit: "mana" },
            { key: "channel", label: "Подготовка", value: 3, unit: "seconds" },
            {
              key: "damage-lock",
              label: "Запрет после удара",
              value: 10,
              unit: "seconds",
            },
            {
              key: "cooldown",
              label: "Перезарядка возврата",
              value: 60,
              unit: "seconds",
            },
            {
              key: "interrupted-cooldown",
              label: "Перезарядка при прерывании",
              value: 30,
              unit: "seconds",
            },
          ],
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
export const perks: readonly Entity<"perk">[] = perkCatalog.map((entry) => {
  const previous = historicalPerks.find((p) => p.id === entry.id);
  const oldData = previous?.revisions[verifiedSource]?.data;
  const stats = new Map((oldData?.stats ?? []).map((stat) => [stat.key, stat]));
  entry.stats.forEach((stat) => stats.set(stat.key, stat));
  return {
    id: entry.id,
    kind: "perk",
    slug: entry.slug,
    name: previous?.name ?? entry.name,
    revisions: {
      ...previous?.revisions,
      [verifiedSource]: {
        data: {
          ...oldData,
          gameId: entry.gameId,
          team: entry.team,
          perkType: entry.perkType,
          phases: entry.phases,
          description: entry.description,
          icon: entry.icon,
          effects: oldData?.effects ?? [],
          mechanicIds: oldData?.mechanicIds ?? [],
          stats: [...stats.values()],
        },
        evidence: entry.evidence,
      },
    },
  };
});
