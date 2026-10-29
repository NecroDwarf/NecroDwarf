import { Link } from "react-router";
import { Fragment } from "react";
import { ContentLink } from "../../../shared/ui/ContentLink";
import { releases } from "./registry";
import type { ChronicleContent } from "./content/types";
import { ChronicleText } from "./ChronicleText";
import { ReleaseDecor } from "./ReleaseDecor";
import { mapCatalog } from "../wiki/data/maps";
import { EntityLink } from "../wiki/ui/EntityLink";
import { useMapAnchor } from "../wiki/pages/useMapAnchor";
import s from "./Chronicles.module.css";

export function ChroniclePage({
  version,
  content,
}: {
  version: string;
  content: ChronicleContent;
}) {
  const release = releases.find((r) => r.version === version)!;
  useMapAnchor(
    mapCatalog.find((map) => map.chronicle?.version === version)?.chronicle
      ?.sectionId,
  );
  const older = releases.find(
    (r) => r.releaseOrder === release.releaseOrder - 1,
  );
  const newer = releases.find(
    (r) => r.releaseOrder === release.releaseOrder + 1,
  );
  return (
    <div className={s.page} data-chronicle={version}>
      <ReleaseDecor key={version} version={version} />
      <header className={s.hero} id="chronicle-top">
        {release.background && (
          <img
            className={s.heroArt}
            src={release.background.src}
            width={release.background.width}
            height={release.background.height}
            alt=""
          />
        )}
        <div className={s.heroContent}>
          <nav className={s.breadcrumb} aria-label="Путь к хронике">
            <Link to="/projects/maniac">Maniac</Link>
            <span>/</span>
            <Link to="/projects/maniac/changelog">Хроники</Link>
            <span>/ {version}</span>
          </nav>
          <p className={s.kicker}>MANIAC / ЗАПИСИ ЛЕТОПИСЦА</p>
          <div className={s.versionMark} aria-hidden="true">
            {version === "1.0" ? "⚒" : version === "1.1" ? "☽" : "✿"}{" "}
            <span>{version}</span>
          </div>
          <h1>{release.title}</h1>
          <p className={s.subtitle}>{content.intro}</p>
          <p className={s.intro}>{content.note}</p>
          <a className={s.readButton} href="#release-content">
            Читать хронику <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>
      <div className={s.body}>
        <dl className={s.stats} aria-label="Показатели из оригинальной хроники">
          {content.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className={s.layout}>
          <aside className={s.contents}>
            <nav aria-label="Оглавление хроники">
              <p className={s.kicker}>В ЭТОМ ВЫПУСКЕ</p>
              <ol>
                {content.sections.map((section, i) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>
                      <span aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <ContentLink href={release.source}>
              Оригинальная хроника ↗
            </ContentLink>
          </aside>
          <div className={s.article} id="release-content">
            <p className={s.historyNote}>
              Историческая запись версии {version}. Значения и формулировки
              сохранены на момент обновления.
            </p>
            {content.sections.map((section, i) => (
              <section
                className={s.section}
                id={section.id}
                key={section.id}
                data-source-section={section.id}
              >
                <div className={s.sectionHead}>
                  <span className={s.sectionNumber} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>
                    {section.title
                      .split(/(?<=[a-z])(?=[A-Z])/)
                      .map((part, index) => (
                        <Fragment key={index}>
                          {index > 0 && <wbr />}
                          {part}
                        </Fragment>
                      ))}
                  </h2>
                </div>
                <div className={s.rich}>
                  <ChronicleText nodes={section.nodes} version={version} />
                  {mapCatalog
                    .filter(
                      (map) =>
                        map.chronicle?.version === version &&
                        map.chronicle.sectionId === section.id,
                    )
                    .map((map) => (
                      <p key={map.id} data-map-chronicle-link={map.id}>
                        <EntityLink id={map.id}>
                          Карта «{map.name}» в Wiki →
                        </EntityLink>
                      </p>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <nav className={s.versionNav} aria-label="Переходы между выпусками">
          {older && (
            <Link to={older.href!}>
              <small>← Предыдущий выпуск · {older.version}</small>
              <strong>{older.title}</strong>
            </Link>
          )}
          {newer && (
            <Link to={newer.href!}>
              <small>Следующий выпуск · {newer.version} →</small>
              <strong>{newer.title}</strong>
            </Link>
          )}
        </nav>
        <div className={s.bottomNav}>
          <Link to="/projects/maniac">← На страницу Maniac</Link>
          <a href="#chronicle-top">В начало ↑</a>
        </div>
      </div>
    </div>
  );
}
