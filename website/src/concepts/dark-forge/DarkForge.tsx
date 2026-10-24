import { brand, projects, chronicles } from "../../data/content";
import {
  Switcher,
  Logo,
  Nav,
  Stack,
  Footer,
  Glyph,
  Rune,
} from "../../components/Shared";
import s from "./DarkForge.module.css";
export function DarkForge() {
  return (
    <div className={s.page}>
      <Switcher active="/dark-forge" />
      <header className={s.header}>
        <Logo />
        <Nav />
        <span className={s.headerRune} aria-hidden="true">
          ᚾ ᛞ
        </span>
      </header>
      <main>
        <section id="home" className={s.hero}>
          <div className={s.arch} aria-hidden="true" />
          <p className={s.kicker}>Код — наше ремесло</p>
          <div className={s.seal}>
            <Rune />
            <span aria-hidden="true">
              ᚾ · ᛖ · ᚲ · ᚱ · ᛟ · ᛞ · ᚹ · ᚨ · ᚱ · ᚠ
            </span>
          </div>
          <h1>
            Necro<span>Dwarf</span>
          </h1>
          <h2>{brand.intro}</h2>
          <div className={s.ornament} aria-hidden="true">
            ──── ◇ ────
          </div>
          <p className={s.description}>{brand.description}</p>
          <a href="#projects" className={s.cta}>
            Наши проекты <span>↓</span>
          </a>
          <span className={s.heroNote}>Камень хранит. Нефрит оживляет.</span>
        </section>
        <div className={s.wrap}>
          <section id="projects" className={s.section}>
            <div className={s.heading}>
              <p className={s.kicker}>I / Дела мастерской</p>
              <h2>Создано в нашей кузнице</h2>
              <span aria-hidden="true">◆</span>
            </div>
            <div className={s.projects}>
              {projects.map((p, i) => (
                <article key={p.id} className={s.project}>
                  <div className={s.projectArt}>
                    <span className={s.index}>0{i + 1}</span>
                    <Glyph kind={p.symbol} />
                    <div className={s.artRune} aria-hidden="true">
                      ᛞ
                    </div>
                  </div>
                  <p className={s.category}>{p.category}</p>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className={s.projectEnd} aria-hidden="true">
                    — ◇ —
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section id="chronicles" className={s.section}>
            <div className={s.heading}>
              <p className={s.kicker}>II / Записи летописца</p>
              <h2>Хроники мастерской</h2>
              <span aria-hidden="true">◆</span>
            </div>
            <div className={s.chronicles}>
              {chronicles.map((c) => (
                <article key={c.version}>
                  <div className={s.version}>{c.version}</div>
                  <div>
                    <p className={s.category}>Maniac · Обновление</p>
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                  </div>
                  <span aria-hidden="true">✧</span>
                </article>
              ))}
            </div>
          </section>
          <section id="about" className={s.about}>
            <p className={s.kicker}>III / О команде</p>
            <h2>{brand.motto}</h2>
            <div className={s.ornament} aria-hidden="true">
              ──── ◇ ────
            </div>
            <p>{brand.about}</p>
            <Stack />
          </section>
          <Footer />
        </div>
      </main>
    </div>
  );
}
