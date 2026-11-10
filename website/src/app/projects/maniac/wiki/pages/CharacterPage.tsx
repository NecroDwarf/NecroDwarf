import { WikiText } from "../ui/WikiText";
import { formatGameText } from "../data/current-descriptions";
import { WikiBreadcrumb } from "../ui/WikiBreadcrumb";
import type { ReactNode } from "react";
import {
  IntegratedMechanics,
  type IntegratedMechanic,
} from "../ui/IntegratedMechanics";
import { removedCatalogEntries } from "../mechanic-placement";
import { Link } from "react-router";
import { RelatedLinks } from "../ui/RelatedLinks";
import { RelatedEffects } from "../ui/RelatedEffects";
import { BackLink } from "../../../../shared/ui/ContentLink";
import { getEntity, getRevision } from "../data/registry";
import { relatedEntityIds } from "../data/relations";
import { publishedEntityRoutes } from "../data/publication";
import { effectConnections } from "../data/effect-connections";
import { publishedEffectMeta } from "../published-effects";
import type { EntityId } from "../data/types";
import { AbilityCard, ItemCard } from "../ui/EntityCards";
import { DifficultyStars } from "../ui/DifficultyStars";
import { characterChronicles } from "../data/character-chronicles";
import { releases } from "../../changelogs/registry";
import { WikiLayout } from "./WikiLayout";
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
  systems = [],
}: {
  id: EntityId<"character">;
  article: Article;
  fresco: { src: string; width: number; height: number };
  children?: ReactNode;
  systems?: readonly IntegratedMechanic[];
}) {
  const entity = getEntity(id)!;
  const revision = getRevision(id)!;
  const data = revision.data;
  const history = characterChronicles[id] ?? [];
  const hasHistory = history.length > 0;
  const relatedExclude: EntityId[] = [
    ...data.itemIds,
    ...data.abilityIds,
    ...systems.map(({ article }) => article.id as EntityId),
  ];
  const hasRelated =
    relatedEntityIds(id).some(
      (target) =>
        publishedEntityRoutes[target] && !relatedExclude.includes(target),
    ) ||
    publishedEffectMeta.some((effect) =>
      effectConnections[effect.id]?.includes(id),
    );
  return (
    <WikiLayout>
      <header className={s.characterHero} data-side={data.role}>
        <div>
          <WikiBreadcrumb
            section="characters"
            label="Персонажи"
            name={entity.name}
            ariaLabel="Путь к персонажу"
          />
          <p className={s.eyebrow}>
            {data.role === "maniac" ? "Маньяк" : "Выживший"} / ДОСЬЕ ПЕРСОНАЖА
          </p>
          <h1>{entity.name}</h1>
          <p className={s.lead}>
            <WikiText text={data.description} />
          </p>
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
            alt={`Фреска: ${entity.name}`}
            fetchPriority="high"
          />
        </div>
      </header>
      <div className={s.container}>
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОМ ДОСЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#features">01 · Особенности</a>
              {systems.length > 0 && <a href="#systems">Механики персонажа</a>}
              {data.abilityIds.length > 0 && (
                <a href="#abilities">02 · Способности</a>
              )}
              <a href="#equipment">03 · Снаряжение</a>
              {children && <a href="#model">04 · 3D-модель</a>}
              {hasHistory && <a href="#chronicles">05 · Хроники</a>}
              {hasRelated && <a href="#related">Связанные материалы</a>}
            </nav>
            <BackLink to="/projects/maniac/wiki/characters">
              Все персонажи
            </BackLink>
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
                    <p>
                      <WikiText text={formatGameText(f.description)} />
                    </p>
                  </article>
                ))}
              </div>
            </section>
            {systems.length > 0 && (
              <section className={s.articleSection} id="systems">
                <h2>Механики персонажа</h2>
                <IntegratedMechanics entries={systems} />
              </section>
            )}
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
                {data.itemIds
                  .filter((item) => !removedCatalogEntries.has(item))
                  .map((item) => (
                    <ItemCard key={item} id={item} provenance="deferred" />
                  ))}
              </div>
            </section>
            {children && (
              <section className={s.articleSection} id="model">
                <p className={s.eyebrow}>ВЗГЛЯД СО ВСЕХ СТОРОН</p>
                <h2>3D-модель</h2>
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
              </section>
            )}
            {hasRelated && (
              <section className={s.articleSection} id="related">
                <h2>Связанные материалы</h2>
                <RelatedEffects entityId={id} />
                <RelatedLinks id={entity.id} exclude={relatedExclude} />
              </section>
            )}
            <BackLink to="/projects/maniac/wiki/characters">
              Вернуться к персонажам
            </BackLink>
          </div>
        </div>
      </div>
    </WikiLayout>
  );
}
