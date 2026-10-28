import type { ComponentType } from "react";
import { routePage } from "../../../shared/lib/route-page";
import { characterRouteMeta } from "./route-metadata";
import { perkRouteMeta } from "./perk-route-metadata";
import { abilityRouteMeta } from "./ability-route-metadata";
const perkArticles = import.meta.glob<{ default: ComponentType }>(
  "./pages/perks/*.tsx",
);
const abilityArticles = import.meta.glob<{ default: ComponentType }>(
  "./pages/abilities/*.tsx",
);
const articles = import.meta.glob<{ default: ComponentType }>(
  "./pages/characters/*.tsx",
);
export const maniacWikiRoutes = [
  {
    path: "/projects/maniac/wiki/perks",
    title: "Перки — Maniac Wiki · NecroDwarf",
    description:
      "Все 44 зарегистрированных перка Maniac: стороны, типы, фазы, игровые эффекты и условия.",
    page: routePage(() => import("./pages/PerksPage").then((m) => m.PerksPage)),
  },
  {
    path: "/projects/maniac/wiki/abilities",
    title: "Способности — Maniac Wiki · NecroDwarf",
    description:
      "12 подтверждённых способностей Maniac: персонажи, действия предметов и снаряжения, условия и параметры.",
    page: routePage(() =>
      import("./pages/AbilitiesPage").then((m) => m.AbilitiesPage),
    ),
  },
  ...perkRouteMeta.map((p) => ({
    path: `/projects/maniac/wiki/perks/${p.slug}`,
    title: `${p.name} — Перки Maniac Wiki · NecroDwarf`,
    description: `${p.name}: игровой эффект, тип, доступная сторона, фазы и проверенные характеристики из исходников Maniac.`,
    page: routePage(() =>
      perkArticles[`./pages/perks/${p.slug}.tsx`]().then((m) => m.default),
    ),
  })),
  ...abilityRouteMeta.map((a) => ({
    path: `/projects/maniac/wiki/abilities/${a.slug}`,
    title: `${a.name} — Способности Maniac Wiki · NecroDwarf`,
    description: `${a.name}: связанный персонаж, условия применения и подтверждённые параметры действия в Maniac.`,
    page: routePage(() =>
      abilityArticles[`./pages/abilities/${a.slug}.tsx`]().then(
        (m) => m.default,
      ),
    ),
  })),
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
