import { Link } from "react-router";
import { ContentLink } from "../../../shared/ui/ContentLink";
import logo from "../assets/logo.png";
import { features, links, roadmap, steps } from "../content";
import { Icon } from "../ui/Icon";
import { HeroPreview, InterfacePreview } from "../ui/MeetingPreview";
import s from "./FriendSheepPage.module.css";

export function FriendSheepPage() {
  return (
    <div className={s.page} data-friendsheep>
      <div className={s.container}>
        <div className={s.projectBar}>
          <Link className={s.back} to="/projects">
            ← Все проекты
          </Link>
          <span>Цифровой сервис от NecroDwarf</span>
        </div>
        <section className={s.hero} aria-labelledby="friendsheep-title">
          <div className={s.heroCopy}>
            <div className={s.brand}>
              <img
                src={logo}
                alt="Логотип FriendSheep: овечка на парусной лодке"
                width="56"
                height="56"
              />
              <div>
                <span>FriendSheep</span>
                <p>Повод быть вместе.</p>
              </div>
            </div>
            <p className={s.eyebrow}>Для организаторов и участников</p>
            <h1 id="friendsheep-title">
              Любые мероприятия. <span>Один понятный план.</span>
            </h1>
            <p className={s.heroDescription}>
              Встречи друзей, концерты, лекции и учебные занятия — создавайте
              свои мероприятия и находите события по интересам. Описание, время,
              место и участники — всё в одном месте.
            </p>
            <div className={s.actions}>
              <ContentLink className={s.primary} href={links.website}>
                Перейти на сайт <span aria-hidden="true">↗</span>
              </ContentLink>
              <ContentLink className={s.primary} href={links.mobileApp}>
                Приложение в RuStore <span aria-hidden="true">↗</span>
              </ContentLink>
            </div>
            <Link className={s.textLink} to="#how-it-works">
              Как это работает <Icon name="arrow" />
            </Link>
            <div className={s.heroFormats}>
              <span>
                <Icon name="pin" />
                События офлайн
              </span>
              <span>
                <Icon name="globe" />
                Мероприятия онлайн
              </span>
            </div>
          </div>
          <HeroPreview />
        </section>
      </div>

      <nav className={s.sectionNav} aria-label="Разделы FriendSheep">
        <div className={s.container}>
          <Link to="#why">Идея</Link>
          <Link to="#features">Возможности</Link>
          <Link to="#interface">Интерфейс</Link>
          <Link to="#roadmap">Развитие</Link>
        </div>
      </nav>

      <section
        className={`${s.section} ${s.container}`}
        id="why"
        aria-labelledby="why-title"
      >
        <div className={s.why}>
          <div>
            <p className={s.eyebrow}>Почему FriendSheep?</p>
            <h2 id="why-title">
              Разные события.
              <br />
              <span>Понятный план.</span>
            </h2>
          </div>
          <div>
            <p className={s.lead}>
              «Когда начало?», «Где проходит?», «Как участвовать?»
            </p>
            <p>
              Будь то встреча друзей, концерт или учебный семинар, участникам
              нужны понятные детали. FriendSheep собирает описание, время, место
              и состав участников в одной карточке мероприятия.
            </p>
          </div>
        </div>
        <dl className={s.planStrip}>
          <div>
            <dt>
              <Icon name="calendar" />
              Что
            </dt>
            <dd>Идея и описание</dd>
          </div>
          <div>
            <dt>
              <Icon name="clock" />
              Когда
            </dt>
            <dd>Дата и время</dd>
          </div>
          <div>
            <dt>
              <Icon name="pin" />
              Где
            </dt>
            <dd>Офлайн или онлайн</dd>
          </div>
          <div>
            <dt>
              <Icon name="people" />
              Для кого
            </dt>
            <dd>Участники и сообщество</dd>
          </div>
        </dl>
      </section>

      <section
        className={`${s.section} ${s.container}`}
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className={s.sectionHeading}>
          <p className={s.eyebrow}>Как это работает</p>
          <h2 id="how-title">От идеи — к мероприятию.</h2>
          <p>
            Планируйте своё событие или присоединяйтесь к тем, что вам
            интересны.
          </p>
        </div>
        <ol className={s.steps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <div className={s.stepTop}>
                <span className={s.iconBox}>
                  <Icon name={step.icon} />
                </span>
                <span className={s.stepNumber}>0{index + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={s.featureSection}
        id="features"
        aria-labelledby="features-title"
      >
        <div className={s.container}>
          <div className={s.splitHeading}>
            <div>
              <p className={s.eyebrow}>Возможности сервиса</p>
              <h2 id="features-title">
                Всё для вашего
                <br />
                мероприятия.
              </h2>
            </div>
            <p>
              От камерной встречи до открытого концерта, лекции или учебного
              мероприятия. Один понятный подход к организации и участию.
            </p>
          </div>
          <div className={s.features}>
            {features.map((feature) => (
              <article
                key={feature.title}
                className={s.feature}
                data-tone={feature.tone}
              >
                <span className={s.iconBox}>
                  <Icon name={feature.icon} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <span className={s.featureDetail}>{feature.detail}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${s.section} ${s.container}`}
        id="interface"
        aria-labelledby="interface-title"
      >
        <div className={s.sectionHeading}>
          <p className={s.eyebrow}>Знакомые детали. Свой характер.</p>
          <h2 id="interface-title">Как выглядит FriendSheep</h2>
          <p>
            Веб-версия и мобильное приложение: лента событий, карточки
            мероприятий и сообщества — на большом экране и в телефоне.
          </p>
        </div>
        <InterfacePreview />
      </section>

      <section
        className={`${s.section} ${s.container}`}
        id="roadmap"
        aria-labelledby="roadmap-title"
      >
        <div className={s.splitHeading}>
          <div>
            <p className={s.eyebrow}>Проект в развитии</p>
            <h2 id="roadmap-title">Куда движется FriendSheep</h2>
          </div>
          <ContentLink className={s.textLink} href={links.roadmap}>
            Подробный roadmap на GitHub ↗
          </ContentLink>
        </div>
        <p className={s.roadmapIntro}>
          Уже есть серверная основа. Впереди — развитие опыта организаторов и
          участников, новые инструменты для мероприятий и сообществ. Без
          обещаний конкретных дат.
        </p>
        <div className={s.roadmap}>
          {roadmap.map((stage, index) => (
            <article className={s.roadmapStage} key={stage.title}>
              <p className={s.stageStatus}>
                <span aria-hidden="true">
                  {index === 0 ? "✓" : `0${index + 1}`}
                </span>
                {stage.status}
              </p>
              <h3>{stage.title}</h3>
              <ul>
                {stage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${s.section} ${s.container} ${s.foundation}`}
        id="team"
        aria-labelledby="friendsheep-team-title"
      >
        <div className={s.team}>
          <span className={s.teamMark} aria-hidden="true">
            NecroDwarf
          </span>
          <p className={s.eyebrow}>Сделано в NecroDwarf</p>
          <h2 id="friendsheep-team-title">
            Из общей идеи —<br />в самостоятельный сервис.
          </h2>
          <p>
            FriendSheep — проект команды NecroDwarf. Он возник в том числе как
            дипломная работа и развивается как самостоятельный цифровой сервис
            для организации мероприятий.
          </p>
          <Link className={s.textLink} to="/about">
            Познакомиться с командой <Icon name="arrow" />
          </Link>
        </div>
      </section>

      <section
        className={`${s.container} ${s.closingWrap}`}
        aria-labelledby="closing-title"
      >
        <div className={s.closing}>
          <img src={logo} alt="" width="64" height="64" loading="lazy" />
          <p className={s.eyebrow}>FriendSheep · Повод быть вместе.</p>
          <h2 id="closing-title">
            Любое событие начинается
            <br />с понятного плана.
          </h2>
          <p>
            Организуйте своё мероприятие или найдите то, в котором хочется
            участвовать.
          </p>
          <div className={s.actions}>
            <ContentLink className={s.primary} href={links.website}>
              Перейти на сайт <span aria-hidden="true">↗</span>
            </ContentLink>
            <ContentLink className={s.primary} href={links.mobileApp}>
              Приложение в RuStore <span aria-hidden="true">↗</span>
            </ContentLink>
            <Link className={s.secondary} to="/projects">
              Другие проекты NecroDwarf <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
