import { Link } from "react-router";
import { getEntity, getRevision } from "../data/registry";
import {
  itemCatalog,
  mechanicCatalog,
  itemCategoryLabels,
  mechanicCategoryLabels,
} from "../data/systems-catalog";
import { entityAssets } from "../data/assets";
import { equipmentAssets } from "../data/equipment-assets";
import { sourceUrl, verifiedSource, sourceCommit } from "../data/snapshots";
import { EntityIcon } from "../ui/EntityIcon";
import { EntityStats } from "../ui/EntityCards";
import { RelatedLinks } from "../ui/RelatedLinks";
import { ContentLink } from "../../../../shared/ui/ContentLink";
import type { EntityId, Evidence } from "../data/types";
import { WikiLayout, DataNote } from "./WikiLayout";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
import a from "./Systems.module.css";
interface Article {
  id: string;
  description: string;
  sections: readonly { title: string; paragraphs: readonly string[] }[];
  notes: readonly string[];
  evidence: readonly Evidence[];
}
interface Picture {
  src: string;
  width: number;
  height: number;
  caption: string;
}
export function SystemsArticlePage({
  id,
  article,
  pictures = [],
}: {
  id: EntityId<"item" | "mechanic">;
  article: Article;
  pictures?: readonly Picture[];
}) {
  const entity = getEntity(id)!,
    revision = getRevision(id)!,
    isItem = entity.kind === "item";
  const entry = (isItem ? itemCatalog : mechanicCatalog).find(
    (e) => e.id === id,
  )!;
  const section = isItem ? "items" : "mechanics",
    label = isItem ? "Предметы" : "Механики",
    labels = isItem ? itemCategoryLabels : mechanicCategoryLabels;
  const asset = revision.data.icon
    ? entityAssets[revision.data.icon]
    : isItem
      ? equipmentAssets[entity.slug]
      : undefined;
  const versions = Object.keys(entity.revisions)
    .filter((key) => key.startsWith("release:"))
    .map((key) => key.slice(8));
  return (
    <WikiLayout>
      <div className={s.container}>
        <header className={r.articleHead}>
          <nav className={s.breadcrumb} aria-label="Путь к статье">
            <Link to="/projects/maniac/wiki">Wiki</Link>
            <span>/</span>
            <Link to={`/projects/maniac/wiki/${section}`}>{label}</Link>
            <span>/</span>
            <span>{entity.name}</span>
          </nav>
          <div className={r.titleRow}>
            {asset && (
              <div className={r.largeIcon}>
                <EntityIcon asset={asset} />
              </div>
            )}
            <div>
              <p className={s.eyebrow}>
                MANIAC WIKI / {isItem ? "ПРЕДМЕТ" : "МЕХАНИКА"}
              </p>
              <h1>{entity.name}</h1>
              <ul className={s.tags}>
                <li>{labels[entry.category]}</li>
              </ul>
            </div>
          </div>
        </header>
        <DataNote />
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОЙ СТАТЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#overview">01 · Назначение</a>
              {article.sections.map((sec, i) => (
                <a href={`#section-${i}`} key={sec.title}>
                  {String(i + 2).padStart(2, "0")} · {sec.title}
                </a>
              ))}
              <a href="#related">Связанные материалы</a>
              <a href="#sources">Источники</a>
            </nav>
            <Link to={`/projects/maniac/wiki/${section}`}>← {label}</Link>
          </aside>
          <div className={s.articleContent}>
            <section className={s.articleSection} id="overview">
              <p className={s.eyebrow}>
                {isItem ? "ИГРОВОЕ НАЗНАЧЕНИЕ" : "ПРАВИЛА И ВЗАИМОДЕЙСТВИЯ"}
              </p>
              <h2>{isItem ? "Что это" : "Основное правило"}</h2>
              <p className={r.fullDescription}>{article.description}</p>
              {!!revision.data.stats?.length && (
                <EntityStats stats={revision.data.stats} />
              )}
            </section>
            {article.sections.map((sec, i) => (
              <section
                className={s.articleSection}
                id={`section-${i}`}
                key={sec.title}
              >
                <h2>{sec.title}</h2>
                {sec.paragraphs.map((paragraph, k) => (
                  <p className={r.fullDescription} key={k}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
            {!!pictures.length && (
              <section
                className={s.articleSection}
                aria-label="Иллюстрации из игрового руководства"
              >
                {pictures.map((picture) => (
                  <figure className={a.figure} key={picture.src}>
                    <img
                      src={picture.src}
                      width={picture.width}
                      height={picture.height}
                      alt={picture.caption}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{picture.caption}</figcaption>
                  </figure>
                ))}
              </section>
            )}
            <section className={s.articleSection} id="related">
              <p className={s.eyebrow}>СВЯЗИ В ЭНЦИКЛОПЕДИИ</p>
              <h2>Связанные материалы</h2>
              <RelatedLinks id={id} />
              {versions.map((v) => (
                <Link
                  key={v}
                  className={s.chronicleLink}
                  to={`/projects/maniac/changelog/${v}`}
                >
                  <strong>Хроника {v}</strong>
                  <span>Историческое состояние →</span>
                </Link>
              ))}
            </section>
            <section className={s.articleSection} id="sources">
              <details className={s.sources}>
                <summary>Проверенные источники и ограничения</summary>
                <p>
                  Снимок исходников <code>{sourceCommit.slice(0, 7)}</code>.
                  Совпадение всего баланса с публичным ZIP 1.2 не заявляется.
                </p>
                {article.notes.map((note, i) => (
                  <p key={i}>{note}</p>
                ))}
                {"registryIds" in entry && (
                  <p>
                    Registry ID:{" "}
                    {entry.registryIds.length
                      ? entry.registryIds.join(", ")
                      : "Составной набор или ванильная запись справочника, не отдельный ModItems ID."}
                  </p>
                )}
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
            <Link
              className={s.textLink}
              to={`/projects/maniac/wiki/${section}`}
            >
              ← Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    </WikiLayout>
  );
}
