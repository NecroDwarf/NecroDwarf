import { RelatedEffects } from "../ui/RelatedEffects";
import { useUrlFilter } from "../../../../shared/lib/use-url-filter";
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { effects } from "../data/effects";
import { sourceUrl, verifiedSource } from "../data/snapshots";
import {
  CatalogGroup,
  CatalogHeader,
  CatalogSearch,
  CatalogResultCount,
  useCatalogSearch,
} from "../ui/CatalogControls";
import { CatalogSelect } from "../ui/CatalogSelect";
import { EffectDescription } from "../ui/EffectDescription";
import { ContentLink } from "../../../../shared/ui/ContentLink";
import { WikiLayout, DataNote } from "./WikiLayout";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
import e from "./Effects.module.css";

const categories = [
  { value: "BENEFICIAL", id: "beneficial", label: "Положительные" },
  { value: "HARMFUL", id: "harmful", label: "Отрицательные" },
  { value: "NEUTRAL", id: "neutral", label: "Нейтральные" },
] as const;

export function EffectsPage() {
  const { query, setQuery, matchesName } = useCatalogSearch();
  const [category, setCategory] = useUrlFilter("category", "");
  const { hash } = useLocation();
  useEffect(() => {
    const id = hash.slice(1);
    if (!effects.some((effect) => effect.id === id)) return;
    // A menu/deep link must reveal its target even after catalog filtering.
    setQuery("", true);
    setCategory("", true);
  }, [hash, setQuery]);
  const visible = effects.filter(
    (effect) =>
      matchesName(`${effect.name} ${effect.id}`) &&
      (!category || effect.category === category),
  );
  const reset = () => {
    setQuery("");
    setCategory("");
  };
  return (
    <WikiLayout>
      <div className={s.container}>
        <CatalogHeader
          label="ЭФФЕКТЫ"
          title={
            <>
              Состояния <em>охоты.</em>
            </>
          }
        >
          {effects.length} эффекта Maniac: усиления, ослабления и особые
          состояния.
        </CatalogHeader>
        <div className={s.filters}>
          <CatalogSearch
            value={query}
            onChange={setQuery}
            placeholder="Название или ID эффекта…"
          />
          <CatalogSelect
            label="Тип эффекта"
            ariaLabel="Тип эффекта"
            value={category}
            onChange={setCategory}
          >
            <option value="">Все типы</option>
            {categories.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </CatalogSelect>
          <CatalogResultCount count={visible.length} />
        </div>
        <DataNote />
        <p className={s.lead}>
          Длительность и сила эффекта зависят от предмета, перка или
          способности, которые его накладывают.
        </p>
        <Link
          className={s.textLink}
          to="/projects/maniac/wiki/mechanics/status-effects"
        >
          Как работают эффекты и состояния →
        </Link>
        {(query || category) && visible.length > 0 && (
          <p>
            <button type="button" className={r.reset} onClick={reset}>
              Сбросить фильтры
            </button>
          </p>
        )}
        <noscript>
          <p>
            Без JavaScript доступны все эффекты. Поиск и фильтры требуют
            JavaScript.
          </p>
        </noscript>
        {categories.map((group) => {
          const entries = visible.filter(
            (effect) => effect.category === group.value,
          );
          return (
            <CatalogGroup
              key={group.id}
              {...group}
              kicker="КАСТОМНЫЕ ЭФФЕКТЫ МОДА"
              count={entries.length}
            >
              <div className={r.referenceGrid}>
                {entries.map((effect) => (
                  <article
                    className={e.card}
                    id={effect.id}
                    key={effect.id}
                    data-effect-id={effect.id}
                  >
                    <div className={r.cardHeading}>
                      {effect.icon && (
                        <img
                          className={e.icon}
                          src={effect.icon}
                          alt=""
                          width="48"
                          height="48"
                          loading="lazy"
                        />
                      )}
                      <h3>
                        <a href={`#${effect.id}`}>{effect.name}</a>
                      </h3>
                    </div>
                    <EffectDescription parts={effect.description} />
                    <RelatedEffects effectId={effect.id} />
                    <details className={e.sources}>
                      <summary>Проверенные источники</summary>
                      <p>
                        Игровой ID: <code>maniacrev:{effect.id}</code>
                      </p>
                      {!effect.icon && (
                        <p>Отдельная иконка в проверенном снимке не найдена.</p>
                      )}
                      <ul>
                        {effect.evidence.map((path) => (
                          <li key={path}>
                            <ContentLink
                              href={sourceUrl(path, verifiedSource)!}
                            >
                              {path.split("/").at(-1)}
                            </ContentLink>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </article>
                ))}
              </div>
            </CatalogGroup>
          );
        })}
        {!visible.length && (
          <div className={s.empty}>
            <h2>Ничего не найдено</h2>
            <p>Измените запрос или сбросьте фильтры.</p>
            <button type="button" onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </WikiLayout>
  );
}
