import { useId, type CSSProperties } from "react";
import s from "./Chronicles.module.css";

// Rare glimpses in the side background; no permanent outline while closed.
export function NightmareEyes({ right = false }: { right?: boolean }) {
  const id = useId();
  return (
    <div className={s.nightmareEyes} data-side={right ? "right" : "left"}>
      <div
        className={s.watchingEye}
        style={
          {
            "--eye-cycle": `${right ? 49 : 37}s`,
            "--eye-delay": `${right ? -7 : -19}s`,
          } as CSSProperties
        }
      >
        <svg viewBox="0 0 120 84" fill="none">
          <defs>
            <radialGradient id={id}>
              <stop stopColor="#d3b6f1" />
              <stop offset=".3" stopColor="#9969ce" />
              <stop offset=".72" stopColor="#54317d" />
              <stop offset="1" stopColor="#140c22" />
            </radialGradient>
          </defs>
          <g className={s.eyeAperture}>
            <path
              d="M3 43Q25 12 57 16Q88 11 117 43Q88 72 61 69Q28 73 3 43Z"
              fill="#100a1d"
              stroke="#80609f"
              strokeWidth="2"
            />
            <ellipse cx="60" cy="43" rx="23" ry="26" fill={`url(#${id})`} />
            <path d="M60 20Q49 43 60 67Q70 43 60 20Z" fill="#06040c" />
            <ellipse
              cx="51"
              cy="33"
              rx="3"
              ry="5"
              fill="#eedfff"
              opacity=".65"
            />
            <path
              d="M10 42L27 37L34 43M108 43L93 49L85 43M20 28L33 34M98 58L85 52"
              stroke="#88559c"
              strokeWidth="1"
            />
            <path
              d="M7 38Q28 6 58 12M66 74Q97 73 113 51"
              stroke="#50315f"
              strokeWidth="3"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
