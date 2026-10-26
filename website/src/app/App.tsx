import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import { SiteLayout } from "./shared/layouts/SiteLayout";
import { routes, notFoundMeta, normalizePath, pageForPath } from "./routes";
import { renderHead, siteOrigin } from "./shared/lib/seo";
function PageEffects({ pathname }: { pathname: string }) {
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
  const location = useLocation();
  const [ready, setReady] = useState(() => ({
    location,
    Page: pageForPath(location.pathname).read(),
  }));
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    setFailed(false);
    pageForPath(location.pathname)
      .preload()
      .then((Page) => {
        if (current) setReady({ location, Page });
      })
      .catch(() => {
        if (current) setFailed(true);
      });
    return () => {
      current = false;
    };
  }, [location]);
  const { Page } = ready;
  return (
    <SiteLayout>
      <PageEffects pathname={ready.location.pathname} />
      {failed && (
        <p role="alert">
          Не удалось загрузить страницу.{" "}
          <a href={location.pathname + location.search + location.hash}>
            Повторить загрузку
          </a>
        </p>
      )}
      {/* Retain the previous route until its replacement is fully loaded. */}
      <Routes location={ready.location}>
        <Route path="*" element={<Page key={ready.location.pathname} />} />
      </Routes>
    </SiteLayout>
  );
}
