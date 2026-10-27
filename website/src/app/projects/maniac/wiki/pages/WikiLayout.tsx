import { Link, NavLink } from "react-router";
import type { ReactNode } from "react";
import theme from "../../theme/theme.module.css";
import s from "./Wiki.module.css";
export function WikiLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${theme.page} ${s.wiki}`}>
      <nav className={s.localNav} aria-label="Maniac Wiki">
        <Link className={s.wordmark} to="/projects/maniac/wiki">
          MANIAC <span>WIKI</span>
        </Link>
        <div>
          <NavLink to="/projects/maniac/wiki" end>
            Обзор
          </NavLink>
          <NavLink to="/projects/maniac/wiki/characters">Персонажи</NavLink>
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
