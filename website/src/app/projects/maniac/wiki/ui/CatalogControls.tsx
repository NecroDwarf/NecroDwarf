import { type ReactNode } from "react";
import { normalizeSearch } from "../../../../shared/lib/search";
import s from "../pages/Wiki.module.css";
import { useUrlFilter } from "../../../../shared/lib/use-url-filter";

export const catalogGroups = {
  maniac: {
    id: "maniacs",
    label: "Маньяки",
    kicker: "ПРЕСЛЕДУЙ / КОНТРОЛИРУЙ",
  },
  survivor: { id: "survivors", label: "Выжившие", kicker: "ВЫЖИВАЙ / ПОМОГАЙ" },
  common: { id: "common", label: "Общие", kicker: "ДЛЯ ОБЕИХ СТОРОН" },
  both: {
    id: "both-teams",
    label: "Обе команды",
    kicker: "ВЛАДЕЛЬЦЫ С ОБЕИХ СТОРОН",
  },
  unassigned: {
    id: "unassigned",
    label: "Без указанного владельца",
    kicker: "ПРИВЯЗКА К ПЕРСОНАЖУ НЕ УКАЗАНА",
  },
} as const;

export function CatalogGroup({
  id,
  label,
  kicker,
  count,
  children,
}: {
  id: string;
  label: string;
  kicker: string;
  count: number;
  children: ReactNode;
}) {
  if (!count) return null;
  return (
    <section
      className={s.section}
      id={id}
      aria-labelledby={`${id}-heading`}
      data-catalog-group={id}
    >
      <div className={s.sectionHeading}>
        <div>
          <p className={s.eyebrow}>{kicker}</p>
          <h2 id={`${id}-heading`}>
            {label}{" "}
            <span className={s.counter}>{String(count).padStart(2, "0")}</span>
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function CatalogHeader({
  label,
  title,
  children,
}: {
  label: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <header className={s.catalogHead}>
      <p className={s.eyebrow}>MANIAC WIKI / {label}</p>
      <h1>{title}</h1>
      <p className={s.lead}>{children}</p>
    </header>
  );
}

export function CatalogSearch({
  value,
  onChange,
  label = "Поиск по названию",
  placeholder = "Название…",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <label className={s.search}>
      {label}
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function CatalogResultCount({ count }: { count: number }) {
  return (
    <p role="status" aria-live="polite">
      Найдено: {count}
    </p>
  );
}

/** Search state shared by the catalog controls; filters stay owned by each page. */
export function useCatalogSearch() {
  const [query, setQuery] = useUrlFilter("q");
  const normalizedQuery = normalizeSearch(query);
  const matchesName = (name: string) =>
    normalizeSearch(name).includes(normalizedQuery);
  return { query, setQuery, matchesName };
}
