import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./pages/Landing.tsx";
import "./workbench.css";
import "./landing.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root container");

createRoot(container).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
);
