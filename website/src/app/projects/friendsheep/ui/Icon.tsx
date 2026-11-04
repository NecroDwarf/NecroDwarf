const paths = {
  calendar:
    "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 3h2",
  people:
    "M16 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3m18 0v-3a4 4 0 0 0-3-3.87M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 3.13a3.5 3.5 0 0 1 0 6.74",
  search: "m21 21-5-5M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z",
  globe:
    "M3 12h18M12 2a18 18 0 0 1 0 20 18 18 0 0 1 0-20Zm0 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 13h4",
  game: "M8 6h8c3 0 4 2 4.5 5l1 6c.4 3-2 4-4 2l-3-3h-5l-3 3c-2 2-4.4 1-4-2l1-6C4 8 5 6 8 6Zm-2 5h4m-2-2v4m8-3h.01m2 3h.01",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z",
  clock: "M12 6v6l4 2m6-2a10 10 0 1 0-20 0 10 10 0 0 0 20 0Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18",
  film: "M3 3h18v18H3V3Zm4 0v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4",
  music:
    "M9 18V5l12-3v13M9 8l12-3M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  book: "M12 5v16m0-16C9 3 6 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 1Z",
  board:
    "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h.01M12 12h.01M17 17h.01M7 17h.01M17 7h.01",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
