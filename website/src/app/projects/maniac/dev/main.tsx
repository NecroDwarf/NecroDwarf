import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "../../../shared/styles/global.css";
import { ManiacLab } from "./ManiacLab";
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ManiacLab />
  </BrowserRouter>,
);
