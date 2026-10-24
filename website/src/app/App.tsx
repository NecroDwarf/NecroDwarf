import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router";
import { SiteLayout } from "./shared/layouts/SiteLayout";
import { routes, notFoundMeta, normalizePath } from "./routes";
import { NotFoundPage } from "./pages/NotFoundPage";
import { renderHead, siteOrigin } from "./shared/lib/seo";
function PageEffects() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    const path = normalizePath(pathname);
    const route = routes.find((r) => r.path === path);
    const head = document.createElement("template");
    head.innerHTML = renderHead(
      route ?? notFoundMeta,
      path,
      siteOrigin(import.meta.env.VITE_SITE_URL),
      !route,
    );
    document.head
      .querySelectorAll(
        'title,meta[name="description"],meta[name="robots"],meta[property^="og:"],link[rel="canonical"],link[rel="icon"]',
      )
      .forEach((node) => node.remove());
    document.head.append(head.content);
    if (firstRender.current) firstRender.current = false;
    else {
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
    }
  }, [pathname]);
  return null;
}
export function App() {
  return (
    <SiteLayout>
      <PageEffects />
      <Routes>
        {routes.map(({ path, Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SiteLayout>
  );
}
