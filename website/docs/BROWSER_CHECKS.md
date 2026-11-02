# Браузерные проверки

Запуск из `website` на Node.js 22.12+:

```powershell
npm ci
npm run browser:install
npm run build
npm run check:browser
```

Playwright зафиксирован в `devDependencies` и `package-lock.json`.
`browser:install` устанавливает соответствующий ему Chromium. После обновления
Playwright установку браузера нужно повторить. На Linux для системных зависимостей
используйте `npx playwright install --with-deps chromium`, как в CI.

`check:browser` последовательно проверяет Wiki/персонажей, перки/способности,
предметы/механики, карты и заключительную проверку общей навигации. Можно запустить один набор:

```powershell
npm run check:wiki:browser
npm run check:reference:browser
npm run check:systems:browser
npm run check:maps:browser
npm run check:navigation:browser
```

Общий помощник `scripts/browser-check.mjs` запускает сервер готовой статики на
свободном localhost-порту и браузер. При завершении или ошибке он закрывает браузер,
сервер и вспомогательный загрузчик модулей. Ошибки страницы и консоли собираются
одинаково во всех наборах. Сценарии проверяют HTML без JavaScript, гидратацию,
изоляцию ресурсов, фильтры, переходы, адаптивность, reduced motion и просмотр 3D.

По умолчанию используется Chromium. Для отдельного прогона в установленном Edge:

```powershell
$env:BROWSER_CHANNEL = 'msedge'
npm run check:browser
Remove-Item Env:BROWSER_CHANNEL
```

Результаты находятся в `build/browser-checks/<набор>/`: `report.json`, каталог
`screenshots`, а при ошибке — `failure.json`. Этот каталог игнорируется Git.
Исторические отчёты в `docs` не перезаписываются. GitHub Actions запускает отдельный
job `browser-checks` после статических проверок и сохраняет результаты как artifact,
в том числе при падении сценария. Для проверки CI нужен push или pull request;
локальный запуск не подтверждает выполнение на GitHub.

Настройки для нестандартного окружения:

- `BROWSER_OUTPUT_DIR` — корень каталога результатов;
- `WIKI_SCREENSHOT_DIR` — явный путь скриншотов, для совместимости со старыми командами;
- `PLAYWRIGHT_MODULE` — необязательный путь внешнего модуля Playwright; обычная
  установка его не требует.

Пересоберите сайт после изменений приложения перед повторным браузерным прогоном.
`npm run check` остаётся отдельной быстрой статической проверкой.

Установка браузера и шаги CI соответствуют документации Playwright:
[браузеры](https://playwright.dev/docs/browsers),
[Continuous Integration](https://playwright.dev/docs/ci).
