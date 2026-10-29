import { useState } from "react";
import { Link } from "react-router";
import {
  itemCatalog,
  mechanicCatalog,
  itemCategoryLabels,
  mechanicCategoryLabels,
} from "../data/systems-catalog";
import { characters } from "../data/characters";
import { entityAssets } from "../data/assets";
import { equipmentAssets } from "../data/equipment-assets";
import { EntityIcon } from "../ui/EntityIcon";
import { WikiLayout, DataNote } from "./WikiLayout";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
export function SystemsCatalogPage({ kind }: { kind: "item" | "mechanic" }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [owner, setOwner] = useState("");
  const entries = kind === "item" ? itemCatalog : mechanicCatalog,
    labels = kind === "item" ? itemCategoryLabels : mechanicCategoryLabels;
  const normalized = (value: string) =>
    value.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
  const visible = entries.filter(
    (e) =>
      normalized(e.name).includes(normalized(query)) &&
      (!category || e.category === category) &&
      (!owner ||
        ("characterIds" in e &&
          e.characterIds.includes(owner as `character:${string}`))),
  );
  const reset = () => {
    setQuery("");
    setCategory("");
    setOwner("");
  };
  const section = kind === "item" ? "items" : "mechanics";
  return (
    <WikiLayout>
      <div className={s.container}>
        <header className={s.catalogHead}>
          <p className={s.eyebrow}>
            MANIAC WIKI / {kind === "item" ? "ПРЕДМЕТЫ" : "МЕХАНИКИ"}
          </p>
          <h1>
            {kind === "item" ? (
              <>
                Ваше <em>снаряжение.</em>
              </>
            ) : (
              <>
                Правила <em>охоты.</em>
              </>
            )}
          </h1>
          <p className={s.lead}>
            {kind === "item"
              ? `${entries.length} подтверждённых предметов и наборов: назначение, применение и связи с персонажами.`
              : `${entries.length} игровых систем: от начала матча и взлома до испытаний и особых ресурсов.`}
          </p>
        </header>
        <div className={s.filters}>
          <label className={s.search}>
            Поиск по названию
            <input
              type="search"
              value={query}
              placeholder="Название…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className={r.selectLabel}>
            Категория
            <select
              aria-label="Категория"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Все категории · {entries.length}</option>
              {Object.entries(labels)
                .filter(([key]) => entries.some((e) => e.category === key))
                .map(([key, name]) => (
                  <option key={key} value={key}>
                    {name} · {entries.filter((e) => e.category === key).length}
                  </option>
                ))}
            </select>
          </label>
          {kind === "item" && (
            <label className={r.selectLabel}>
              Персонаж
              <select
                aria-label="Персонаж предмета"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="">Все персонажи</option>
                {characters
                  .filter((c) =>
                    itemCatalog.some((item) =>
                      item.characterIds.includes(c.id),
                    ),
                  )
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <p role="status" aria-live="polite">
            Найдено: {visible.length}
          </p>
        </div>
        <noscript>
          <p>
            Показан полный каталог. Поиск и фильтры доступны при включённом
            JavaScript.
          </p>
        </noscript>
        <DataNote />
        {(query || category || owner) && (
          <button className={r.reset} onClick={reset}>
            Сбросить фильтры
          </button>
        )}
        {!visible.length ? (
          <div className={s.empty}>
            <h2>Ничего не найдено</h2>
            <p>Измените запрос или сбросьте фильтры.</p>
          </div>
        ) : (
          <div className={r.referenceGrid}>
            {visible.map((entry) => {
              const asset = entry.icon
                ? entityAssets[entry.icon]
                : kind === "item"
                  ? equipmentAssets[entry.slug]
                  : undefined;
              return (
                <Link
                  key={entry.id}
                  to={`/projects/maniac/wiki/${section}/${entry.slug}`}
                  className={r.referenceCard}
                  data-system-id={entry.id}
                >
                  <div className={r.cardHeading}>
                    {asset && <EntityIcon asset={asset} />}
                    <div>
                      <p className={s.eyebrow}>{labels[entry.category]}</p>
                      <h2>{entry.name}</h2>
                    </div>
                  </div>
                  <p className={r.description}>{entry.description}</p>
                  {"characterIds" in entry && !!entry.characterIds.length && (
                    <p className={r.ownerLabel}>
                      {entry.characterIds
                        .map((id) => characters.find((c) => c.id === id)?.name)
                        .join(", ")}
                    </p>
                  )}
                  <span className={s.textLink}>Читать статью →</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </WikiLayout>
  );
}
