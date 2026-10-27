import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { characterEntries, roleLabel } from "./catalog";
import { WikiLayout, DataNote } from "./WikiLayout";
import { DifficultyStars } from "../ui/DifficultyStars";
import s from "./Wiki.module.css";
type Side = "all" | "maniac" | "survivor";
export function CharactersPage() {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<Side>("all");
  const { hash } = useLocation();
  useEffect(() => {
    setSide(
      hash === "#maniacs"
        ? "maniac"
        : hash === "#survivors"
          ? "survivor"
          : "all",
    );
  }, [hash]);
  const normalize = (text: string) =>
    text.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
  const visible = characterEntries.filter(
    (c) =>
      (side === "all" || c.data.role === side) &&
      normalize(c.name).includes(normalize(query)),
  );
  return (
    <WikiLayout>
      <div className={s.container}>
        <header className={s.catalogHead}>
          <p className={s.eyebrow}>MANIAC WIKI / ПЕРСОНАЖИ</p>
          <h1>
            Лица <em>охоты.</em>
          </h1>
          <p className={s.lead}>
            Пятнадцать способов изменить ход матча.
            <br />
            Найдите своего персонажа и изучите его правила игры.
          </p>
        </header>
        <div className={s.filters}>
          <label className={s.search}>
            Поиск персонажа
            <input
              type="search"
              placeholder="Имя персонажа…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <fieldset>
            <legend>Сторона</legend>
            <div>
              {(
                [
                  ["all", "Все · 15"],
                  ["maniac", "Маньяки · 8"],
                  ["survivor", "Выжившие · 7"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={side === value}
                  onClick={() => setSide(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <p role="status" aria-live="polite">
            Найдено: {visible.length}
          </p>
        </div>
        <noscript>
          <p className={s.dataNote}>
            Для поиска и фильтров нужен JavaScript. Полный каталог доступен
            ниже.
          </p>
        </noscript>
        <DataNote />
        {(["maniac", "survivor"] as const).map((role) => {
          const group = visible.filter((c) => c.data.role === role);
          return group.length ? (
            <section
              className={s.section}
              id={role === "maniac" ? "maniacs" : "survivors"}
              key={role}
            >
              <div className={s.sectionHeading}>
                <div>
                  <p className={s.eyebrow}>
                    {role === "maniac"
                      ? "ПРЕСЛЕДУЙ / КОНТРОЛИРУЙ"
                      : "ВЫЖИВАЙ / ПОМОГАЙ"}
                  </p>
                  <h2>
                    {role === "maniac" ? "Маньяки" : "Выжившие"}{" "}
                    <span className={s.counter}>
                      {group.length.toString().padStart(2, "0")}
                    </span>
                  </h2>
                </div>
              </div>
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
            </section>
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
