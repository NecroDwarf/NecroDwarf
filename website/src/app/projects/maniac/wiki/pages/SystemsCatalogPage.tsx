import { StatText } from "../ui/StatText";
import { useUrlFilter } from "../../../../shared/lib/use-url-filter";
import { CatalogSelect } from "../ui/CatalogSelect";
import { Link } from "react-router";
import {
  type ItemMeta,
  listedItems,
  mechanicCatalog,
  itemCategoryLabels,
  mechanicCategoryLabels,
} from "../data/systems-catalog";
import { characterNames } from "../data/character-names";
import { matchesItemTeam, itemOwnerGroup } from "../data/owner-teams";
import { CharacterFilter } from "../ui/CharacterFilter";
import {
  CatalogHeader,
  CatalogSearch,
  CatalogResultCount,
  useCatalogSearch,
  CatalogGroup,
  catalogGroups,
} from "../ui/CatalogControls";
import { SystemIcon } from "../ui/SystemIcon";
import { InlineStat } from "../ui/InlineStat";
import { WikiLayout } from "./WikiLayout";
import s from "./Wiki.module.css";
import r from "./Reference.module.css";
export function SystemsCatalogPage({ kind }: { kind: "item" | "mechanic" }) {
  const { query, setQuery, matchesName } = useCatalogSearch();
  const [category, setCategory] = useUrlFilter("category", ""),
    [owner, setOwner] = useUrlFilter("owner", "");
  const [team, setTeam] = useUrlFilter("team", "all");
  const entries = kind === "item" ? listedItems : mechanicCatalog,
    labels = kind === "item" ? itemCategoryLabels : mechanicCategoryLabels;
  const visible = entries.filter(
    (e) =>
      matchesName(e.name) &&
      (!category || e.category === category) &&
      (kind !== "item" ||
        ("characterIds" in e && matchesItemTeam(e as ItemMeta, team))) &&
      (!owner ||
        ("characterIds" in e && e.characterIds.some((id) => id === owner))),
  );
  const reset = () => {
    setQuery("");
    setCategory("");
    setOwner("");
    setTeam("all");
  };
  const section = kind === "item" ? "items" : "mechanics";
  const renderCards = (cards: typeof visible) => (
    <div className={r.referenceGrid}>
      {cards.map((entry) => {
        const damage =
          entry.category === "weapon"
            ? entry.stats.find((stat) => stat.key === "base-damage")
            : undefined;
        return (
          <Link
            key={entry.id}
            to={`/projects/maniac/wiki/${section}/${entry.slug}`}
            className={r.referenceCard}
            data-system-id={entry.id}
          >
            <div className={r.cardHeading}>
              <SystemIcon id={entry.id} icon={entry.icon} />
              <div>
                <p className={s.eyebrow}>{labels[entry.category]}</p>
                <h3>{entry.name}</h3>
              </div>
            </div>
            <p className={r.description}>
              <StatText text={entry.description} interactive={false} />
            </p>
            {damage && (
              <p className={r.weaponDamage}>
                <span>{damage.label}</span>
                <strong>
                  {String(damage.value).replace(".", ",")}{" "}
                  <InlineStat name="damage" interactive={false} />
                </strong>
              </p>
            )}
            {"characterIds" in entry && !!entry.characterIds.length && (
              <p className={r.ownerLabel}>
                {characterNames(entry.characterIds)}
              </p>
            )}
            <span className={s.textLink}>Читать статью →</span>
          </Link>
        );
      })}
    </div>
  );
  return (
    <WikiLayout>
      <div className={s.container}>
        <CatalogHeader
          label={kind === "item" ? "ПРЕДМЕТЫ" : "МЕХАНИКИ"}
          title={
            kind === "item" ? (
              <>
                Ваше <em>снаряжение.</em>
              </>
            ) : (
              <>
                Правила <em>охоты.</em>
              </>
            )
          }
        >
          {kind === "item"
            ? `${entries.length} предметов и наборов: назначение, применение и связи с персонажами.`
            : `${entries.length} игровых систем: от начала матча и взлома до испытаний и особых ресурсов.`}
        </CatalogHeader>
        <div className={s.filters}>
          <CatalogSearch value={query} onChange={setQuery} />
          <CatalogSelect
            label="Категория"
            ariaLabel="Категория"
            value={category}
            onChange={setCategory}
          >
            <option value="">Все категории · {entries.length}</option>
            {Object.entries(labels)
              .filter(([key]) => entries.some((e) => e.category === key))
              .map(([key, name]) => (
                <option key={key} value={key}>
                  {name} · {entries.filter((e) => e.category === key).length}
                </option>
              ))}
          </CatalogSelect>
          {kind === "item" && (
            <>
              <CatalogSelect
                label="Команда владельца"
                ariaLabel="Команда владельца предмета"
                value={team}
                onChange={setTeam}
              >
                <option value="all">Все команды</option>
                <option value="maniac">Маньяки</option>
                <option value="survivor">Выжившие</option>
                <option value="unassigned">Без указанного владельца</option>
              </CatalogSelect>
              <CharacterFilter
                entries={listedItems}
                label="Персонаж предмета"
                value={owner}
                onChange={setOwner}
              />
            </>
          )}
          <CatalogResultCount count={visible.length} />
        </div>
        <noscript>
          <p>
            Показан полный каталог. Поиск и фильтры доступны при включённом
            JavaScript.
          </p>
        </noscript>
        {(query || category || owner || team !== "all") && (
          <button className={r.reset} onClick={reset}>
            Сбросить фильтры
          </button>
        )}
        {!visible.length ? (
          <div className={s.empty}>
            <h2>Ничего не найдено</h2>
            <p>Измените запрос или сбросьте фильтры.</p>
          </div>
        ) : kind === "item" ? (
          (["maniac", "survivor", "both", "unassigned"] as const).map(
            (side) => {
              const group = visible.filter(
                (entry) =>
                  "characterIds" in entry &&
                  itemOwnerGroup(entry as ItemMeta) === side,
              );
              return (
                <CatalogGroup
                  key={side}
                  {...catalogGroups[side]}
                  count={group.length}
                >
                  {renderCards(group)}
                </CatalogGroup>
              );
            },
          )
        ) : (
          Object.entries(mechanicCategoryLabels).map(([categoryId, label]) => {
            const group = visible.filter(
              (entry) => entry.category === categoryId,
            );
            return (
              <CatalogGroup
                key={categoryId}
                id={categoryId}
                label={label}
                kicker="ИГРОВЫЕ ПРАВИЛА И ВЗАИМОДЕЙСТВИЯ"
                count={group.length}
              >
                {renderCards(group)}
              </CatalogGroup>
            );
          })
        )}
      </div>
    </WikiLayout>
  );
}
