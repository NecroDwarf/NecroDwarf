import { wikiSectionPath } from "./sections";
import type { ComponentType } from "react";
import { routePage } from "../../../shared/lib/route-page";
import { characterRouteMeta } from "./route-metadata";
import { perkRouteMeta } from "./perk-route-metadata";
import { abilityRouteMeta } from "./ability-route-metadata";
import { itemRouteMeta } from "./item-route-metadata";
import { mechanicRouteMeta } from "./mechanic-route-metadata";
import { mapRouteMeta } from "./map-route-metadata";
const mapArticles = import.meta.glob<{ default: ComponentType }>(
  "./pages/maps/*.tsx",
);
const itemArticles = import.meta.glob<{ default: ComponentType }>(
  "./pages/items/*.tsx",
);
const mechanicArticles = import.meta.glob<{ default: ComponentType }>(
  "./pages/mechanics/*.tsx",
);
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
    path: wikiSectionPath("search"),
    title: "Поиск — Maniac Wiki · NecroDwarf",
    description: "Общий поиск по Maniac Wiki.",
    page: routePage(() =>
      import("./pages/WikiSearchPage").then((m) => m.WikiSearchPage),
    ),
  },
  {
    path: wikiSectionPath("effects"),
    title: "Эффекты — Maniac Wiki · NecroDwarf",
    description:
      "Все кастомные эффекты Maniac: действие, ограничения и состояния-индикаторы.",
    page: routePage(() =>
      import("./pages/EffectsPage").then((m) => m.EffectsPage),
    ),
  },
  {
    path: wikiSectionPath("maps"),
    title: "Карты — Maniac Wiki · NecroDwarf",
    description:
      "Особняк, Пиццерия и Форт: превью, размер, сложность и особенности карт Maniac.",
    page: routePage(() => import("./pages/MapsPage").then((m) => m.MapsPage)),
  },
  ...mapRouteMeta.map((m) => ({
    path: `${wikiSectionPath("maps")}/${m.slug}`,
    title: `${m.name} — Карты Maniac Wiki · NecroDwarf`,
    description: `${m.name}: превью, размер, сложность и особенности карты Maniac.`,
    page: routePage(() =>
      mapArticles[`./pages/maps/${m.slug}.tsx`]().then((m) => m.default),
    ),
  })),
  {
    path: wikiSectionPath("items"),
    title: "Предметы — Maniac Wiki · NecroDwarf",
    description:
      "Игровое снаряжение, оружие, расходники, ресурсы и предметы перков Maniac.",
    page: routePage(() => import("./pages/ItemsPage").then((m) => m.ItemsPage)),
  },
  {
    path: wikiSectionPath("mechanics"),
    title: "Механики — Maniac Wiki · NecroDwarf",
    description: "Правила матча, взлом, ресурсы и особые системы Maniac.",
    page: routePage(() =>
      import("./pages/MechanicsPage").then((m) => m.MechanicsPage),
    ),
  },
  ...itemRouteMeta.map((item) => ({
    path: `${wikiSectionPath("items")}/${item.slug}`,
    title: `${item.name} — Предметы Maniac Wiki · NecroDwarf`,
    description: `${item.name}: назначение, применение, ограничения и связанные игровые материалы Maniac.`,
    page: routePage(() =>
      itemArticles[`./pages/items/${item.slug}.tsx`]().then((m) => m.default),
    ),
  })),
  ...mechanicRouteMeta.map((m) => ({
    path: `${wikiSectionPath("mechanics")}/${m.slug}`,
    title: `${m.name} — Механики Maniac Wiki · NecroDwarf`,
    description: `${m.name}: игровые правила, последовательность действий и ограничения Maniac.`,
    page: routePage(() =>
      mechanicArticles[`./pages/mechanics/${m.slug}.tsx`]().then(
        (m) => m.default,
      ),
    ),
  })),
  {
    path: wikiSectionPath("perks"),
    title: "Перки — Maniac Wiki · NecroDwarf",
    description: `Каталог перков Maniac (${perkRouteMeta.length}): стороны, типы, фазы, игровые эффекты и условия.`,
    page: routePage(() => import("./pages/PerksPage").then((m) => m.PerksPage)),
  },
  {
    path: wikiSectionPath("abilities"),
    title: "Способности — Maniac Wiki · NecroDwarf",
    description: `Каталог способностей Maniac (${abilityRouteMeta.length}): персонажи, действия предметов и снаряжения, условия и параметры.`,
    page: routePage(() =>
      import("./pages/AbilitiesPage").then((m) => m.AbilitiesPage),
    ),
  },
  ...perkRouteMeta.map((p) => ({
    path: `${wikiSectionPath("perks")}/${p.slug}`,
    title: `${p.name} — Перки Maniac Wiki · NecroDwarf`,
    description: `${p.name}: игровой эффект, тип, доступная сторона, фазы и характеристики Maniac.`,
    page: routePage(() =>
      perkArticles[`./pages/perks/${p.slug}.tsx`]().then((m) => m.default),
    ),
  })),
  ...abilityRouteMeta.map((a) => ({
    path: `${wikiSectionPath("abilities")}/${a.slug}`,
    title: `${a.name} — Способности Maniac Wiki · NecroDwarf`,
    description: `${a.name}: связанный персонаж, условия применения и параметры действия в Maniac.`,
    page: routePage(() =>
      abilityArticles[`./pages/abilities/${a.slug}.tsx`]().then(
        (m) => m.default,
      ),
    ),
  })),
  {
    path: wikiSectionPath("overview"),
    title: "Maniac Wiki — игровая энциклопедия · NecroDwarf",
    description:
      "Персонажи, перки, снаряжение, механики, карты и эффекты Maniac.",
    page: routePage(() =>
      import("./pages/WikiHomePage").then((m) => m.WikiHomePage),
    ),
  },
  {
    path: wikiSectionPath("characters"),
    title: "Персонажи — Maniac Wiki · NecroDwarf",
    description: `Все ${characterRouteMeta.length} персонажей Maniac: маньяки и выжившие. Фрески, поиск, способности и снаряжение.`,
    page: routePage(() =>
      import("./pages/CharactersPage").then((m) => m.CharactersPage),
    ),
  },
  ...characterRouteMeta.map((c) => ({
    path: `${wikiSectionPath("characters")}/${c.slug}`,
    title: `${c.name} — Maniac Wiki · NecroDwarf`,
    description: `${c.name}: особенности игры, способности, снаряжение и фреска персонажа Maniac.`,
    page: routePage(() =>
      articles[`./pages/characters/${c.slug}.tsx`]().then((m) => m.default),
    ),
  })),
];
