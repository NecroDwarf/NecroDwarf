import type { ProjectMeta } from "../../shared/content/types";
import { FriendSheepArt } from "./assets/FriendSheepArt";
import theme from "./theme/theme.module.css";
export const meta: ProjectMeta = {
  id: "friendsheep",
  name: "FriendSheep",
  category: "Сервис / Мероприятия",
  description:
    "FriendSheep — сервис для организации мероприятий: встречи друзей, концерты, лекции и учебные события. Время, место и участники — в одном месте.",
  tagline: "Повод быть вместе.",
  theme: theme.project,
  Art: FriendSheepArt,
};
