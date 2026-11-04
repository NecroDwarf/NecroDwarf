import { StatText } from "../ui/StatText";
import { RelatedEffects } from "../ui/RelatedEffects";
import { WikiText } from "../ui/WikiText";
import {
  currentDescription,
  formatGameText,
} from "../data/current-descriptions";
import { WikiBreadcrumb } from "../ui/WikiBreadcrumb";
import { Link } from "react-router";
import { BackLink } from "../../../../shared/ui/ContentLink";
import { getEntity, getRevision } from "../data/registry";
import { referenceChronicles } from "../data/reference-chronicles";
import { EntityIcon } from "../ui/EntityIcon";
import { entityAssets } from "../data/assets";
import { EntityStats } from "../ui/EntityCards";
import { EntityLink } from "../ui/EntityLink";
import { GameGlyph } from "../ui/GameGlyph";
import { RelatedLinks } from "../ui/RelatedLinks";
import type { EntityId, Evidence } from "../data/types";
import {
  typeLabels,
  phaseLabels,
  teamLabels,
  typeDescriptions,
  abilityLabels,
} from "./reference-labels";
import { WikiLayout } from "./WikiLayout";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
interface Article {
  id: string;
  description: string;
  conditions: readonly string[];
  availability: { mana?: string; cooldown?: string };
  notes: readonly string[];
  evidence: readonly Evidence[];
}
export function ReferenceArticlePage({
  id,
  article,
}: {
  id: EntityId<"perk" | "ability">;
  article: Article;
}) {
  const entity = getEntity(id)!;
  const revision = getRevision(id)!;
  const data = revision.data;
  const perk =
    entity.kind === "perk"
      ? getRevision(id as EntityId<"perk">)!.data
      : undefined;
  const ability =
    entity.kind === "ability"
      ? getRevision(id as EntityId<"ability">)!.data
      : undefined;
  const section = perk ? "perks" : "abilities";
  const label = perk ? "Перки" : "Способности";
  const asset = data.icon ? entityAssets[data.icon] : undefined;
  const releases = referenceChronicles(entity);
  return (
    <WikiLayout>
      <div className={s.container}>
        <header className={r.articleHead}>
          <WikiBreadcrumb
            section={section}
            label={label}
            name={entity.name}
            ariaLabel="Путь к статье"
          />
          <div className={r.titleRow}>
            {asset ? (
              <div className={r.largeIcon}>
                <EntityIcon asset={asset} />
              </div>
            ) : (
              <span className={r.largeFallback} aria-hidden="true">
                <GameGlyph name="sanity" />
              </span>
            )}
            <div>
              <p className={s.eyebrow}>
                MANIAC WIKI / {perk ? "ПЕРК" : "СПОСОБНОСТЬ"}
              </p>
              <h1>{entity.name}</h1>
              <ul className={s.tags}>
                {perk && (
                  <>
                    <li>{teamLabels[perk.team!]}</li>
                    <li>{typeLabels[perk.perkType!]}</li>
                  </>
                )}
                {ability && <li>{abilityLabels[ability.abilityKind!]}</li>}
              </ul>
            </div>
          </div>
        </header>
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОЙ СТАТЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#effect">01 · Действие</a>
              <a href="#parameters">02 · Характеристики</a>
              <a href="#conditions">03 · Условия</a>
              <a href="#related">04 · Связанные материалы</a>
            </nav>
            <BackLink to={`/projects/maniac/wiki/${section}`}>{label}</BackLink>
          </aside>
          <div className={s.articleContent}>
            <section className={s.articleSection} id="effect">
              <p className={s.eyebrow}>ИГРОВОЕ ДЕЙСТВИЕ</p>
              <h2>Эффект</h2>
              <p className={r.fullDescription}>
                <WikiText text={currentDescription(id, article.description)} />
              </p>
            </section>
            <section className={s.articleSection} id="parameters">
              <p className={s.eyebrow}>ПАРАМЕТРЫ</p>
              <h2>Характеристики</h2>
              {!!data.stats?.length && <EntityStats stats={data.stats} />}
              <dl className={r.availability}>
                {!(data.stats ?? []).some((v) => v.key === "mana") && (
                  <div>
                    <dt>Мана</dt>
                    <dd>
                      <StatText
                        text={formatGameText(
                          article.availability.mana ??
                            "Для этого действия не указана",
                        )}
                      />
                    </dd>
                  </div>
                )}
                {!(data.stats ?? []).some((v) => v.key === "cooldown") && (
                  <div>
                    <dt>Перезарядка</dt>
                    <dd>
                      <StatText
                        text={formatGameText(
                          article.availability.cooldown ??
                            "Для этого действия не указана",
                        )}
                      />
                    </dd>
                  </div>
                )}
              </dl>
            </section>
            <section className={s.articleSection} id="conditions">
              <p className={s.eyebrow}>ПРИМЕНЕНИЕ И ОГРАНИЧЕНИЯ</p>
              <h2>Как использовать</h2>
              {perk && (
                <>
                  <p className={r.fullDescription}>
                    {typeDescriptions[perk.perkType!]}
                  </p>
                  <div className={r.phaseBox}>
                    <strong>Доступные фазы</strong>
                    <ul className={s.tags}>
                      {perk.phases!.map((phase) => (
                        <li key={phase}>{phaseLabels[phase]}</li>
                      ))}
                    </ul>
                    <p>
                      «Любая игровая фаза» не означает доступность в прелобби.
                      Для активируемых перков базовый класс также требует режим
                      приключения.
                    </p>
                  </div>
                </>
              )}
              {article.conditions.length > 0 && (
                <ul className={r.conditions}>
                  {article.conditions.map((text) => (
                    <li key={text}>
                      <WikiText text={formatGameText(text)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className={s.articleSection} id="related">
              <p className={s.eyebrow}>СВЯЗИ В ЭНЦИКЛОПЕДИИ</p>
              <h2>Связанные материалы</h2>
              <RelatedEffects entityId={id} />
              <RelatedLinks
                id={id}
                exclude={[
                  ...(ability?.characterIds ?? []),
                  ...(ability?.itemIds ?? []),
                  ...data.mechanicIds,
                ]}
              />
              {ability?.characterIds?.map((owner) => (
                <p key={owner}>
                  Персонаж:{" "}
                  <span className={s.textLink}>
                    <EntityLink id={owner} />
                  </span>
                </p>
              ))}
              {!!ability?.itemIds?.length && (
                <>
                  <h3>Снаряжение</h3>
                  <ul>
                    {ability.itemIds.map((item) => (
                      <li key={item}>
                        <EntityLink id={item} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!!data.mechanicIds.length && (
                <>
                  <h3>Механики</h3>
                  <ul>
                    {data.mechanicIds.map((mechanic) => (
                      <li key={mechanic}>
                        <EntityLink id={mechanic} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {releases.map((release) => (
                <Link
                  className={s.chronicleLink}
                  key={release.version}
                  to={release.href}
                >
                  <span>ХРОНИКИ {release.version}</span>
                  <strong>{release.title}</strong>
                  <span>Исторические значения на момент выпуска →</span>
                </Link>
              ))}
              {!ability?.characterIds?.length && !releases.length && (
                <p className={s.sectionIntro}>
                  Перк доступен по своей игровой стороне. Конкретному персонажу
                  автоматически не назначается.
                </p>
              )}
            </section>
            <BackLink to={`/projects/maniac/wiki/${section}`}>
              Вернуться в каталог
            </BackLink>
          </div>
        </div>
      </div>
    </WikiLayout>
  );
}
