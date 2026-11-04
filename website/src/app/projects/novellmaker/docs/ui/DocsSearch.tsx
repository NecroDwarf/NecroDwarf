import { useState } from "react";
import { Link } from "react-router";
import entries from "../search-index.json";
import s from "./Docs.module.css";
export function searchDocuments(query: string) {
  const q = query.trim().toLocaleLowerCase("ru");
  if (!q) return [];
  const words = q.split(/\s+/);
  return entries
    .map((entry, index) => {
      const title = entry.title.toLocaleLowerCase("ru"),
        description = entry.description.toLocaleLowerCase("ru");
      const score =
        title === q
          ? 100
          : title.includes(q)
            ? 50
            : words.every((w) => `${title} ${description}`.includes(w))
              ? 10
              : 0;
      return { ...entry, score, index };
    })
    .filter((e) => e.score)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 30);
}
export function DocsSearch() {
  const [query, setQuery] = useState("");
  const results = searchDocuments(query);
  return (
    <section className={s.search} aria-label="Поиск NovellMaker">
      <label htmlFor="novellmaker-search">Поиск по документации</label>
      <div className={s.searchInput}>
        <input
          id="novellmaker-search"
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название, game.set, ui.create…"
        />
        <button type="button" onClick={() => setQuery("")}>
          Очистить
        </button>
      </div>
      {query.trim() && (
        <>
          <p role="status">
            {results.length
              ? `Найдено: ${results.length}${results.length === 30 ? "+" : ""}`
              : "Ничего не найдено. Попробуйте другое название или часть слова."}
          </p>
          <ul className={s.results}>
            {results.map((r) => (
              <li key={r.href}>
                <Link to={r.href} onClick={() => setQuery("")}>
                  <strong>{r.title}</strong>
                  <span>{r.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
