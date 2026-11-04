import { useState, type ReactNode, type ComponentType } from "react";
import { Link, NavLink } from "react-router";
import metadata from "../metadata.json";
import { docPath } from "../paths";
import type { Heading } from "./DocArticle";
import s from "./Docs.module.css";
const base = "/projects/novellmaker/docs";
const groups = [
  { title: "Начало работы", slugs: ["engine-guide", "examples", "characters"] },
  {
    title: "Сценарий и интерфейс",
    slugs: [
      "index",
      "execution-model",
      "scenario",
      "components",
      "events",
      "input-and-triggers",
      "modules",
    ],
  },
  {
    title: "Системы движка",
    slugs: [
      "animations",
      "audio",
      "state-and-random",
      "minigames",
      "session-and-storage",
      "history",
      "external-services",
    ],
  },
  {
    title: "Контракты и ограничения",
    slugs: ["standard-library", "limits", "diagnostics", "verification"],
  },
];
export function DocsLayout({
  children,
  headings = [],
}: {
  children: ReactNode;
  headings?: Heading[];
}) {
  const [Search, setSearch] = useState<ComponentType>();
  const [error, setError] = useState(false);
  async function loadSearch() {
    try {
      const m = await import("./DocsSearch");
      setSearch(() => m.DocsSearch);
      setError(false);
    } catch {
      setError(true);
    }
  }
  const tree = (
    <nav className={s.tree} aria-label="Разделы документации NovellMaker">
      <NavLink to={base} end>
        Обзор документации
      </NavLink>
      {groups.map((g) => (
        <div key={g.title}>
          <p>{g.title}</p>
          {g.slugs.map((slug) => {
            const doc = metadata.find(([id]) => id === slug)!;
            return (
              <NavLink key={slug} to={docPath(slug)} end>
                {doc[1]}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
  const toc = (
    <nav className={s.toc} aria-label="На этой странице">
      <p>На этой странице</p>
      {headings
        .filter((h) => h.level > 1 && h.level < 4)
        .map((h) => (
          <Link key={h.id} to={`#${h.id}`} data-level={h.level}>
            {h.title}
          </Link>
        ))}
    </nav>
  );
  return (
    <div className={s.docs} data-novellmaker-docs>
      <div className={s.top}>
        <Link className={s.brand} to={base}>
          NovellMaker <span> / документация</span>
        </Link>
        <Link to="/projects/novellmaker">← О движке</Link>
      </div>
      <div className={s.searchArea}>
        {Search ? (
          <Search />
        ) : (
          <>
            <button
              className={s.searchTrigger}
              type="button"
              onClick={() => void loadSearch()}
            >
              Поиск по документации <span>game.set, сохранение…</span>
            </button>
            <noscript>
              <p>
                Для поиска включите JavaScript. Все разделы и алфавитный
                указатель Lua доступны по ссылкам.
              </p>
            </noscript>
            {error && (
              <p role="status">
                Не удалось загрузить поиск. Повторите попытку или выберите
                раздел.
              </p>
            )}
          </>
        )}
      </div>
      <div className={s.mobileNav}>
        <details>
          <summary>Все разделы</summary>
          {tree}
        </details>
        {headings.length > 1 && (
          <details>
            <summary>На этой странице</summary>
            {toc}
          </details>
        )}
      </div>
      <div className={s.layout}>
        <aside className={s.sidebar}>{tree}</aside>
        <div className={s.content}>
          {children}
          <footer className={s.provenance}>
            Оригинальная документация NovellMaker · исходники{" "}
            <a
              href="https://github.com/doflare123/NovellMaker/tree/5e885944ee36f5945a734c18c19c65c261402445"
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>5e88594</code> ↗
            </a>
            <br />
            Контракты сохранены. Исторические отчёты проверок относятся к
            исходному движку.
          </footer>
        </div>
        {headings.length > 1 && <aside className={s.right}>{toc}</aside>}
      </div>
    </div>
  );
}
