import { brand, concepts, stack } from "../data/content";
export function Switcher({ active }: { active: string }) {
  return (
    <nav className="switcher" aria-label="Выбор дизайн-концепции">
      <a href="/" aria-label="Все концепции">
        ⌘ <span>Концепции</span>
      </a>
      <div>
        {concepts.map((c) => (
          <a
            key={c.path}
            href={c.path}
            aria-current={active === c.path ? "page" : undefined}
          >
            <small>{c.number}</small> {c.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
export function Nav() {
  return (
    <nav className="section-nav" aria-label="Основная навигация">
      <a href="#home">Главная</a>
      <a href="#projects">Проекты</a>
      <a href="#chronicles">Хроники</a>
      <a href="#about">О команде</a>
    </nav>
  );
}
export function Logo() {
  return (
    <a className="logo" href="#home">
      <span aria-hidden="true">⟐</span> NecroDwarf
    </a>
  );
}
export function Stack() {
  return (
    <ul className="stack">
      {stack.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <a href="#home">
        NecroDwarf <span aria-hidden="true">⟐</span>
      </a>
      <p>{brand.footer}</p>
      <a href="#home">Наверх ↑</a>
    </footer>
  );
}
export function Glyph({ kind }: { kind: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {kind === "sheep" ? (
        <>
          <path d="M25 61C8 57 12 34 28 34C26 16 49 12 57 27C71 17 87 31 80 44C95 55 84 72 70 67H35Z" />
          <path d="M33 65v15m31-12v12M63 43l17 3-4 15-15-2Z" />
          <circle cx="70" cy="49" r="1" />
        </>
      ) : kind === "swords" ? (
        <>
          <path d="M22 15l11 4 43 50-8 8-44-50Zm56 0-11 4-43 50 8 8 44-50ZM16 66l19 18m29-1 21-18M21 79l-6 7m64-7 6 7" />
        </>
      ) : kind === "crown" ? (
        <>
          <path d="m15 32 18 13 17-24 17 24 18-13-9 39H24ZM25 80h50M26 61h48" />
          <circle cx="50" cy="16" r="4" />
        </>
      ) : (
        <>
          <path d="m50 10 36 21v39L50 91 14 70V31Zm0 0v42m36-21L50 52 14 31m36 21v39" />
          <circle cx="33" cy="52" r="3" />
          <circle cx="32" cy="66" r="3" />
          <circle cx="66" cy="60" r="3" />
        </>
      )}
    </svg>
  );
}
export function Rune() {
  return (
    <svg viewBox="0 0 300 300" fill="none" aria-hidden="true">
      <path d="m150 15 112 65v140l-112 65L38 220V80Z" stroke="currentColor" />
      <path
        d="m150 40 90 52v115l-90 53-90-53V92Z"
        stroke="currentColor"
        opacity=".4"
      />
      <path
        d="M108 204V96l84 108V96M108 126l42-26 42 26M108 174l42 26 42-26"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinejoin="bevel"
      />
      <path
        d="M150 15v25m112 40-22 12m22 128-22-13m-90 78v-25M38 220l22-13M38 80l22 12"
        stroke="currentColor"
      />
    </svg>
  );
}
