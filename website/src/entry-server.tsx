import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { App } from "./app/App";
import { routes, notFoundMeta } from "./app/routes";
import { projects } from "./app/projects/registry";
import { renderHead, siteOrigin } from "./app/shared/lib/seo";
export const paths = routes.map((route) => route.path);
export { projects, siteOrigin };
export function render(path: string, origin?: string) {
  const route = routes.find((route) => route.path === path);
  return {
    head: renderHead(route ?? notFoundMeta, path, origin, !route),
    html: renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    ),
  };
}
