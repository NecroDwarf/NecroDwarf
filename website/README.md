# NecroDwarf 2.0 — сайт команды

React + TypeScript + Vite + React Router. Русскоязычный статический сайт независимой команды. Без сервера, CMS, аккаунтов и Cloudflare Workers.

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

`dev` — Vite для разработки, его fallback не проверяет статические URL. `preview` — локальный сервер готовой статики с clean URL, редиректом завершающего `/` и настоящим HTTP 404. `check` запускает такой сервер на свободном порту и проверяет HTML, метаданные, ссылки, ресурсы, закрытые будущие маршруты и 404 без выполнения JavaScript.

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
    maniac/                   meta, assets, theme, pages, changelogs/registry.ts
    friendsheep/              meta, assets, theme, pages
    novellmaker/              meta, assets, theme, pages
  shared/
    content/                  типы, команда, контакты
    layouts/                  шапка, навигация, футер
    ui/                       повторно используемые компоненты
    styles/                   токены и базовые стили
    lib/                      SEO
src/entry-server.tsx          сборочный renderer
scripts/                      сборка, проверка, preview, архив прототипов
public/brand/                 оптимизированные предоставленные логотипы
brand-source/                 оригиналы предоставленных PNG (не публикуются)
```

`shared` не импортирует проекты. Общие страницы получают данные из реестра. Индивидуальные страницы, иллюстрации и CSS Modules принадлежат проектам. Четвёртый проект добавляется модулем и записью в `projects/registry.ts`: каталог и базовый URL создаются автоматически. Смена логотипа выполняется через `BrandLogo` и файлы `public/brand`.

Два изображения из текущего сообщения приняты как предоставленные пользователем логотипы, что уточняет старую пометку документов «логотип позже». Собственная эмблема не создавалась. По следующей просьбе пользователя фон обоих логотипов удалён встроенным imagegen (background-extraction). Оригиналы сохранены; прозрачные версии находятся в `brand-source/*-transparent.png`. Публичные PNG уменьшены для веба (полный 768 px, мини 96 px) с сохранением alpha. Скрипт `scripts/optimize-brand.ps1` масштабирует прозрачные версии. Текстовый fallback показывается только при ошибке загрузки изображения.

## Опубликованные маршруты

- `/`
- `/projects`
- `/projects/maniac`
- `/projects/friendsheep`
- `/projects/novellmaker`
- `/changelog`
- `/about`
- `/projects/maniac/changelog` и `/projects/maniac/changelog/1.0`, `/1.1`, `/1.2`
- `/projects/maniac/wiki` и `/projects/maniac/wiki/characters`
- `/projects/maniac/wiki/characters/:slug` — 15 статей подтверждённых персонажей
- `/projects/maniac/wiki/perks` и `/projects/maniac/wiki/perks/:slug` — каталог и 44 статьи
- `/projects/maniac/wiki/abilities` и `/projects/maniac/wiki/abilities/:slug` — каталог и 12 статей
- `/projects/maniac/wiki/items` и `/projects/maniac/wiki/items/:slug` — каталог и 69 статей предметов и наборов
- `/projects/maniac/wiki/mechanics` и `/projects/maniac/wiki/mechanics/:slug` — каталог и 28 статей механик
- `/projects/maniac/wiki/maps` и `/projects/maniac/wiki/maps/:slug` — Особняк, Пиццерия и Форт

Всего 189 опубликованных маршрутов. Остальные адреса возвращают 404.
DEV Preview остаётся отдельным. Списки хроник ведут на готовые внутренние страницы.

Этап 3A: [публичная Wiki, источники, ограничения и проверка](docs/MANIAC_3A_VERIFICATION.md).
Для браузерного аудита — `npm run check:wiki:browser` с локальным Playwright/Edge;
подробности и путь скриншотов — в отчёте.

Этап 3B: [перки, способности, расхождения исходников и проверки](docs/MANIAC_3B_VERIFICATION.md).
Повторный браузерный аудит — `npm run check:reference:browser` с локальным Playwright/Edge.

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

Команда и контакты перенесены в точности из ТЗ. Три проекта имеют равный вес на главной и в каталоге. FriendSheep и NovellMaker содержат только согласованную базовую информацию. Проектные сцены — декоративные SVG, не скриншоты и не демонстрация неподтверждённых возможностей.

Maniac 1.0/1.1/1.2 подтверждены ТЗ, V2 и чтением `docs/changelogs/maniac/` старого GitHub-репозитория. HTTP-ссылки на все три старых материала проверены (200). Краткие описания не заменяют полные тексты будущего переноса. Даты не известны и не добавлены; `releaseOrder` задаёт порядок внутри истории проекта. Записи других проектов появятся только после подтверждения реальных выпусков.

Метаданные релиза заданы один раз в папке проекта; агрегатор исключает `draft`, использует известные даты, а записи без дат выводит отдельной стабильной группой по проектам и порядку выпуска. Номера версий разных проектов не сравниваются как глобальная хронология. Сборка проверяет дубли ID, `(projectId, version)`, `(projectId, slug)` и принадлежность записей проекту.

MDX и схемы Wiki будут подключены вместе с реальным длинным контентом на этапах 2/3. Пустых MDX-статей и фиктивных Wiki-реестров сейчас нет.

## Cloudflare Pages и SEO

Будущая Git integration (настройки аккаунта сейчас не изменялись):

| Поле                   | Значение                                                   |
| ---------------------- | ---------------------------------------------------------- |
| Root directory         | `website`                                                  |
| Build command          | `npm run build`                                            |
| Build output directory | `build/client`                                             |
| Node                   | 22.12+ (рекомендуется 22 LTS)                              |
| Production branch      | `main` — включать только после разрешения на публикацию    |
| Environment            | `SITE_URL` — настоящий origin собственного домена без пути |

Без `SITE_URL` сборка предназначена для локального/предварительного просмотра: `noindex`, запрет индексации в `robots.txt`, без фиктивного canonical и sitemap. При установленном настоящем `SITE_URL` создаются абсолютные canonical, Open Graph URL/изображение и `sitemap.xml` только из 11 опубликованных маршрутов. Build передаёт тот же origin клиенту. Для preview-веток не задавайте production `SITE_URL`. Домен пока не предоставлен.

Для локальной проверки production-ветки SEO можно временно задать зарезервированный `https://example.invalid` как `SITE_URL`; это тест, не адрес публикации. После проверки пересоберите без переменной.

GitHub Actions `.github/workflows/ci.yml` запускается для push в `main` и `test`, а также pull request; выполняет `npm ci`, проверку форматирования, build, проверку статических маршрутов и условного контента компонентов. Деплоя в workflow нет. Cloudflare Pages и старый GitHub Pages не изменялись. Старые URL на другом домене не перенаправляются файлом нового сайта.

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

Этап 2B реализован: `/projects/maniac/changelog` и выпуски `/1.0`, `/1.1`, `/1.2`.
Полные тексты, темы и CSS-анимации — [отчёт 2B](docs/MANIAC_2B_VERIFICATION.md),
[соответствие разделов](docs/MANIAC_CHRONICLES_SECTIONS.md).

Следующие этапы — только по отдельной команде: 3. Полная открытая Wiki, типизированный баланс, MDX и статический поиск. 4. Детали FriendSheep и NovellMaker после получения материалов. 5. Домен, preview на Cloudflare, production-публикация и отдельный план перехода со старых URL.

Результаты текущих проверок — `STAGE_1_VERIFICATION.md`. Исторический `VERIFICATION.md` относится к прототипам.
