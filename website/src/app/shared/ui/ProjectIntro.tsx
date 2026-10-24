import type { ReactNode } from "react";
import { Link } from "react-router";
import type { ProjectMeta, Project } from "../content/types";
import { ProjectGallery } from "./ProjectGallery";
import s from "./ProjectIntro.module.css";
const statuses: Record<NonNullable<Project["status"]>, string> = {
  idea: "Идея",
  development: "В разработке",
  beta: "Бета",
  released: "Выпущен",
  paused: "Приостановлен",
};
const linkLabels = {
  github: "GitHub",
  website: "Сайт проекта",
  documentation: "Документация",
  download: "Скачать",
};
export function ProjectIntro({
  project,
  children,
}: {
  project: ProjectMeta;
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
          {project.status && (
            <p className={s.status}>{statuses[project.status]}</p>
          )}
          {project.platforms?.length ? (
            <p className={s.description}>
              Платформы: {project.platforms.join(", ")}
            </p>
          ) : null}
          {project.links && Object.values(project.links).some(Boolean) && (
            <div className={s.links}>
              {Object.entries(project.links).map(
                ([kind, href]) =>
                  href && (
                    <a key={kind} href={href}>
                      {linkLabels[kind as keyof typeof linkLabels]}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ),
              )}
            </div>
          )}
          {children}
        </div>
        {(project.cover || project.Art) && (
          <div className={s.art}>
            {project.cover ? (
              <img
                src={project.cover.src}
                alt={project.cover.alt}
                width={project.cover.width}
                height={project.cover.height}
                decoding="async"
              />
            ) : (
              project.Art && <project.Art />
            )}
            {project.cover ? (
              project.cover.caption && <span>{project.cover.caption}</span>
            ) : (
              <span>Художественная иллюстрация</span>
            )}
          </div>
        )}
      </div>
      {project.longDescription?.length ? (
        <section className={s.details}>
          <h2>О проекте</h2>
          {project.longDescription.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ) : null}
      {project.features?.length ? (
        <section className={s.details}>
          <h2>Ключевые особенности</h2>
          <ul>
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {project.gallery?.length ? (
        <section className={s.details}>
          <h2>Галерея</h2>
          <ProjectGallery images={project.gallery} />
        </section>
      ) : null}
    </section>
  );
}
