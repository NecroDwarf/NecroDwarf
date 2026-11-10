import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const base = "/src/app/projects/maniac/wiki/";
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const { statTextParts } = await server.ssrLoadModule(
    base + "data/stat-text.ts",
  );
  const { StatText } = await server.ssrLoadModule(base + "ui/StatText.tsx");
  const { statGlyph } = await server.ssrLoadModule(base + "ui/GameGlyph.tsx");
  const cases = [
    ["Наносит 2.5 урона в радиусе 1.8 блоков.", ["damage", "range"]],
    ["+2 маны / сек. за уровень.", ["mana", "cooldown", "level"]],
    ["+1 HP / 12 сек.", ["health", "cooldown"]],
    ["50% входящего урона. +20% к скорости передвижения.", ["damage", "speed"]],
    ["Восстанавливает 10% от макс. HP.", ["health"]],
    ["Наносит 2.5 HP.", ["damage"]],
    ["Вклад во взлом на 5%. Прочность: 15.", ["hacking", "durability"]],
    ["−20% скорости, 1,5–2,5 блока и 2–3 сек.", ["speed", "range", "cooldown"]],
    ["Minecraft 1.20.1. Фазы 1–3. Сохраняет 75% прогресса.", ["progress"]],
    ["Отнимает 50% прогресса у самого заряженного компьютера.", ["progress"]],
    ["Прогресс на 5%. С прогрессом не ниже 80%.", ["progress", "progress"]],
    ["Взлом защищён. Скорость передвижения обычная.", []],
    ["Фаза 1 с союзниками. Задержка 10 с.", ["cooldown"]],
    ["Поднимает вас с 5 HP.", ["health"]],
    ["Начинает с 3 маны.", ["mana"]],
    ["Игра с 3 союзниками.", []],
    ["Задержка 10 с, затем 2 с. Конец.", ["cooldown", "cooldown"]],
    ["Розовые очки с прочностью 15.", ["durability"]],
    ["Успешное QTE даёт +1% вклада за заряд.", ["hacking"]],
    ["Скорость 3 на 15 сек.", ["speed", "cooldown"]],
    ["Скорость III. Сила I.", ["speed", "strength"]],
    ["Снижает зависимость на 70%.", ["addiction"]],
    ["−70% текущей зависимости.", ["addiction"]],
    ["Даёт Силу I в фазе «Переворот».", ["strength"]],
    ["Радиус 3 бл. На 2 УР.", ["range", "level"]],
    [
      "31 рассудка / сек., восстановление — 2,2 рассудка / сек.",
      ["sanity", "cooldown", "sanity", "cooldown"],
    ],
    ["Провал: −0,8 очка прогресса.", ["progress"]],
  ];
  for (const [text, symbols] of cases) {
    const parts = statTextParts(text);
    assert.deepEqual(
      parts.filter((p) => typeof p !== "string").map((p) => p.symbol),
      symbols,
      text,
    );
    assert.equal(
      parts.map((p) => (typeof p === "string" ? p : p.original)).join(""),
      text,
    );
  }
  // Formatting must preserve every original number and word across real content.
  const dataRoot = "src/app/projects/maniac/wiki/data/";
  let strings = 0;
  function checkStrings(value) {
    if (typeof value === "string") {
      assert.equal(
        statTextParts(value)
          .map((p) => (typeof p === "string" ? p : p.original))
          .join(""),
        value,
      );
      strings++;
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(checkStrings);
    }
  }
  for (const kind of [
    "character",
    "perk",
    "ability",
    "item",
    "mechanic",
    "map",
  ]) {
    const dir = `${dataRoot}${kind}-articles/`;
    for (const file of await readdir(dir)) {
      if (file.endsWith(".json"))
        checkStrings(JSON.parse(await readFile(dir + file, "utf8")));
    }
  }
  const markup = renderToStaticMarkup(
    createElement(StatText, { text: cases[0][0], interactive: false }),
  );
  const sentences = statTextParts(
    "Ускорение на 8 сек. Длительность следующего: 7 сек.",
  );
  assert.equal(
    sentences.map((p) => (typeof p === "string" ? p : "[иконка]")).join(""),
    "Ускорение на 8 [иконка]. Длительность следующего: 7 [иконка].",
  );
  assert.match(markup, /role="img" aria-label="Урон"/);
  assert.match(markup, /aria-label="Расстояние, блоки"/);
  assert.doesNotMatch(
    markup,
    /tabindex=/,
    "Whole-card links must not contain extra tab stops",
  );
  assert.match(
    renderToStaticMarkup(createElement(StatText, { text: "10 маны" })),
    /tabindex="0"/,
  );
  assert.equal(statGlyph("speed-duration", "seconds"), "cooldown");
  assert.equal(statGlyph("movement-speed", "percent"), "speed");
  assert.equal(statGlyph("durability", "count"), "durability");
  assert.equal(statGlyph("share", "percent"), "damage");
  const catalog = await readFile(
    "build/client/projects/maniac/wiki/abilities.html",
    "utf8",
  );
  const leap = catalog.match(
    /<a[^>]*href="\/projects\/maniac\/wiki\/abilities\/beast-leap"[^>]*>([\s\S]*?)<\/a>/,
  )?.[1];
  assert.ok(leap, "Beast Leap catalog card");
  assert.match(leap, /data-glyph="damage"/);
  assert.match(leap, /data-glyph="range"/);
  assert.doesNotMatch(leap, /tabindex=/);
  const { itemCatalog, listedItems } = await server.ssrLoadModule(
    base + "data/systems-catalog.ts",
  );
  assert.equal(itemCatalog.filter((e) => e.category === "armor").length, 13);
  const hiddenItemIds = new Set([
    "item:soul-essence",
    "item:slot-machine",
    "item:alchemy-kit",
    "item:dodepovich-coins",
    "item:computer",
    "item:recipe-book",
  ]);
  assert.equal(listedItems.length, 50);
  assert.deepEqual(
    listedItems.map((e) => e.id),
    itemCatalog
      .filter((e) => e.category !== "armor" && !hiddenItemIds.has(e.id))
      .map((e) => e.id),
  );
  const weaponsCatalogHtml = await readFile(
    "build/client/projects/maniac/wiki/items.html",
    "utf8",
  );
  assert.doesNotMatch(weaponsCatalogHtml, /<option value="armor"/);
  for (const item of itemCatalog.filter(
    (e) => e.category === "armor" || hiddenItemIds.has(e.id),
  ))
    assert.ok(
      !weaponsCatalogHtml.includes(`data-system-id="${item.id}"`),
      item.id,
    );
  const weaponFixtures = {
    hook: 4,
    "death-scythe": 2,
    microphone: 2,
    "toy-knife": 2,
    "beast-claw": 1,
    "plague-lantern": 0.5,
    "agent-pistol": 6.75,
    "agent-knife": 2,
  };
  assert.equal(
    listedItems.filter((e) => e.category === "weapon").length,
    Object.keys(weaponFixtures).length,
  );
  for (const [slug, value] of Object.entries(weaponFixtures)) {
    const item = listedItems.find((e) => e.slug === slug);
    const damage = item.stats.find((stat) => stat.key === "base-damage");
    assert.equal(damage.value, value, slug);
    assert.equal(damage.unit, "damage", slug);
    const label = slug.startsWith("agent-")
      ? "Урон по справочнику"
      : "Базовый урон";
    assert.equal(damage.label, label);
    const card = weaponsCatalogHtml.match(
      new RegExp(
        `<a[^>]*data-system-id="item:${slug}"[^>]*>([\\s\\S]*?)<\\/a>`,
      ),
    )?.[1];
    assert.ok(card, slug);
    assert.ok(card.includes(label), slug);
    assert.ok(card.includes(String(value).replace(".", ",")), slug);
    assert.match(card, /data-glyph="damage"/);
    assert.doesNotMatch(card, /tabindex=/);
    const article = await readFile(
      `build/client/projects/maniac/wiki/items/${slug}.html`,
      "utf8",
    );
    assert.ok(article.includes(label), slug);
    assert.match(article, /data-glyph="damage"/);
  }
  console.log(
    `PASS: shared stat icons in prose/cards, accessible names, no nested tab stops; ${strings} original article strings preserved.`,
  );
} finally {
  await server.close();
}
