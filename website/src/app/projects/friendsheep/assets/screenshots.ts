import card from "./screenshots/event-card.webp";
import cardFull from "./screenshots/event-card.png";
import feed from "./screenshots/event-feed.webp";
import feedFull from "./screenshots/event-feed.png";
import create from "./screenshots/create-event.webp";
import createFull from "./screenshots/create-event.png";
import group from "./screenshots/group.webp";
import groupFull from "./screenshots/group.png";

export const screenshots = {
  card: {
    id: "event-card",
    src: card,
    full: cardFull,
    width: 406,
    height: 264,
    title: "Карточка события",
    figure: "19",
    alt: "Карточка мероприятия FriendSheep с обложкой, датой, жанрами и числом участников",
  },
  feed: {
    id: "event-feed",
    src: feed,
    full: feedFull,
    width: 1200,
    height: 604,
    title: "Лента событий",
    figure: "П1.3",
    alt: "Лента событий FriendSheep с голубым фоном и карточками мероприятий",
  },
  create: {
    id: "create-event",
    src: create,
    full: createFull,
    width: 634,
    height: 577,
    title: "Создание мероприятия",
    figure: "20",
    alt: "Форма создания события FriendSheep с названием, описанием, категорией, временем и местом",
  },
  group: {
    id: "group",
    src: group,
    full: groupFull,
    width: 1037,
    height: 517,
    title: "Страница группы",
    figure: "П1.4",
    alt: "Страница группы FriendSheep с описанием, подписчиками и запланированными мероприятиями",
  },
} as const;
