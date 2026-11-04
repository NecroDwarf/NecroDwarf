import { WikiText } from "./WikiText";
import { entityAssets } from "../data/assets";
import { getEntity, getRevision } from "../data/registry";
import { snapshots, verifiedSource } from "../data/snapshots";
import type { EntityId, EntityKind, SnapshotId, Stat } from "../data/types";
import { EntityLink } from "./EntityLink";
import { Link } from "react-router";
import { publishedEntityRoutes } from "../data/publication";
import { EntityIcon } from "./EntityIcon";
import { systemIconAsset } from "../data/system-icons";
import { GameGlyph, statGlyph, equipmentGlyph } from "./GameGlyph";
import { InlineStat } from "./InlineStat";
import { DifficultyStars } from "./DifficultyStars";
import iconStyles from "./EntityIcon.module.css";
import type { ReactNode } from "react";
import s from "./EntityCards.module.css";
const units: Record<Stat["unit"], string> = {
  seconds: "с",
  mana: "маны",
  blocks: "бл.",
  percent: "%",
  count: "",
  health: "HP",
  damage: "HP",
  armor: "",
};
export function EntityStats({ stats }: { stats: readonly Stat[] }) {
  return (
    <dl className={s.stats}>
      {stats.map((stat) => (
        <div key={stat.key}>
          <dt>
            <span>{stat.label}</span>
          </dt>
          <dd>
            <span>
              {stat.value}
              {stat.unit === "percent" ? "%" : " "}
            </span>
            <InlineStat
              name={statGlyph(stat.key, stat.unit)}
              original={stat.unit === "percent" ? undefined : units[stat.unit]}
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
export interface CardProps {
  id: EntityId;
  snapshot?: SnapshotId;
  variant?: "compact" | "detail";
  editorial?: ReactNode;
  /** Heading content only; the card supplies its Wiki link. */
  title?: ReactNode;
  showStats?: boolean;
  provenance?: "inline" | "deferred";
}
export function EntityCard({
  id,
  snapshot = verifiedSource,
  variant = "detail",
  editorial,
  title,
  showStats = true,
  provenance = "inline",
}: CardProps) {
  const entity = getEntity(id),
    revision = getRevision(id, snapshot);
  if (!entity) return <p>Сущность не найдена.</p>;
  if (!revision)
    return <p>{entity.name}: данные для выбранного снимка не подтверждены.</p>;
  const { data } = revision,
    asset =
      snapshot === verifiedSource &&
      (entity.kind === "item" || entity.kind === "mechanic")
        ? systemIconAsset(id as EntityId<"item" | "mechanic">, data.icon)
        : data.icon
          ? entityAssets[data.icon]
          : undefined;
  const relations: readonly EntityId[] = [
    ...("abilityIds" in data ? data.abilityIds : []),
    ...("itemIds" in data ? (data.itemIds ?? []) : []),
    ...("characterIds" in data ? (data.characterIds ?? []) : []),
    ...("mechanicIds" in data ? data.mechanicIds : []),
  ];
  const wikiRoute = publishedEntityRoutes[id];
  const heading = (
    <>
      {asset && <EntityIcon asset={asset} variant={variant} />}
      {!asset && entity.kind === "item" && (
        <span
          className={`${iconStyles.frame} ${s.equipmentSymbol}`}
          data-kind="symbol"
          data-variant={variant}
          title="Условное обозначение предмета"
          aria-hidden="true"
        >
          <GameGlyph name={equipmentGlyph(entity.slug)} />
        </span>
      )}
      <div>
        <p className={s.label}>
          {provenance === "deferred" || snapshot === verifiedSource
            ? entity.kind === "ability"
              ? "Способность"
              : "Снаряжение"
            : (snapshots[snapshot as keyof typeof snapshots]?.label ??
              snapshot)}
        </p>
        <h3>{title ?? entity.name}</h3>
        {wikiRoute && (
          <span className={s.wikiAction}>
            Открыть в Wiki <span aria-hidden="true">↗</span>
          </span>
        )}
      </div>
    </>
  );
  return (
    <article
      className={s.card}
      data-variant={variant}
      data-entity-card={id}
      data-snapshot={snapshot}
    >
      <div>
        {wikiRoute ? (
          <Link
            to={wikiRoute}
            className={`${s.header} ${s.headerLink}`}
            aria-label={`${entity.name} — открыть в Wiki`}
          >
            {heading}
          </Link>
        ) : (
          <div className={s.header}>{heading}</div>
        )}
      </div>
      {"role" in data && (
        <p className={s.label}>
          {data.role === "maniac" ? "Маньяк" : "Выживший"} · {data.style}
        </p>
      )}
      {"difficulty" in data && data.difficulty !== undefined && (
        <p className={s.difficulty}>
          Сложность <DifficultyStars value={data.difficulty} />
        </p>
      )}
      {editorial ?? (
        <>
          <p>
            <WikiText text={data.description} />
          </p>
          {"usage" in data && data.usage && (
            <p>
              <WikiText text={data.usage} />
            </p>
          )}
        </>
      )}
      {showStats && data.stats?.length ? (
        <EntityStats stats={data.stats} />
      ) : null}
      {variant === "detail" && (
        <>
          {relations.length > 0 && (
            <ul className={s.relations}>
              {relations.map((related) => (
                <li key={related}>
                  <EntityLink id={related} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  );
}
function typedCard(kind: EntityKind, props: CardProps) {
  if (getEntity(props.id)?.kind !== kind) return <p>Неверный тип сущности.</p>;
  return <EntityCard {...props} />;
}
export const CharacterCard = (props: CardProps) =>
  typedCard("character", props);
export const AbilityCard = (props: CardProps) => typedCard("ability", props);
export const PerkCard = (props: CardProps) => typedCard("perk", props);
export const ItemCard = (props: CardProps) => typedCard("item", props);
