import type { ReactNode } from "react";
import s from "./GameGlyph.module.css";
const shapes = {
  damage: (
    <>
      <path d="m14 3 7 0 0 7-11 11-7-7Z M14 3l7 7 M4 11l9 9 M3 21l4-4" />
    </>
  ),
  health: <path d="M12 21 3.5 12.5C-2 7 6 0 12 6c6-6 14 1 8.5 6.5Z" />,
  armor: (
    <>
      <path d="m5 3 4 2h6l4-2 3 6-4 3v9H6v-9L2 9Z M9 5l3 4 3-4" />
      <path d="M9 13h6" />
    </>
  ),
  cooldown: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v5l3 2 M9 2h6 M12 2v3" />
    </>
  ),
  mana: (
    <path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z M9 15a3 3 0 0 0 3 3" />
  ),
  range: (
    <>
      <path d="M3 21 21 3 M3 15v6h6 M15 3h6v6 M8 12l4 4 M12 8l4 4" />
    </>
  ),
  sanity: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  count: (
    <>
      <path d="m12 2 9 5-9 5-9-5Z M3 7v10l9 5 9-5V7 M12 12v10" />
    </>
  ),
  pistol: (
    <>
      <path d="M3 5h17v6H9l-2 9H2l3-11H3Z M13 11v4H8 M3 8h17 M17 5V3" />
    </>
  ),
  coin: (
    <>
      <ellipse cx="10" cy="8" rx="7" ry="4" />
      <path d="M3 8v5c0 5 14 5 14 0V8 M6 17v2c0 4 15 4 15-1v-6" />
    </>
  ),
  staff: (
    <>
      <path d="m5 22 9-13 M14 9l-4-5 6-3 6 5-4 5Z M14 9l4 2" />
    </>
  ),
  needle: (
    <>
      <path d="m7 3 14 14 M3 7 17 21 M8 6l10 10-5 5L3 11Z M3 21l3-3 M12 6l6-6 M16 2l6 6" />
    </>
  ),
  bandage: (
    <>
      <path d="m3 14 11-11a4 4 0 0 1 6 6L9 20a4 4 0 0 1-6-6Z M8 9l7 7 M10 7l7 7 M10 13h.01 M13 10h.01" />
    </>
  ),
  tablet: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 6h6 M11 18h2 M9 11h6 M12 8v6" />
    </>
  ),
  flask: (
    <>
      <path d="M8 2h8 M9 2v7L3 19a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3L15 9V2 M6 15h12 M8 18h.01 M14 19h.01" />
    </>
  ),
  hook: (
    <>
      <path d="M12 2v13c0 8-10 8-10 0v-4l4 5 M12 15l8-9 M17 6h3v3" />
    </>
  ),
  microphone: (
    <>
      <rect x="8" y="2" width="8" height="12" rx="4" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8" />
    </>
  ),
  lantern: (
    <>
      <path d="M9 5V3a3 3 0 0 1 6 0v2 M7 5h10l3 4-2 12H6L4 9Z M4 9h16 M8 9v12 M16 9v12 M12 12v6" />
    </>
  ),
  claw: <path d="M4 21 11 8l1-6 3 3-3 8 M10 22l7-12 1-6 3 3-3 8 M16 22l5-7" />,
  scythe: (
    <>
      <path d="m5 22 9-18 M3 2c9-3 17 1 19 11-6-7-12-6-19-11Z" />
    </>
  ),
  totem: (
    <>
      <path d="M8 3h8v18H8Z M4 6h16 M4 15h16 M10 8h.01 M14 8h.01 M10 12h4 M10 18h4" />
    </>
  ),
  slots: (
    <>
      <path d="M3 5h16v17H3Z M3 9h16 M6 13h2v4H6Z M11 13h2v4h-2Z M19 14h3V6" />
      <circle cx="22" cy="4" r="2" />
    </>
  ),
} satisfies Record<string, ReactNode>;
export type Glyph = keyof typeof shapes;
export function GameGlyph({ name }: { name: Glyph }) {
  return (
    <svg
      className={`${s.glyph} ${s[name] ?? ""}`}
      data-glyph={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[name]}
    </svg>
  );
}
export function statGlyph(key: string, unit: string): Glyph {
  if (unit === "health") return "health";
  if (unit === "damage") return "damage";
  if (unit === "armor") return "armor";
  if (unit === "mana") return "mana";
  if (unit === "blocks") return "range";
  if (/sanity/.test(key)) return "sanity";
  if (unit === "seconds") return "cooldown";
  return "count";
}
export function equipmentGlyph(slug: string): Glyph {
  for (const [pattern, glyph] of [
    [/armor/, "armor"],
    [/pistol/, "pistol"],
    [/knife/, "damage"],
    [/coin/, "coin"],
    [/staff/, "staff"],
    [/soul/, "sanity"],
    [/syringe|needle/, "needle"],
    [/bandage/, "bandage"],
    [/tablet/, "tablet"],
    [/bong|alchemy/, "flask"],
    [/hook/, "hook"],
    [/microphone/, "microphone"],
    [/lantern/, "lantern"],
    [/claw/, "claw"],
    [/scythe/, "scythe"],
    [/totem/, "totem"],
    [/slot-machine/, "slots"],
    [/teleport/, "range"],
  ] as const)
    if (pattern.test(slug)) return glyph;
  return "count";
}
