import type { GameVersion } from "./types";
import { flowerPerks } from "./flower-perks";
// Partial curated change index, never a replacement for original release prose.
export const gameVersions: readonly GameVersion[] = [
  {
    id: "1.0",
    releaseId: "maniac:1.0",
    snapshot: "release:1.0",
    coverage: "partial",
    changes: [],
  },
  {
    id: "1.1",
    releaseId: "maniac:1.1",
    snapshot: "release:1.1",
    coverage: "partial",
    changes: [],
  },
  {
    id: "1.2",
    releaseId: "maniac:1.2",
    snapshot: "release:1.2",
    coverage: "partial",
    changes: [
      {
        id: "perk:forget-me-not",
        operation: "added",
        after: { id: "perk:forget-me-not", snapshot: "release:1.2" },
        editorial:
          "В Flower Cleaning появилась Незабудка: установите личную точку возврата и выбирайте место, которое маньяк не найдёт.",
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_2.html" },
        ],
      },
      ...flowerPerks.map((perk) => ({
        id: perk.id,
        operation: "added" as const,
        after: { id: perk.id, snapshot: "release:1.2" as const },
        editorial: `Добавлен перк «${perk.name}».`,
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_2.html" },
        ],
      })),
    ],
  },
];
