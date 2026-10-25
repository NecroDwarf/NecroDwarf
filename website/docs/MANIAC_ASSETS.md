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
  атлас предмета, а не готовый перспективный render; ItemCard показывает ресурс.
- `geo/windigo.geo.json` + `textures/entity/windigo.png` +
  `animations/windigo.animation.json` → `character:keeper-of-nightmares`;
  связь установлена KeeperNightmareModel.java.
- UI-экраны выбора персонажей, планшетов, ready/voting и HUD есть в индексе.
  Копировать их в фундамент без конкретного использования не потребовалось.

## Что действительно импортировано

`src/app/projects/maniac/assets/imports.json` фиксирует **семь выбранных исходных
ресурсов**, entityId, commit, исходный путь и SHA-256, локальный путь и размер.
Для оптимизированных иллюстраций также записаны исходные размеры/хеши.

| Локальный ресурс | Сущность | Обработка |
| --- | --- | --- |
| models/keeper/source/windigo.geo.json | character:keeper-of-nightmares | Точные исходные байты |
| models/keeper/source/windigo.png | character:keeper-of-nightmares | Исходная текстура 128×128 |
| models/keeper/source/windigo.animation.json | character:keeper-of-nightmares | Сохранён, анимации пока отключены |
| wiki/concentrated-nightmare.webp | ability:concentrated-nightmare | Иллюстрация 1536×1024 → 256×171, lossless WebP |
| wiki/forget-me-not-perk.webp | perk:forget-me-not | Иллюстрация 512×512 → 256×256, lossless WebP |
| wiki/nightmare-lighter.png | item:nightmare-lighter | 64×32 без изменений, pixelated |
| wiki/forget-me-not-item.png | item:forget-me-not | 32×32 без изменений, pixelated |

В качестве отдельного производного ассета создан keeper.glb (104 768 байт).
Его состав и происхождение записаны в conversion.json. В нём встроена оригинальная
текстура, нет внешних ссылок на GitHub и нет подмены GeckoLib JSON glTF-загрузчиком.

Иллюстрационные иконки большого разрешения оптимизированы Pillow (thumbnail,
LANCZOS, WebP lossless); небольшие Minecraft-спрайты и текстура модели не ресайзились.
Для повторной подготовки оригинальные большие PNG доступны по зафиксированным
commit/пути и хешу manifest; полный каталог текстур в сайт не копировался.

## Границы проверки

Инвентаризация — список ресурсов удалённого commit, а не обещание, что любой файл
является самостоятельной публичной сущностью. Полноценное сопоставление остальных
перков, способностей, предметов и UI выполняется при наполнении Wiki.
Данные каждого импортированного ресурса проверены, локальные пути/размеры/хеши
проверяются npm run check. Игра и все возможные состояния анимации не запускались.
