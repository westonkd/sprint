import { type ReactNode, useEffect, useState } from "react";
import {
  Button,
  Link,
  listAgentMeta,
  SprintProvider,
  Stack,
  useSprintViewControl,
  version,
} from "../src/index.ts";
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

export function Workbench() {
  return (
    <SprintProvider>
      <WorkbenchShell />
    </SprintProvider>
  );
}

function WorkbenchShell() {
  const { view } = useSprintViewControl();
  const components = listAgentMeta();
  const [route, setRoute] = useState(currentRoute);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setRoute(currentRoute());
      setMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const guide = route.startsWith("guide/")
    ? GUIDES.find((entry) => `guide/${entry.id}` === route)
    : undefined;
  const component = components.find((meta) => meta.name === route);

  return (
    <div className="shell" data-view={view}>
      <aside className="side" data-open={menuOpen ? "" : undefined}>
        <div className="side-bar">
          <a className="brand" href="#/">
            SPRINT
            <span className="brand-version">v{version}</span>
          </a>
          <span className="menu-toggle">
            <Button agentTool={false} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? "Close" : "Menu"}
            </Button>
          </span>
        </div>

        <nav className="nav" aria-label="Workbench">
          <Stack gap="tight">
            <span className="nav-label">Guides</span>
            <Stack gap="none">
              {GUIDES.map((entry) => (
                <Link
                  key={entry.id}
                  className="nav-link"
                  href={`#/guide/${entry.id}`}
                  active={guide?.id === entry.id}
                >
                  {entry.title}
                </Link>
              ))}
            </Stack>

            <span className="nav-label">Components</span>
            <Stack gap="none">
              {components.map((meta) => (
                <Link
                  key={meta.name}
                  className="nav-link"
                  href={`#/${meta.name}`}
                  active={meta.name === route}
                >
                  {meta.name}
                </Link>
              ))}
            </Stack>

            <span className="nav-label">Reference</span>
            <Stack gap="none">
              <Link
                className="nav-link"
                href="https://developer.chrome.com/docs/ai/webmcp"
                external
              >
                Chrome docs
              </Link>
              <Link
                className="nav-link"
                href="https://github.com/webmachinelearning/webmcp"
                external
              >
                Specification
              </Link>
            </Stack>
          </Stack>
        </nav>
      </aside>

      <main className="content">
        {guide !== undefined ? (
          guide.render()
        ) : component !== undefined ? (
          <ComponentDoc key={component.name} meta={component} />
        ) : (
          <Overview components={components} />
        )}
      </main>
    </div>
  );
}
