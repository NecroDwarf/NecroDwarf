import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import type { EntityId } from "../data/types";
import { effectConnections, type EffectId } from "../data/effect-connections";
import { publishedEffectMeta } from "../published-effects";
import { publishedEntityMeta } from "../data/publication";
import s from "./EntityLink.module.css";
import { removedCatalogEntries } from "../mechanic-placement";
export function EntityLink({
  id,
  children,
}: {
  id: EntityId;
  children?: ReactNode;
}) {
  const meta = publishedEntityMeta[id];
  const text = children ?? meta?.name ?? "Неизвестная сущность";
  const route = removedCatalogEntries.has(id) ? undefined : meta?.href;
  return route ? (
    <Link className={s.link} to={route}>
      {text}
    </Link>
  ) : (
    <span>{text}</span>
  );
}

export function RelatedEffects({
  effectId,
  entityId,
}: {
  effectId?: EffectId;
  entityId?: EntityId;
}) {
  const entities = effectId ? (effectConnections[effectId] ?? []) : [];
  const effects = entityId
    ? publishedEffectMeta.filter((effect) =>
        effectConnections[effect.id]?.includes(entityId),
      )
    : [];
  if (!entities.length && !effects.length) return null;
  return (
    <p>
      Связано:{" "}
      {entities.map((id, index) => (
        <Fragment key={id}>
          {index > 0 && " · "}
          <EntityLink id={id} />
        </Fragment>
      ))}
      {effects.map((effect, index) => (
        <Fragment key={effect.id}>
          {index > 0 && " · "}
          <Link
            className={s.link}
            to={`/projects/maniac/wiki/effects#${effect.id}`}
          >
            {effect.name}
          </Link>
        </Fragment>
      ))}
    </p>
  );
}
