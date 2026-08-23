import { type ReactNode, useEffect, useState } from "react";
import {
  Link,
  listAgentMeta,
  Nav,
  NavGroup,
  SegmentedControl,
  Shell,
  SprintProvider,
  type SprintTheme,
  THEME_ATTRIBUTE,
  useSprintViewControl,
  version,
} from "../src/index.ts";
import { ComponentDoc } from "./pages/ComponentDoc.tsx";
import { GuideForms } from "./pages/GuideForms.tsx";
import { GuideLayout } from "./pages/GuideLayout.tsx";
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
  { id: "layout", title: "Composing a page", render: () => <GuideLayout /> },
  { id: "forms", title: "Composing a form", render: () => <GuideForms /> },
];

function currentRoute(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

const THEMES = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
];

export function Workbench() {
  const [theme, setTheme] = useState<SprintTheme>("dark");

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }, [theme]);

  return (
    <SprintProvider theme={theme}>
      <WorkbenchShell theme={theme} onThemeChange={setTheme} />
    </SprintProvider>
  );
}

interface WorkbenchShellProps {
  theme: SprintTheme;
  onThemeChange: (theme: SprintTheme) => void;
}

function WorkbenchShell(props: WorkbenchShellProps) {
  const { theme, onThemeChange } = props;
  const { view } = useSprintViewControl();
  const components = listAgentMeta();
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const sync = () => {
      setRoute(currentRoute());
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
    <div className="app" data-view={view}>
      <Shell
        sideLabel="Workbench sidebar"
        bar={
          <>
            <Link className="brand" href="#/">
              SPRINT <span className="brand-version">v{version}</span>
            </Link>
            <SegmentedControl
              label="Theme"
              options={THEMES}
              value={theme}
              agentTool={false}
              onChange={(next) => onThemeChange(next === "light" ? "light" : "dark")}
            />
          </>
        }
        side={
          <Nav label="Workbench">
            <NavGroup label="Guides">
              {GUIDES.map((entry) => (
                <Link
                  key={entry.id}
                  href={`#/guide/${entry.id}`}
                  active={guide?.id === entry.id}
                >
                  {entry.title}
                </Link>
              ))}
            </NavGroup>

            <NavGroup label="Components">
              {components.map((meta) => (
                <Link
                  key={meta.name}
                  href={`#/${meta.name}`}
                  active={meta.name === route}
                >
                  {meta.name}
                </Link>
              ))}
            </NavGroup>

            <NavGroup label="Reference">
              <Link href="https://developer.chrome.com/docs/ai/webmcp" external>
                Chrome docs
              </Link>
              <Link href="https://github.com/webmachinelearning/webmcp" external>
                Specification
              </Link>
            </NavGroup>
          </Nav>
        }
      >
        {guide !== undefined ? (
          guide.render()
        ) : component !== undefined ? (
          <ComponentDoc key={component.name} meta={component} />
        ) : (
          <Overview components={components} />
        )}
      </Shell>
    </div>
  );
}
