import { relatedEntityIds } from "../data/relations";
import { publishedEntityRoutes } from "../data/publication";
import { EntityLink } from "./EntityLink";
import type { EntityId } from "../data/types";
export function RelatedLinks({
  id,
  exclude = [],
}: {
  id: EntityId;
  exclude?: readonly EntityId[];
}) {
  const ids = relatedEntityIds(id).filter(
    (target) => publishedEntityRoutes[target] && !exclude.includes(target),
  );
  if (!ids.length) return null;
  return (
    <div>
      <h3>В энциклопедии</h3>
      <ul>
        {ids.map((target) => (
          <li key={target}>
            <EntityLink id={target} />
          </li>
        ))}
      </ul>
    </div>
  );
}
