import { Link } from "react-router";
import { mapCatalog } from "../data/maps";
import voting from "../data/map-voting.json";
import { sourceUrl, verifiedSource, sourceCommit } from "../data/snapshots";
import { publishedEntityRoutes } from "../data/publication";
import { ContentLink } from "../../../../shared/ui/ContentLink";
import { WikiLayout, DataNote } from "./WikiLayout";
import { MapFacts } from "./MapFacts";
import { mapCardImages } from "./map-card-images";
import { useMapAnchor } from "./useMapAnchor";
import s from "./Wiki.module.css";
import m from "./Maps.module.css";
export function MapsPage() {
  useMapAnchor("map-voting");
  return (
    <WikiLayout>
      <div className={s.container}>
        <header className={s.catalogHead}>
          <p className={s.eyebrow}>MANIAC WIKI / ЛОКАЦИИ</p>
          <h1>
            Место <em>охоты.</em>
          </h1>
          <p className={s.lead}>
            Три карты. Тайные маршруты, тесные коридоры и открытые линии обзора
            — изучите место следующей встречи.
          </p>
        </header>
        <DataNote />
        <div className={m.grid}>
          {mapCatalog.map((map) => {
            const image = mapCardImages[map.slug as keyof typeof mapCardImages];
            return (
              <Link
                className={m.card}
                to={`/projects/maniac/wiki/maps/${map.slug}`}
                key={map.id}
                data-map-id={map.id}
              >
                <div className={m.cardImage}>
                  <img
                    {...image}
                    sizes="(min-width:1100px) 400px, (min-width:700px) 600px, calc(100vw - 48px)"
                    alt={`Игровое превью карты «${map.name}» из меню Maniac`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={m.cardBody}>
                  <p className={s.eyebrow}>ИГРОВАЯ КАРТА</p>
                  <h2>{map.name}</h2>
                  <p>{map.description}</p>
                  <MapFacts map={map} />
                  <ul className={m.features}>
                    {map.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <span className={s.textLink}>Изучить карту →</span>
                </div>
              </Link>
            );
          })}
        </div>
        <p className={m.previewNote}>
          Изображения — игровые превью из меню мода, а не точные планы уровней.
        </p>
        <section className={s.section} id="map-voting">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>ПЕРЕД НАЧАЛОМ МАТЧА</p>
              <h2>Как выбирается карта</h2>
            </div>
          </div>
          <ol className={m.voting}>
            {voting.paragraphs.map((p, i) => (
              <li key={p}>
                <span aria-hidden="true">0{i + 1}</span>
                <p>{p}</p>
              </li>
            ))}
          </ol>
          <p className={s.textLink}>
            <Link to={publishedEntityRoutes["mechanic:match-preparation"]!}>
              Подготовка и начало матча →
            </Link>
          </p>
          <details className={s.sources}>
            <summary>Источники выбора карты</summary>
            <p>
              Снимок <code>{sourceCommit.slice(0, 7)}</code>.
            </p>
            {voting.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
            <ul>
              {voting.evidence.map((ev) => (
                <li key={ev.path}>
                  <ContentLink href={sourceUrl(ev.path, verifiedSource)!}>
                    {ev.path.split("/").at(-1)}
                  </ContentLink>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </div>
    </WikiLayout>
  );
}
