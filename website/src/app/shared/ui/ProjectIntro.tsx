import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Project } from "../content/types";
import s from "./ProjectIntro.module.css";
export function ProjectIntro({
  project,
  children,
}: {
  project: Pick<
    Project,
    "name" | "category" | "description" | "tagline" | "theme" | "Art"
  >;
  children?: ReactNode;
}) {
  return (
    <section className={`${s.intro} ${project.theme}`}>
      <Link to="/projects" className={s.back}>
        ← Все проекты
      </Link>
      <div className={s.layout}>
        <div>
          <p className={s.label}>{project.category}</p>
          <h1>{project.name}</h1>
          <p className={s.tagline}>{project.tagline}</p>
          <p className={s.description}>{project.description}</p>
          {children}
        </div>
        <div className={s.art}>
          <project.Art />
          <span>Художественная иллюстрация</span>
        </div>
      </div>
    </section>
  );
}
