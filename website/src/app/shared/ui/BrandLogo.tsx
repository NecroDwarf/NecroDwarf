import { useState } from "react";
import s from "./BrandLogo.module.css";
export function BrandLogo({
  variant = "compact",
}: {
  variant?: "compact" | "full";
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={variant === "full" ? s.full : s.compact}
      role={variant === "full" ? "img" : undefined}
      aria-label={variant === "full" ? "NecroDwarf" : undefined}
    >
      {!failed && (
        <img
          src={`/brand/necrodwarf-${variant === "full" ? "full" : "mark"}.png`}
          alt=""
          width={variant === "full" ? 768 : 96}
          height={variant === "full" ? 768 : 96}
          onError={() => setFailed(true)}
        />
      )}
      {(variant === "compact" || failed) && (
        <span
          className={variant === "full" ? s.fallback : s.name}
          aria-hidden={variant === "full" ? true : undefined}
        >
          NecroDwarf
        </span>
      )}
    </span>
  );
}
