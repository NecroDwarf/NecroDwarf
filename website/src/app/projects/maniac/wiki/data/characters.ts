import type { Entity, EntityId } from "./types";
import { verifiedSource } from "./snapshots";
import catalog from "./character-catalog.json";
import relations from "./character-relations.json";
const base = "src/main/java/org/example/maniacrevolution/character/";
const foundationalCharacters: readonly Entity<"character">[] = [
  {
    id: "character:keeper-of-nightmares",
    kind: "character",
    slug: "keeper-of-nightmares",
    name: "Хранитель кошмаров",
    revisions: {
      "release:1.1": {
        data: {
          role: "maniac",
          style: "Давление рассудком",
          description:
            "Маньяк, который ломает выживших не уроном, а рассудком.",
          abilityIds: ["ability:concentrated-nightmare"],
          itemIds: ["item:nightmare-lighter"],
        },
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_1.html" },
        ],
      },
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
      "release:1.1": {
        data: {
          role: "maniac",
          style: "Скрытность и вселение",
          description:
            "Скрытный маньяк, который может исчезать полностью и захватывать тело выжившего.",
          abilityIds: [],
          itemIds: [],
        },
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_1.html" },
        ],
      },
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
      "release:1.1": {
        data: {
          role: "survivor",
          style: "Монетки и казино",
          description:
            "Азартный выживший, который играет через монетки и казино-автомат.",
          abilityIds: [],
          itemIds: [],
        },
        evidence: [
          { path: "docs/changelogs/maniac/changelog_maniac_1_1.html" },
        ],
      },
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
// One authoritative character registry. Full article fragments load separately;
// historical revisions above remain exactly as published in the chronicles.
export const characters: readonly Entity<"character">[] = catalog.map(
  (entry) => {
    const previous = foundationalCharacters.find((c) => c.id === entry.id);
    const related = relations[entry.gameId as keyof typeof relations];
    return {
      id: entry.id as Entity<"character">["id"],
      kind: "character",
      slug: entry.slug,
      name: entry.name,
      revisions: {
        ...previous?.revisions,
        [verifiedSource]: {
          data: {
            ...previous?.revisions[verifiedSource]?.data,
            gameId: entry.gameId,
            role: entry.role as "maniac" | "survivor",
            style:
              previous?.revisions[verifiedSource]?.data.style ??
              entry.tags.slice(0, 2).join(" · "),
            description:
              previous?.revisions[verifiedSource]?.data.description ??
              entry.summary,
            sourceDescription: entry.description,
            difficulty: entry.difficulty,
            tags: entry.tags,
            abilityIds: related.abilityIds as readonly EntityId<"ability">[],
            itemIds: related.itemIds as readonly EntityId<"item">[],
          },
          evidence: [
            { path: entry.classPath },
            { path: `${base}CharacterRegistry.java` },
            { path: "src/main/resources/assets/maniacrev/lang/ru_ru.json" },
          ],
        },
      },
    };
  },
);
