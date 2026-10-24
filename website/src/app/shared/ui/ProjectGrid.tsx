import { Link } from "react-router";
import type { Project } from "../content/types";
import s from "./Content.module.css";
export function ProjectGrid({
  projects,
  headingLevel = 3,
}: {
  projects: readonly Project[];
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={s.projects}>
      {projects.map((project, index) => (
        <article className={`${s.project} ${project.theme}`} key={project.id}>
          <Link to={`/projects/${project.id}`} className={s.projectLink}>
            {(project.cover || project.Art) && (
              <div className={s.projectArt}>
                {project.cover ? (
                  <img
                    src={project.cover.src}
                    alt={project.cover.alt}
                    width={project.cover.width}
                    height={project.cover.height}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  project.Art && <project.Art />
                )}
                <span aria-hidden="true">
                  0{index + 1} / {project.id.toUpperCase()}
                </span>
              </div>
            )}
            <div className={s.projectCopy}>
              <p className={s.category}>{project.category}</p>
              <Heading>{project.name}</Heading>
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
