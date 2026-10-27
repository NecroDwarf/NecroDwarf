import type { ComponentType } from "react";
import { routePage } from "../../../shared/lib/route-page";
import { characterRouteMeta } from "./route-metadata";
const articles = import.meta.glob<{ default: ComponentType }>(
  "./pages/characters/*.tsx",
);
export const maniacWikiRoutes = [
  {
    path: "/projects/maniac/wiki",
    title: "Maniac Wiki — игровая энциклопедия · NecroDwarf",
    description:
      "Персонажи, игровые особенности и оригинальные материалы Maniac. Выберите свою сторону охоты.",
    page: routePage(() =>
      import("./pages/WikiHomePage").then((m) => m.WikiHomePage),
    ),
  },
  {
    path: "/projects/maniac/wiki/characters",
    title: "Персонажи — Maniac Wiki · NecroDwarf",
    description:
      "Все 15 персонажей Maniac: 8 маньяков и 7 выживших. Фрески, поиск, способности и снаряжение.",
    page: routePage(() =>
      import("./pages/CharactersPage").then((m) => m.CharactersPage),
    ),
  },
  ...characterRouteMeta.map((c) => ({
    path: `/projects/maniac/wiki/characters/${c.slug}`,
    title: `${c.name} — Maniac Wiki · NecroDwarf`,
    description: `${c.name}: особенности игры, способности, снаряжение и оригинальная фреска. Подтверждённые сведения из исходников Maniac.`,
    page: routePage(() =>
      articles[`./pages/characters/${c.slug}.tsx`]().then((m) => m.default),
    ),
  })),
];
