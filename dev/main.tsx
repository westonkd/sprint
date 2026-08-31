import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Workbench } from "./Workbench.tsx";
import "../src/styles/primitives.css";
import "../src/styles/semantic.css";
import "../src/styles/ornament.css";
import "../src/styles/base.css";
import "./workbench.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root container");

createRoot(container).render(
  <StrictMode>
    <Workbench />
  </StrictMode>,
);
