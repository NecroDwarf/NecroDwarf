import type { CSSProperties } from "react";
import type { EntityAsset } from "../data/types";
import s from "./EntityIcon.module.css";

export function EntityIcon({
  asset,
  variant = "detail",
}: {
  asset: EntityAsset;
  variant?: "compact" | "detail";
}) {
  const {
    scale = 1,
    position = [50, 50],
    blend = "normal",
  } = asset.presentation ?? {};
  const style = {
    "--icon-scale": scale,
    "--icon-x": `${position[0]}%`,
    "--icon-y": `${position[1]}%`,
    "--icon-blend": blend,
  } as CSSProperties;
  return (
    <span
      className={s.frame}
      data-variant={variant}
      data-kind={asset.kind}
      data-entity={asset.entityId}
      style={style}
      aria-hidden="true"
    >
      <img
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
