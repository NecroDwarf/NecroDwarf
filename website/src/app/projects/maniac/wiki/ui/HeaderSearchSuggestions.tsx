import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link, useNavigate } from "react-router";
import { wikiSectionPath } from "../sections";
import s from "./HeaderSearchSuggestions.module.css";

type SearchModule = typeof import("../search-index");
const listId = "wiki-header-options";
const hintId = "wiki-header-search-hint";

/** Enhance the existing form without replacing the focused input or its draft. */
export function HeaderSearchSuggestions({
  form,
}: {
  form: RefObject<HTMLFormElement | null>;
}) {
  const [index, setIndex] = useState<SearchModule>();
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const popup = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const results = index?.findWikiEntries(query) ?? [];
  const visible = open && Boolean(query.trim());
  const entries = results.slice(0, 6);
  const current = useRef({ visible, entries, active });
  const allResults = `${wikiSectionPath("search")}?${new URLSearchParams({ q: query.trim() })}`;

  useEffect(() => {
    let mounted = true;
    void import("../search-index").then(
      (module) => {
        if (mounted) setIndex(module);
      },
      () => {
        if (mounted) setFailed(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    const node = form.current;
    const input = node?.elements.namedItem("q") as HTMLInputElement | null;
    if (!node || !input) return;
    setQuery(input.value);
    setOpen(document.activeElement === input);
    const attributes = [
      "role",
      "aria-autocomplete",
      "aria-controls",
      "aria-expanded",
      "aria-activedescendant",
      "aria-describedby",
    ];
    const previous = attributes.map((name) => input.getAttribute(name));
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", listId);
    input.setAttribute("aria-describedby", hintId);
    let pointerInside = false;
    let pointerTimer: ReturnType<typeof setTimeout>;
    const change = () => {
      setQuery(input.value);
      setOpen(true);
      setActive(-1);
    };
    const focus = () => setOpen(true);
    const blur = (event: FocusEvent) => {
      if (!pointerInside && !node.contains(event.relatedTarget as Node | null))
        setOpen(false);
    };
    const pointer = (event: PointerEvent) => {
      pointerInside = node.contains(event.target as Node);
      if (!pointerInside) setOpen(false);
    };
    const release = () => {
      clearTimeout(pointerTimer);
      pointerTimer = setTimeout(() => {
        pointerInside = false;
        if (!node.contains(document.activeElement)) setOpen(false);
      }, 0);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) return;
      const state = current.current;
      if (
        (event.key === "ArrowDown" || event.key === "ArrowUp") &&
        state.entries.length
      ) {
        event.preventDefault();
        setOpen(true);
        setActive(
          state.visible && state.active >= 0
            ? (state.active +
                (event.key === "ArrowDown" ? 1 : -1) +
                state.entries.length) %
                state.entries.length
            : event.key === "ArrowDown"
              ? 0
              : state.entries.length - 1,
        );
      } else if (
        event.key === "Enter" &&
        state.visible &&
        state.entries[state.active]
      ) {
        event.preventDefault();
        setOpen(false);
        void navigate(state.entries[state.active].href);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        if (!state.visible) {
          input.value = "";
          setQuery("");
        }
        setActive(-1);
      } else if (event.key === "Tab") setOpen(false);
    };
    const submit = (event: SubmitEvent) => {
      event.preventDefault();
      setOpen(false);
      const value = input.value.trim();
      void navigate({
        pathname: wikiSectionPath("search"),
        search: value ? `?${new URLSearchParams({ q: value })}` : "",
      });
    };
    input.addEventListener("input", change);
    input.addEventListener("focus", focus);
    input.addEventListener("keydown", keydown);
    node.addEventListener("focusout", blur);
    node.addEventListener("submit", submit);
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    return () => {
      clearTimeout(pointerTimer);
      input.removeEventListener("input", change);
      input.removeEventListener("focus", focus);
      input.removeEventListener("keydown", keydown);
      node.removeEventListener("focusout", blur);
      node.removeEventListener("submit", submit);
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      attributes.forEach((name, i) =>
        previous[i] === null
          ? input.removeAttribute(name)
          : input.setAttribute(name, previous[i]!),
      );
    };
  }, [form, navigate]);

  useLayoutEffect(() => {
    current.current = { visible, entries, active };
    const input = form.current?.elements.namedItem(
      "q",
    ) as HTMLInputElement | null;
    if (!input) return;
    input.setAttribute("aria-expanded", String(visible));
    if (visible && active >= 0 && entries[active]) {
      input.setAttribute(
        "aria-activedescendant",
        `wiki-header-option-${active}`,
      );
      document
        .getElementById(`wiki-header-option-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  });

  useLayoutEffect(() => {
    if (!visible) return;
    const resize = () => {
      if (popup.current && form.current) {
        const viewport = window.visualViewport;
        const bottom =
          (viewport?.height ?? innerHeight) + (viewport?.offsetTop ?? 0);
        popup.current.style.maxHeight = `${Math.max(120, Math.min(440, bottom - form.current.getBoundingClientRect().bottom - 16))}px`;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", resize, true);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", resize, true);
      window.visualViewport?.removeEventListener("resize", resize);
    };
  }, [visible, form]);

  return (
    <>
      <span id={hintId} className={s.srOnly}>
        Стрелки выбирают подсказку, Enter открывает её, Escape закрывает список.
      </span>
      <div ref={popup} className={s.popup} hidden={!visible}>
        <p className={s.status} role="status" aria-live="polite">
          {failed
            ? "Не удалось загрузить подсказки."
            : !index
              ? "Ищем…"
              : results.length
                ? `Найдено: ${results.length}. Показано: ${entries.length}.`
                : "Ничего не найдено"}
        </p>
        <ul
          id={listId}
          role="listbox"
          aria-label="Подсказки Wiki"
          className={s.options}
        >
          {entries.map((entry, i) => (
            <li role="presentation" key={entry.href}>
              <Link
                id={`wiki-header-option-${i}`}
                role="option"
                aria-selected={active === i}
                data-category={entry.section}
                tabIndex={-1}
                to={entry.href}
                onPointerMove={(event) => {
                  if (event.pointerType === "mouse") setActive(i);
                }}
                onClick={() => setOpen(false)}
              >
                <span className={s.title}>{entry.name}</span>
                <span className={s.category}>{entry.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          className={s.all}
          tabIndex={-1}
          to={allResults}
          onClick={() => setOpen(false)}
        >
          {results.length ? "Все результаты" : "Открыть поиск"}{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}
