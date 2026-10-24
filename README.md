# NecroDwarf 2.0

Основное приложение находится в [website](website/README.md). Выполнены этапы 0 и 1 из [ТЗ](NECRODWARF_V2_TZ.md). Постоянные правила — [AGENTS.md](AGENTS.md).

```powershell
cd website
npm ci
npm run dev
```

Локальная сборка: `npm run build`, проверка результата: `npm run check`, просмотр статики: `npm run preview`.

Деплой не выполнялся. Cloudflare Pages: root directory `website`, build command `npm run build`, output directory `build/client`.
