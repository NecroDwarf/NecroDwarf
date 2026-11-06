# NecroDwarf 2.0 — сайт команды

React + TypeScript + Vite + React Router. Русскоязычный статический сайт независимой команды. Без сервера, CMS, аккаунтов и Cloudflare Workers.

Состояние описания: 6 ноября 2026. Опубликованы 213 маршрутов и отдельная 404.
Текущие разделы и ограничения перечислены ниже.

Исторические результаты исправлений и границы проверки перед выпуском:
[RELEASE_READINESS.md](docs/RELEASE_READINESS.md) (1 ноября 2026).
Исходные замечания — [FINAL_RELEASE_AUDIT.md](docs/FINAL_RELEASE_AUDIT.md),
история предыдущего рефакторинга — [CODE_AUDIT.md](docs/CODE_AUDIT.md).

## Запуск

Node.js 22.12+ (проверено на 22.13.0), npm 10.9.2. Версии зависимостей фиксируются в `package-lock.json`.

```powershell
cd website
npm ci
npm run dev
# http://127.0.0.1:5173
```

```powershell
npm run typecheck
npm run build
npm run check
npm run format:check
npm run preview
# http://127.0.0.1:4173
```

Полный браузерный прогон: [установка Chromium, команды и отчёты](docs/BROWSER_CHECKS.md).

`dev` — Vite для разработки, его fallback не проверяет статические URL. `preview` — локальный сервер готовой статики с clean URL, редиректом завершающего `/` и настоящим HTTP 404. `check` запускает такой сервер на свободном порту и проверяет HTML, метаданные, ссылки, ресурсы, закрытые будущие маршруты и 404 без выполнения JavaScript.

`build` последовательно подготавливает документацию NovellMaker из локальных
Markdown-исходников, обновляет полнотекстовый индекс Maniac Wiki, проверяет типы
и генерирует статику. `dev` автоматически обновляет индекс Wiki перед запуском Vite.
После изменения статей в уже запущенном dev повторите `npm run search:prepare`;
после изменения исходников документации — `npm run docs:novellmaker`.

## Аудит и миграционные решения

На старте корень репозитория содержал `.gitattributes` и неотслеживаемую папку `website/`. Ветка `main`, единственный коммит `ec0b479 Initial commit`; предыдущие исходники сайта ещё не были закоммичены. Обычный `git diff` поэтому не показывал прототипы. Исходное состояние сохранено локально в игнорируемом `.audit/website-before-stage1.zip`.

Найдены четыре прототипа: `src/concepts/{neo-tech,neo-tech-v2,neo-forge,dark-forge}`, общие иллюстрации/компоненты `src/components`, демонстрационные данные `src/data/content.ts`. Исходный V2 доступен: сохранены его исходники, инженерная типографика, центральный hero, нефритовая палитра, бронзовые подписи и цветочный мотив. Это адаптация композиции под реальный сайт, не точная пиксельная копия.

Старые концепции, CSS, данные и документы `DESIGN_PROTOTYPES_TZ.md`/`VERIFICATION.md` сохранены как история. Прежний `src/main.tsx` скопирован в `src/prototype-main.tsx`. Просмотр архива отдельно:

```powershell
npm run dev:prototypes
# http://127.0.0.1:5174 — выбор; /neo-tech-v2 — утверждённая концепция
```

Архив не включается в production entry, навигацию, sitemap или prerender. Старые замороженные проекты остаются только в архивных исходниках.

### Статическая генерация

Выбрана равноценная разрешённая ТЗ архитектура: React Router Declarative Mode + Vite build-time rendering (`renderToString`/`StaticRouter`). `scripts/build.mjs` собирает клиент, затем временный `.ssg/entry-server.js`, и генерирует отдельный полностью наполненный HTML для каждого URL из `src/app/routes.ts`. Браузер гидратирует готовую разметку. Серверный модуль используется **только при сборке** и не публикуется. Подключение Framework Mode и серверного адаптера для этих статических страниц не требуется.

Результат — **`build/client`**, а не старый `dist`. На Cloudflare Pages публикуется только этот каталог. `404.html` отключает неявный SPA fallback Pages. Пути без завершающего `/`; `_redirects` создаётся из реестра маршрутов. Никаких wildcard-редиректов на SPA-оболочку.

Страницы подключаются через `routePage(() => import(...))`. `render()` теперь асинхронный: перед `renderToString` он ожидает модуль текущего маршрута; браузер ожидает тот же модуль перед `hydrateRoot`. При переходах React Router сохраняет предыдущую страницу до готовности следующей. Общий CSS включён в статический HTML и работает без JS. Полные тексты хроник импортируются только собственными `*.page.tsx`, а реестры проектов/релизов содержат метаданные. `React.lazy`/Suspense для SSG не используются.

Без JavaScript и при сбое загрузки скриптов основные ссылки мобильной навигации
остаются видимыми; сворачивание меню включается после гидратации. При Back/Forward
сохраняются URL, фильтры и позиция прокрутки, в том числе при возврате из длинной
статьи в короткий каталог. Тип перехода применяется вместе с готовой страницей.

Замеры до/после, граф зависимостей, инструкции проверки production preview и паттерн будущих Wiki-статей: [ROUTE_LOADING.md](docs/ROUTE_LOADING.md). `npm run check` включает проверку изоляции чанков; повторный браузерный замер — `npm run measure:loading -- after` (требуется локальный Playwright и Edge, подробности в отчёте).

Документация сверена: [Vite build-time prerender](https://vite.dev/guide/ssr.html#pre-rendering-ssg), [React Router rendering](https://reactrouter.com/how-to/pre-rendering), [Cloudflare static serving](https://developers.cloudflare.com/pages/configuration/serving-pages/). Существующий диапазон Vite сохранён (lockfile: 7.3.7); React Router зафиксирован на 7.18.4. Vite выводит известное предупреждение об игнорировании `use client` в React Router при клиентской сборке; результат успешно собирается и гидратируется.

## Архитектура

```text
src/app/
  App.tsx                     общая оболочка, маршрутизация, клиентские метаданные
  routes.ts                   единый список опубликованных страниц и SEO
  pages/                      главная, каталог, команда, общая лента, 404
  projects/
    registry.ts               реестр проектов и агрегатор опубликованных релизов
    navigation.ts             дерево быстрых переходов по проектам
    maniac/                   meta, assets, theme, pages, changelogs/, wiki/
    friendsheep/              meta, assets, theme, pages
    novellmaker/              meta, assets, theme, pages, docs/, navigation.ts
  shared/
    content/                  типы, команда, контакты
    layouts/                  шапка, навигация, футер
    ui/                       повторно используемые компоненты
    styles/                   токены и базовые стили
    lib/                      SEO, фильтры URL, восстановление прокрутки
src/entry-server.tsx          сборочный renderer
scripts/                      сборка, проверка, preview, архив прототипов
public/brand/                 оптимизированные предоставленные логотипы
brand-source/                 оригиналы предоставленных PNG (не публикуются)
```

`shared` не импортирует проекты. Общие страницы получают данные из реестра. Индивидуальные страницы, иллюстрации и CSS Modules принадлежат проектам. Для нового проекта нужны модуль, запись в `projects/registry.ts` и загрузчик страницы в `projectPages` файла `app/routes.ts`; каталог и базовый URL используют реестр. Публичный состав сейчас ограничен тремя утверждёнными проектами. Смена логотипа выполняется через `BrandLogo` и файлы `public/brand`.

Предоставленные логотипы и их прозрачные версии находятся в `brand-source/`; публичные PNG уменьшены для веба (полный 768 px, мини 96 px) с сохранением alpha. Скрипт `scripts/optimize-brand.ps1` масштабирует прозрачные версии. Текстовый fallback показывается только при ошибке загрузки изображения. Эмблемы архивных концепций не являются источником текущего логотипа.

## Опубликованные маршруты

- `/`
- `/projects`
- `/projects/maniac`
- `/projects/friendsheep`
- `/projects/novellmaker`
- `/changelog`
- `/about`
- `/projects/maniac/changelog` и `/projects/maniac/changelog/:version` для версий `1.0`, `1.1`, `1.2`
- `/projects/maniac/wiki` и `/projects/maniac/wiki/characters`
- `/projects/maniac/wiki/search` — общий поиск по 204 опубликованным сущностям
- `/projects/maniac/wiki/characters/:slug` — 15 статей подтверждённых персонажей
- `/projects/maniac/wiki/perks` и `/projects/maniac/wiki/perks/:slug` — каталог и 44 статьи
- `/projects/maniac/wiki/abilities` и `/projects/maniac/wiki/abilities/:slug` — каталог и 12 статей
- `/projects/maniac/wiki/items` и `/projects/maniac/wiki/items/:slug` — каталог и 69 статей предметов и наборов
- `/projects/maniac/wiki/mechanics` и `/projects/maniac/wiki/mechanics/:slug` — каталог и 28 статей механик
- `/projects/maniac/wiki/maps` и `/projects/maniac/wiki/maps/:slug` — Особняк, Пиццерия и Форт
- `/projects/maniac/wiki/effects` — 33 опубликованных эффекта, переходы к эффектам по якорям
- `/projects/novellmaker/docs` — обзор документации
- `/projects/novellmaker/docs/engine-guide` — руководство редактора
- `/projects/novellmaker/docs/lua` — алфавитный указатель Lua API
- `/projects/novellmaker/docs/lua/:slug` — 19 тематических документов

Всего 213 опубликованных маршрутов: 7 общих страниц, 4 страницы хроник Maniac,
180 страниц Maniac Wiki и 22 страницы документации NovellMaker (обзор и 21 документ).
Реестр — `src/app/routes.ts`; список последней сборки — `.ssg/paths.json`.
Эффекты используют якоря одной страницы, а не 33 отдельных маршрута.
Загрузка и установка Maniac находятся на `/projects/maniac#download`;
отдельная `/projects/maniac/download` и руководства Wiki пока не опубликованы.
Остальные адреса возвращают 404.
DEV Preview остаётся отдельным. Списки хроник ведут на готовые внутренние страницы.

Этап 3A: [публичная Wiki, источники, ограничения и проверка](docs/MANIAC_3A_VERIFICATION.md).
Браузерная проверка — `npm run check:wiki:browser`; текущая среда и результаты
описаны в [BROWSER_CHECKS.md](docs/BROWSER_CHECKS.md).

Этап 3B: [перки, способности, расхождения исходников и проверки](docs/MANIAC_3B_VERIFICATION.md).
Повторный браузерный аудит — `npm run check:reference:browser` в Chromium по умолчанию.

Этап 3C-1: [предметы, механики и ограничения источников](docs/MANIAC_3C_VERIFICATION.md),
[полная таблица 66 регистраций ModItems](docs/MANIAC_3C_ITEM_REGISTRY.md).
Браузерный аудит новых разделов — `npm run check:systems:browser`.

Этап 3C-2: [карты, источники, расхождения и размеры JS до/после](docs/MANIAC_3C2_VERIFICATION.md).
Production-аудит четырёх маршрутов — `npm run check:maps:browser`.

## Контент

Подготовительный этап типографики: локальные Geologica (заголовки) и Rubik
(текст/интерфейс), поддержка необязательного контента проектов и галереи.
Инструкция по данным, изображениям, ссылкам, релизам и добавлению проекта —
[`PROJECT_CONTENT.md`](PROJECT_CONTENT.md). Проверки —
[`TYPOGRAPHY_VERIFICATION.md`](TYPOGRAPHY_VERIFICATION.md).

Команда и контакты перенесены из ТЗ. Три проекта имеют равный вес на главной
и в каталоге. FriendSheep представлен отдельной страницей Social Sky с возможностями,
roadmap и четырьмя реальными скриншотами интерфейса; источники и границы —
[FRIENDSHEEP_SHOWCASE.md](docs/FRIENDSHEEP_SHOWCASE.md).
NovellMaker представлен страницей Ink & Lavender, демонстрационными проектами
и документацией редактора и Lua API; источники и границы —
[novellmaker-showcase-report.md](docs/novellmaker-showcase-report.md).
Декоративные SVG в карточках проектов не являются скриншотами.

Maniac 1.0/1.1/1.2 подтверждены ТЗ, V2 и исходными хрониками старого репозитория. Полные тексты уже перенесены в отдельные JSON и тематические страницы. Даты не известны и не добавлены; `releaseOrder` задаёт порядок внутри истории проекта. Записи других проектов появятся только после подтверждения реальных выпусков. Исторические проверки внешних ссылок приведены в отчётах этапов и не заменяют проверку перед публикацией.

Метаданные релиза заданы один раз в папке проекта; агрегатор исключает `draft`, использует известные даты, а записи без дат выводит отдельной стабильной группой по проектам и порядку выпуска. Номера версий разных проектов не сравниваются как глобальная хронология. Сборка проверяет дубли ID, `(projectId, version)`, `(projectId, slug)` и принадлежность записей проекту.

Длинные материалы Maniac хранятся в JSON и отображаются проектными React-шаблонами;
контракты и метаданные заданы в TypeScript. Документация NovellMaker хранит 21
оригинал Markdown в `src/app/projects/novellmaker/docs/source/` и генерирует из них JSON,
React-обёртки, метаданные и собственный поисковый индекс. Внешний исходник закреплён
на commit `5e885944ee36f5945a734c18c19c65c261402445`; обычная сборка работает с
локальными файлами. `npm run docs:novellmaker:sync -- <путь-к-чистому-checkout>`
предназначен для явной синхронизации с этим commit, не для обычной сборки.
MDX, предусмотренный ТЗ для длинных материалов, ещё не подключён.

Общие текущие параметры описаний и таблиц берутся из `wiki/data/gameplay-facts.ts`.
В текущем каталоге `Stat` может содержать числовое `value` либо `valueRef` на общий
факт, но не оба поля. Разрешённые ссылки типизированы; неизвестная ссылка ломает
сборку. `release:*` сохраняет собственные числовые снимки. После повторного импорта
данных проверяйте сохранность этих связей: генератор может вернуть исходные числа,
а проверка синхронизации должна обнаружить рассогласование.

Названия и URL ссылок Wiki берутся из лёгких метаданных публикации. Каталоги,
описания и исторические снимки не должны попадать в зависимости компонентов ссылок.
Связи эффектов задаются один раз в `effect-connections.ts` и выводятся в обе стороны.
Количества в интерфейсе вычисляются из каталогов, а в SEO — из метаданных маршрутов.

## Cloudflare Pages и SEO

Будущая Git integration (настройки аккаунта сейчас не изменялись):

| Поле                   | Значение                                                   |
| ---------------------- | ---------------------------------------------------------- |
| Root directory         | `website`                                                  |
| Build command          | `npm run build`                                            |
| Build output directory | `build/client`                                             |
| Node                   | 22.12+; в CI используется Node 22                          |
| Production branch      | `main` — включать только после разрешения на публикацию    |
| Environment            | `SITE_URL` — настоящий origin собственного домена без пути |

Без `SITE_URL` сборка предназначена для локального/предварительного просмотра: `noindex`, запрет индексации в `robots.txt`, без фиктивного canonical и sitemap. При установленном настоящем `SITE_URL` создаются абсолютные canonical, Open Graph URL/изображение и `sitemap.xml` из всех опубликованных маршрутов. Build передаёт тот же origin клиенту. Для preview-веток не задавайте production `SITE_URL`.

Для локальной проверки production-ветки SEO можно временно задать зарезервированный `https://example.invalid` как `SITE_URL`; это тест, не адрес публикации. После проверки пересоберите без переменной.

GitHub Actions `.github/workflows/ci.yml` настроен для push в `main` и `test`, а также pull request. Статическое задание выполняет `npm ci`, форматирование, build и `check`. Отдельное задание устанавливает Chromium, собирает сайт, запускает `check:browser` и сохраняет результаты как artifact. Typecheck также запрещает неиспользуемые импорты, локальные переменные и параметры. Локальные проверки не подтверждают выполнение workflow в GitHub. Деплоя в workflow нет; настройки Cloudflare Pages, домен и старый GitHub Pages не менялись.

## Хроники Maniac и Wiki Preview

Фундамент Wiki/хроник 2B-0 и изолированный 3D-прототип Хранителя:

```powershell
npm run dev:maniac
# http://127.0.0.1:5175/__maniac-lab
# либо готовая отдельная статика:
npm run build:maniac-preview
npm run preview:maniac
# http://127.0.0.1:4175/maniac-lab.html
```

Описание данных, снимков и viewer — [архитектура Wiki](docs/MANIAC_WIKI_FOUNDATION.md),
ресурсы — [MANIAC_ASSETS](docs/MANIAC_ASSETS.md),
проверки — [MANIAC_2B0_VERIFICATION](docs/MANIAC_2B0_VERIFICATION.md).

Общий EntityIcon, статичный рендер оригинальной зажигалки, подготовка миниатюр
и проверки 2B-0.1 — [MANIAC_ICONS_2B01](docs/MANIAC_ICONS_2B01.md).
Прототип не входит в build/client, публичные маршруты и sitemap.

Этап 2A: презентационная страница Maniac реализована. Источники и проверка
архива Flower Cleaning 1.2 описаны в [`CONTENT_SOURCES.md`](src/app/projects/maniac/CONTENT_SOURCES.md),
проверки — в [`MANIAC_2A_VERIFICATION.md`](MANIAC_2A_VERIFICATION.md).
Прямая загрузка Google Drive и зеркало Яндекс Диска проверены отдельно:
[`MANIAC_DOWNLOAD_VERIFICATION.md`](MANIAC_DOWNLOAD_VERIFICATION.md).
С 03.11.2026 зеркало недоступно: по просьбе владельца его кнопка временно ведёт
на Rickroll. Основная загрузка Google Drive сохранена; текущие URL и пояснение
заданы в `src/app/projects/maniac/content.ts`.

Этап 2B реализован: `/projects/maniac/changelog` и выпуски версий `1.0`, `1.1`, `1.2`.
Полные тексты, темы и CSS-анимации — [отчёт 2B](docs/MANIAC_2B_VERIFICATION.md),
[соответствие разделов](docs/MANIAC_CHRONICLES_SECTIONS.md).

Следующие продуктовые задачи — только по отдельной команде: новые проверенные
материалы и руководства Wiki; переход длинных материалов на MDX; согласование
отдельной страницы загрузки Maniac; восстановление настоящего зеркала загрузки;
домен, preview на Cloudflare, production-публикация и план перехода со старых URL.
Страницы FriendSheep и NovellMaker, документация NovellMaker, поиск,
фильтры, текущие характеристики и открытые статьи Wiki уже реализованы.

Исторический аудит Wiki — [MANIAC_WIKI_RELEASE_CANDIDATE.md](../MANIAC_WIKI_RELEASE_CANDIDATE.md).
Актуальные результаты локальных браузерных прогонов находятся в
`build/browser-checks/<набор>/report.json`; запуск — по
[BROWSER_CHECKS.md](docs/BROWSER_CHECKS.md). Они не подтверждают работу production,
проверку настоящего домена или текущую доступность внешних архивов скачивания.
Общий поиск использует метаданные публикации, редакционные синонимы из
`wiki/search-vocabulary.ts` и производный текст опубликованных статей.
`npm run search:prepare` обновляет `wiki/search-content.json` из текущего React HTML,
включая подставленные игровые характеристики. Меню, оглавления и блоки связанных
материалов исключены; каждый эффект индексируется отдельно. Генерация запускается
автоматически перед `dev` и `build`. После изменения статей во время работы dev
повторите `npm run search:prepare`. Проверка соответствия готовому HTML —
`npm run check:search`. Числа в производном индексе не редактируются вручную.
Индекс загружается на странице поиска или при первом непустом вводе в шапке;
рендереры статей, игровые каталоги и изображения в него не входят. Названия
имеют приоритет над синонимами, категориями и совпадениями в тексте.
Постоянное поле в шапке всех страниц
Wiki показывает до шести живых подсказок с категориями. Стрелки и Enter открывают
выбранную запись; «Найти» и «Все результаты» открывают полную выдачу.
Поиск внутри каталога остаётся отдельным.
Предыдущие итоги исправлений — [RELEASE_READINESS.md](docs/RELEASE_READINESS.md).
`STAGE_1_VERIFICATION.md` и остальные отчёты этапов сохраняют состояние на момент
их написания; `VERIFICATION.md` относится к прототипам.
