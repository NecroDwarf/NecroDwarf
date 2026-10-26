# Maniac 2B-0.1 — игровые иконки и 3D-предметы

Дата: 25.10.2026. Ветка сайта: `test`. Это доработка изолированного DEV Preview,
без публикации Wiki, изменения баланса или исторических снимков.
Предыдущие незакоммиченные изменения этапа 2B-0 и скачивания сохранены.

## EntityIcon и метаданные

`wiki/ui/EntityIcon.tsx` используется общим EntityCard, поэтому одинаково работает
в CharacterCard, AbilityCard, PerkCard, ItemCard и карточках хроник.
Если у персонажа нет изображения, пустая рамка не выводится.
Иконки декоративные (`alt=""`, `aria-hidden`), поскольку рядом есть название.

EntityAsset определён в `wiki/data/types.ts`; реестр — `wiki/data/assets.ts`:

```ts
{
  src: localImage,
  width: 512,
  height: 512,
  entityId: "item:nightmare-lighter",
  kind: "item-render",
  presentation: {
    scale: 1,
    position: [50, 50],
    blend: "normal",
  },
}
```

`kind`: `illustration` — иллюстрация, `pixel-texture` — маленький Minecraft-спрайт
с image-rendering: pixelated, `item-render` — готовое изображение 3D-предмета.
`width/height` — реальные размеры файла, проверяемые по imports.json.
Необязательный `scale` задаёт равномерный масштаб, `position` — центр изображения
в процентах рамки, `blend` — normal или screen. Значения по умолчанию 1, [50,50],
normal. Настройки относятся к визуальному ассету, не к игровому балансу.

Общая рамка: 88×88 px detail, 80×80 на узком экране; 64×64 compact.
Внутренний отступ 6 px, приглушённая бронзовая граница, тёмная радиальная подложка
и мягкое внутреннее затемнение. Пропорции сохраняет object-fit: contain.
Настройки не требуют CSS-исключений по ID сущности. Для узких карточек заголовок
переходит под строку иконки/источника по container query, чтобы длинное название
не ломалось посреди слова из-за ширины иконки.

Незабудка сохраняет исходное изображение с чёрным фоном; screen смешивает фон с
подложкой рамки без изменения файла и обрезки синего свечения. Прозрачные изображения
остаются с normal; зажигалка имеет настоящий alpha-канал.

## Концентрированный кошмар

Исходник: `textures/gui/abilities/concentrated_nightmare.png`, 1536×1024.
SHA-256: `3cad7888df6547b9f2fbcdcf3c377b678feb6806160e593a4fb4814be77c8040`.
Ненулевой alpha охватывает почти весь файл [12,1,1504,1023] из-за очень слабых
периферийных пикселей. При alpha >=8 полезные границы — [368,100,1186,848].

Использован квадратный crop [336,33,1218,915] (882×882) с 32 px бокового запаса;
он сохраняет важные контуры, художественные детали и исходный alpha внутри crop.
Изменены только почти невидимые внешние поля. Затем LANCZOS → 256×256 lossless WebP.
Символ занимает примерно 93% ширины миниатюры вместо 53% исходного прямоугольника.
Полезный рисунок стал крупнее без нарушения пропорций.

Воспроизведение (Pillow требуется только для подготовки, не сборки сайта):

```powershell
python scripts/prepare-maniac-illustration.py <verified-original.png> src/app/projects/maniac/assets/wiki/concentrated-nightmare.webp
```

Скрипт проверяет хеш входа. Исходный PNG можно получить по закреплённому commit
и пути из imports.json; во время открытия страницы сетевой загрузки нет.

## Оригинальная Кошмарная зажигалка

Источник закреплён на `8692f66dc76582144be85d553d43a41f189b64e7`.
Проверены следующие оригинальные файлы:

- [NightmareLighterModel.java](https://github.com/doflare123/Maniac-mod-evolution/blob/8692f66dc76582144be85d553d43a41f189b64e7/src/main/java/org/example/maniacrevolution/client/model/NightmareLighterModel.java)
  связывает `geo/nightmare_lighter.geo.json`, `textures/item/nightmare_lighter.png`
  и `animations/nightmare_lighter.animation.json`.
- [NightmareLighterRenderer.java](https://github.com/doflare123/Maniac-mod-evolution/blob/8692f66dc76582144be85d553d43a41f189b64e7/src/main/java/org/example/maniacrevolution/client/renderer/NightmareLighterRenderer.java)
  использует GeoItemRenderer без подмены модели.
- [NightmareLighterItem.java](https://github.com/doflare123/Maniac-mod-evolution/blob/8692f66dc76582144be85d553d43a41f189b64e7/src/main/java/org/example/maniacrevolution/item/NightmareLighterItem.java)
  подключает этот renderer, выбирает Idle для незажжённого предмета и
  animation/fire/Close для открытия/горения/закрытия.
- `models/item/nightmare_lighter.json` имеет parent builtin/entity и display
  transforms для рук/земли/головы/рамки; собственной gui-трансформации нет.

Геометрия, атлас, анимации и item JSON сохранены точными байтами в
`assets/models/nightmare-lighter/source/`. Их хеши проверяет imports.json.
Масштаб UV берётся из description геометрии (16×16), не из разрешения PNG (64×32):
используется оригинальная нормализация UV GeckoLib, а не новая раскладка атласа.

Общий конвертер Bedrock переиспользован для 40 костей, 49 кубов (5 плоских).
Применён проверенный числовой snapshot конца оригинальной анимации открытия
`animation` (1.5833 с): крышка group повёрнута на 80°, смещение [0,-0.4,-8],
fire/fire_side имеют scale [1,1,1]. Видны механизм и оригинальное пламя.
Для каждого канала взят последний ключ; все каналы в этой анимации числовые.
Molang не вычисляется; скрипт отклоняет нечисловые каналы вместо их имитации.

Промежуточный GLB служит только экспорту, в карточки не загружается.
Ортографическая камера [1,0.65,-1] показывает верх, широкую и узкую стороны
открытого корпуса; модель занимает 86% доступного кадра по большей стороне.
Three.js экспортирует PNG 512×512 с прозрачным фоном, исходной nearest-текстурой
и мягким студийным освещением. Оригинальный атлас перенесён из assets/wiki в source;
EntityAsset указывает только на `wiki/nightmare-lighter-render.png` (~37.3 КБ).

Воспроизводимые команды из website:

```powershell
npm run assets:maniac:item
# Playwright предоставляется средой подготовки или установлен отдельно.
# Если он не доступен как обычный Node module, указать абсолютный путь index.mjs:
$env:MANIAC_PLAYWRIGHT_MODULE = '<path-to-playwright>/index.mjs'
# По умолчанию установленный Edge; другой установленный канал — MANIAC_BROWSER.
npm run assets:maniac:render
```

Renderer запускает временный локальный Vite на 5186 и закрывает его после экспорта.
Добавлять Playwright/Pillow в зависимости сайта для обычной сборки не требуется.
`render.json` фиксирует позу, камеру, версию браузера и хеши GLB/PNG.
При намеренной переподготовке на другом GPU/браузере пиксели могут отличаться:
после визуального просмотра обновить хеш PNG в imports.json вместе с render.json.

Сверка игрового вида выполнена по геометрии, текстуре и коду игрового renderer и
контроллера. Minecraft для сравнения не запускался. Освещение, glint и игровые
шейдеры не воспроизводятся побитово. Это рендер оригинального открытого предмета,
не скриншот из игры. В карточке показан статичный кадр, анимация не проигрывается.

Дополнительная проверка после замечания команды о сходстве с хлебом: корпус
прямоугольный уже в исходной геометрии (`bone`: 7×10×13, крышка `group`), а
коричневые, золотистые и бордовые полосы присутствуют в оригинальном атласе.
Это не нарисованные при экспорте цвета. Нормализация UV по description 16×16
сверена также с [GeckoLib BakedModelFactory](https://github.com/bernie-g/geckolib/blob/7d6f32db9168a24e14b327c0ad9f8f87dfc204de/Forge/src/main/java/software/bernie/geckolib/loading/object/BakedModelFactory.java)
и [GeoQuad](https://github.com/bernie-g/geckolib/blob/7d6f32db9168a24e14b327c0ad9f8f87dfc204de/Forge/src/main/java/software/bernie/geckolib/cache/object/GeoQuad.java)
ветки 1.20.1; источник размера UV — ModelProperties, не размер PNG.
Для сравнения экспортирован отдельный пробный кадр конца оригинальной анимации
открытия (1.5833 с): он показывает крышку, серый механизм и исходное пламя.
Проба сохранена как артефакт чата `maniac-icons/lighter-open-candidate.png`;
после выбора команды открытый вариант подключён к карточке. Закрытая Idle-поза
не используется для текущей иконки.

## Камера Хранителя

Прежний fit учитывал пустые углы мирового AABB, особенно заметные на mobile.
Теперь дистанция вычисляется по проекциям всех исходных вершин на camera right/up
с учётом глубины, FOV и aspect; добавлен запас 10%. Геометрия/текстура GLB не менялись.
На тестовых скриншотах модель занимает примерно 86% высоты desktop canvas
(раньше 64%) и 83% ширины mobile canvas (раньше 62%). На узком экране ограничение
по ширине оставляет вертикальное пространство, чтобы конечности и рога были видны.

## Проверки и результат

- `npm run typecheck`, `npm run build`, `npm run check`, `npm run format:check` — PASS.
- `npm run build:maniac-preview`, экспорт модели и рендера — PASS.
- `check-maniac-wiki.mjs` дополнен проверками типов ассетов, соответствия размеров
  manifest, настроек иконок, происхождения рендера, оригинальной текстуры GLB,
  количества костей/кубов, открытой крышки и видимого пламени и хешей производных файлов.
- Edge: desktop 1440×1000, mobile 390×1000 с touch emulation. Проверены обе
  размерности карточек, Незабудка, способность, зажигалка, пиксельный цветок и
  Хранитель. Иконки имеют размеры 88/80/64 px, картинки загрузились, переполнения нет.
- Мышь/touch/pinch, кнопки и клавиатура, zoom/reset работают. После сброса внутренние
  пиксели canvas совпадают (внешняя строка исключена из-за субпиксельной прокрутки).
  Нет постоянного RAF в покое; WebGL освобождается при unmount, remount работает.
  Проверены reduced motion и fallback без WebGL. JS-ошибок и внешних запросов нет.
- Публичная сборка по-прежнему содержит семь маршрутов +404; GLB и Three.js viewer
  не попадают в публичные bundle. Wiki/lab не опубликованы, прямое скачивание сохранено.
- Остаются прежние предупреждения React Router и размера lazy viewer chunk (~643 КБ).
  Реальные телефоны, Safari/Firefox и игровой клиент не проверялись.

Артефакты чата: `maniac-icons` в каталоге visualizations текущего чата.
До: `before-prototype-1440.png`, `before-prototype-390.png`, `before-keeper-*.png`.
После: `prototype-1440.png`, `prototype-390.png`, `cards-*.png`, `compact-*.png`,
`history-*.png`, `keeper-*.png`; сценарии — `browser-results.json`.

Изменённые файлы этого этапа: EntityIcon TSX/CSS (новые), EntityCards TSX/CSS,
data/assets.ts, data/types.ts, data/provenance.json, ModelCanvas.tsx,
dev/ManiacLab.tsx, assets/imports.json и подготовленные изображения/исходники,
scripts/convert-maniac-model.mjs, scripts/check-maniac-wiki.mjs,
scripts/prepare-maniac-item.mjs, scripts/render-maniac-item.mjs,
scripts/prepare-maniac-illustration.py, package.json и документация.
Игровые характеристики и снимки не редактировались; другие проекты не менялись.
Коммит, push, слияние и production-деплой не выполнялись.
