import type { ReactNode } from "react";
import { Link } from "react-router";
import { RelatedLinks } from "../ui/RelatedLinks";
import { ContentLink } from "../../../../shared/ui/ContentLink";
import { getEntity, getRevision } from "../data/registry";
import { sourceUrl, sourceCommit, verifiedSource } from "../data/snapshots";
import type { EntityId } from "../data/types";
import { AbilityCard, ItemCard } from "../ui/EntityCards";
import { DifficultyStars } from "../ui/DifficultyStars";
import { characterChronicles } from "../data/character-chronicles";
import { releases } from "../../changelogs/registry";
import { WikiLayout, DataNote } from "./WikiLayout";
import s from "./Wiki.module.css";
interface Article {
  gameId: string;
  features: readonly { name: string; description: string }[];
}
export function CharacterPage({
  id,
  article,
  fresco,
  children,
}: {
  id: EntityId<"character">;
  article: Article;
  fresco: { src: string; width: number; height: number };
  children?: ReactNode;
}) {
  const entity = getEntity(id)!;
  const revision = getRevision(id)!;
  const data = revision.data;
  const history = characterChronicles[id] ?? [];
  const hasHistory = history.length > 0;
  return (
    <WikiLayout>
      <header className={s.characterHero} data-side={data.role}>
        <div>
          <nav className={s.breadcrumb} aria-label="Путь к персонажу">
            <Link to="/projects/maniac/wiki">Wiki</Link>
            <span>/</span>
            <Link to="/projects/maniac/wiki/characters">Персонажи</Link>
            <span>/</span>
            <span>{entity.name}</span>
          </nav>
          <p className={s.eyebrow}>
            {data.role === "maniac" ? "Маньяк" : "Выживший"} / ДОСЬЕ ПЕРСОНАЖА
          </p>
          <h1>{entity.name}</h1>
          <p className={s.lead}>{data.description}</p>
          <ul className={s.tags}>
            {data.tags?.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className={s.heroDifficulty}>
            Сложность{" "}
            {data.difficulty !== undefined && (
              <DifficultyStars value={data.difficulty} />
            )}
            <small>По игровому справочнику</small>
          </p>
          <blockquote>«{data.sourceDescription}»</blockquote>
          <a className={s.textLink} href="#features">
            Изучить персонажа ↓
          </a>
        </div>
        <div className={s.heroFresco}>
          <img
            src={fresco.src}
            width={fresco.width}
            height={fresco.height}
            alt={`Оригинальная фреска: ${entity.name}`}
            fetchPriority="high"
          />
          <span>ОРИГИНАЛЬНАЯ ФРЕСКА / MANIAC</span>
        </div>
      </header>
      <div className={s.container}>
        <DataNote />
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОМ ДОСЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#features">01 · Особенности</a>
              {data.abilityIds.length > 0 && (
                <a href="#abilities">02 · Способности</a>
              )}
              <a href="#equipment">03 · Снаряжение</a>
              {children && <a href="#model">04 · 3D-модель</a>}
              {hasHistory && <a href="#chronicles">05 · Хроники</a>}
              <a href="#sources">Источники</a>
            </nav>
            <Link to="/projects/maniac/wiki/characters">← Все персонажи</Link>
          </aside>
          <div className={s.articleContent}>
            <section className={s.articleSection} id="features">
              <p className={s.eyebrow}>ОСОБЕННОСТИ ИГРЫ</p>
              <h2>Как играет {entity.name}</h2>
              <div className={s.featureGrid}>
                {article.features.map((f, i) => (
                  <article key={f.name} className={s.featureCard}>
                    <span className={s.featureIndex}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{f.name}</h3>
                    <p>{f.description}</p>
                  </article>
                ))}
              </div>
            </section>
            {data.abilityIds.length > 0 && (
              <section className={s.articleSection} id="abilities">
                <p className={s.eyebrow}>ОСОБЫЕ ДЕЙСТВИЯ</p>
                <h2>Способности</h2>
                <div className={s.entityGrid}>
                  {data.abilityIds.map((ability) => (
                    <AbilityCard
                      key={ability}
                      id={ability}
                      provenance="deferred"
                    />
                  ))}
                </div>
              </section>
            )}
            <section className={s.articleSection} id="equipment">
              <p className={s.eyebrow}>ПРЕДМЕТЫ И ЭКИПИРОВКА</p>
              <h2>Снаряжение</h2>
              <p className={s.sectionIntro}>
                Предметы из игрового справочника персонажа. Среди них могут быть
                ресурсы, которые выдаются по ходу матча или используются другими
                участниками испытаний.
              </p>
              <div className={s.entityGrid}>
                {data.itemIds.map((item) => (
                  <ItemCard key={item} id={item} provenance="deferred" />
                ))}
              </div>
            </section>
            {children && (
              <section className={s.articleSection} id="model">
                <p className={s.eyebrow}>ВЗГЛЯД СО ВСЕХ СТОРОН</p>
                <h2>Оригинальная 3D-модель</h2>
                <p className={s.sectionIntro}>
                  Одна модель Хранителя, без дополнительных форм. Загрузите её,
                  чтобы рассмотреть детали, повернуть и приблизить.
                </p>
                {children}
              </section>
            )}
            {hasHistory && (
              <section className={s.articleSection} id="chronicles">
                <p className={s.eyebrow}>СЛЕД В ИСТОРИИ</p>
                <h2>Связанные хроники</h2>
                {history.map((entry) => (
                  <Link
                    key={entry.version + entry.anchor}
                    className={s.chronicleLink}
                    to={`/projects/maniac/changelog/${entry.version}#${entry.anchor}`}
                  >
                    <span>ВЫПУСК {entry.version}</span>
                    <strong>
                      {releases.find((r) => r.version === entry.version)!.title}
                    </strong>
                    <span>{entry.label} →</span>
                  </Link>
                ))}
                <p className={s.sectionIntro}>
                  Хроника сохраняет характеристики на момент выпуска. Сведения
                  этой статьи проверены отдельно по исходникам.
                </p>
              </section>
            )}
            <section className={s.articleSection} id="sources">
              <RelatedLinks
                id={entity.id}
                exclude={[...data.itemIds, ...data.abilityIds]}
              />
              <details className={s.sources}>
                <summary>Об этой статье и источниках</summary>
                <p>
                  Снимок исходников <code>{sourceCommit.slice(0, 7)}</code>. Он
                  не подтверждает идентичность значений скачиваемому архиву
                  Flower Cleaning 1.2.
                </p>
                <p>
                  Имена, теги, сложность, особенности и предметы сверены с
                  классом персонажа и русской локализацией. Указанная сложность
                  — игровая шкала от 1 до 5.
                </p>
                <ul>
                  {revision.evidence.map((ev) => (
                    <li key={ev.path}>
                      <ContentLink href={sourceUrl(ev.path, verifiedSource)!}>
                        {ev.path.split("/").at(-1)}
                      </ContentLink>
                    </li>
                  ))}
                </ul>
                <p>
                  Фреска сопоставлена по игровому ID{" "}
                  <code>{article.gameId}</code>. Её композиция сохранена
                  целиком.
                </p>
              </details>
            </section>
            <Link className={s.textLink} to="/projects/maniac/wiki/characters">
              ← Вернуться к персонажам
            </Link>
          </div>
        </div>
      </div>
    </WikiLayout>
  );
}
