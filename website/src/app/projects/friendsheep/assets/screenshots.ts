import card from "./screenshots/event-card.webp";
import cardFull from "./screenshots/event-card.png";
import feed from "./screenshots/event-feed.webp";
import feedFull from "./screenshots/event-feed.png";
import create from "./screenshots/create-event.webp";
import createFull from "./screenshots/create-event.png";
import group from "./screenshots/group.webp";
import groupFull from "./screenshots/group.png";
import mobileFeed from "./screenshots/mobile-feed.webp";
import mobileFeedFull from "./screenshots/mobile-feed.png";
import mobileEvent from "./screenshots/mobile-event.webp";
import mobileEventFull from "./screenshots/mobile-event.png";
import mobileGroup from "./screenshots/mobile-group.webp";
import mobileGroupFull from "./screenshots/mobile-group.png";

export const screenshots = {
  mobileFeed: {
    id: "mobile-feed",
    src: mobileFeed,
    full: mobileFeedFull,
    width: 360,
    height: 780,
    title: "Лента в приложении",
    figure: "17",
    alt: "Главный экран мобильного FriendSheep: поиск, новые мероприятия и категории",
  },
  mobileEvent: {
    id: "mobile-event",
    src: mobileEvent,
    full: mobileEventFull,
    width: 360,
    height: 780,
    title: "Мероприятие в приложении",
    figure: "23",
    alt: "Карточка мероприятия в мобильном FriendSheep с описанием, временем, местом и участниками",
  },
  mobileGroup: {
    id: "mobile-group",
    src: mobileGroup,
    full: mobileGroupFull,
    width: 360,
    height: 780,
    title: "Группа в приложении",
    figure: "26",
    alt: "Экран группы в мобильном FriendSheep: описание сообщества, категории, контакты и участники",
  },
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
