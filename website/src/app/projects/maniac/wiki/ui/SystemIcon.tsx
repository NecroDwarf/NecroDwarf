import type { EntityId } from "../data/types";
import { systemIconAsset } from "../data/system-icons";
import { EntityIcon } from "./EntityIcon";
import { GameGlyph, equipmentGlyph } from "./GameGlyph";
import frame from "./EntityIcon.module.css";
import s from "./SystemIcon.module.css";

export function SystemIcon({
  id,
  icon,
  variant = "detail",
}: {
  id: EntityId<"item" | "mechanic">;
  icon?: string;
  variant?: "detail" | "compact";
}) {
  const asset = systemIconAsset(id, icon);
  if (asset) return <EntityIcon asset={asset} variant={variant} />;
  return (
    <span
      className={`${frame.frame} ${s.symbol}`}
      data-entity={id}
      data-kind="symbol"
      data-variant={variant}
      aria-hidden="true"
    >
      <GameGlyph name={equipmentGlyph(id.split(":")[1])} />
    </span>
  );
}
