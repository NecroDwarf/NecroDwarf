import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { MemoryRouter } = await server.ssrLoadModule("react-router");
  const { ProjectIntro } = await server.ssrLoadModule(
    "/src/app/shared/ui/ProjectIntro.tsx",
  );
  const { ProjectGallery } = await server.ssrLoadModule(
    "/src/app/shared/ui/ProjectGallery.tsx",
  );
  const { ProjectGrid } = await server.ssrLoadModule(
    "/src/app/shared/ui/ProjectGrid.tsx",
  );
  const { ReleaseList } = await server.ssrLoadModule(
    "/src/app/shared/ui/ReleaseList.tsx",
  );
  const { projects } = await server.ssrLoadModule(
    "/src/app/projects/registry.ts",
  );
  const render = (Component, props) =>
    renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Component, props)),
    );
  for (const project of projects) {
    const html = render(ProjectIntro, { project });
    assert.ok(html.includes(project.description));
    assert.match(html, /Художественная иллюстрация/);
    assert.doesNotMatch(
      html,
      /Ключевые особенности|Галерея|Платформы:|Скачать|В разработке/,
    );
  }
  assert.equal(render(ProjectGallery, {}), "");
  assert.equal(render(ProjectGallery, { images: [] }), "");
  assert.equal(render(ReleaseList, { releases: [], projectNames: {} }), "");
  // Synthetic data stays in this check; it is never part of the public registry.
  const image = {
    src: "/test-cover.webp",
    alt: "Проверка изображения",
    width: 1200,
    height: 800,
    caption: "Подпись",
  };
  const project = {
    ...projects[0],
    status: "beta",
    longDescription: ["Подробное описание"],
    features: ["Особенность"],
    platforms: ["Платформа"],
    cover: image,
    gallery: [image],
    links: {
      github: "https://example.invalid/repository",
      website: "https://example.invalid/",
      documentation: "https://example.invalid/docs",
      download: "https://example.invalid/download",
    },
  };
  const html = render(ProjectIntro, { project });
  for (const text of [
    "Бета",
    "Подробное описание",
    "Особенность",
    "Платформы: Платформа",
    "Галерея",
    "GitHub",
    "Сайт проекта",
    "Документация",
    "Скачать",
    'alt="Проверка изображения"',
    'width="1200"',
    'height="800"',
    'loading="lazy"',
  ])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /Художественная иллюстрация/);
  const grid = render(ProjectGrid, { projects: [project], headingLevel: 2 });
  assert.match(grid, /<h2>Maniac<\/h2>/);
  assert.match(grid, /src="\/test-cover.webp"/);
  assert.doesNotMatch(grid, /<svg/);
  assert.doesNotMatch(
    render(ProjectIntro, { project: { ...projects[0], Art: undefined } }),
    /Художественная иллюстрация|<img|<svg/,
  );
  const { ManiacPage } = await server.ssrLoadModule(
    "/src/app/projects/maniac/pages/ManiacPage.tsx",
  );
  const maniac = render(ManiacPage, {});
  for (const section of [
    "gameplay",
    "features",
    "characters",
    "updates",
    "download",
  ])
    assert.ok(maniac.includes(`id="${section}"`), `Maniac: ${section}`);
  for (const release of projects.find((p) => p.id === "maniac").releases)
    assert.ok(maniac.includes(release.title), `Maniac: ${release.title}`);
  assert.equal((maniac.match(/<h1[ >]/g) || []).length, 1);
  assert.doesNotMatch(
    maniac,
    /id="gallery"|href="#gallery"|minecraft-inside\.ru|\/wiki|changelog_maniac|Версия доступного архива пока не подтверждена/,
  );
  const { download } = await server.ssrLoadModule(
    "/src/app/projects/maniac/content.ts",
  );
  const primary = new URL(download.url);
  assert.equal(primary.origin, "https://drive.usercontent.google.com");
  assert.equal(primary.pathname, "/download");
  assert.equal(
    primary.searchParams.get("id"),
    "1Pe_mgHtMvoVIn5-FwG5Nj_sG0xuDvY6D",
  );
  assert.equal(primary.searchParams.get("export"), "download");
  assert.equal(primary.searchParams.get("confirm"), "t");
  assert.equal(download.mirrorUrl, "https://disk.yandex.ru/d/z7mqmWDD3k9OTg");
  assert.equal(download.version, "1.2");
  assert.equal(download.releaseName, "Flower Cleaning");
  const links = [...maniac.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  for (const [url, label] of [
    [download.url, "Скачать Maniac 1.2"],
    [download.mirrorUrl, "Скачать с Яндекс Диска"],
  ]) {
    const matching = links.filter(([, attrs]) =>
      attrs.includes(`href="${url.replaceAll("&", "&amp;")}"`),
    );
    assert.equal(matching.length, 2, `${label}: hero and download section`);
    for (const [, attrs, content] of matching) {
      assert.match(attrs, /target="_blank"/);
      assert.match(attrs, /rel="noopener noreferrer"/);
      assert.ok(content.includes(label));
      assert.doesNotMatch(attrs, /\sdownload(?:=|\s|$)/);
    }
  }
  for (const text of ["mods.zip", "world.zip", "saves/Maniac", "level.dat"])
    assert.ok(maniac.includes(text), `Installation: ${text}`);
  assert.match(maniac, /href="\/projects\/maniac\/changelog"/);
  for (const version of ["1.0", "1.1", "1.2"])
    assert.ok(maniac.includes(`href="/projects/maniac/changelog/${version}"`));
  const history = render(ReleaseList, {
    releases: projects[0].releases,
    projectNames: { maniac: "Maniac" },
    sourceHref: "/changelog",
    sourceLabel: "История обновлений",
  });
  assert.doesNotMatch(history, /changelog_maniac/);
  assert.match(history, /История обновлений/);
  console.log(
    "PASS: optional project content, covers, gallery, empty releases and Maniac presentation/download/history safeguards.",
  );
} finally {
  await server.close();
}
