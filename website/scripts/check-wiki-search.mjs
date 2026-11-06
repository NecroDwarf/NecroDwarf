import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { articleText } from "./wiki-search-text.mjs";

assert.equal(
  articleText(
    '<header>outside</header><main><nav>menu</nav><aside>toc</aside><h1>Учёный</h1><p>Разорвите<!-- --> контакт &amp; &#x27;взгляд&#39;.</p><p>5 <span role="img" aria-label="здоровье"><svg><title>icon</title></svg><span aria-hidden="true">HP</span></span></p><section id="related">unrelated</section><footer>footer</footer><p>Разорвите</p></main>',
    "/article",
  ),
  "ученый разорвите контакт & 'взгляд'. 5 здоровье",
);
const effects =
  '<main><article data-effect-id="first"><h3>Первый</h3><p>Кровавые следы.</p></article><article data-effect-id="second"><h3>Второй</h3><p>Другой текст.</p></article></main>';
assert.equal(articleText(effects, "/effects#first"), "первый кровавые следы.");
assert.equal(articleText(effects, "/effects#second"), "второй другой текст.");
assert.throws(
  () => articleText(effects, "/effects#missing"),
  /one search article root/,
);
assert.throws(
  () => articleText("<main>one</main><main>two</main>", "/article"),
  /one search article root/,
);

const content = JSON.parse(
  await readFile("src/app/projects/maniac/wiki/search-content.json", "utf8"),
);
const paths = JSON.parse(await readFile(".ssg/paths.json", "utf8"));
for (const [href, text] of Object.entries(content)) {
  const path = href.split("#")[0];
  assert.ok(paths.includes(path), href);
  const html = await readFile(`build/client${path}.html`, "utf8");
  assert.equal(
    text,
    articleText(html, href),
    `Search text must match current published HTML: ${href}`,
  );
  assert.ok(text.length > 20, href);
  assert.doesNotMatch(text, /\{\{|<!--|<svg|\.java\b|src\/main\//);
}
assert.ok(
  content["/projects/maniac/wiki/mechanics/sanity"].includes("разорвите"),
);
assert.ok(
  content["/projects/maniac/wiki/effects#open_wound"].includes("кровавые"),
);
assert.ok(
  !Object.keys(content).some((href) => href.includes("weak_instant_health")),
);
console.log(
  `PASS: ${Object.keys(content).length} search documents match published HTML; text extraction, effect isolation and hidden content safeguards`,
);
