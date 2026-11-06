import { useId, useLayoutEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import type { NavigationItem } from "../content/navigation";
import s from "./ProjectSwitcher.module.css";

function NavigationBranch({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const row = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const children = item.children;
  const hasChildren = !!children?.length;
  const isArticleList =
    hasChildren && children.every((child) => !child.children?.length);
  useLayoutEffect(() => {
    if (!open || !hasChildren) return;
    const placePanel = () => {
      const element = panel.current;
      if (!element) return;
      element.style.setProperty("--panel-shift-y", "0px");
      element.dataset.side = "right";
      if (window.matchMedia("(max-width: 700px)").matches) return;
      const rect = element.getBoundingClientRect();
      if (rect.right > window.innerWidth - 16) element.dataset.side = "left";
      const shift = Math.max(
        16 - rect.top,
        Math.min(0, window.innerHeight - 16 - rect.bottom),
      );
      element.style.setProperty("--panel-shift-y", `${shift}px`);
    };
    placePanel();
    window.addEventListener("resize", placePanel);
    return () => window.removeEventListener("resize", placePanel);
  }, [open, hasChildren]);
  const linkProps = { onClick: onNavigate, onFocus: () => setOpen(true) };
  return (
    <li
      className={s.branch}
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(min-width: 701px) and (hover: hover)").matches
        )
          setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(min-width: 701px) and (hover: hover)").matches
        )
          setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          event.stopPropagation();
          if (!hasChildren) return;
          setOpen(true);
          requestAnimationFrame(() =>
            panel.current?.querySelector("a")?.focus(),
          );
        } else if (
          (event.key === "ArrowLeft" || event.key === "Escape") &&
          open &&
          hasChildren
        ) {
          event.preventDefault();
          event.stopPropagation();
          row.current?.querySelector("a")?.focus();
          setOpen(false);
        }
      }}
    >
      <div className={s.row} ref={row}>
        {item.href.includes("#") ? (
          <a href={item.href} {...linkProps}>
            {item.label}
          </a>
        ) : (
          <NavLink to={item.href} end {...linkProps}>
            {item.label}
          </NavLink>
        )}
        {hasChildren && (
          <button
            type="button"
            className={s.toggle}
            aria-label={"Разделы " + item.label}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((current) => !current)}
          >
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
      {hasChildren && (
        <div id={panelId} className={s.subPanel} ref={panel} hidden={!open}>
          {open && (
            <ul
              className={`${s.submenu} ${isArticleList ? s.articleList : ""}`}
            >
              {children.map((child) => (
                <NavigationBranch
                  key={child.href}
                  item={child}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export function ProjectSwitcher({
  projects,
  visible,
  onNavigate,
}: {
  projects: readonly NavigationItem[];
  visible: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav
      id="project-navigation"
      className={s.panel}
      aria-label="Быстрый переход между проектами"
      hidden={!visible}
    >
      {visible && (
        <ul className={s.root}>
          {projects.map((item) => (
            <NavigationBranch
              key={item.href}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </nav>
  );
}
