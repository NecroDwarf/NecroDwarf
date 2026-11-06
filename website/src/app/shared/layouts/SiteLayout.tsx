import { ContentLink } from "../ui/ContentLink";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "../ui/BrandLogo";
import { contacts } from "../content/team";
import { ProjectSwitcher } from "../ui/ProjectSwitcher";
import type { NavigationItem } from "../content/navigation";
import s from "./SiteLayout.module.css";
const navigation = [
  { to: "/", label: "Главная" },
  { to: "/projects", label: "Проекты" },
  { to: "/changelog", label: "Хроники" },
  { to: "/about", label: "Команда" },
];
export function SiteLayout({
  children,
  projects,
  loadProjects,
}: {
  children: ReactNode;
  projects: readonly NavigationItem[];
  loadProjects?: () => Promise<readonly NavigationItem[]>;
}) {
  const [navigationReady, setNavigationReady] = useState(false);
  useEffect(() => {
    setNavigationReady(true);
  }, []);
  const [open, setOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsVisible = projectsOpen || open;
  const [projectItems, setProjectItems] = useState(projects);
  const projectRequest = useRef<Promise<readonly NavigationItem[]> | null>(
    null,
  );
  useEffect(() => {
    if (!projectsVisible || !loadProjects) return;
    let current = true;
    projectRequest.current ??= loadProjects().catch((error) => {
      projectRequest.current = null;
      throw error;
    });
    projectRequest.current
      .then((items) => {
        if (current) setProjectItems(items);
      })
      .catch(() => {
        // Base project links remain usable; reopening retries the submenu load.
      });
    return () => {
      current = false;
    };
  }, [projectsVisible, loadProjects]);
  const projectsLink = useRef<HTMLAnchorElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeNavigation = () => {
    setOpen(false);
    setProjectsOpen(false);
  };
  return (
    <>
      <ContentLink href="#main" className={s.skip}>
        К содержанию
      </ContentLink>
      <div
        className={s.headerArea}
        data-navigation-ready={navigationReady}
        data-mobile-open={open}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setProjectsOpen(false);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setProjectsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (open) {
              setOpen(false);
              menuButton.current?.focus();
            } else if (projectsOpen) {
              projectsLink.current?.focus();
            }
            setProjectsOpen(false);
          }
        }}
      >
        <header className={s.header}>
          <Link
            to="/"
            aria-label="NecroDwarf — главная"
            onClick={closeNavigation}
          >
            <BrandLogo />
          </Link>
          <button
            ref={menuButton}
            className={s.menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => {
              setOpen((current) => !current);
              setProjectsOpen(false);
            }}
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
                ref={item.to === "/projects" ? projectsLink : undefined}
                aria-controls={
                  item.to === "/projects" ? "project-navigation" : undefined
                }
                aria-expanded={
                  item.to === "/projects" ? projectsVisible : undefined
                }
                onMouseEnter={() => setProjectsOpen(item.to === "/projects")}
                onFocus={() => setProjectsOpen(item.to === "/projects")}
                onKeyDown={(event) => {
                  if (item.to === "/projects" && event.key === "ArrowDown") {
                    event.preventDefault();
                    setProjectsOpen(true);
                    requestAnimationFrame(() =>
                      document
                        .getElementById("project-navigation")
                        ?.querySelector("a")
                        ?.focus(),
                    );
                  }
                }}
                onClick={closeNavigation}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ContentLink className={s.headerContact} href={contacts[0].url}>
            На связи <span aria-hidden="true">↗</span>
          </ContentLink>
        </header>
        <ProjectSwitcher
          projects={projectItems}
          visible={projectsVisible}
          onNavigate={closeNavigation}
        />
      </div>
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
