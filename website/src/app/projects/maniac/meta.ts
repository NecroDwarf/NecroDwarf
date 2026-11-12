import type { ProjectMeta } from "../../shared/content/types";
import cover from "./assets/maniac-cover.webp";
import theme from "./theme/theme.module.css";
export const meta: ProjectMeta = {
  id: "maniac",
  name: "Maniac",
  category: "Асимметричный хоррор / Minecraft",
  description:
    "Асимметричный хоррор для Minecraft. Противостояние маньяка и выживших.",
  tagline: "Охота начинается.",
  theme: theme.project,
  cover: {
    src: cover,
    alt: "Два персонажа Maniac в красном коридоре у двери с вывеской EXIT",
    width: 1600,
    height: 1238,
  },
};
