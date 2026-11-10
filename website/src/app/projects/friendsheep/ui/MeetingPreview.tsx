import { screenshots } from "../assets/screenshots";
import s from "./MeetingPreview.module.css";

type Screenshot = (typeof screenshots)[keyof typeof screenshots];

function ScreenshotLink({
  image,
  className = "",
  eager = false,
}: {
  image: Screenshot;
  className?: string;
  eager?: boolean;
}) {
  return (
    <a
      className={`${s.imageLink} ${className}`}
      href={image.full}
      target="_blank"
      rel="noopener noreferrer"
      data-project-screenshot={image.id}
      aria-label={`Открыть «${image.title}» в полном размере в новой вкладке`}
    >
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </a>
  );
}

export function HeroPreview() {
  return (
    <figure className={s.heroPreview} aria-label="Интерфейс FriendSheep">
      <div className={s.heroBackdrop} aria-hidden="true" />
      <div className={s.heroScreen}>
        <div className={s.screenLabel}>
          <span>Веб-клиент FriendSheep</span>
        </div>
        <ScreenshotLink image={screenshots.feed} eager />
      </div>
      <div className={s.heroCard}>
        <ScreenshotLink image={screenshots.card} eager />
        <span>Карточка события</span>
      </div>
    </figure>
  );
}

export function InterfacePreview() {
  const gallery = [
    {
      image: screenshots.feed,
      platform: "web",
      description: "Общий экран с категориями и карточками мероприятий.",
    },
    {
      image: screenshots.mobileFeed,
      platform: "mobile",
      description:
        "Поиск, новые события и категории — на главном экране телефона.",
    },
    {
      image: screenshots.create,
      platform: "web",
      description:
        "Название, описание, категория, дата, место и другие подробности события.",
    },
    {
      image: screenshots.mobileEvent,
      platform: "mobile",
      description:
        "Описание, время, место и участники мероприятия в одном экране.",
    },
    {
      image: screenshots.group,
      platform: "web",
      description:
        "Описание сообщества, участники и запланированные мероприятия.",
    },
    {
      image: screenshots.mobileGroup,
      platform: "mobile",
      description:
        "Информация о сообществе, его интересах и участниках в приложении.",
    },
  ];
  return (
    <div className={s.gallery}>
      <div className={s.galleryGrid}>
        {gallery.map(({ image, platform, description }) => (
          <figure key={image.id} data-screenshot-platform={platform}>
            <ScreenshotLink image={image} className={s.galleryImage} />
            <figcaption>
              <span className={s.platform}>
                {platform === "mobile" ? "Мобильное приложение" : "Веб-версия"}
              </span>
              <h3>{image.title}</h3>
              <p>{description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={s.galleryHint}>
        Нажмите на изображение, чтобы открыть его в полном размере.
      </p>
    </div>
  );
}
