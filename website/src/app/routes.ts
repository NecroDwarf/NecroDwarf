import { routePage } from "./shared/lib/route-page";
import { projects } from "./projects/registry";
import { maniacChangelogRoutes } from "./projects/maniac/changelogs/routes";
import { maniacWikiRoutes } from "./projects/maniac/wiki/routes";
const projectPages = {
  maniac: routePage(() =>
    import("./projects/maniac/pages/ManiacPage").then((m) => m.ManiacPage),
  ),
  friendsheep: routePage(() =>
    import("./projects/friendsheep/pages/FriendSheepPage").then(
      (m) => m.FriendSheepPage,
    ),
  ),
  novellmaker: routePage(() =>
    import("./projects/novellmaker/pages/NovellMakerPage").then(
      (m) => m.NovellMakerPage,
    ),
  ),
};
export const routes = [
  {
    path: "/",
    title: "NecroDwarf — Куём идеи. Оживляем код.",
    description:
      "Независимая команда разработчиков игр, приложений и цифровых сервисов. Maniac, FriendSheep и NovellMaker.",
    page: routePage(() =>
      import("./pages/home/HomePage").then((m) => m.HomePage),
    ),
  },
  {
    path: "/projects",
    title: "Проекты — NecroDwarf",
    description:
      "Maniac, FriendSheep и NovellMaker — игры, сервисы и инструменты команды NecroDwarf.",
    page: routePage(() =>
      import("./pages/projects/ProjectsPage").then((m) => m.ProjectsPage),
    ),
  },
  {
    path: "/about",
    title: "Команда — NecroDwarf",
    description:
      "VitaminLLO, doflare и raisin3. Команда NecroDwarf, наши идеи и контакты.",
    page: routePage(() =>
      import("./pages/about/AboutPage").then((m) => m.AboutPage),
    ),
  },
  {
    path: "/changelog",
    title: "Хроники — NecroDwarf",
    description:
      "Последние опубликованные обновления проектов NecroDwarf. История Maniac: Reforge, Кошмарный додеп, Flower Cleaning.",
    page: routePage(() =>
      import("./pages/changelog/ChangelogPage").then((m) => m.ChangelogPage),
    ),
  },
  ...projects.map((project) => ({
    path: `/projects/${project.id}`,
    title: `${project.name} — NecroDwarf`,
    description: project.description,
    page: projectPages[project.id as keyof typeof projectPages],
  })),
  ...maniacChangelogRoutes,
  ...maniacWikiRoutes,
];
const notFoundPage = routePage(() =>
  import("./pages/NotFoundPage").then((m) => m.NotFoundPage),
);
export function pageForPath(path: string) {
  return (
    routes.find((route) => route.path === normalizePath(path))?.page ??
    notFoundPage
  );
}
export const notFoundMeta = {
  title: "Страница не найдена — NecroDwarf",
  description:
    "Такой страницы нет. Проекты, хроники и команда NecroDwarf доступны с главной страницы.",
};
export function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}
