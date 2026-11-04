import { Link } from "react-router";
import { DocsLayout } from "./ui/DocsLayout";
import s from "./ui/Docs.module.css";
const base = "/projects/novellmaker/docs";
const entries = [
  [
    "01",
    "Начало работы",
    "Создайте .novell, настройте первую сцену и проверьте её через F6.",
    "/engine-guide#проект-и-рабочее-пространство",
  ],
  [
    "02",
    "Руководство редактора",
    "Сцены, диалоги, ресурсы, персонажи и рабочее пространство.",
    "/engine-guide",
  ],
  [
    "03",
    "Lua API",
    "Сценарный game.*, обработчики ui.* и ограниченная стандартная библиотека.",
    "/lua",
  ],
  [
    "04",
    "Готовые примеры",
    "От первого сценария до интерфейсов, модулей и мини-игр.",
    "/lua/examples",
  ],
  [
    "05",
    "Ограничения и экспорт",
    "Подготовьте папку игры или установщик для Windows x64.",
    "/engine-guide#экспорт-папки-и-установщика-windows-x64",
  ],
];
export function DocsHome() {
  return (
    <DocsLayout>
      <section className={s.home}>
        <p className={s.eyebrow}>От первой сцены до своей игры</p>
        <h1>История начинается здесь.</h1>
        <p className={s.lead}>
          NovellMaker объединяет настольный визуальный редактор и
          программируемый движок. Сцены, персонажи, интерфейсы и правила
          принадлежат вашему проекту.
        </p>
        <Link className={s.start} to={`${base}/engine-guide`}>
          Создать первую новеллу →
        </Link>
        <div className={s.entryGrid}>
          {entries.map(([number, title, description, href]) => (
            <Link key={number} to={base + href}>
              <span>{number} /</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
        <h2>Когда понадобится Lua?</h2>
        <p>
          Базовую новеллу можно собрать в GUI. Lua добавляет сценарные условия,
          авторские интерфейсы и мини-игры. Начните с{" "}
          <Link to={`${base}/lua/execution-model`}>модели исполнения</Link>:
          окружение сценария <code>game.*</code> и обработчики <code>ui.*</code>{" "}
          устроены по-разному.
        </p>
        <div className={s.notice}>
          <strong>Проверяйте историю в движке.</strong>
          <p>
            F6 запускает нативное окно со снимком проекта. Экспорт Windows x64
            требует подготовленного runtime-шаблона; установщик — также NSIS.
            Здесь доступны руководства и примеры кода.
          </p>
        </div>
      </section>
    </DocsLayout>
  );
}
