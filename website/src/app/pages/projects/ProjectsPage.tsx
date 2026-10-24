import { projects } from "../../projects/registry";
import { ProjectGrid } from "../../shared/ui/ProjectGrid";
import s from "../../shared/ui/Content.module.css";
export function ProjectsPage() {
  return (
    <section className={`${s.section} ${s.pageTitle}`}>
      <p className={s.label}>NECRODWARF / ПРОЕКТЫ</p>
      <h1>
        Разные идеи.
        <br />
        Общий характер.
      </h1>
      <p className={s.intro}>
        Игры, сервисы и инструменты. Три проекта нашей команды — каждый со своей
        атмосферой.
      </p>
      <ProjectGrid projects={projects} headingLevel={2} />
    </section>
  );
}
