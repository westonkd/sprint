import { type ReactNode, useEffect, useState } from "react";
import { listAgentMeta, SprintProvider, version } from "../src/index.ts";
import { ComponentDoc } from "./pages/ComponentDoc.tsx";
import { GuidePhilosophy } from "./pages/GuidePhilosophy.tsx";
import { GuideWebMCP } from "./pages/GuideWebMCP.tsx";
import { Overview } from "./pages/Overview.tsx";

interface Guide {
  id: string;
  title: string;
  render: () => ReactNode;
}

const GUIDES: readonly Guide[] = [
  { id: "webmcp", title: "WebMCP", render: () => <GuideWebMCP /> },
  {
    id: "philosophy",
    title: "Integration philosophy",
    render: () => <GuidePhilosophy />,
  },
];

function currentRoute(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

function useHashRoute(): [string, (route: string) => void] {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const sync = () => setRoute(currentRoute());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return [
    route,
    (next: string) => {
      window.location.hash = next === "" ? "/" : `/${next}`;
      window.scrollTo(0, 0);
    },
  ];
}

export function Workbench() {
  const components = listAgentMeta();
  const [route, go] = useHashRoute();

  const guide = route.startsWith("guide/")
    ? GUIDES.find((entry) => `guide/${entry.id}` === route)
    : undefined;
  const component = components.find((meta) => meta.name === route);

  return (
    <SprintProvider>
      <div className="shell">
        <nav className="nav">
          <button type="button" className="brand" onClick={() => go("")}>
            SPRINT
            <span className="brand-version">v{version}</span>
          </button>

          <span className="nav-label">Guides</span>
          <ul>
            {GUIDES.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className={guide?.id === entry.id ? "nav-link active" : "nav-link"}
                  onClick={() => go(`guide/${entry.id}`)}
                >
                  {entry.title}
                </button>
              </li>
            ))}
          </ul>

          <span className="nav-label">Components</span>
          <ul>
            {components.map((meta) => (
              <li key={meta.name}>
                <button
                  type="button"
                  className={meta.name === route ? "nav-link active" : "nav-link"}
                  onClick={() => go(meta.name)}
                >
                  {meta.name}
                </button>
              </li>
            ))}
          </ul>

          <span className="nav-label">Reference</span>
          <ul>
            <li>
              <a
                className="nav-link"
                href="https://developer.chrome.com/docs/ai/webmcp"
                target="_blank"
                rel="noreferrer"
              >
                Chrome docs ↗
              </a>
            </li>
            <li>
              <a
                className="nav-link"
                href="https://github.com/webmachinelearning/webmcp"
                target="_blank"
                rel="noreferrer"
              >
                Specification ↗
              </a>
            </li>
          </ul>
        </nav>

        <main className="content">
          {guide !== undefined ? (
            guide.render()
          ) : component !== undefined ? (
            <ComponentDoc key={component.name} meta={component} />
          ) : (
            <Overview components={components} onOpen={go} />
          )}
        </main>
      </div>
    </SprintProvider>
  );
}
