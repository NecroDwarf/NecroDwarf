import { Link } from "react-router";
import { releases } from "./registry";
import s from "./Chronicles.module.css";
export function ManiacChangelogPage() {
  return (
    <div className={`${s.page} ${s.index}`} data-chronicle="index">
      <header className={s.indexHead}>
        <Link to="/projects/maniac">← Maniac</Link>
        <p className={s.kicker}>MANIAC / ИСТОРИЯ ОБНОВЛЕНИЙ</p>
        <h1>
          Каждая версия —<br />
          <em>новая охота.</em>
        </h1>
        <p>
          От перековки игровых систем до цветочного хоррора. Полные хроники,
          авторские заметки и изменения, которые сделали Maniac таким, каким вы
          его знаете.
        </p>
      </header>
      <div className={s.releaseGrid}>
        {releases.map((release) => (
          <article
            key={release.id}
            className={s.releaseCard}
            data-chronicle={release.version}
          >
            {release.background && (
              <img
                src={release.background.src}
                width={release.background.width}
                height={release.background.height}
                alt=""
                loading="lazy"
              />
            )}
            <div className={s.releaseCopy}>
              <p className={s.kicker}>
                ВЫПУСК <span>{release.version}</span>
              </p>
              <h2>
                <Link to={release.href!}>{release.title}</Link>
              </h2>
              <p>{release.summary}</p>
              <span className={s.cardAction}>
                Полная хроника <span aria-hidden="true">↗</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      <p className={s.indexFoot}>
        Точные даты выпусков не подтверждены. Хроники расположены в порядке
        версий.
      </p>
    </div>
  );
}
