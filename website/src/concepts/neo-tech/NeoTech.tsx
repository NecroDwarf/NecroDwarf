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
import s from "./NeoTech.module.css";
export function NeoTech() {
  return (
    <div className={s.page}>
      <Switcher active="/neo-tech" />
      <div className={s.wrap}>
        <header className={s.header}>
          <Logo />
          <Nav />
        </header>
        <main>
          <section id="home" className={s.hero}>
            <div className={s.heroCopy}>
              <p className="eyebrow">● Независимая разработка / NecroDwarf</p>
              <h1>
                Идеи в код.
                <br />
                Код в <span>жизнь.</span>
              </h1>
              <h2>{brand.intro}</h2>
              <p>{brand.description}</p>
              <a className={s.cta} href="#projects">
                Наши проекты <span>↗</span>
              </a>
            </div>
            <div className={s.blueprint} aria-hidden="true">
              <div className={s.coordinates}>
                ND / ENGINEERING
                <br />
                JADE CONSTRUCTION
              </div>
              <div className={s.machine}>
                <Rune />
                <div />
                <div />
              </div>
              <span className={s.caption}>ГЕОМЕТРИЯ СОЗДАНИЯ +</span>
            </div>
            <div className={s.heroBottom}>
              <span>Игры / Сервисы / Приложения / Инструменты</span>
              <a href="#projects">Исследовать ↓</a>
            </div>
          </section>
          <section id="projects" className={s.section}>
            <div className={s.heading}>
              <div>
                <p className="eyebrow">01 / Что мы создаём</p>
                <h2>
                  Избранные проекты<span> / 04</span>
                </h2>
              </div>
              <p>
                Разные задачи.
                <br />
                Одинаковый интерес к созданию.
              </p>
            </div>
            <div className={s.grid}>
              {projects.map((p, i) => (
                <article className={s.card} key={p.id}>
                  <div className={s.art}>
                    <span>ND—0{i + 1}</span>
                    <Glyph kind={p.symbol} />
                    <small>{p.label}</small>
                  </div>
                  <div className={s.cardBody}>
                    <p className="eyebrow">{p.category}</p>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section id="chronicles" className={s.section}>
            <div className={s.heading}>
              <div>
                <p className="eyebrow">02 / Журнал изменений</p>
                <h2>Хроники</h2>
              </div>
              <span className="eyebrow">Проект: Maniac</span>
            </div>
            <div className={s.updates}>
              {chronicles.map((c) => (
                <article key={c.version}>
                  <span className={s.version}>v{c.version}</span>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <span className={s.updateMeta}>MANIAC / ОБНОВЛЕНИЕ</span>
                </article>
              ))}
            </div>
          </section>
          <section id="about" className={s.about}>
            <p className="eyebrow">03 / Люди за кодом</p>
            <div>
              <h2>{brand.motto}</h2>
              <p>{brand.about}</p>
              <Stack />
            </div>
            <span className={s.aboutMark} aria-hidden="true">
              [nd]
            </span>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
