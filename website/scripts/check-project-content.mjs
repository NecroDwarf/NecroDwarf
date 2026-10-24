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
    /id="gallery"|href="#gallery"|drive\.google|disk\.yandex|\/wiki|changelog_maniac/,
  );
  assert.match(
    maniac,
    /href="https:\/\/minecraft-inside.ru\/maps\/188353-maniac-dbd.html"/,
  );
  assert.match(maniac, /Версия доступного архива пока не подтверждена/);
  assert.match(maniac, /href="\/changelog"/);
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
