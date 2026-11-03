import { Link, NavLink } from "react-router";
import {
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import theme from "../../theme/theme.module.css";
import s from "./Wiki.module.css";
import {
  wikiSections,
  wikiSectionPath,
  loadWikiSuggestions,
} from "../sections";
export function WikiLayout({
  children,
  searchQuery = "",
}: {
  children: ReactNode;
  searchQuery?: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [Suggestions, setSuggestions] =
    useState<ComponentType<{ form: RefObject<HTMLFormElement | null> }>>();
  const suggest = (event: SyntheticEvent<HTMLInputElement>) => {
    if (!Suggestions)
      void loadWikiSuggestions(event.currentTarget.value)
        ?.then((component) => setSuggestions(() => component))
        .catch(() => {
          /* The native GET form remains available. */
        });
  };
  return (
    <div className={`${theme.page} ${s.wiki}`}>
      <nav className={s.localNav} aria-label="Maniac Wiki">
        <Link className={s.wordmark} to="/projects/maniac/wiki">
          MANIAC <span>WIKI</span>
        </Link>
        <form
          ref={form}
          className={s.navSearch}
          role="search"
          aria-label="Поиск по Wiki в шапке"
          action={wikiSectionPath("search")}
          method="get"
        >
          <input
            key={searchQuery}
            type="search"
            name="q"
            defaultValue={searchQuery}
            aria-label="Поиск по всей Wiki"
            placeholder="Поиск по Wiki…"
            autoComplete="off"
            onFocus={suggest}
            onChange={suggest}
          />
          <button type="submit">Найти</button>
          {Suggestions && <Suggestions key={searchQuery} form={form} />}
        </form>
        <div className={s.localLinks}>
          {wikiSections
            .filter((item) => item.id !== "search")
            .map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/projects/maniac/wiki"}
              >
                {item.label}
              </NavLink>
            ))}
          <Link to="/projects/maniac/changelog">Хроники ↗</Link>
          <Link to="/projects/maniac">К игре ↗</Link>
        </div>
      </nav>
      {children}
      <footer className={s.wikiFooter}>
        <span>MANIAC / ОТКРЫТЫЙ СПРАВОЧНИК</span>
        <Link to="/projects/maniac/wiki/characters">Все персонажи →</Link>
        <Link to="/">NecroDwarf ↗</Link>
      </footer>
    </div>
  );
}
export function DataNote() {
  return (
    <p className={s.dataNote}>
      Сведения проверены по исходникам игры. Они могут отличаться от скачиваемой
      сборки Flower Cleaning 1.2; исторические значения сохранены в хрониках.
    </p>
  );
}
