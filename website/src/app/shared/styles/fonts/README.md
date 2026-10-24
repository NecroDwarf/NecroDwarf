# Локальные шрифты

Geologica и Rubik: normal variable WOFF2, подмножества Cyrillic и Latin.
Получены из пакетов Fontsource версии **5.3.0**:

- https://www.npmjs.com/package/@fontsource-variable/geologica/v/5.3.0
- https://www.npmjs.com/package/@fontsource-variable/rubik/v/5.3.0

Файлы: `https://cdn.jsdelivr.net/npm/@fontsource-variable/{family}@5.3.0/files/{family}-{subset}-wght-normal.woff2`.
Лицензии SIL OFL 1.1 сохранены в `geologica-LICENSE.txt` и `rubik-LICENSE.txt` без изменений.
Используемые диапазоны Unicode взяты из `wght.css` этих же пакетов.

Центральное подключение — `../fonts.css`, импортированное из `../global.css`.
Geologica ограничена весами 600–700, Rubik — 400–600. Variable-файлы содержат полный
диапазон весов; отдельные статические файлы для каждого начертания не нужны.
Общий размер четырёх WOFF2 — 91 832 байта. Кириллица и латиница загружаются по
необходимости через `unicode-range`, с `font-display: swap`, без внешних запросов.
Расширенные алфавиты и курсив на данном этапе не подключены.
