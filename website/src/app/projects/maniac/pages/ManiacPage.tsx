import { Link } from "react-router";
import { ProjectIntro } from "../../../shared/ui/ProjectIntro";
import { ReleaseList } from "../../../shared/ui/ReleaseList";
import { SectionHeading } from "../../../shared/ui/SectionHeading";
import { meta } from "../meta";
import { releases } from "../changelogs/registry";
import s from "../../../shared/ui/Content.module.css";
export function ManiacPage() {
  return (
    <>
      <ProjectIntro project={meta}>
        <Link className={s.primary} to="/changelog">
          Хроники проекта ↗
        </Link>
      </ProjectIntro>
      <section className={s.section}>
        <SectionHeading
          index="01"
          label="История проекта"
          title="Последняя глава"
        />
        <ReleaseList
          releases={releases
            .filter((r) => r.status === "published")
            .slice(0, 1)}
          projectNames={{ maniac: "Maniac" }}
        />
      </section>
    </>
  );
}
