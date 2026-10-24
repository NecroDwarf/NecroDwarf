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
  console.log(
    "PASS: existing project content, absent optional fields, cover, links, descriptions, features, platforms, gallery and empty releases.",
  );
} finally {
  await server.close();
}
