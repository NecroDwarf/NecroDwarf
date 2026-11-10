import type { ProjectMeta } from "../../shared/content/types";
import { NovellMakerArt } from "./assets/NovellMakerArt";
import { docs, source, releaseUrl } from "./release-info";
import theme from "./theme/theme.module.css";
export const meta: ProjectMeta = {
  id: "novellmaker",
  name: "NovellMaker",
  category: "Инструмент / Творчество",
  description:
    "Движок и редактор для создания визуальных новелл. Открытая бета 0.1: готовые сборки для Windows x64.",
  status: "beta",
  links: { github: source, documentation: docs, download: releaseUrl },
  tagline: "У каждой истории — своё начало.",
  theme: theme.project,
  Art: NovellMakerArt,
};
