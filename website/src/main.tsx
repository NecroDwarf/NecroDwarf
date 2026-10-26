import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app/App";
import { pageForPath } from "./app/routes";
import "./app/shared/styles/global.css";
const root = document.getElementById("root")!;
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
// Keep the complete static HTML visible while the matching route module loads.
pageForPath(window.location.pathname)
  .preload()
  .then(() => {
    if (root.hasChildNodes()) hydrateRoot(root, app);
    else createRoot(root).render(app);
  })
  .catch((error) =>
    console.error(
      "Unable to hydrate route; static content remains available",
      error,
    ),
  );
