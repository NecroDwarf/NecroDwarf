import { WikiBreadcrumb } from "../ui/WikiBreadcrumb";
import { Link } from "react-router";
import { mapCatalog } from "../data/maps";
import type { EntityId, Evidence } from "../data/types";
import { RelatedLinks } from "../ui/RelatedLinks";
import { BackLink } from "../../../../shared/ui/ContentLink";
import { WikiLayout } from "./WikiLayout";
import { MapFacts } from "./MapFacts";
import { StatText } from "../ui/StatText";
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
          <WikiBreadcrumb
            section="maps"
            label="Карты"
            name={map.name}
            ariaLabel="Путь к статье"
          />
          <p className={s.eyebrow}>MANIAC WIKI / ИГРОВАЯ КАРТА</p>
          <div className={m.titleRow}>
            <h1>{map.name}</h1>
            <MapFacts map={map} />
          </div>
          <p className={s.lead}>
            <StatText text={map.description} />
          </p>
          <figure className={m.heroImage}>
            <img
              {...image}
              sizes="(min-width:1440px) 1280px, calc(100vw - 48px)"
              alt={`Превью карты «${map.name}»`}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </header>
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОЙ СТАТЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#guide">01 · Особенности и советы</a>
              <a href="#related">02 · Связанные материалы</a>
            </nav>
            <BackLink to="/projects/maniac/wiki/maps">Все карты</BackLink>
          </aside>
          <div className={s.articleContent}>
            <section className={s.articleSection} id="guide">
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
                    <p>
                      <StatText text={detail} />
                    </p>
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
            <BackLink to="/projects/maniac/wiki/maps">
              Вернуться к картам
            </BackLink>
          </div>
        </div>
      </article>
    </WikiLayout>
  );
}
