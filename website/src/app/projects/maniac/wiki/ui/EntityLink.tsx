import type { ReactNode } from "react";
import { Link } from "react-router";
import type { EntityId } from "../data/types";
import { getEntity } from "../data/registry";
import { publishedEntityRoutes } from "../data/publication";
export function EntityLink({
  id,
  children,
}: {
  id: EntityId;
  children?: ReactNode;
}) {
  const text = children ?? getEntity(id)?.name ?? "Неизвестная сущность";
  const route = publishedEntityRoutes[id];
  return route ? <Link to={route}>{text}</Link> : <span>{text}</span>;
}
