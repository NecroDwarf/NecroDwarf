import type { Entity } from "./types";
import { verifiedSource } from "./snapshots";
const base = "src/main/java/org/example/maniacrevolution/character/";
export const characters: readonly Entity<"character">[] = [
  {
    id: "character:keeper-of-nightmares",
    kind: "character",
    slug: "keeper-of-nightmares",
    name: "Хранитель кошмаров",
    revisions: {
      [verifiedSource]: {
        data: {
          role: "maniac",
          style: "Психологическое давление",
          description:
            "Воздействует на рассудок выживших и отправляет их в кошмарные испытания. Заставляет следить не только за маршрутом, но и за самим охотником.",
          abilityIds: ["ability:abyss-gaze", "ability:concentrated-nightmare"],
          itemIds: ["item:nightmare-lighter"],
          model: "keeper-nightmares",
        },
        evidence: [
          { path: `${base}maniac/KeeperOfNightmaresClass.java` },
          { path: `${base}CharacterRegistry.java` },
        ],
      },
    },
  },
  {
    id: "character:ghost",
    kind: "character",
    slug: "ghost",
    name: "Призрак",
    revisions: {
      [verifiedSource]: {
        data: {
          role: "maniac",
          style: "Скрытность и одержимость",
          description:
            "Исчезает из виду и вселяется в выживших. Играет на неожиданности: не каждая встреча с союзником оказывается безопасной.",
          abilityIds: [],
          itemIds: [],
        },
        evidence: [{ path: `${base}maniac/GhostClass.java` }],
      },
    },
  },
  {
    id: "character:dodepovich",
    kind: "character",
    slug: "dodepovich",
    name: "Никита Додепович",
    revisions: {
      [verifiedSource]: {
        data: {
          role: "survivor",
          style: "Риск и удача",
          description:
            "Использует особые монетки и казино-автомат. Удачный розыгрыш помогает пережить опасный момент, неудачный оборачивается новой проблемой.",
          abilityIds: [],
          itemIds: [],
        },
        evidence: [{ path: `${base}survivor/DodepovichClass.java` }],
      },
    },
  },
];
