import { Link } from "react-router";
import { ContentLink } from "../../../shared/ui/ContentLink";
import { docs, source, pinned, features, steps } from "../content";
import { WorkspaceIllustration } from "../ui/WorkspaceIllustration";
import traveller from "../assets/examples/traveller.png";
import mechanic from "../assets/examples/mechanic.png";
import s from "./NovellMakerPage.module.css";
export function NovellMakerPage() {
  return (
    <div className={s.page} data-novellmaker>
      <div className={s.container}>
        <div className={s.projectBar}>
          <Link to="/projects">← Все проекты</Link>
          <span>Инструменты для авторов / NecroDwarf</span>
        </div>
        <section className={s.hero} aria-labelledby="novellmaker-title">
          <div>
            <p className={s.wordmark}>
              NovellMaker<span>INK & LAVENDER / CREATIVE TOOLS</span>
            </p>
            <p className={s.eyebrow}>Ваша история. Ваши правила.</p>
            <h1 id="novellmaker-title">
              Создавайте истории, <br />
              <em>которые оживают.</em>
            </h1>
            <p className={s.lead}>
              Визуальный редактор и программируемый движок для самостоятельных
              визуальных новелл. От первой реплики до собственной игры — с
              вашими сценами, персонажами и логикой.
            </p>
            <div className={s.actions}>
              <Link className={s.primary} to={docs}>
                Открыть документацию ↗
              </Link>
              <Link className={s.secondary} to="#features">
                Изучить возможности ↓
              </Link>
            </div>
            <ContentLink className={s.sourceLink} href={source}>
              Исходный код на GitHub ↗
            </ContentLink>
          </div>
          <WorkspaceIllustration />
        </section>
      </div>
      <nav className={s.sectionNav} aria-label="Разделы NovellMaker">
        <Link to="#features">Возможности</Link>
        <Link to="#start">Как начать</Link>
        <Link to="#examples">Примеры</Link>
        <Link to="#developers">Разработчикам</Link>
        <Link to={docs}>Документация ↗</Link>
      </nav>
      <section className={`${s.section} ${s.container}`} id="features">
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>
              Творчество, которому есть на что опереться
            </p>
            <h2>
              История — ваша.
              <br />
              <span>Инструменты — под рукой.</span>
            </h2>
          </div>
          <p>
            Соберите основу визуально. Добавьте код там, где истории нужно
            больше свободы.
          </p>
        </div>
        <div className={s.features}>
          {features.map(([title, text, detail, href], i) => (
            <Link to={docs + href} key={title}>
              <div className={s.cardTop}>
                <span>0{i + 1} /</span>
                <span aria-hidden="true">↗</span>
              </div>
              <div className={s.featureDetail}>{detail}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className={s.startSection} id="start">
        <div className={s.container}>
          <p className={s.eyebrow}>От замысла к игре</p>
          <h2>
            Первая сцена —<br />
            <em>уже начало.</em>
          </h2>
          <div className={s.steps}>
            {steps.map(([title, text, href], i) => (
              <Link to={docs + href} key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className={`${s.section} ${s.container}`} id="examples">
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>Открыть. Разобрать. Изменить.</p>
            <h2>Начните с живого примера.</h2>
          </div>
          <p>
            Два редактируемых проекта из репозитория. Откройте{" "}
            <code>example.novell</code> в редакторе и нажмите F6.
          </p>
        </div>
        <div className={s.examples}>
          <article>
            <div className={s.exampleArt}>
              <img
                src={traveller}
                width="240"
                height="320"
                loading="lazy"
                alt="Персонаж traveller из примера авторского интерфейса"
              />
              <div className={s.exampleMenu}>
                <span>АВТОРСКИЙ ХОЛСТ</span>
                <b>Меню</b>
                <span>Звук</span>
                <span>Сохранение</span>
              </div>
            </div>
            <div className={s.exampleCopy}>
              <span className={s.eyebrow}>01 / Интерфейс</span>
              <h3>Каждая кнопка — часть вашего мира.</h3>
              <p>
                Авторские меню, настройки звука и обработчики ui.*. Пример
                показывает создание компонента через ui.create и удаление через
                ui.remove.
              </p>
              <ContentLink href={`${pinned}/examples/author-interface`}>
                Открыть файлы примера ↗
              </ContentLink>
              <Link to={`${docs}/lua/examples`}>Разобрать Lua-примеры →</Link>
            </div>
          </article>
          <article>
            <div className={`${s.exampleArt} ${s.characterArt}`}>
              <span className={s.rigLabel}>СЛОИ / PIVOT / КЛЮЧИ</span>
              <img
                src={mechanic}
                width="240"
                height="320"
                loading="lazy"
                alt="Процедурный PNG персонажа Механик из примера character-animation"
              />
              <div className={s.timeline} aria-hidden="true">
                <span>0.0</span>
                <i>◆</i>
                <i>◆</i>
                <i>◆</i>
                <span>1.0</span>
              </div>
            </div>
            <div className={s.exampleCopy}>
              <span className={s.eyebrow}>02 / Персонажи</span>
              <h3>Дайте персонажу характер. И движение.</h3>
              <p>
                «Механик»: тело, голова и рука с иерархией и ключами; отдельная
                поза из четырёх PNG-кадров с собственными длительностями.
              </p>
              <ContentLink href={`${pinned}/examples/character-animation`}>
                Открыть файлы примера ↗
              </ContentLink>
              <Link to={`${docs}/lua/characters`}>
                Изучить персонажей и клипы →
              </Link>
            </div>
          </article>
        </div>
        <p className={s.caption}>
          Оригинальные PNG из демонстрационных проектов. Композиции карточек —
          иллюстрации возможностей.
        </p>
      </section>
      <section className={s.developers} id="developers">
        <div className={s.container}>
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>Для тех, кто заглядывает под обложку</p>
              <h2>
                Визуально — снаружи.
                <br />
                <span>Программируемо — внутри.</span>
              </h2>
            </div>
            <p>
              Открытая кодовая база и локальные проекты. Редактор работает на
              вашем компьютере; каждая новелла хранит собственные данные и
              ресурсы.
            </p>
          </div>
          <div className={s.technologies}>
            {[
              "C# / .NET 10",
              "Avalonia",
              "MonoGame",
              "Lua 5.2 / MoonSharp",
              ".novell",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className={s.developerGrid}>
            <div>
              <h3>Lua там, где он нужен.</h3>
              <p>
                Сценарный <code>game.*</code> управляет очередью действий.
                Обработчики <code>ui.*</code> работают в собственном окружении с
                ограниченной стандартной библиотекой. Контексты, квоты и
                восстановление описаны в справочнике.
              </p>
              <Link to={`${docs}/lua/execution-model`}>
                Как устроено исполнение →
              </Link>
            </div>
            <div>
              <h3>Запустите редактор из исходников.</h3>
              <p>
                Потребуются закреплённый .NET SDK и NuGet-пакеты. Руководство
                объясняет запуск, подготовку Windows-шаблона и сборку
                установщика.
              </p>
              <Link
                to={`${docs}/engine-guide#для-сборки-редактора-из-репозитория`}
              >
                Руководство по запуску →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className={`${s.finalSection} ${s.container}`}>
        <p className={s.eyebrow}>Следующая глава — за вами</p>
        <h2>
          Пусть идея
          <br />
          <em>станет историей.</em>
        </h2>
        <Link className={s.primary} to={docs}>
          Начать с документации ↗
        </Link>
        <p>Руководство редактора, Lua API и готовые примеры.</p>
      </section>
    </div>
  );
}
