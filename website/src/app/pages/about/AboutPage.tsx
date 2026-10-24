import { TeamGrid } from "../../shared/ui/TeamGrid";
import { Contacts } from "../../shared/ui/Contacts";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import s from "../../shared/ui/Content.module.css";
export function AboutPage() {
  return (
    <>
      <section className={`${s.section} ${s.pageTitle}`}>
        <p className={s.label}>NECRODWARF / КОМАНДА</p>
        <h1>
          Создаём, потому что
          <br />
          нам интересно.
        </h1>
        <p className={s.intro}>
          Мы — небольшая независимая команда разработчиков. Нас объединяют
          любопытство, желание учиться и любовь к созданию игр, инструментов и
          цифровых сервисов.
        </p>
        <TeamGrid />
      </section>
      <section className={s.section}>
        <SectionHeading
          index="01"
          label="Связь с командой"
          title="Продолжим разговор."
        />
        <Contacts />
      </section>
    </>
  );
}
