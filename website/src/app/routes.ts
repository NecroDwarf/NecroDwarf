import { HomePage } from "./pages/home/HomePage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { AboutPage } from "./pages/about/AboutPage";
import { ChangelogPage } from "./pages/changelog/ChangelogPage";
import { projects } from "./projects/registry";
export const routes = [
  {
    path: "/",
    title: "NecroDwarf — Куём идеи. Оживляем код.",
    description:
      "Независимая команда разработчиков игр, приложений и цифровых сервисов. Maniac, FriendSheep и NovellMaker.",
    Page: HomePage,
  },
  {
    path: "/projects",
    title: "Проекты — NecroDwarf",
    description:
      "Maniac, FriendSheep и NovellMaker — игры, сервисы и инструменты команды NecroDwarf.",
    Page: ProjectsPage,
  },
  {
    path: "/about",
    title: "Команда — NecroDwarf",
    description:
      "VitaminLLO, doflare и raisin3. Команда NecroDwarf, наши идеи и контакты.",
    Page: AboutPage,
  },
  {
    path: "/changelog",
    title: "Хроники — NecroDwarf",
    description:
      "Последние опубликованные обновления проектов NecroDwarf. История Maniac: Reforge, Кошмарный додеп, Flower Cleaning.",
    Page: ChangelogPage,
  },
  ...projects.map((project) => ({
    path: `/projects/${project.id}`,
    title: `${project.name} — NecroDwarf`,
    description: project.description,
    Page: project.Page,
  })),
];
export const notFoundMeta = {
  title: "Страница не найдена — NecroDwarf",
  description:
    "Такой страницы нет. Проекты, хроники и команда NecroDwarf доступны с главной страницы.",
};
export function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}
