import { useEffect, useRef, useState, type ReactNode } from "react";
import { brand, chronicles, projects, stack } from "../../data/content";
import { Emblem } from "./Emblem";
import {
  ManiacArt,
  FriendSheepArt,
  KingdomArt,
  DiceArt,
  FlowerArt,
} from "./ProjectArt";
import s from "./NeoTechV2.module.css";

export const jadeConcept = {
  path: "/neo-tech-v2",
  name: "Neo Tech V2",
  number: "04",
  caption: "Jade Engineering",
  description:
    "Металл, нефритовая энергия и независимая разработка. Новая глава Neo Tech.",
};

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${s.reveal} ${className}`}
      data-visible={visible}
    >
      {children}
    </div>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path d="M10 3h24l7 7v24l-7 7H10l-7-7V10Z" stroke="currentColor" />
      <path
        d="M12 31V13l10 18V13m5 0h3l5 5v8l-5 5h-3Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="bevel"
      />
      <path d="M3 17V10l7-7m31 24v7l-7 7" stroke="#B69A62" strokeWidth="2" />
    </svg>
  );
}

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: ReactNode;
}) {
  return (
    <p className={s.sectionLabel}>
      <span>{index}</span>
      <span className={s.labelLine} />
      {children}
    </p>
  );
}

function ProjectCopy({ id, number }: { id: string; number: string }) {
  const project = projects.find((p) => p.id === id)!;
  return (
    <div className={s.projectCopy}>
      <p className={s.projectCategory}>
        <span>{number}</span> {project.category}
      </p>
      <h3>{project.name}</h3>
      <p className={s.projectDescription}>{project.description}</p>
    </div>
  );
}

const disciplines = [
  {
    name: "Интерфейсы",
    note: "То, с чем взаимодействуют люди.",
    tech: ["React", "React Native"],
    glyph: "interface",
  },
  {
    name: "Системы",
    note: "То, что связывает всё вместе.",
    tech: ["Node.js", "Go", "PostgreSQL"],
    glyph: "system",
  },
  {
    name: "Игровые миры",
    note: "То, во что хочется погрузиться.",
    tech: ["Minecraft modding"],
    glyph: "world",
  },
];

export function NeoTechV2() {
  const latest = chronicles.find((c) => c.version === "1.2")!;
  return (
    <div className={s.page}>
      <a className={s.skipLink} href="#v2-main">
        К содержанию
      </a>
      <aside className={s.demoBar} aria-label="Сравнение прототипов">
        <a href="/">
          ← <span>Все концепции</span>
        </a>
        <span className={s.demoTitle}>
          Neo Tech V2 <i /> <span>Jade Engineering</span>
        </span>
        <a href="/neo-tech">
          <span>Сравнить с </span>V1 ↗
        </a>
      </aside>
      <header className={s.header}>
        <a className={s.brand} href="#home" aria-label="NecroDwarf — главная">
          <BrandMark />
          <span>
            NecroDwarf<small>Independent development collective</small>
          </span>
        </a>
        <nav className={s.navigation} aria-label="Навигация Neo Tech V2">
          <a href="#home">Главная</a>
          <a href="#projects">Проекты</a>
          <a href="#chronicles">Хроники</a>
          <a href="#about">О команде</a>
        </nav>
        <a className={s.headerLink} href="#projects">
          Исследовать <span>↗</span>
        </a>
      </header>
      <main id="v2-main">
        <section id="home" className={s.hero}>
          <div className={s.heroAtmosphere} aria-hidden="true" />
          <p className={s.heroEyebrow}>
            <span /> Независимая разработка. Собственная энергия.
          </p>
          <h1>
            Куём идеи.
            <br />
            <span>Оживляем код.</span>
          </h1>
          <div className={s.heroStage}>
            <div className={s.heroAside}>
              <span className={s.technical}>01 / JADE ENGINEERING</span>
              <p>
                Ремесло в основе.
                <br />
                Любопытство —<br />
                движущая сила.
              </p>
              <div className={s.smallRule} />
              <span className={s.annotation}>Металл · Нефрит · Код</span>
            </div>
            <div className={s.core}>
              <div className={s.coreGuide} aria-hidden="true" />
              <Emblem className={s.heroEmblem} />
              <p className={s.coreCaption}>
                <span /> ND / КОНЦЕПТУАЛЬНАЯ ЭМБЛЕМА
              </p>
            </div>
            <div className={s.heroIntro}>
              <p>
                Независимая команда разработчиков игр, приложений и цифровых
                сервисов
              </p>
              <a href="#projects" className={s.primaryLink}>
                Наши проекты <span>↘</span>
              </a>
              <span className={s.annotation}>
                От первой идеи до своего мира.
              </span>
            </div>
          </div>
          <div className={s.heroFoot}>
            <span>Создаём то, во что верим.</span>
            <div aria-hidden="true">
              <span>ᚾ</span>
              <i />
              <span>ᛞ</span>
            </div>
            <a href="#projects">
              Листайте, чтобы исследовать <span>↓</span>
            </a>
          </div>
        </section>

        <section id="projects" className={`${s.section} ${s.projectsSection}`}>
          <Reveal>
            <div className={s.sectionHeading}>
              <div>
                <SectionLabel index="01">Наша работа</SectionLabel>
                <h2>
                  Разные миры.
                  <br />
                  <span>Один почерк.</span>
                </h2>
              </div>
              <p>{brand.description}</p>
            </div>
          </Reveal>
          <div className={s.projectGrid}>
            <Reveal className={s.maniacSlot}>
              <article className={`${s.project} ${s.maniac}`}>
                <ManiacArt />
                <div className={s.maniacWord} aria-hidden="true">
                  MANIAC
                </div>
                <div className={s.projectTop}>
                  <span>ВНУТРИ MINECRAFT</span>
                  <span className={s.projectSigil} aria-hidden="true">
                    II / I
                  </span>
                </div>
                <ProjectCopy id="maniac" number="01" />
                <span className={s.projectEngraving} aria-hidden="true">
                  SURVIVE THE UNKNOWN
                </span>
              </article>
            </Reveal>
            <Reveal className={s.friendsSlot}>
              <article className={`${s.project} ${s.friends}`}>
                <div className={s.projectTop}>
                  <span>БЛИЖЕ ДРУГ К ДРУГУ</span>
                  <span aria-hidden="true">+</span>
                </div>
                <FriendSheepArt />
                <ProjectCopy id="friendsheep" number="02" />
              </article>
            </Reveal>
            <Reveal className={s.kingdomSlot}>
              <article className={`${s.project} ${s.kingdom}`}>
                <div className={s.projectTop}>
                  <span>МИР ВНУТРИ ДИАЛОГА</span>
                  <span aria-hidden="true">ᛟ</span>
                </div>
                <KingdomArt />
                <ProjectCopy id="kingdoms" number="03" />
              </article>
            </Reveal>
            <Reveal className={s.diceSlot}>
              <article className={`${s.project} ${s.dice}`}>
                <div className={s.projectTop}>
                  <span>СТРАТЕГИЯ ВСТРЕЧАЕТ СЛУЧАЙНОСТЬ</span>
                  <span aria-hidden="true">D20</span>
                </div>
                <DiceArt />
                <ProjectCopy id="dice" number="04" />
                <span className={s.diceEquation} aria-hidden="true">
                  CHANCE × CHOICE
                </span>
              </article>
            </Reveal>
          </div>
          <div className={s.catalogEnd}>
            <span>Игры. Приложения. Сервисы. Эксперименты.</span>
            <span aria-hidden="true">— ND / 04</span>
          </div>
        </section>

        <section
          id="chronicles"
          className={`${s.section} ${s.chroniclesSection}`}
        >
          <Reveal>
            <div className={s.sectionHeading}>
              <div>
                <SectionLabel index="02">Хроники разработки</SectionLabel>
                <h2>
                  Код меняется.
                  <br />
                  <span>История остаётся.</span>
                </h2>
              </div>
              <p>
                Новые главы Maniac.
                <br />
                Идеи, которые обрели форму.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={s.releaseLayout}>
              <article className={s.latestRelease}>
                <div className={s.releaseTop}>
                  <span>
                    <i /> Последнее в хрониках
                  </span>
                  <span>MANIAC / ОБНОВЛЕНИЕ</span>
                </div>
                <div className={s.releaseBody}>
                  <div className={s.releaseCopy}>
                    <span className={s.releaseVersion}>
                      1.2<span>/</span>
                    </span>
                    <h3>{latest.title}</h3>
                    <p>{latest.description}</p>
                    <div className={s.releaseFact}>
                      <strong>15</strong>
                      <span>
                        новых способов
                        <br />
                        изменить игру
                      </span>
                    </div>
                  </div>
                  <FlowerArt />
                </div>
                <div className={s.releaseBottom}>
                  <span>Цветы расцветают. Баги увядают.</span>
                  <span aria-hidden="true">✳</span>
                </div>
              </article>
              <div className={s.timeline}>
                <p className={s.timelineLabel}>ПРЕДЫДУЩИЕ ГЛАВЫ</p>
                {chronicles
                  .filter((c) => c.version !== "1.2")
                  .map((c) => (
                    <article key={c.version}>
                      <div className={s.timelineNumber}>
                        <span>{c.version}</span>
                        <i />
                      </div>
                      <div>
                        <span className={s.technical}>MANIAC / RELEASE</span>
                        <h3>{c.title}</h3>
                        <p>{c.description}</p>
                      </div>
                    </article>
                  ))}
                <span className={s.timelineEnd}>
                  Каждая версия — продолжение.
                </span>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="about" className={s.about}>
          <div className={s.aboutGlow} aria-hidden="true" />
          <Reveal>
            <div className={s.aboutHeading}>
              <SectionLabel index="03">Те, кто создаёт</SectionLabel>
              <span className={s.aboutCode} aria-hidden="true">
                &lt;craft /&gt;
              </span>
            </div>
            <h2>
              Создаём, потому что
              <br />
              нам <span>интересно.</span>
            </h2>
            <div className={s.aboutText}>
              <span className={s.aboutSignature}>
                NecroDwarf
                <br />
                <small>
                  Независимы в идеях.
                  <br />
                  Едины в ремесле.
                </small>
              </span>
              <p>{brand.about}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className={s.workbench}>
              <div className={s.workbenchTitle}>
                <span>Инструменты нашей мастерской</span>
                <span aria-hidden="true">↙</span>
              </div>
              <div className={s.disciplines}>
                {disciplines.map((d, i) => (
                  <div className={s.discipline} key={d.name}>
                    <div className={s.disciplineIcon} aria-hidden="true">
                      <svg
                        viewBox="0 0 60 50"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d={
                            i === 0
                              ? "M8 8h44v32H8ZM8 17h44M18 8v32m7-17h19m-19 7h12"
                              : i === 1
                                ? "M10 8h40v10H10Zm0 16h40v10H10Zm0 16h40M40 13h4m-4 16h4M16 13h2m-2 16h2"
                                : "m30 6 23 13v25L30 31 7 44V19Zm0 0v25M7 19l23 13 23-13"
                          }
                        />
                      </svg>
                    </div>
                    <h3>{d.name}</h3>
                    <p>{d.note}</p>
                    <ul>
                      {stack
                        .filter((t) => d.tech.includes(t))
                        .map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className={s.aboutClosing}>
            <span aria-hidden="true">ᚾ / ᛞ</span>
            <p>
              Из любопытства — в код.
              <br />
              Из кода — во что-то настоящее.
            </p>
          </div>
        </section>
      </main>
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <a className={s.brand} href="#home">
            <BrandMark />
            <span>NecroDwarf</span>
          </a>
          <p>{brand.footer}</p>
          <a href="#home" className={s.backTop}>
            К началу <span>↑</span>
          </a>
        </div>
        <div className={s.footerBottom}>
          <span>JADE ENGINEERING / ВИЗУАЛЬНАЯ КОНЦЕПЦИЯ</span>
          <a href="/neo-tech">Вернуться к Neo Tech V1 ↗</a>
          <span>СОЗДАНО С ХАРАКТЕРОМ.</span>
        </div>
      </footer>
    </div>
  );
}
