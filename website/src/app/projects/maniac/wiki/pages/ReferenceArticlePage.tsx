import { Link } from "react-router";
import { ContentLink } from "../../../../shared/ui/ContentLink";
import { getEntity, getRevision } from "../data/registry";
import { EntityIcon } from "../ui/EntityIcon";
import { entityAssets } from "../data/assets";
import { EntityStats } from "../ui/EntityCards";
import { EntityLink } from "../ui/EntityLink";
import { GameGlyph } from "../ui/GameGlyph";
import { sourceUrl, verifiedSource, sourceCommit } from "../data/snapshots";
import type { EntityId, Evidence } from "../data/types";
import {
  typeLabels,
  phaseLabels,
  teamLabels,
  typeDescriptions,
  abilityLabels,
} from "./reference-labels";
import { WikiLayout, DataNote } from "./WikiLayout";
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
const reforgeIds = new Set([
  "ejection",
  "family-discord",
  "griefer",
  "silence",
  "independence",
  "altruist-exe",
  "magic-lover",
  "dutch-helm",
  "idealych",
  "mental-bond",
  "football-fan",
  "hedgehog-skin",
  "mana-break",
  "bigmoney",
  "fear-wave",
  "megamind",
  "gto-medal",
  "computer-breaker",
  "blindness",
  "i-am-speed",
  "last-breath",
  "mimic",
  "quick-reflexes",
  "wallhack",
  "catch-mistakes",
]);
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
  const releases = entity.revisions["release:1.2"]
    ? ["1.2"]
    : entity.revisions["release:1.1"]
      ? ["1.1"]
      : perk && reforgeIds.has(entity.slug)
        ? ["1.0"]
        : [];
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
        <DataNote />
        <div className={s.articleLayout}>
          <aside className={s.articleNav}>
            <p className={s.eyebrow}>В ЭТОЙ СТАТЬЕ</p>
            <nav aria-label="Содержание статьи">
              <a href="#effect">01 · Действие</a>
              <a href="#parameters">02 · Характеристики</a>
              <a href="#conditions">03 · Условия</a>
              <a href="#related">04 · Связанные материалы</a>
              <a href="#sources">Источники</a>
            </nav>
            <Link to={`/projects/maniac/wiki/${section}`}>← {label}</Link>
          </aside>
          <div className={s.articleContent}>
            <section className={s.articleSection} id="effect">
              <p className={s.eyebrow}>ИГРОВОЕ ДЕЙСТВИЕ</p>
              <h2>Эффект</h2>
              <p className={r.fullDescription}>{article.description}</p>
            </section>
            <section className={s.articleSection} id="parameters">
              <p className={s.eyebrow}>ПОДТВЕРЖДЁННЫЕ ПАРАМЕТРЫ</p>
              <h2>Характеристики</h2>
              {!!data.stats?.length && <EntityStats stats={data.stats} />}
              <dl className={r.availability}>
                {!(data.stats ?? []).some((v) => v.key === "mana") && (
                  <div>
                    <dt>Мана</dt>
                    <dd>
                      {article.availability.mana ??
                        "Для этого действия не указана"}
                    </dd>
                  </div>
                )}
                {!(data.stats ?? []).some((v) => v.key === "cooldown") && (
                  <div>
                    <dt>Перезарядка</dt>
                    <dd>
                      {article.availability.cooldown ??
                        "Для этого действия не указана"}
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
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              )}
              <p className={s.sectionIntro}>
                Условия срабатывания, накопления и расходования ресурсов указаны
                в описании эффекта. Динамический результат не считается
                постоянной характеристикой.
              </p>
            </section>
            <section className={s.articleSection} id="related">
              <p className={s.eyebrow}>СВЯЗИ В ЭНЦИКЛОПЕДИИ</p>
              <h2>Связанные материалы</h2>
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
              {releases.map((version) => (
                <Link
                  className={s.chronicleLink}
                  key={version}
                  to={`/projects/maniac/changelog/${version}`}
                >
                  <span>ХРОНИКИ {version}</span>
                  <strong>
                    {version === "1.2"
                      ? "Flower Cleaning"
                      : version === "1.1"
                        ? "Кошмарный додеп"
                        : "Maniac Reforge"}
                  </strong>
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
            <section className={s.articleSection} id="sources">
              <details className={s.sources}>
                <summary>Проверенные источники и различия</summary>
                <p>
                  Снимок исходников <code>{sourceCommit.slice(0, 7)}</code>.
                  Значения не объявлены идентичными публичному ZIP 1.2.
                </p>
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
