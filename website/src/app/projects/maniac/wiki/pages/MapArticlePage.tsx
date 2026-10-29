import { Link } from "react-router";
import { mapCatalog } from "../data/maps";
import type { EntityId, Evidence } from "../data/types";
import { sourceUrl, sourceCommit, verifiedSource } from "../data/snapshots";
import { RelatedLinks } from "../ui/RelatedLinks";
import { ContentLink } from "../../../../shared/ui/ContentLink";
import { WikiLayout, DataNote } from "./WikiLayout";
import { MapFacts } from "./MapFacts";
import s from "./Wiki.module.css";
import m from "./Maps.module.css";
interface Article {
  id: string;
  details: readonly string[];
  notes: readonly string[];
  registryDescription: string;
  evidence: readonly Evidence[];
}
interface Image {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}
export function MapArticlePage({
  id,
  article,
  image,
}: {
  id: EntityId<"map">;
  article: Article;
  image: Image;
}) {
  const map = mapCatalog.find((map) => map.id === id)!;
  return (
    <WikiLayout>
      <article className={s.container} data-map-article={id}>
        <header className={m.articleHead}>
          <nav className={s.breadcrumb} aria-label="Путь к статье">
            <Link to="/projects/maniac/wiki">Wiki</Link>
            <span>/</span>
            <Link to="/projects/maniac/wiki/maps">Карты</Link>
            <span>/</span>
            <span>{map.name}</span>
          </nav>
          <p className={s.eyebrow}>MANIAC WIKI / ИГРОВАЯ КАРТА</p>
          <div className={m.titleRow}>
            <h1>{map.name}</h1>
            <MapFacts map={map} />
          </div>
          <p className={s.lead}>{map.description}</p>
          <figure className={m.heroImage}>
            <img
              {...image}
              sizes="(min-width:1440px) 1280px, calc(100vw - 48px)"
              alt={`Оригинальное игровое превью карты «${map.name}»`}
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>
              Игровое превью из меню Maniac. Изображение не является точной
              схемой уровня.
            </figcaption>
          </figure>
        </header>
        <DataNote />
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОЙ СТАТЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#guide">01 · Особенности и советы</a>
              <a href="#related">02 · Связанные материалы</a>
              <a href="#sources">Источники</a>
            </nav>
            <Link to="/projects/maniac/wiki/maps">← Все карты</Link>
          </aside>
          <div className={s.articleContent}>
            <section className={s.articleSection} id="guide">
              <p className={s.eyebrow}>ИЗ ВНУТРИИГРОВОГО РУКОВОДСТВА</p>
              <h2>Особенности и советы</h2>
              <p className={s.sectionIntro}>
                Изучайте маршруты и учитывайте обстановку: рекомендации помогают
                ориентироваться, но не гарантируют победу.
              </p>
              <ol className={m.details}>
                {article.details.map((detail, i) => (
                  <li key={detail} data-guide-detail={i}>
                    <span aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p>{detail}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className={s.articleSection} id="related">
              <p className={s.eyebrow}>СВЯЗИ В ЭНЦИКЛОПЕДИИ</p>
              <h2>Правила и история</h2>
              <RelatedLinks id={id} />
              {map.chronicle && (
                <Link
                  className={s.chronicleLink}
                  to={`/projects/maniac/changelog/${map.chronicle.version}#${map.chronicle.sectionId}`}
                >
                  <span>ХРОНИКИ {map.chronicle.version}</span>
                  <strong>Кошмарный додеп</strong>
                  <span>Первое упоминание Форта в истории обновлений →</span>
                </Link>
              )}
              <p className={s.textLink}>
                <Link to="/projects/maniac/wiki/maps#map-voting">
                  Как выбирается карта →
                </Link>
              </p>
            </section>
            <section className={s.articleSection} id="sources">
              <details className={s.sources}>
                <summary>Проверенные источники и различия</summary>
                <p>
                  Снимок <code>{sourceCommit.slice(0, 7)}</code>. Название,
                  размер, сложность и рекомендации взяты из локализованного
                  руководства; точные геометрические размеры и координаты не
                  подтверждены.
                </p>
                <p>
                  String ID: <code>{map.slug}</code>; внутренний scoreboard ID:{" "}
                  <code>{map.numericId}</code>.
                </p>
                <p>Описание в MapRegistry: {article.registryDescription}</p>
                {article.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
                <ul>
                  {article.evidence.map((ev) => (
                    <li key={ev.path}>
                      <ContentLink href={sourceUrl(ev.path, verifiedSource)!}>
                        {ev.path.split("/").at(-1)}
                      </ContentLink>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
            <Link className={s.textLink} to="/projects/maniac/wiki/maps">
              ← Вернуться к картам
            </Link>
          </div>
        </div>
      </article>
    </WikiLayout>
  );
}
