import type { Release } from "../../../shared/content/types";
import theme from "../theme/theme.module.css";
import flowerBackground from "../assets/releases/flower-cleaning.jpg";
import nightmareBackground from "../assets/releases/nightmare.jpg";
import reforgeBackground from "../assets/releases/reforge.jpg";
const base =
  "https://doflare123.github.io/Maniac-mod-evolution/changelogs/maniac/";
// Titles, order and short descriptions confirmed by the brief and existing V2.
// No dates or claim about the current downloadable version are inferred.
export const releases: readonly Release[] = [
  {
    id: "maniac:1.2",
    projectId: "maniac",
    version: "1.2",
    slug: "1.2",
    title: "Flower Cleaning",
    background: { src: flowerBackground, width: 1400, height: 933 },
    summary:
      "Цветочное обновление: 15 новых перков, изменения интерфейса, механик и исправления.",
    releaseOrder: 3,
    status: "published",
    theme: theme.flower,
    source: `${base}changelog_maniac_1_2.html`,
    tags: ["Цветочное обновление"],
  },
  {
    id: "maniac:1.1",
    projectId: "maniac",
    version: "1.1",
    slug: "1.1",
    title: "Кошмарный додеп",
    background: { src: nightmareBackground, width: 1400, height: 583 },
    summary: "Новая глава хроник Maniac — «Кошмарный додеп».",
    releaseOrder: 2,
    status: "published",
    theme: theme.nightmare,
    source: `${base}changelog_maniac_1_1.html`,
  },
  {
    id: "maniac:1.0",
    projectId: "maniac",
    version: "1.0",
    slug: "1.0",
    title: "Maniac Reforge",
    background: { src: reforgeBackground, width: 1400, height: 518 },
    summary: "Большая переработка игровых систем Maniac.",
    releaseOrder: 1,
    status: "published",
    theme: theme.reforge,
    source: `${base}changelog_maniac.html`,
  },
];
