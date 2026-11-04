import { useUrlFilter } from "../../../../shared/lib/use-url-filter";
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { characterEntries, roleLabel } from "./catalog";
import { WikiLayout } from "./WikiLayout";
import {
  CatalogHeader,
  CatalogSearch,
  CatalogResultCount,
  useCatalogSearch,
  CatalogGroup,
  catalogGroups,
} from "../ui/CatalogControls";
import { DifficultyStars } from "../ui/DifficultyStars";
import s from "./Wiki.module.css";
export function CharactersPage() {
  const { query, setQuery, matchesName } = useCatalogSearch();
  const [side, setSide] = useUrlFilter("side", "all");
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    setSide(
      hash === "#maniacs"
        ? "maniac"
        : hash === "#survivors"
          ? "survivor"
          : "all",
      true,
    );
  }, [hash]);
  const visible = characterEntries.filter(
    (c) => (side === "all" || c.data.role === side) && matchesName(c.name),
  );
  return (
    <WikiLayout>
      <div className={s.container}>
        <CatalogHeader
          label="ПЕРСОНАЖИ"
          title={
            <>
              Лица <em>охоты.</em>
            </>
          }
        >
          Персонажей в каталоге: {characterEntries.length}.
          <br />
          Найдите своего персонажа и изучите его правила игры.
        </CatalogHeader>
        <div className={s.filters}>
          <CatalogSearch
            label="Поиск персонажа"
            placeholder="Имя персонажа…"
            value={query}
            onChange={setQuery}
          />
          <fieldset>
            <legend>Сторона</legend>
            <div>
              {(
                [
                  ["all", "Все"],
                  ["maniac", "Маньяки"],
                  ["survivor", "Выжившие"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={side === value}
                  onClick={() => setSide(value)}
                >
                  {label} ·{" "}
                  {value === "all"
                    ? characterEntries.length
                    : characterEntries.filter(
                        (entry) => entry.data.role === value,
                      ).length}
                </button>
              ))}
            </div>
          </fieldset>
          <CatalogResultCount count={visible.length} />
        </div>
        <noscript>
          <p className={s.dataNote}>
            Для поиска и фильтров нужен JavaScript. Полный каталог доступен
            ниже.
          </p>
        </noscript>
        {(["maniac", "survivor"] as const).map((role) => {
          const group = visible.filter((c) => c.data.role === role);
          return group.length ? (
            <CatalogGroup
              key={role}
              {...catalogGroups[role]}
              count={group.length}
            >
              <div className={s.characterGrid}>
                {group.map((c) => (
                  <Link
                    key={c.id}
                    to={c.href}
                    className={s.characterCard}
                    data-side={role}
                    data-character={c.id}
                  >
                    <div className={s.cardArt}>
                      <img
                        src={c.fresco}
                        width="205"
                        height="480"
                        alt={`Фреска: ${c.name}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className={s.cardCopy}>
                      <p className={s.eyebrow}>{roleLabel(role)}</p>
                      <h3>{c.name}</h3>
                      <p>{c.data.description}</p>
                      <ul className={s.tags}>
                        {c.data.tags?.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                      <p className={s.difficulty}>
                        Сложность{" "}
                        {c.data.difficulty !== undefined && (
                          <DifficultyStars value={c.data.difficulty} />
                        )}
                      </p>
                      <span className={s.cardAction}>
                        Открыть досье <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CatalogGroup>
          ) : null;
        })}
        {!visible.length && (
          <div className={s.empty}>
            <h2>Никого не нашли</h2>
            <p>Попробуйте другое имя или выберите другую сторону.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSide("all");
              }}
            >
              Сбросить поиск
            </button>
          </div>
        )}
      </div>
    </WikiLayout>
  );
}
