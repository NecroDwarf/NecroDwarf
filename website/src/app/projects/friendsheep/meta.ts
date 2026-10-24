import type { ProjectMeta } from "../../shared/content/types";
import { FriendSheepArt } from "./assets/FriendSheepArt";
import theme from "./theme/theme.module.css";
export const meta: ProjectMeta = {
  id: "friendsheep",
  name: "FriendSheep",
  category: "Сервис / Мероприятия",
  description:
    "Сервис для организации мероприятий. Встречи начинаются с идеи собраться вместе.",
  tagline: "Повод быть вместе.",
  theme: theme.project,
  Art: FriendSheepArt,
};
