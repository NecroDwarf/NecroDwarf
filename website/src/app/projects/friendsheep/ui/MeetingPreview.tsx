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
  return (
    <div className={s.gallery}>
      <figure className={s.featured}>
        <ScreenshotLink image={screenshots.feed} />
        <figcaption>
          <h3>Лента событий</h3>
          <p>Общий экран с категориями и карточками мероприятий.</p>
        </figcaption>
      </figure>
      <div className={s.details}>
        <figure>
          <ScreenshotLink
            image={screenshots.create}
            className={s.detailImage}
          />
          <figcaption>
            <h3>Создание мероприятия</h3>
            <p>
              Название, описание, категория, дата, место и другие подробности
              события.
            </p>
          </figcaption>
        </figure>
        <figure>
          <ScreenshotLink image={screenshots.group} className={s.detailImage} />
          <figcaption>
            <h3>Страница группы</h3>
            <p>Описание сообщества, участники и запланированные мероприятия.</p>
          </figcaption>
        </figure>
      </div>
      <p className={s.galleryHint}>
        Нажмите на изображение, чтобы открыть его в полном размере.
      </p>
    </div>
  );
}
