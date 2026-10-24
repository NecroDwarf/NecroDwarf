import type { PageMeta } from "../content/types";
export function siteOrigin(value: string | undefined) {
  if (!value) return undefined;
  const url = new URL(value);
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "SITE_URL must be an HTTP(S) origin, without path, query or credentials",
    );
  return url.origin;
}
export function escapeHtml(text: string) {
  return text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
export function renderHead(
  meta: PageMeta,
  path: string,
  origin?: string,
  notFound = false,
) {
  const title = escapeHtml(meta.title),
    description = escapeHtml(meta.description);
  return `<title>${title}</title><meta name="description" content="${description}"/><meta property="og:title" content="${title}"/><meta property="og:description" content="${description}"/><meta property="og:type" content="website"/><meta property="og:locale" content="ru_RU"/><meta property="og:site_name" content="NecroDwarf"/>${origin && !notFound ? `<link rel="canonical" href="${escapeHtml(origin + path)}"/><meta property="og:url" content="${escapeHtml(origin + path)}"/><meta property="og:image" content="${escapeHtml(origin)}/brand/necrodwarf-full.png"/>` : ""}${!origin || notFound ? '<meta name="robots" content="noindex, nofollow"/>' : ""}<link rel="icon" type="image/png" href="/brand/necrodwarf-mark.png"/>`;
}
