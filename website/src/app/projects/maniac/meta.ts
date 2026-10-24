import type { ProjectMeta } from "../../shared/content/types";
import { ManiacArt } from "./assets/ManiacArt";
import theme from "./theme/theme.module.css";
export const meta: ProjectMeta = {
  id: "maniac",
  name: "Maniac",
  category: "Асимметричный хоррор / Minecraft",
  description:
    "Асимметричный хоррор для Minecraft. Противостояние маньяка и выживших.",
  tagline: "Охота начинается.",
  theme: theme.project,
  Art: ManiacArt,
};
