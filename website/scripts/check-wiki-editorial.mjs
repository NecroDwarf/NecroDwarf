import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "vite";
const base = "src/app/projects/maniac/wiki/";
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: "custom",
});
try {
  const load = (name) => server.ssrLoadModule("/" + base + name);
  const {
    gameplayFacts: facts,
    currentDescription,
    formatGameText,
  } = await load("data/gameplay-facts.ts");
  const { publishedEntityRoutes } = await load("data/publication.ts");
  const { effectConnections } = await load("data/effect-connections.ts");
  const { publishedEffectMeta } = await load("published-effects.ts");
  assert.throws(
    () => formatGameText("{{missing.fact}}"),
    /Unknown gameplay fact/,
  );
  const { currentStats } = await load("data/gameplay-facts.ts");
  for (const stat of [
    { key: "test", label: "Test", unit: "health", valueRef: "missing.fact" },
    {
      key: "test",
      label: "Test",
      unit: "health",
      value: 2,
      valueRef: "bandages.selfHealth",
    },
  ])
    assert.throws(() => currentStats("item:bandages", [stat]), /stat value/);

  // Change facts before module evaluation, without modifying source files.
  // All current consumers must follow; release snapshots must remain identical.
  const probeFacts = structuredClone(facts);
  Object.assign(probeFacts.bandages, {
    allyHealth: 88,
    selfHealth: 99,
    seconds: 9.5,
  });
  Object.assign(probeFacts.clarity, { drinkSeconds: 2.6, effectSeconds: 7 });
  Object.assign(probeFacts.orchid, { mana: 11, cooldownSeconds: 46 });
  probeFacts.sprout.mana = 6;
  Object.assign(probeFacts.ancestor, { baseHealth: 3, bonusHealth: 4 });
  probeFacts.sanity.range = 41;
  const probe = await createServer({
    plugins: [
      {
        name: "probe-gameplay-facts",
        enforce: "pre",
        transform(code, id) {
          if (!id.replaceAll("\\", "/").endsWith("/data/gameplay-facts.ts"))
            return;
          const changed = code.replace(
            /export const gameplayFacts = [\s\S]*? as const;/,
            `export const gameplayFacts = ${JSON.stringify(probeFacts)} as const;`,
          );
          assert.notEqual(
            changed,
            code,
            "Gameplay facts initializer not found",
          );
          return changed;
        },
      },
    ],
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: "custom",
  });
  try {
    const registryPath = "/" + base + "data/registry.ts";
    const original = await server.ssrLoadModule(registryPath);
    const changed = await probe.ssrLoadModule(registryPath);
    for (const [id, expected] of [
      ["item:bandages", { use: 9.5, "self-heal": 99, "ally-heal": 88 }],
      ["item:clarity", { use: 2.6, duration: 7 }],
      ["perk:pink-orchid", { mana: 11, cooldown: 46 }],
      ["perk:sber-sprout", { mana: 6 }],
      ["ability:abyss-gaze", { range: 41 }],
      ["item:ancestor-soul", { "base-heal": 3, "spectator-heal": 4 }],
    ]) {
      const stats = changed.getRevision(id).data.stats;
      for (const [key, value] of Object.entries(expected))
        assert.equal(
          stats.find((stat) => stat.key === key)?.value,
          value,
          `${id}/${key}`,
        );
    }
    const { formatGameText: changedText } = await probe.ssrLoadModule(
      "/" + base + "data/gameplay-facts.ts",
    );
    const bandages = JSON.parse(
      await readFile(base + "data/item-articles/bandages.json", "utf8"),
    );
    assert.match(changedText(bandages.description), /9,5 сек.*88 HP.*99 HP/);
    for (const entity of original.entities)
      for (const [snapshot, revision] of Object.entries(entity.revisions))
        if (snapshot.startsWith("release:"))
          assert.deepEqual(
            changed.getEntity(entity.id).revisions[snapshot],
            revision,
            `${entity.id}/${snapshot}`,
          );
  } finally {
    await probe.close();
  }
  for (const [effect, entities] of Object.entries(effectConnections)) {
    assert.ok(
      publishedEffectMeta.some((entry) => entry.id === effect),
      effect,
    );
    for (const entity of entities)
      assert.ok(publishedEntityRoutes[entity], entity);
  }
  let checked = 0;
  for (const dir of [
    "item-articles",
    "mechanic-articles",
    "perk-articles",
    "ability-articles",
  ]) {
    for (const file of await readdir(base + "data/" + dir)) {
      const article = JSON.parse(
        await readFile(base + "data/" + dir + "/" + file, "utf8"),
      );
      const prose = [
        currentDescription(article.id, article.description),
        ...(article.sections ?? []).flatMap((section) => section.paragraphs),
        ...(article.conditions ?? []),
      ]
        .map(formatGameText)
        .join("\n");
      assert.doesNotMatch(
        prose,
        /§[0-9a-fk-or]|\b(?:amplifier|consumeMana|setMana|[A-Z]\w*(?:Manager|Capability|Entity)|ModBrewingRecipes|HackConfig)\b|\{\{/,
        file,
      );
      const html = await readFile(
        "build/client" + publishedEntityRoutes[article.id] + ".html",
        "utf8",
      );
      assert.ok(!html.includes("{{"), file);
      assert.ok(!html.includes('class="undefined"'), file);
      checked++;
    }
  }
  const html = async (path) =>
    readFile("build/client/projects/maniac/wiki/" + path + ".html", "utf8");
  // Regression cases found in the second player-facing audit. Check the
  // rendered catalog: a valid long article cannot compensate for a cut card.
  const { perkCatalog } = await load("data/reference-catalog.ts");
  const perkHtml = await html("perks");
  for (const [slug, required] of [
    ["mana-break", [/снимает 10 маны/]],
    ["hedgehog-skin", [/возвращает атакующему 50%/, /не снижает/]],
    [
      "emergency-overclock",
      [/обычный вклад во взлом отключён/, /крит \+50%/, /Провал/],
    ],
    [
      "flowers-lead-the-investigation",
      [/оставляют цветочный след/, /12 сек\./],
    ],
    ["str-perk", [/Силу I/, /Переворот/]],
    ["rose-colored-glasses", [/25% входящего урона/]],
  ]) {
    const entry = perkCatalog.find((e) => e.slug === slug);
    assert.ok(entry, slug);
    const card = perkHtml.match(
      new RegExp(
        `<a[^>]*data-reference-id="perk:${slug}"[^>]*>([\\s\\S]*?)<\\/a>`,
      ),
    )?.[1];
    assert.ok(card, slug);
    const text = card.replace(/<[^>]*>/g, "");
    for (const pattern of required) assert.match(text, pattern, slug);
  }
  for (const [path, required, glyphs] of [
    [
      "items/coin-health",
      [/\+4 HP/, /4 магического урона/],
      ["health", "damage"],
    ],
    ["items/coin-elusiveness", [/10 сек\./, /5 сек\./], ["speed"]],
    ["items/coin-shackles", [/7 сек\./], ["cooldown"]],
    ["items/coin-eagle", [/10 сек\./], ["cooldown"]],
    [
      "items/salt",
      [/замедление на 2 сек\./, /Слепота на 6 сек\./],
      ["cooldown"],
    ],
    [
      "items/green-color-card",
      [/\+4 HP/, /1,5 урона/, /45 сек\./],
      ["health", "damage"],
    ],
    [
      "items/blue-color-card",
      [/\+5% прогресса/, /−5% прогресса/, /45 сек\./],
      ["progress"],
    ],
    [
      "items/adrenaline-syringe",
      [/Скорость 3/, /8 сек\./, /70%/],
      ["speed", "addiction"],
    ],
    ["items/bandages", [/\+4 HP/, /\+2 HP/, /4,5 сек\./], ["health"]],
    ["items/ancestor-soul", [/\+2 HP/, /выжившего-наблюдателя/], ["health"]],
    [
      "abilities/abyss-gaze",
      [/31 рассудка/, /2,2 рассудка/, /16 сек\./],
      ["sanity"],
    ],
    [
      "mechanics/sanity",
      [/100 рассудка/, /31 рассудка/, /2,2 рассудка/],
      ["sanity"],
    ],
  ]) {
    const page = await html(path);
    const text = page.replace(/<[^>]*>/g, "");
    for (const pattern of required) assert.match(text, pattern, path);
    for (const glyph of glyphs)
      assert.ok(page.includes(`data-glyph="${glyph}"`), `${path}: ${glyph}`);
  }
  const drink = await html("items/clarity");
  assert.ok(drink.includes('href="/projects/maniac/wiki/effects#mana_flow"'));
  assert.ok(drink.includes('href="/projects/maniac/wiki/perks/football-fan"'));
  const football = await html("perks/football-fan");
  assert.doesNotMatch(football, /Бросает пиво/);
  assert.ok(football.includes("Обездвиживает вас"));
  assert.ok(football.includes(String(facts.football.survivorSeconds)));
  for (const page of [
    "items/rose-colored-glasses",
    "perks/rose-colored-glasses",
    "effects",
  ]) {
    const text = (await html(page)).replace(/<[^>]*>/g, "");
    assert.ok(text.includes(`${facts.glasses.reductionPercent}%`), page);
    assert.ok(
      !text.includes("защищают от определённых отрицательных состояний"),
      page,
    );
  }
  assert.ok(!(await html("perks/pink-orchid")).includes("§d"));
  console.log(
    `PASS: ${checked} current articles have player-facing prose, valid fact references and complete CSS classes; linked effects and shared characteristics agree.`,
  );
} finally {
  await server.close();
}
