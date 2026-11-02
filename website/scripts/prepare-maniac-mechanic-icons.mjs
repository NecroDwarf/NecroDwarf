// Original, editable SVG pictograms for Wiki mechanics; no runtime generator.
import { mkdir, writeFile } from "node:fs/promises";
const output = "src/app/projects/maniac/assets/wiki/mechanics";
const drawings = {
  "match-preparation": '<path d="M9 25V7h15l-3 5 3 5H9 M18 25l3 3 6-7"/>',
  "match-phases":
    '<path d="M5 25h22 M7 21v-5h5v5 M14 21V11h5v10 M21 21V6h5v15 M6 9l3 3 5-6"/>',
  "match-timer":
    '<circle cx="16" cy="18" r="10"/><path d="M12 3h8 M16 3v5 M16 12v7l5 3 M24 7l3 3"/>',
  "objectives-and-escape":
    '<path d="M7 28V5h15v8 M22 23v5H7 M12 5v23 M17 18h12 m-5-5 5 5-5 5"/>',
  hacking:
    '<rect x="4" y="5" width="24" height="17" rx="2"/><path d="M10 27h12 M16 22v5 M12 10l-4 4 4 4 M20 10l4 4-4 4"/>',
  qte: '<circle cx="16" cy="16" r="11"/><path d="M16 5v5 M27 16h-5 M16 16l6-6 M11 23l3 3 6-7"/><circle cx="16" cy="16" r="2"/>',
  downed:
    '<circle cx="8" cy="17" r="3"/><path d="M5 27h23 M12 21h9l3 4 M15 21l-2 4 M22 6v9 M18 10h9"/>',
  "map-interactions":
    '<path d="M5 28V5h9v23 M22 5h5v23h-5 M14 16h8 M18 12l4 4-4 4"/><circle cx="10" cy="17" r="1"/>',
  mana: '<path d="M16 3C12 10 7 15 7 20a9 9 0 0 0 18 0c0-5-5-10-9-17Z M11 20a5 5 0 0 0 5 5"/>',
  sanity:
    '<path d="M3 16S8 7 16 7s13 9 13 9-5 9-13 9S3 16 3 16Z M16 3v4 M16 25v4"/><circle cx="16" cy="16" r="4"/>',
  "nightmare-trials":
    '<path d="M6 28V13a10 10 0 0 1 20 0v15 M6 28h20 M12 28V15h8v13 M4 8l3 1 M28 8l-3 1 M16 4v4"/><path d="m14 20 2 3 2-3"/>',
  "flower-return":
    '<path d="M16 17v12 M16 25l-5-4 M16 23l5-4 M7 14H3l3-4 M3 14a13 13 0 0 1 23-7"/><path d="M16 16c-8 0-7-8-2-6-3-6 5-8 5-2 6-3 9 5 3 6 3 5-4 8-6 2Z"/>',
  addiction:
    '<path d="M11 3h10 M13 3v8L6 25a3 3 0 0 0 3 4h14a3 3 0 0 0 3-4l-7-14V3 M10 18h12 m-6 1-3 4h5l-2 4"/>',
  casino:
    '<rect x="4" y="7" width="21" height="21" rx="2"/><path d="M8 12h4v9H8Z M16 12h4v9h-4Z M25 19h4V8 M8 25h12"/><circle cx="29" cy="5" r="2"/>',
  alchemy:
    '<path d="M9 3h6 M10 3v9L4 25a3 3 0 0 0 3 4h12a3 3 0 0 0 3-4l-7-13V3 M7 20h12 M25 7v8 M21 11h8"/><circle cx="12" cy="24" r="1"/>',
  resurrection:
    '<path d="M10 28v-9a6 6 0 0 1 12 0v9 M7 28h18 M16 6v12 M11 11h10 M5 17H2l2-4 M2 17a14 14 0 0 1 25-9"/>',
  plague:
    '<circle cx="16" cy="16" r="7"/><path d="M16 3v6 M16 23v6 M3 16h6 M23 16h6 M7 7l4 4 M21 21l4 4 M7 25l4-4 M21 11l4-4 M13 14h1 M19 18h1"/><circle cx="17" cy="13" r="1"/>',
  "ghost-states":
    '<path d="M7 27V13a9 9 0 0 1 18 0v14l-5-3-4 3-4-3-5 3Z M11 13v3 M21 13v3 M13 20h6 M3 10l-2 3 M29 10l2 3"/>',
  "medical-care":
    '<path d="M11 4h10v7h7v10h-7v7H11v-7H4V11h7Z M13 16h6 M16 13v6"/>',
  "shaman-spirits":
    '<path d="M10 4h12v25H10Z M5 9h22 M5 22h22 M13 13h1 M18 13h1 M14 17h4 M16 25v3"/><path d="M3 5l2-3 M27 5l2-3"/>',
  paint:
    '<path d="M7 10h18l-2 17H9Z M7 10l3-5h12l3 5 M10 5c0-5 12-5 12 0 M11 15v7 M26 23c4 4 4 7 0 7s-4-3 0-7Z"/>',
  "orchid-illusion":
    '<path d="M14 18v11 M14 25l-5-4 M14 23l5-4 M14 17c-7 0-8-7-3-8-3-6 5-9 6-3 6-3 9 5 3 6 4 5-3 9-6 5Z M24 9h5v18h-5"/><circle cx="14" cy="12" r="2"/>',
  "color-roulette":
    '<rect x="4" y="5" width="13" height="21" rx="2"/><path d="m18 8 9 3-6 18-5-2 M8 11h5 M10 17v5 M23 14l-2 6"/>',
  "freddy-generator":
    '<rect x="5" y="9" width="22" height="18" rx="2"/><path d="M11 9V5h10v4 M5 22h22 M9 27v3 M23 27v3 m-6-18-5 7h6l-3 5"/>',
  traps:
    '<path d="m4 25 5-10 5 10 5-10 5 10 M4 26h24 M10 8l5 4 5-4 M15 3v9"/><circle cx="26" cy="9" r="2"/>',
  "status-effects":
    '<path d="m9 4 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z m14 10 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z M22 4v5 M19 6h6 M8 24v5 M5 26h6"/>',
  "agent-shop":
    '<path d="M5 4h22v24H5Z M5 10h22 M10 5v4 M22 5v4 M10 16h12 M10 22h6"/><circle cx="23" cy="24" r="2"/>',
  "ursa-stacks":
    '<path d="m4 27 7-16 1-8 4 4-3 11 M11 28l8-15 1-8 4 4-3 10 M19 29l8-14 2-7 2 5-5 12"/>',
};
await mkdir(output, { recursive: true });
for (const [slug, art] of Object.entries(drawings)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 19V8h11 M45 8h11v11 M56 45v11H45 M19 56H8V45" fill="none" stroke="#b69a62" stroke-opacity=".5"/><circle cx="32" cy="32" r="23" fill="#53cfa1" fill-opacity=".05"/><g transform="translate(12 12) scale(1.25)" fill="none" stroke="#83d9bd" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>\n`;
  await writeFile(`${output}/${slug}.svg`, svg);
}
console.log(
  `Prepared ${Object.keys(drawings).length} distinct mechanic pictograms.`,
);
