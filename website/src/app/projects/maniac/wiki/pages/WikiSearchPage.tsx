import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useUrlFilter } from "../../../../shared/lib/use-url-filter";
import { wikiSections } from "../sections";
import { CatalogHeader } from "../ui/CatalogControls";
import { WikiLayout } from "./WikiLayout";
import s from "./Wiki.module.css";
import search from "./WikiSearch.module.css";

type SearchModule = typeof import("../search-index");
export function WikiSearchPage() {
  const [query, setQuery] = useUrlFilter("q");
  const [index, setIndex] = useState<SearchModule>();
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    setFailed(false);
    void import("../search-index").then(
      (module) => {
        if (active) setIndex(module);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);
  const results = index?.findWikiEntries(query) ?? [];
  const hasQuery = Boolean(query.trim());
  return (
    <WikiLayout searchQuery={query}>
      <div className={s.container}>
        <CatalogHeader
          label="ПОИСК"
          title={
            <>
              Найдите <em>ответ.</em>
            </>
          }
        >
          Единый поиск по персонажам, перкам, способностям, предметам,
          механикам, картам и эффектам.
        </CatalogHeader>
        <form
          className={search.form}
          role="search"
          aria-label="Поиск по Maniac Wiki"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className={search.label} htmlFor="wiki-search">
            Название или ID статьи
          </label>
          <div className={search.controls}>
            <input
              id="wiki-search"
              ref={input}
              type="search"
              value={query}
              placeholder="Например, Учёный или розовые очки…"
              autoComplete="off"
              aria-describedby="wiki-search-help"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setQuery("");
                  input.current?.focus();
                }
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
              >
                Очистить
              </button>
            )}
          </div>
          <p id="wiki-search-help">
            Регистр и е/ё не влияют на поиск. Escape очищает запрос.
          </p>
        </form>
        {!index && (
          <p>
            Поиск требует JavaScript. Все материалы доступны в разделах ниже.
          </p>
        )}
        <p role="status" aria-live="polite" aria-atomic="true">
          {failed
            ? "Не удалось загрузить поиск. Откройте раздел или повторите попытку."
            : !index
              ? "Можно открыть раздел ниже или дождаться загрузки поиска."
              : hasQuery
                ? `Найдено: ${results.length}`
                : "Введите название или выберите раздел энциклопедии."}
        </p>
        {failed && (
          <button
            type="button"
            className={search.retry}
            onClick={() => window.location.reload()}
          >
            Перезагрузить поиск
          </button>
        )}
        {index && hasQuery && !results.length && (
          <div className={s.empty}>
            <h2>Ничего не найдено</h2>
            <p>Попробуйте другое название или откройте нужный раздел ниже.</p>
          </div>
        )}
        {wikiSections
          .filter((section) => !["overview", "search"].includes(section.id))
          .map((section) => {
            const entries = results.filter(
              (entry) => entry.section === section.id,
            );
            return entries.length ? (
              <section
                key={section.id}
                className={search.group}
                aria-labelledby={`search-${section.id}`}
              >
                <h2 id={`search-${section.id}`}>
                  {section.label}{" "}
                  <span className={s.counter}>{entries.length}</span>
                </h2>
                <ul>
                  {entries.map((entry) => (
                    <li key={entry.href}>
                      <Link to={entry.href}>
                        {entry.name}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null;
          })}
        <nav className={search.sections} aria-label="Разделы энциклопедии">
          <h2>Разделы энциклопедии</h2>
          <ul>
            {wikiSections
              .filter((section) => !["overview", "search"].includes(section.id))
              .map((section) => (
                <li key={section.id}>
                  <Link to={section.href}>{section.label} →</Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </WikiLayout>
  );
}
