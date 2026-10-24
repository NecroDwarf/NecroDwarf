import { build } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const originValue = process.env.SITE_URL;
// Same public origin for generated HTML and client navigation.
process.env.VITE_SITE_URL = originValue || "";
await build({ build: { outDir: "build/client" } });
await build({
  build: { ssr: "src/entry-server.tsx", outDir: ".ssg", emptyOutDir: true },
});
const { paths, render, projects, siteOrigin } = await import(
  "../.ssg/entry-server.js"
);
const origin = siteOrigin(originValue);
const ids = new Set(),
  versions = new Set(),
  slugs = new Set(),
  releaseIds = new Set();
for (const project of projects) {
  if (ids.has(project.id)) throw new Error(`Duplicate project: ${project.id}`);
  ids.add(project.id);
  for (const release of project.releases) {
    const version = `${project.id}:${release.version}`,
      slug = `${project.id}:${release.slug}`;
    if (
      release.projectId !== project.id ||
      versions.has(version) ||
      slugs.has(slug) ||
      releaseIds.has(release.id)
    )
      throw new Error(`Invalid release: ${release.id}`);
    versions.add(version);
    slugs.add(slug);
    releaseIds.add(release.id);
    if (release.publishedAt && !/^\d{4}-\d{2}-\d{2}$/.test(release.publishedAt))
      throw new Error(`Invalid date: ${release.id}`);
    new URL(release.source);
  }
}
if (new Set(paths).size !== paths.length) throw new Error("Duplicate route");
const template = await readFile("build/client/index.html", "utf8");
for (const path of [...paths, "/404"]) {
  const page = render(path, origin);
  const target = resolve(
    "build/client",
    path === "/" ? "index.html" : `${path.slice(1)}.html`,
  );
  await mkdir(dirname(target), { recursive: true });
  await writeFile(
    target,
    template
      .replace("<!--app-head-->", page.head)
      .replace("<!--app-html-->", page.html),
  );
}
await writeFile(
  "build/client/robots.txt",
  origin
    ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n",
);
if (origin) {
  const escape = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  await writeFile(
    "build/client/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escape(origin + path)}</loc></url>`).join("")}</urlset>`,
  );
}
await writeFile(".ssg/paths.json", JSON.stringify(paths));
await writeFile(
  "build/client/_redirects",
  paths
    .filter((path) => path !== "/")
    .map((path) => `${path}/ ${path} 301`)
    .join("\n") + "\n",
);
console.log(
  `Prerendered ${paths.length} pages + 404 → build/client. ${origin ? `Origin: ${origin}` : "SITE_URL absent: noindex, sitemap omitted."}`,
);
