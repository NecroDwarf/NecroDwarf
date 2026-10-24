import { ContentLink } from "./ContentLink";
import type { Release } from "../content/types";
import s from "./Content.module.css";
export function ReleaseList({
  releases,
  projectNames,
  headingLevel = 3,
  sourceHref,
  sourceLabel = "Исходные хроники",
}: {
  releases: readonly Release[];
  projectNames: Readonly<Record<string, string>>;
  headingLevel?: 2 | 3;
  sourceHref?: string;
  sourceLabel?: string;
}) {
  const Heading = `h${headingLevel}` as const;
  if (!releases.length) return null;
  return (
    <div className={s.releases}>
      {releases.map((release) => (
        <article key={release.id} className={`${s.release} ${release.theme}`}>
          {release.background && (
            <div className={s.releaseArt} aria-hidden="true">
              <img
                src={release.background.src}
                width={release.background.width}
                height={release.background.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <span className={s.version}>{release.version}</span>
          <div>
            <p className={s.category}>
              {projectNames[release.projectId]} / Обновление
            </p>
            <Heading>{release.title}</Heading>
            <p>{release.summary}</p>
            {release.publishedAt && (
              <time dateTime={release.publishedAt}>
                {new Intl.DateTimeFormat("ru-RU", {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(release.publishedAt))}
              </time>
            )}
          </div>
          <ContentLink
            href={sourceHref ?? release.source}
            className={s.source}
            aria-label={`Читать хроники ${projectNames[release.projectId]} ${release.version} — ${release.title}`}
          >
            {sourceLabel} <span aria-hidden="true">↗</span>
          </ContentLink>
        </article>
      ))}
    </div>
  );
}
