import { ChroniclePage } from "./ChroniclePage";
import { ManiacChangelogPage } from "./ManiacChangelogPage";
import { releases } from "./registry";
export const maniacChangelogRoutes = [
  {
    path: "/projects/maniac/changelog",
    title: "Хроники Maniac — NecroDwarf",
    description:
      "Полная история Maniac: Reforge 1.0, Кошмарный додеп 1.1 и Flower Cleaning 1.2.",
    Page: ManiacChangelogPage,
  },
  ...releases.map((release) => ({
    path: release.href!,
    title: `${release.title} ${release.version} — Хроники Maniac · NecroDwarf`,
    description: `${release.summary} Полный текст обновления Maniac ${release.version}.`,
    Page: () => <ChroniclePage version={release.version} />,
  })),
];
