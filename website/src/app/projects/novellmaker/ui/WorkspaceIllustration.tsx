import s from "./WorkspaceIllustration.module.css";
export function WorkspaceIllustration() {
  return (
    <figure className={s.figure}>
      <div
        className={s.workspace}
        aria-label="Схема рабочей среды: обозреватель, экран сцены, свойства и фразы"
      >
        <div className={s.title}>
          <span aria-hidden="true">● ● ●</span>
          <span>NovellMaker / история.novell</span>
          <span>F6 ↗</span>
        </div>
        <div className={s.menu}>
          Файл <span>Проект</span> Вид <span>Запуск</span> Сборка
        </div>
        <div className={s.body}>
          <div className={s.explorer}>
            <b>Обозреватель</b>
            <span>⌄ Сцены</span>
            <em>Начало истории</em>
            <span>⌄ Персонажи</span>
            <span>⌄ Изображения</span>
            <span>⌄ Lua-файлы</span>
          </div>
          <div className={s.canvas}>
            <div className={s.sky}>
              <svg viewBox="0 0 420 260" aria-hidden="true">
                <defs>
                  <linearGradient id="nm-sky" x2="0" y2="1">
                    <stop stopColor="#56466e" />
                    <stop offset="1" stopColor="#b997c2" />
                  </linearGradient>
                </defs>
                <path fill="url(#nm-sky)" d="M0 0h420v260H0z" />
                <circle cx="300" cy="62" r="27" fill="#ebcb91" />
                <path
                  d="m0 180 80-100 80 110 74-82 90 110 60-100 36 55v87H0"
                  fill="#544562"
                />
                <path
                  d="m0 215 120-62 100 66 90-40 110 48v33H0"
                  fill="#302c40"
                />
                <path d="m228 208 16-58 19-8 18 8 17 58z" fill="#bfa1cb" />
                <circle cx="262" cy="126" r="19" fill="#e1c8d4" />
              </svg>
              <div className={s.dialogue}>
                <b>Ваша история</b>
                <p>У каждого пути есть первая строка.</p>
                <span aria-hidden="true">▾</span>
              </div>
            </div>
          </div>
          <div className={s.properties}>
            <b>Свойства</b>
            <span>Сцена</span>
            <em>Начало истории</em>
            <span>Персонажи</span>
            <span>Фон</span>
            <span>Холст</span>
          </div>
        </div>
        <div className={s.phrases}>
          <span>Фразы</span>
          <div>
            <i>01</i>
            <b>Начало</b>
            <span>→</span>
            <i>02</i>
            <b>Диалог</b>
            <span>→</span>
            <i>03</i>
            <b>Выбор</b>
          </div>
        </div>
      </div>
      <figcaption>
        Иллюстрация рабочей среды по структуре редактора. Не скриншот.
      </figcaption>
    </figure>
  );
}
