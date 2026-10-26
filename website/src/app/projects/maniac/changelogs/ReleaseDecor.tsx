import type { CSSProperties } from "react";
import s from "./Chronicles.module.css";
import { NightmareEyes } from "./NightmareEyes";
const edgePosition = (index: number) => {
  const fraction = [0.2, 0.8, 0.4, 0.6, 0.3, 0.7][Math.floor(index / 2) % 6];
  return index % 2
    ? `calc(100% - var(--decor-edge-width) * ${fraction})`
    : `calc(var(--decor-edge-width) * ${fraction})`;
};
export function ReleaseDecor({ version }: { version: string }) {
  return (
    <div className={s.decor} data-release-decor={version} aria-hidden="true">
      {version === "1.2" ? (
        <>
          <div className={s.garden} />
          {Array.from({ length: 12 }, (_, i) => (
            <i
              className={s.petal}
              key={i}
              style={
                {
                  "--x": edgePosition(i),
                  "--duration": `${25 + (i % 5) * 3}s`,
                  "--delay": `${-i * 3 - 2}s`,
                } as CSSProperties
              }
            />
          ))}
        </>
      ) : version === "1.0" ? (
        <>
          <div className={s.forgeGlow} />
          {Array.from({ length: 8 }, (_, i) => (
            <i
              className={s.spark}
              key={i}
              style={
                {
                  "--x": edgePosition(i),
                  "--duration": `${6 + (i % 3) * 2}s`,
                  "--delay": `${-i * 2}s`,
                  "--drift": `calc(clamp(2px, calc(var(--decor-edge-width) * .06), 18px) * ${i % 2 ? -1 : 1})`,
                } as CSSProperties
              }
            />
          ))}
        </>
      ) : (
        <>
          <i className={s.haze} />
          <i className={s.haze} />
          <NightmareEyes />
          <NightmareEyes right />
        </>
      )}
    </div>
  );
}
