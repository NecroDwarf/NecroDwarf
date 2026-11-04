import { StatText } from "../ui/StatText";
import { useUrlFilter } from "../../../../shared/lib/use-url-filter";
import { CatalogSelect } from "../ui/CatalogSelect";
import { Link } from "react-router";
import { perkCatalog, abilityCatalog } from "../data/reference-catalog";
import { entityAssets } from "../data/assets";
import { characterNames } from "../data/character-names";
import { ownerGroup } from "../data/owner-teams";
import { CharacterFilter } from "../ui/CharacterFilter";
import {
  CatalogHeader,
  CatalogSearch,
  CatalogResultCount,
  useCatalogSearch,
  CatalogGroup,
  catalogGroups,
} from "../ui/CatalogControls";
import { EntityIcon } from "../ui/EntityIcon";
import { GameGlyph } from "../ui/GameGlyph";
import { WikiLayout } from "./WikiLayout";
import { teamLabels, typeLabels, abilityLabels } from "./reference-labels";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
const perkGroups = {
  MANIAC: "maniac",
  SURVIVOR: "survivor",
  ALL: "common",
} as const;
export function ReferenceCatalogPage({ kind }: { kind: "perk" | "ability" }) {
  const { query, setQuery, matchesName } = useCatalogSearch();
  const [team, setTeam] = useUrlFilter("team", "ALL_FILTER");
  const [type, setType] = useUrlFilter("type", "");
  const [owner, setOwner] = useUrlFilter("owner", "");
  const entries = kind === "perk" ? perkCatalog : abilityCatalog;
  const visible = entries.filter(
    (e) =>
      matchesName(e.name) &&
      ("team" in e
        ? (team === "ALL_FILTER" || e.team === team) &&
          (!type || e.perkType === type)
        : !owner || e.characterIds.some((id) => id === owner)),
  );
  const reset = () => {
    setQuery("");
    setTeam("ALL_FILTER");
    setType("");
    setOwner("");
  };
  const section = kind === "perk" ? "perks" : "abilities";
  const groups =
    kind === "perk"
      ? (["maniac", "survivor", "common"] as const)
      : (["maniac", "survivor", "both", "unassigned"] as const);
  return (
    <WikiLayout>
      <div className={s.container}>
        <CatalogHeader
          label={kind === "perk" ? "ПЕРКИ" : "СПОСОБНОСТИ"}
          title={
            kind === "perk" ? (
              <>
                Ваше <em>преимущество.</em>
              </>
            ) : (
              <>
                Особые <em>действия.</em>
              </>
            )
          }
        >
          {kind === "perk"
            ? `Перков в каталоге: ${perkCatalog.length}. Выбирайте сторону и тип, изучайте условия и сочетайте эффекты.`
            : `Способностей в каталоге: ${abilityCatalog.length}. Действия предметов, снаряжения и отдельная пассивная способность Хранителя.`}
        </CatalogHeader>
        <div className={s.filters}>
          <CatalogSearch value={query} onChange={setQuery} />
          {kind === "perk" ? (
            <>
              <CatalogSelect
                label="Сторона"
                ariaLabel="Сторона перка"
                value={team}
                onChange={setTeam}
              >
                <option value="ALL_FILTER">Все · {perkCatalog.length}</option>
                {(["SURVIVOR", "MANIAC", "ALL"] as const).map((side) => (
                  <option key={side} value={side}>
                    {catalogGroups[perkGroups[side]].label} ·{" "}
                    {perkCatalog.filter((entry) => entry.team === side).length}
                  </option>
                ))}
              </CatalogSelect>
              <CatalogSelect
                label="Тип"
                ariaLabel="Тип перка"
                value={type}
                onChange={setType}
              >
                <option value="">Все типы</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </CatalogSelect>
            </>
          ) : (
            <CharacterFilter
              entries={abilityCatalog}
              label="Персонаж способности"
              value={owner}
              onChange={setOwner}
            />
          )}
          <CatalogResultCount count={visible.length} />
        </div>
        <noscript>
          <p className={s.dataNote}>
            Без JavaScript доступен весь каталог. Для поиска и фильтров включите
            JavaScript.
          </p>
        </noscript>
        <section
          aria-label={
            kind === "perk" ? "Каталог перков" : "Каталог способностей"
          }
        >
          {groups.map((side) => {
            const group = visible.filter(
              (entry) =>
                ("team" in entry
                  ? perkGroups[entry.team]
                  : ownerGroup(entry.characterIds)) === side,
            );
            return (
              <CatalogGroup
                key={side}
                {...catalogGroups[side]}
                count={group.length}
              >
                <div className={r.referenceGrid}>
                  {group.map((entry) => {
                    const asset = entry.icon
                      ? entityAssets[entry.icon]
                      : undefined;
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
                              {"team" in entry
                                ? teamLabels[entry.team]
                                : abilityLabels[entry.abilityKind]}
                            </p>
                            <h3>{entry.name}</h3>
                          </div>
                        </div>
                        {"perkType" in entry && (
                          <span className={r.typeBadge}>
                            {typeLabels[entry.perkType]}
                          </span>
                        )}
                        <p className={r.description}>
                          <StatText
                            text={entry.description}
                            interactive={false}
                          />
                        </p>
                        {"characterIds" in entry && (
                          <p className={r.ownerLabel}>
                            {characterNames(entry.characterIds)}
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
              </CatalogGroup>
            );
          })}
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
