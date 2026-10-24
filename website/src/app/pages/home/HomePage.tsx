import { Link } from "react-router";
import { BrandLogo } from "../../shared/ui/BrandLogo";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { ProjectGrid } from "../../shared/ui/ProjectGrid";
import { ReleaseList } from "../../shared/ui/ReleaseList";
import { TeamGrid } from "../../shared/ui/TeamGrid";
import { Contacts } from "../../shared/ui/Contacts";
import {
  projects,
  publishedReleases,
  projectNames,
} from "../../projects/registry";
import { contacts } from "../../shared/content/team";
import c from "../../shared/ui/Content.module.css";
import s from "./HomePage.module.css";
export function HomePage() {
  return (
    <>
      <section className={s.hero}>
        <p className={s.eyebrow}>
          <span />
          Независимая разработка. Собственная энергия.
        </p>
        <h1>
          Куём идеи.
          <br />
          <span>Оживляем код.</span>
        </h1>
        <div className={s.stage}>
          <div className={s.aside}>
            <span className={s.technical}>NECRO / DWARF</span>
            <p>
              Любопытство —<br />
              наш источник энергии.
            </p>
            <i />
            <small>
              Игры. Инструменты.
              <br />
              Сервисы. Идеи.
            </small>
          </div>
          <div className={s.core}>
            <BrandLogo variant="full" />
          </div>
          <div className={s.intro}>
            <p>
              Независимая команда разработчиков игр, приложений и цифровых
              сервисов.
            </p>
            <Link to="/projects" className={c.primary}>
              Наши проекты <span aria-hidden="true">↗</span>
            </Link>
            <a className={s.telegram} href={contacts[0].url}>
              Telegram команды ↗
            </a>
          </div>
        </div>
        <div className={s.foot}>
          <span>
            JADE ENGINEERING <i /> NECRODWARF
          </span>
          <a href="#projects">Исследовать проекты ↓</a>
        </div>
      </section>
      <section id="projects" className={c.section}>
        <SectionHeading
          index="01"
          label="То, что мы создаём"
          title={
            <>
              Разные идеи.
              <br />
              Общий характер.
            </>
          }
          action={<Link to="/projects">Все проекты ↗</Link>}
        />
        <ProjectGrid projects={projects} />
      </section>
      <section className={c.section}>
        <SectionHeading
          index="02"
          label="Хроники разработки"
          title={
            <>
              Код меняется.
              <br />
              История остаётся.
            </>
          }
          action={<Link to="/changelog">Все обновления ↗</Link>}
        />
        <ReleaseList
          releases={publishedReleases.slice(0, 3)}
          projectNames={projectNames}
        />
      </section>
      <section className={c.section}>
        <SectionHeading
          index="03"
          label="Те, кто создаёт"
          title={
            <>
              Создаём, потому что
              <br />
              нам интересно.
            </>
          }
          action={<Link to="/about">О команде ↗</Link>}
        />
        <TeamGrid />
      </section>
      <section className={c.section}>
        <SectionHeading
          index="04"
          label="На связи"
          title="Есть идея? Обсудим."
        />
        <Contacts />
      </section>
    </>
  );
}
