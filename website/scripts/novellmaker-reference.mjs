import { Marked } from "marked";
import hljs from "highlight.js/lib/core";
import lua from "highlight.js/lib/languages/lua";
import json from "highlight.js/lib/languages/json";
import powershell from "highlight.js/lib/languages/powershell";
import csharp from "highlight.js/lib/languages/csharp";
import { posix } from "node:path";
export const commit = "5e885944ee36f5945a734c18c19c65c261402445";
export const repository = "https://github.com/doflare123/NovellMaker";
export const base = "/projects/novellmaker/docs";
export const docPath = (slug) =>
  slug === "engine-guide"
    ? `${base}/engine-guide`
    : slug === "index"
      ? `${base}/lua`
      : `${base}/lua/${slug}`;
export const slugify = (text) =>
  text
    .replace(/<[^>]+>/g, "")
    .replace(/[`*]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s/g, "-");
for (const [name, language] of Object.entries({
  lua,
  json,
  powershell,
  csharp,
}))
  hljs.registerLanguage(name, language);
const parser = new Marked({ gfm: true });
const n = (tag, children = [], props) => ({
  tag,
  children,
  ...(props ? { props } : {}),
});
const decode = (s) =>
  s.replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (m, e) =>
      ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[e] ??
      (e[0] === "#"
        ? String.fromCodePoint(
            e[1].toLowerCase() === "x"
              ? parseInt(e.slice(2), 16)
              : Number(e.slice(1)),
          )
        : m),
  );
export function resolveLink(raw, file) {
  if (/^(https?:|mailto:)/i.test(raw)) return raw;
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(raw))
    throw new Error(`Unsafe URL: ${raw}`);
  const [path, fragment] = raw.split("#");
  if (!path) return raw;
  const target = posix.normalize(
    posix.join("docs/lua-reference", decodeURIComponent(path)),
  );
  if (target.startsWith("docs/lua-reference/") && target.endsWith(".md"))
    return (
      docPath(posix.basename(target, ".md")) + (fragment ? `#${fragment}` : "")
    );
  if (target.startsWith("../") || target.startsWith("/"))
    throw new Error(`Escaping source root: ${file}: ${raw}`);
  return `${repository}/blob/${commit}/${target}${fragment ? `#${fragment}` : ""}`;
}
function highlighted(code, language) {
  const lang =
    { cs: "csharp", "c#": "csharp", ps1: "powershell" }[language] ?? language;
  if (!hljs.getLanguage(lang)) return [code];
  // Only text and generated span nodes reach React; Markdown HTML is never injected.
  const html = hljs.highlight(code, { language: lang }).value;
  const root = [],
    stack = [root];
  for (const token of html.split(/(<span class="[a-zA-Z0-9_ -]+">|<\/span>)/)) {
    if (token.startsWith('<span class="')) {
      const node = n("span", [], { className: token.slice(13, -2) });
      stack.at(-1).push(node);
      stack.push(node.children);
    } else if (token === "</span>") stack.pop();
    else if (token) stack.at(-1).push(decode(token));
  }
  return root;
}
export function compile(markdown, file) {
  const headings = [],
    codes = [],
    links = [],
    ids = new Set();
  let lastExplicit;
  function convert(tokens) {
    return tokens.flatMap((t) => {
      const inner = () => convert(t.tokens ?? []);
      switch (t.type) {
        case "space":
          return [];
        case "text":
          return t.tokens ? inner() : [decode(t.text)];
        case "escape":
          return [decode(t.text)];
        case "heading": {
          const title = t.text.replace(/[`*]/g, "");
          const stem = slugify(t.text);
          let id = stem,
            i = 0;
          // An explicit source anchor immediately before a heading is canonical.
          while (ids.has(id)) id = `${stem}-${++i}`;
          ids.add(id);
          headings.push({ title, id: lastExplicit ?? id, level: t.depth });
          lastExplicit = undefined;
          return [n(`h${t.depth}`, inner(), { id })];
        }
        case "html": {
          const anchors = [...t.text.matchAll(/<a\s+id="([\w-]+)"\s*>/g)];
          if (t.text.replace(/<a\s+id="[\w-]+"\s*>|<\/a>/g, "").trim())
            return [t.text];
          return anchors.map((a) => {
            if (ids.has(a[1])) throw new Error(`Duplicate anchor ${a[1]}`);
            ids.add(a[1]);
            lastExplicit = a[1];
            return n("span", [], { id: a[1] });
          });
        }
        case "paragraph":
          return [n("p", inner())];
        case "strong":
        case "em":
        case "del":
          return [n(t.type, inner())];
        case "codespan":
          return [n("code", [decode(t.text)])];
        case "br":
          return [n("br")];
        case "hr":
          return [n("hr")];
        case "blockquote":
          return [n("blockquote", inner())];
        case "list":
          return [
            n(
              t.ordered ? "ol" : "ul",
              t.items.map((item) => n("li", convert(item.tokens))),
              t.ordered ? { start: t.start } : undefined,
            ),
          ];
        case "link": {
          const href = resolveLink(t.href, file);
          links.push(href);
          return [
            n("a", inner(), {
              href,
              ...(href.startsWith("https:")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {}),
            }),
          ];
        }
        case "image":
          throw new Error(`Review image before import: ${file}`);
        case "code": {
          const language = t.lang?.split(/\s/)[0] || "text";
          codes.push({ language, text: t.text });
          return [
            {
              tag: "pre",
              text: t.text,
              language,
              children: highlighted(t.text, language),
            },
          ];
        }
        case "table":
          return [
            n(
              "div",
              [
                n("table", [
                  n("thead", [
                    n(
                      "tr",
                      t.header.map((c) =>
                        n("th", convert(c.tokens), { scope: "col" }),
                      ),
                    ),
                  ]),
                  n(
                    "tbody",
                    t.rows.map((row) =>
                      n(
                        "tr",
                        row.map((c) => n("td", convert(c.tokens))),
                      ),
                    ),
                  ),
                ]),
              ],
              {
                className: "nm-table",
                tabIndex: 0,
                role: "region",
                "aria-label": "Таблица, прокрутка по горизонтали",
              },
            ),
          ];
        default:
          throw new Error(`Unhandled Markdown token ${t.type} in ${file}`);
      }
    });
  }
  const nodes = convert(parser.lexer(markdown));
  return {
    title: headings[0]?.title,
    headings,
    nodes,
    codes,
    links,
    ids: [...ids],
  };
}
