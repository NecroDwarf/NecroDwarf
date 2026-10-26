# Инвентаризация ресурсов Maniac — 25.10.2026

Источник: удалённая main `doflare123/Maniac-mod-evolution`, commit
`8692f66dc76582144be85d553d43a41f189b64e7`.
Локальные незакоммиченные материалы мода (включая Lich) не импортировались.
Командное уточнение об одной модели Хранителя принято как актуальное.

Полный файловый индекс без копирования изображений: `maniac-assets-inventory.json`.
Он содержит 410 файлов assets/maniacrev, исходный путь, размер и Git blob SHA.

| Категория | Файлов | Назначение |
| --- | ---: | --- |
| textures | 304 | Иконки перков/способностей, предметные атласы, UI и модели |
| models | 76 | JSON моделей предметов/блоков |
| geo | 4 | windigo, nightmare_lighter, nightmare_cocoon, bone_arms |
| animations | 4 | Соответствующие GeckoLib-анимации |
| lang | 2 | ru_ru/en_us |
| blockstates | 5 | Состояния блоков |
| loot_tables | 2 | Игровые таблицы |
| sounds | 11 | Аудио, в сайт не перенесено |
| Прочее | 2 | sounds.json и necromancer_soul.json |

Наличие геометрии зажигалки, кокона или костяных рук не означает отдельную форму
Хранителя и не используется для такого переключателя.

## Сопоставление

- `textures/perks/forget_me_not.png` → ID мода `forget_me_not`, локализация
  `perk.maniacrev.forget_me_not.name`, класс ForgetMeNotPerk и запись PerkRegistry.
  В Wiki это `perk:forget-me-not`.
- Остальные `textures/perks/*.png` перечислены в машинном индексе; среди них
  pink_orchid, reality_anchor, sber_sprout, цветочные маньячьи перки и прежние перки.
  Их полные карточки/характеристики ещё не перенесены.
- `textures/gui/abilities/concentrated_nightmare.png` связан с
  `ability:concentrated-nightmare`. В каталоге также есть hook, beast_claw,
  ghost_full_invisibility, death_scythe, plague_lantern и другие ресурсы. Название
  файла само по себе не служит доказательством баланса способности.
- `textures/item/forget_me_not.png` → `item:forget-me-not`, предмет личного цветка.
- `textures/item/nightmare_lighter.png` → `item:nightmare-lighter`. Это исходный
  атлас предмета. Начиная с 2B-0.1 карточки показывают подготовленный рендер
  оригинальной `geo/nightmare_lighter.geo.json` в конце анимации открытия, а не атлас.
  Связь проверена по NightmareLighterModel/Renderer и NightmareLighterItem.
- `geo/windigo.geo.json` + `textures/entity/windigo.png` +
  `animations/windigo.animation.json` → `character:keeper-of-nightmares`;
  связь установлена KeeperNightmareModel.java.
- UI-экраны выбора персонажей, планшетов, ready/voting и HUD есть в индексе.
  Копировать их в фундамент без конкретного использования не потребовалось.

## Что действительно импортировано

`src/app/projects/maniac/assets/imports.json` фиксирует **24 выбранных исходных
ресурсов и один производный рендер**, entityId, commit, исходный путь и SHA-256,
локальный путь и размер.
Для оптимизированных иллюстраций также записаны исходные размеры/хеши.

| Локальный ресурс | Сущность | Обработка |
| --- | --- | --- |
| models/keeper/source/windigo.geo.json | character:keeper-of-nightmares | Точные исходные байты |
| models/keeper/source/windigo.png | character:keeper-of-nightmares | Исходная текстура 128×128 |
| models/keeper/source/windigo.animation.json | character:keeper-of-nightmares | Сохранён, анимации пока отключены |
| wiki/concentrated-nightmare.webp | ability:concentrated-nightmare | Полезная область 1536×1024 → квадратная миниатюра 256×256, lossless WebP |
| wiki/forget-me-not-perk.webp | perk:forget-me-not | Иллюстрация 512×512 → 256×256, lossless WebP |
| models/nightmare-lighter/source/nightmare-lighter.png | item:nightmare-lighter | Исходный атлас 64×32, точные байты |
| models/nightmare-lighter/source/nightmare_lighter.geo.json | item:nightmare-lighter | Геометрия, 40 костей и 49 кубов |
| models/nightmare-lighter/source/nightmare_lighter.animation.json | item:nightmare-lighter | Исходная анимация открытия для статичного кадра |
| models/nightmare-lighter/source/nightmare_lighter.item.json | item:nightmare-lighter | Оригинальные display transforms предмета |
| wiki/nightmare-lighter-render.png | item:nightmare-lighter | Статичный рендер 512×512 с прозрачностью |
| wiki/forget-me-not-item.png | item:forget-me-not | 32×32 без изменений, pixelated |

В качестве отдельного производного ассета создан keeper.glb (104 768 байт).
Его состав и происхождение записаны в conversion.json. В нём встроена оригинальная
текстура, нет внешних ссылок на GitHub и нет подмены GeckoLib JSON glTF-загрузчиком.

Иллюстрационные иконки большого разрешения оптимизированы Pillow (thumbnail,
LANCZOS, WebP lossless); небольшие Minecraft-спрайты и текстура модели не ресайзились.
Для повторной подготовки оригинальные большие PNG доступны по зафиксированным
commit/пути и хешу manifest; полный каталог текстур в сайт не копировался.

На этапе 2B дополнительно импортированы 14 иконок перков Flower Cleaning в
`wiki/flower/`: lossless WebP до 256 px, суммарно около 971 КБ. Вместе с прежней
Незабудкой все 15 перков хроники имеют оригинальные локальные иконки.
Декоративный `releases/flower-sprig.svg` взят из старого сайта; его происхождение
записано отдельно в `docs/maniac-chronicles-correspondence.json`, поскольку это
оформление страницы, а не игровая сущность. Полный отчёт — `MANIAC_2B_VERIFICATION.md`.

Подробности подготовки иконок, формат метаданных и проверки:
[MANIAC_ICONS_2B01.md](MANIAC_ICONS_2B01.md).

## Границы проверки

Инвентаризация — список ресурсов удалённого commit, а не обещание, что любой файл
является самостоятельной публичной сущностью. Полноценное сопоставление остальных
перков, способностей, предметов и UI выполняется при наполнении Wiki.
Данные каждого импортированного ресурса проверены, локальные пути/размеры/хеши
проверяются npm run check. Игра и все возможные состояния анимации не запускались.
