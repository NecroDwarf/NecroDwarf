// Input is React's own static HTML, never arbitrary remote HTML.
const voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const excluded = new Set([
  "nav",
  "aside",
  "footer",
  "script",
  "style",
  "svg",
  "button",
  "noscript",
]);
const decode = (text) =>
  text.replace(/&(amp|lt|gt|quot|apos|#x[\da-f]+|#\d+);/gi, (match, entity) => {
    if (entity.startsWith("#"))
      return String.fromCodePoint(
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : Number(entity.slice(1)),
      );
    return (
      { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[entity] ?? match
    );
  });

export function articleText(html, href) {
  const fragment = href.split("#")[1];
  const stack = [];
  const parts = [];
  let roots = 0;
  for (const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? []) {
    if (token.startsWith("<!--")) continue;
    if (token.startsWith("</")) {
      const tag = token.slice(2).match(/^\w+/)?.[0];
      const index = stack.findLastIndex((node) => node.tag === tag);
      if (index >= 0) stack.length = index;
      // Inline stat fragments stay together; blocks separate words.
      if (
        /^(p|h[1-6]|li|dt|dd|td|th|div|section|article|blockquote)$/.test(
          tag ?? "",
        )
      )
        parts.push(" ");
    } else if (token.startsWith("<")) {
      const tag = token.slice(1).match(/^\w+/)?.[0];
      const attributes = Object.fromEntries(
        [...token.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [
          key,
          decode(value),
        ]),
      );
      const root = fragment
        ? (tag === "article" && attributes["data-effect-id"] === fragment) ||
          (tag === "section" &&
            attributes.id === fragment &&
            !!attributes["data-mechanic-id"])
        : tag === "main";
      if (root) roots++;
      const parent = stack.at(-1);
      const node = {
        tag,
        active: root || parent?.active,
        skip:
          parent?.skip ||
          excluded.has(tag) ||
          attributes["aria-hidden"] === "true" ||
          attributes.id === "related",
      };
      if (
        node.active &&
        !node.skip &&
        attributes.role === "img" &&
        attributes["aria-label"]
      )
        parts.push(` ${attributes["aria-label"]} `);
      if (tag === "br") parts.push(" ");
      if (!voidTags.has(tag) && !token.endsWith("/>")) stack.push(node);
    } else if (stack.at(-1)?.active && !stack.at(-1)?.skip) {
      parts.push(decode(token));
    }
  }
  if (roots !== 1)
    throw new Error(
      `Expected one search article root for ${href}, got ${roots}`,
    );
  // Search uses word intersections. Deduplication keeps the deferred corpus small.
  return [
    ...new Set(
      parts.join("").toLowerCase().replaceAll("ё", "е").trim().split(/\s+/),
    ),
  ].join(" ");
}
