import { publishedReleases, projectNames } from "../../projects/registry";
import { ReleaseList } from "../../shared/ui/ReleaseList";
import s from "../../shared/ui/Content.module.css";
export function ChangelogPage() {
  return (
    <section className={`${s.section} ${s.pageTitle}`}>
      <p className={s.label}>NECRODWARF / ХРОНИКИ</p>
      <h1>История в версиях.</h1>
      <p className={s.intro}>
        Последние опубликованные обновления наших проектов. Сейчас в хрониках —
        три главы Maniac.
      </p>
      <ReleaseList
        releases={publishedReleases}
        projectNames={projectNames}
        headingLevel={2}
      />
      <p className={s.note}>
        Точные даты этих выпусков не указаны. Обновления Maniac расположены в
        порядке версий; полные хроники доступны на страницах выпусков.
      </p>
    </section>
  );
}
