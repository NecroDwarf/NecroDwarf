import type { EntityChange } from "../data/types";
import { EntityCard } from "./EntityCards";
import s from "./EntityCards.module.css";
export function ReleaseEntityChange({ change }: { change: EntityChange }) {
  return (
    <article className={s.change}>
      <p>{change.editorial}</p>
      <div className={s.comparison}>
        {change.before && (
          <div>
            <p>До изменения</p>
            <EntityCard {...change.before} variant="compact" />
          </div>
        )}
        {change.after && (
          <div>
            <p>
              {change.operation === "added"
                ? "На момент появления"
                : "После изменения"}
            </p>
            <EntityCard {...change.after} variant="compact" />
          </div>
        )}
      </div>
    </article>
  );
}
