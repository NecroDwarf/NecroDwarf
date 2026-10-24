import { ContentLink } from "../ui/ContentLink";
import { useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "../ui/BrandLogo";
import { contacts } from "../content/team";
import s from "./SiteLayout.module.css";
const navigation = [
  { to: "/", label: "Главная" },
  { to: "/projects", label: "Проекты" },
  { to: "/changelog", label: "Хроники" },
  { to: "/about", label: "Команда" },
];
export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <>
      <ContentLink href="#main" className={s.skip}>
        К содержанию
      </ContentLink>
      <header
        className={s.header}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <Link
          to="/"
          aria-label="NecroDwarf — главная"
          onClick={() => setOpen(false)}
        >
          <BrandLogo />
        </Link>
        <button
          ref={menuButton}
          className={s.menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Закрыть ×" : "Меню +"}
        </button>
        <nav
          id="main-navigation"
          className={s.nav}
          data-open={open}
          aria-label="Основная навигация"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ContentLink className={s.headerContact} href={contacts[0].url}>
          На связи <span aria-hidden="true">↗</span>
        </ContentLink>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <Link to="/" aria-label="NecroDwarf — главная">
            <BrandLogo />
          </Link>
          <p>Кованы в любви к коду.</p>
          <div>
            {contacts.map((contact) => (
              <ContentLink key={contact.url} href={contact.url}>
                {contact.name} ↗
              </ContentLink>
            ))}
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>NECRODWARF / INDEPENDENT DEVELOPMENT</span>
          <span>Куём идеи. Оживляем код.</span>
        </div>
      </footer>
    </>
  );
}
