import { routePage } from "../../../shared/lib/route-page";
import slugs from "./route-slugs.json";
import { docPath } from "./paths";
export const novellmakerDocsRoutes = [
  {
    path: "/projects/novellmaker/docs",
    title: "Документация NovellMaker — NecroDwarf",
    description:
      "Руководство NovellMaker: сцены, Lua API, интерфейсы, примеры и экспорт Windows x64.",
    page: routePage(() => import("./DocsHome").then((m) => m.DocsHome)),
  },
  ...slugs.map((slug) => {
    // routePage is preloaded before SSG, hydration and client head updates.
    // Keep full Russian navigation/SEO metadata out of unrelated routes.
    let title = "Документация";
    return {
      path: docPath(slug),
      get title() {
        return `${title} — NovellMaker · NecroDwarf`;
      },
      get description() {
        return `${title}: документация NovellMaker. Контракты API, примеры и ограничения.`;
      },
      page: routePage(async () => {
        const m = await import("./load-article");
        const Page = await m.loadArticle(slug);
        title = m.articleTitle(slug);
        return Page;
      }),
    };
  }),
];
