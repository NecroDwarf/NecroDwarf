# NecroDwarf 2.0

Основное приложение находится в [website](website/README.md): сайт команды,
страницы трёх проектов, хроники Maniac и открытая Wiki. Текущая сборка содержит
190 опубликованных маршрутов и отдельную 404. Полный продукт и этапы —
[ТЗ](NECRODWARF_V2_TZ.md), постоянные правила — [AGENTS.md](AGENTS.md).

```powershell
cd website
npm ci
npm run dev
```

Локальная сборка: `npm run build`, проверка результата: `npm run check`, просмотр статики: `npm run preview`.

Браузерные проверки: `npm run browser:install`, затем `npm run check:browser` после
сборки. Подробности — [BROWSER_CHECKS.md](website/docs/BROWSER_CHECKS.md).

Деплой не выполнялся. Cloudflare Pages: root directory `website`, build command `npm run build`, output directory `build/client`.
