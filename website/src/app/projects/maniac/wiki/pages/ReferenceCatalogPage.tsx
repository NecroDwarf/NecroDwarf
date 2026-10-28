import { useState } from "react";
import { Link } from "react-router";
import {
  perkCatalog,
  abilityCatalog,
  type PerkMeta,
  type AbilityMeta,
} from "../data/reference-catalog";
import { entityAssets } from "../data/assets";
import { characters } from "../data/characters";
import { EntityIcon } from "../ui/EntityIcon";
import { GameGlyph } from "../ui/GameGlyph";
import { WikiLayout, DataNote } from "./WikiLayout";
import { teamLabels, typeLabels, abilityLabels } from "./reference-labels";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
export function ReferenceCatalogPage({ kind }: { kind: "perk" | "ability" }) {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("ALL_FILTER");
  const [type, setType] = useState("");
  const [owner, setOwner] = useState("");
  const entries = kind === "perk" ? perkCatalog : abilityCatalog;
  const normalized = (s: string) =>
    s.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
  const visible = entries.filter(
    (e) =>
      normalized(e.name).includes(normalized(query)) &&
      ("team" in e
        ? (team === "ALL_FILTER" || e.team === team) &&
          (!type || e.perkType === type)
        : !owner || e.characterIds.includes(owner as `character:${string}`)),
  );
  const reset = () => {
    setQuery("");
    setTeam("ALL_FILTER");
    setType("");
    setOwner("");
  };
  const section = kind === "perk" ? "perks" : "abilities";
  return (
    <WikiLayout>
      <div className={s.container}>
        <header className={s.catalogHead}>
          <p className={s.eyebrow}>
            MANIAC WIKI / {kind === "perk" ? "ПЕРКИ" : "СПОСОБНОСТИ"}
          </p>
          <h1>
            {kind === "perk" ? (
              <>
                Ваше <em>преимущество.</em>
              </>
            ) : (
              <>
                Особые <em>действия.</em>
              </>
            )}
          </h1>
          <p className={s.lead}>
            {kind === "perk"
              ? "44 зарегистрированных перка: выбирайте сторону и тип, изучайте условия и сочетайте эффекты."
              : "12 подтверждённых способностей: действия предметов, снаряжения и отдельная пассивная способность Хранителя."}
          </p>
        </header>
        <div className={s.filters}>
          <label className={s.search}>
            Поиск по названию
            <input
              type="search"
              placeholder="Название…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {kind === "perk" ? (
            <>
              <label className={r.selectLabel}>
                Сторона
                <select
                  aria-label="Сторона перка"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                >
                  <option value="ALL_FILTER">Все · 44</option>
                  <option value="SURVIVOR">Выжившие · 19</option>
                  <option value="MANIAC">Маньяки · 15</option>
                  <option value="ALL">Общие · 10</option>
                </select>
              </label>
              <label className={r.selectLabel}>
                Тип
                <select
                  aria-label="Тип перка"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">Все типы</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label className={r.selectLabel}>
              Персонаж
              <select
                aria-label="Персонаж способности"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="">Все персонажи</option>
                {characters
                  .filter((c) =>
                    abilityCatalog.some((a) => a.characterIds.includes(c.id)),
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
          <p className={s.dataNote}>
            Без JavaScript доступен весь каталог. Для поиска и фильтров включите
            JavaScript.
          </p>
        </noscript>
        <DataNote />
        <section
          className={s.section}
          aria-label={
            kind === "perk" ? "Каталог перков" : "Каталог способностей"
          }
        >
          <div className={r.referenceGrid}>
            {visible.map((entry) => {
              const asset = entry.icon ? entityAssets[entry.icon] : undefined;
              return (
                <Link
                  key={entry.id}
                  to={`/projects/maniac/wiki/${section}/${entry.slug}`}
                  className={r.referenceCard}
                  data-reference-id={entry.id}
                >
                  <div className={r.cardHeading}>
                    {asset ? (
                      <EntityIcon asset={asset} />
                    ) : (
                      <span className={r.fallbackIcon} aria-hidden="true">
                        <GameGlyph name="sanity" />
                      </span>
                    )}
                    <div>
                      <p className={s.eyebrow}>
                        {kind === "perk"
                          ? teamLabels[(entry as PerkMeta).team]
                          : abilityLabels[(entry as AbilityMeta).abilityKind]}
                      </p>
                      <h2>{entry.name}</h2>
                    </div>
                  </div>
                  {"perkType" in entry && (
                    <span className={r.typeBadge}>
                      {typeLabels[entry.perkType]}
                    </span>
                  )}
                  <p className={r.description}>{entry.description}</p>
                  {"characterIds" in entry && (
                    <p className={r.ownerLabel}>
                      {entry.characterIds
                        .map((id) => characters.find((c) => c.id === id)?.name)
                        .join(", ")}
                    </p>
                  )}
                  <span className={s.cardAction}>
                    Изучить {kind === "perk" ? "перк" : "способность"}{" "}
                    <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              );
            })}
          </div>
          {!visible.length && (
            <div className={s.empty}>
              <h2>Ничего не найдено</h2>
              <p>Измените название или сочетание фильтров.</p>
              <button type="button" onClick={reset}>
                Сбросить фильтры
              </button>
            </div>
          )}
        </section>
      </div>
    </WikiLayout>
  );
}
