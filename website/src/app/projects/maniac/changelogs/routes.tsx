import { routePage } from "../../../shared/lib/route-page";
import { releases } from "./registry";
const releasePages = {
  "1.0": routePage(() => import("./content/1.0.page").then((m) => m.default)),
  "1.1": routePage(() => import("./content/1.1.page").then((m) => m.default)),
  "1.2": routePage(() => import("./content/1.2.page").then((m) => m.default)),
};
export const maniacChangelogRoutes = [
  {
    path: "/projects/maniac/changelog",
    title: "Хроники Maniac — NecroDwarf",
    description:
      "Полная история Maniac: Reforge 1.0, Кошмарный додеп 1.1 и Flower Cleaning 1.2.",
    page: routePage(() =>
      import("./ManiacChangelogPage").then((m) => m.ManiacChangelogPage),
    ),
  },
  ...releases.map((release) => ({
    path: release.href!,
    title: `${release.title} ${release.version} — Хроники Maniac · NecroDwarf`,
    description: `${release.summary} Полный текст обновления Maniac ${release.version}.`,
    page: releasePages[release.version as keyof typeof releasePages],
  })),
];
