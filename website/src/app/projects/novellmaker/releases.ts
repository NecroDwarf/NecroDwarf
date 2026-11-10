import type { Release } from "../../shared/content/types";
import { version, releaseUrl } from "./release-info";
import theme from "./theme/theme.module.css";
export const releases: readonly Release[] = [
  {
    id: `novellmaker:${version}`,
    projectId: "novellmaker",
    version,
    slug: version,
    title: "Открытая бета",
    summary:
      "Первый бета-выпуск редактора и движка: импорт сценариев, анимация, озвучка, Lua и экспорт самостоятельных игр. Установщик и portable для Windows x64; экспериментальная сборка Linux.",
    publishedAt: "2026-11-10",
    releaseOrder: 1,
    status: "published",
    theme: theme.project,
    source: releaseUrl,
    href: "/projects/novellmaker#release",
    tags: ["Открытая бета"],
  },
];
