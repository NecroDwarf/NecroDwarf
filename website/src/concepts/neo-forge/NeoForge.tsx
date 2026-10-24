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
import s from "./NeoForge.module.css";
export function NeoForge() {
  return (
    <div className={s.page}>
      <Switcher active="/neo-forge" />
      <div className={s.wrap}>
        <header className={s.header}>
          <Logo />
          <Nav />
        </header>
        <main>
          <section id="home" className={s.hero}>
            <div className={s.overline}>
              <span>{brand.intro}</span>
              <span>Игры · Сервисы · Приложения</span>
            </div>
            <h1>
              Цифровое.
              <br />
              <em>С характером.</em>
            </h1>
            <div className={s.heroBottom}>
              <div className={s.intro}>
                <p>{brand.description}</p>
                <a href="#projects">
                  Наши проекты <span>↘</span>
                </a>
              </div>
              <div className={s.artifact} aria-hidden="true">
                <div className={s.artifactStone}>
                  <Rune />
                </div>
                <span>ND — РЕМЕСЛО В КАЖДОЙ ДЕТАЛИ</span>
              </div>
              <p className={s.sideNote}>
                Любопытство —<br />
                наш исходный код.
              </p>
            </div>
          </section>
          <section id="projects" className={s.projects}>
            <div className={s.sectionHeading}>
              <p className="eyebrow">01 / Избранные работы</p>
              <h2>
                От идеи
                <br />к своему миру.
              </h2>
              <span>
                Четыре проекта.
                <br />
                Четыре разных истории.
              </span>
            </div>
            {projects.map((p, i) => (
              <article key={p.id} className={s.project}>
                <div className={s.projectTitle}>
                  <span className={s.number}>0{i + 1}</span>
                  <div>
                    <p className="eyebrow">{p.category}</p>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                  </div>
                </div>
                <div className={s.projectArt}>
                  <Glyph kind={p.symbol} />
                  <span>{p.label}</span>
                  <span aria-hidden="true" className={s.corner}>
                    ⌜
                  </span>
                </div>
              </article>
            ))}
          </section>
          <section id="chronicles" className={s.chronicles}>
            <div>
              <p className="eyebrow">02 / Хроники</p>
              <h2>
                Работа
                <br />
                продолжается<span>.</span>
              </h2>
              <p className={s.chroniclesNote}>
                Новые главы Maniac.
                <br />
                Шаг за шагом, версия за версией.
              </p>
            </div>
            <div className={s.entries}>
              {chronicles.map((c) => (
                <article key={c.version}>
                  <span>MANIAC / {c.version}</span>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                </article>
              ))}
            </div>
          </section>
          <section id="about" className={s.about}>
            <div>
              <p className="eyebrow">03 / О нас</p>
              <div className={s.smallRune}>
                <Rune />
              </div>
            </div>
            <div>
              <h2>{brand.motto}</h2>
              <h3>NecroDwarf — {brand.intro.toLowerCase()}.</h3>
              <p>{brand.about}</p>
              <Stack />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
