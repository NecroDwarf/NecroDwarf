import { Link } from "react-router";
import { releases } from "../../changelogs/registry";
import { characterEntries } from "./catalog";
import { WikiLayout, DataNote } from "./WikiLayout";
import s from "./Wiki.module.css";
export function WikiHomePage() {
  const keeper = characterEntries.find(
    (c) => c.slug === "keeper-of-nightmares",
  )!;
  const trio = ["ghost", "keeper-of-nightmares", "shaman"].map(
    (slug) => characterEntries.find((c) => c.slug === slug)!,
  );
  return (
    <WikiLayout>
      <header className={s.homeHero}>
        <div>
          <p className={s.eyebrow}>ПОЛЕВОЙ СПРАВОЧНИК / MANIAC</p>
          <h1>
            Maniac <em>Wiki</em>
          </h1>
          <p className={s.heroLead}>
            У каждой охоты
            <br />
            есть две стороны.
          </p>
          <p className={s.lead}>
            Узнайте, кто скрывается за фреской. Изучайте персонажей, их
            способности и снаряжение — и выбирайте, как пережить следующую
            встречу.
          </p>
          <Link className={s.primary} to="/projects/maniac/wiki/characters">
            Открыть персонажей <span aria-hidden="true">↗</span>
          </Link>
          <div className={s.heroCounts}>
            <span>
              <b>15</b> персонажей
            </span>
            <span>
              <b>02</b> стороны охоты
            </span>
            <span>
              <b>01</b> мир Maniac
            </span>
          </div>
        </div>
        <div className={s.triptych} aria-hidden="true">
          {trio.map((c) => (
            <img key={c.id} src={c.fresco} width="205" height="480" alt="" />
          ))}
        </div>
      </header>
      <div className={s.container}>
        <DataNote />
        <section className={s.section} aria-labelledby="wiki-sections">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>01 / ЭНЦИКЛОПЕДИЯ</p>
              <h2 id="wiki-sections">Выберите сторону</h2>
            </div>
            <p>Разные цели. Одна охота.</p>
          </div>
          <div className={s.sideChoices}>
            <Link
              to="/projects/maniac/wiki/characters#maniacs"
              data-side="maniac"
            >
              <span className={s.eyebrow}>ОХОТНИКИ / 08 ПЕРСОНАЖЕЙ</span>
              <h3>
                Маньяки <span aria-hidden="true">↗</span>
              </h3>
              <p>Преследуйте, контролируйте и заставляйте ошибаться.</p>
            </Link>
            <Link
              to="/projects/maniac/wiki/characters#survivors"
              data-side="survivor"
            >
              <span className={s.eyebrow}>ПО ТУ СТОРОНУ / 07 ПЕРСОНАЖЕЙ</span>
              <h3>
                Выжившие <span aria-hidden="true">↗</span>
              </h3>
              <p>Помогайте друг другу, рискуйте и находите путь к спасению.</p>
            </Link>
          </div>
          <div className={s.futureCategories}>
            {["Перки", "Способности", "Предметы", "Механики", "Карты"].map(
              (name, i) =>
                i < 2 ? (
                  <Link
                    key={name}
                    to={`/projects/maniac/wiki/${i === 0 ? "perks" : "abilities"}`}
                  >
                    <span className={s.eyebrow}>0{i + 3}</span>
                    <h3>{name}</h3>
                    <span>{i === 0 ? "44 перка" : "12 способностей"} ↗</span>
                  </Link>
                ) : (
                  <div key={name}>
                    <span className={s.eyebrow}>0{i + 3}</span>
                    <h3>{name}</h3>
                    <span>Следующий раздел</span>
                  </div>
                ),
            )}
          </div>
        </section>
        <section className={s.featured} aria-labelledby="featured-character">
          <div className={s.featuredArt}>
            <img
              src={keeper.fresco}
              width="205"
              height="480"
              alt="Оригинальная фреска Хранителя кошмаров"
              loading="lazy"
            />
          </div>
          <div>
            <p className={s.eyebrow}>В ФОКУСЕ / МАНЬЯК</p>
            <h2 id="featured-character">
              Не смотри
              <br />
              слишком долго.
            </h2>
            <h3>Хранитель кошмаров</h3>
            <p>{keeper.data.description}</p>
            <Link className={s.primary} to={keeper.href}>
              Открыть досье <span aria-hidden="true">↗</span>
            </Link>
            <span className={s.featuredNote}>
              В статье — оригинальная 3D-модель персонажа.
            </span>
          </div>
        </section>
        <section className={s.section} aria-labelledby="wiki-history">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>02 / ХРОНИКИ</p>
              <h2 id="wiki-history">Мир меняется</h2>
            </div>
            <Link to="/projects/maniac/changelog">Вся история →</Link>
          </div>
          <div className={s.historyGrid}>
            {releases.map((r) => (
              <Link key={r.id} to={r.href!}>
                <span className={s.eyebrow}>ВЫПУСК {r.version}</span>
                <h3>{r.title}</h3>
                <p>{r.summary}</p>
                <span>Читать хронику ↗</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WikiLayout>
  );
}
