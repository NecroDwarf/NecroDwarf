import type { NavigationItem } from "../../shared/content/navigation";
import metadata from "./docs/metadata.json";
import { docPath, docsBase } from "./docs/paths";

const base = "/projects/novellmaker";
const article = (slug: string): NavigationItem => ({
  label: metadata.find(([id]) => id === slug)![1],
  href: docPath(slug),
});

export const novellmakerNavigation: readonly NavigationItem[] = [
  { label: "О движке", href: base },
  { label: "Скачать бету", href: `${base}#download` },
  { label: "Выпуски", href: `${base}#release` },
  {
    label: "Документация",
    href: docsBase,
    children: [
      { label: "Обзор", href: docsBase },
      article("engine-guide"),
      article("dialogue-import"),
      {
        label: "Lua API",
        href: docPath("index"),
        children: [
          "execution-model",
          "scenario",
          "components",
          "events",
          "input-and-triggers",
          "modules",
          "animations",
          "audio",
          "state-and-random",
          "minigames",
          "session-and-storage",
          "history",
          "external-services",
          "standard-library",
        ].map(article),
      },
      article("characters"),
      article("examples"),
      {
        label: "Ограничения и проверка",
        href: docPath("limits"),
        children: ["limits", "diagnostics", "compatibility"].map(article),
      },
    ],
  },
  { label: "Возможности", href: `${base}#features` },
  { label: "Как начать", href: `${base}#start` },
  { label: "Примеры", href: `${base}#examples` },
  { label: "Разработчикам", href: `${base}#developers` },
];
