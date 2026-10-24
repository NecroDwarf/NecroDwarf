import { Link } from "react-router";
import type { Project } from "../content/types";
import s from "./Content.module.css";
export function ProjectGrid({ projects }: { projects: readonly Project[] }) {
  return (
    <div className={s.projects}>
      {projects.map((project, index) => (
        <article className={`${s.project} ${project.theme}`} key={project.id}>
          <Link to={`/projects/${project.id}`} className={s.projectLink}>
            <div className={s.projectArt}>
              <project.Art />
              <span aria-hidden="true">
                0{index + 1} / {project.id.toUpperCase()}
              </span>
            </div>
            <div className={s.projectCopy}>
              <p className={s.category}>{project.category}</p>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <span className={s.projectAction}>
                О проекте <span aria-hidden="true">↗</span>
              </span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
