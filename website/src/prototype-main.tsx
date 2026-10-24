import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NeoTech } from "./concepts/neo-tech/NeoTech";
import { DarkForge } from "./concepts/dark-forge/DarkForge";
import { NeoForge } from "./concepts/neo-forge/NeoForge";
import { NeoTechV2, jadeConcept } from "./concepts/neo-tech-v2/NeoTechV2";
import { Emblem } from "./concepts/neo-tech-v2/Emblem";
import v2 from "./concepts/neo-tech-v2/SelectorV2.module.css";
import { concepts } from "./data/content";
import { Rune } from "./components/Shared";
import "./styles/globals.css";
const path = window.location.pathname.replace(/\/$/, "") || "/";
function Selector() {
  return (
    <main className="selector">
      <header>
        <span className="logo">⟐ NecroDwarf</span>
        <span className="eyebrow">Дизайн-исследование / 2.0</span>
      </header>
      <p className="eyebrow">Одна команда. Новая глава.</p>
      <h1>
        В какой кузнице
        <br />
        родится <em>новая история?</em>
      </h1>
      <p className="selector-intro">
        Neo Tech V2 — новое развитие выбранного направления. Первые три
        концепции сохранены для сравнения.
      </p>
      <a className={v2.feature} href={jadeConcept.path}>
        <div className={v2.art}>
          <Emblem />
        </div>
        <div className={v2.copy}>
          <small>НОВАЯ КОНЦЕПЦИЯ / 04</small>
          <h2>
            Neo Tech <span>V2</span>
          </h2>
          <h3>Jade Engineering</h3>
          <p>
            Куём идеи. Оживляем код. Металл, нефритовая энергия и собственный
            характер независимой команды.
          </p>
          <span className={v2.link}>Исследовать новую концепцию ↗</span>
        </div>
      </a>
      <div className="concepts">
        {concepts.map((c) => (
          <a
            className={"concept-preview preview-" + c.number}
            href={c.path}
            key={c.path}
          >
            <div className="preview-art">
              <Rune />
              <span>{c.number}</span>
            </div>
            <div className="preview-copy">
              <small>КОНЦЕПЦИЯ {c.number}</small>
              <h2>
                {c.name} <span>↗</span>
              </h2>
              <b>{c.caption}</b>
              <p>{c.description}</p>
              <span className="preview-link">Посмотреть концепцию →</span>
            </div>
          </a>
        ))}
      </div>
      <footer>
        Визуальные прототипы · выбор направления{" "}
        <span>Нефрит в основе. Характер в деталях.</span>
      </footer>
    </main>
  );
}
const pages: Record<string, React.ReactNode> = {
  "/": <Selector />,
  "/neo-tech": <NeoTech />,
  "/dark-forge": <DarkForge />,
  "/neo-forge": <NeoForge />,
  "/neo-tech-v2": <NeoTechV2 />,
};
document.title = `${[...concepts, jadeConcept].find((c) => c.path === path)?.name || "Дизайн-концепции"} — NecroDwarf`;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {pages[path] || (
      <main className="selector">
        <h1>Страница не найдена</h1>
        <a href="/">К концепциям →</a>
      </main>
    )}
  </StrictMode>,
);
