import { GameGlyph } from "./GameGlyph";
import { statLabels, type StatSymbol } from "../data/stat-labels";
import s from "./InlineStat.module.css";

export function InlineStat({
  name,
  original,
  label,
  interactive = true,
}: {
  name: StatSymbol;
  original?: string;
  label?: string;
  interactive?: boolean;
}) {
  return (
    <span
      className={s.stat}
      role="img"
      aria-label={label ?? statLabels[name]}
      tabIndex={interactive ? 0 : undefined}
    >
      <GameGlyph name={name} />
      {original && (
        <span className={s.original} aria-hidden="true">
          {original}
        </span>
      )}
    </span>
  );
}
