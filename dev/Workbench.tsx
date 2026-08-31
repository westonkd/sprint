import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  type AgentComponentMeta,
  Link,
  listAgentMeta,
  MetaLine,
  Nav,
  NavGroup,
  SegmentedControl,
  Shell,
  SprintProvider,
  type SprintTheme,
  type SprintView,
  version,
} from "../src/index.ts";
import { ComponentDoc, docSections } from "./pages/ComponentDoc.tsx";
import { Everything } from "./pages/Everything.tsx";
import { GuideForms } from "./pages/GuideForms.tsx";
import { GuideLayout } from "./pages/GuideLayout.tsx";
import { GuidePhilosophy } from "./pages/GuidePhilosophy.tsx";
import { GuideWebMCP } from "./pages/GuideWebMCP.tsx";
import { Overview } from "./pages/Overview.tsx";
import { THEME_OPTIONS, useTheme } from "./theme.ts";

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
  { id: "everything", title: "Every component", render: () => <Everything /> },
];

const CATEGORY_ORDER = [
  "layout",
  "navigation",
  "typography",
  "display",
  "action",
  "input",
  "feedback",
  "overlay",
];

interface Route {
  page: string;
  section?: string;
  view: SprintView;
}

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path = "", query = ""] = raw.split("?");
  const view = new URLSearchParams(query).get("view") === "agent" ? "agent" : "human";
  if (path.startsWith("guide/")) return { page: path, view };
  const [page = "", section] = path.split("/");
  return section === undefined ? { page, view } : { page, section, view };
}

function formatHash(route: Route): string {
  const section = route.section === undefined ? "" : `/${route.section}`;
  const query = route.view === "agent" ? "?view=agent" : "";
  return `#/${route.page}${section}${query}`;
}

function byCategory(
  components: readonly AgentComponentMeta[],
): [string, AgentComponentMeta[]][] {
  const groups = new Map<string, AgentComponentMeta[]>();
  for (const meta of components) {
    const list = groups.get(meta.category) ?? [];
    list.push(meta);
    groups.set(meta.category, list);
  }
  const known = CATEGORY_ORDER.filter((category) => groups.has(category));
  const rest = [...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  return [...known, ...rest].map((category) => {
    const list = groups.get(category) ?? [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    return [category, list];
  });
}

export function Workbench() {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const sync = () => setRoute(parseHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.title =
      route.page === ""
        ? "Sprint workbench"
        : `${route.page.replace("guide/", "")} · Sprint workbench`;
    if (route.section !== undefined) {
      document.getElementById(route.section)?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [route.page, route.section]);

  const setView = useCallback((next: SprintView) => {
    const updated = { ...parseHash(), view: next };
    window.history.replaceState(null, "", formatHash(updated));
    setRoute(updated);
  }, []);

  return (
    <SprintProvider theme={theme} view={route.view} onViewChange={setView}>
      <WorkbenchShell theme={theme} onThemeChange={setTheme} route={route} />
    </SprintProvider>
  );
}

interface WorkbenchShellProps {
  theme: SprintTheme;
  onThemeChange: (theme: SprintTheme) => void;
  route: Route;
}

function WorkbenchShell(props: WorkbenchShellProps) {
  const { theme, onThemeChange, route } = props;
  const components = listAgentMeta();

  const guide = route.page.startsWith("guide/")
    ? GUIDES.find((entry) => `guide/${entry.id}` === route.page)
    : undefined;
  const component = components.find((meta) => meta.name === route.page);

  const href = (path: string) =>
    `#/${path}${route.view === "agent" ? "?view=agent" : ""}`;

  return (
    <div className="app" data-view={route.view}>
      <Shell
        sideLabel="Workbench sidebar"
        bar={
          <>
            <Link className="brand" href={href("")}>
              SPRINT <span className="brand-version">v{version}</span>
            </Link>
            <SegmentedControl
              label="Theme"
              options={THEME_OPTIONS}
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
                  href={href(`guide/${entry.id}`)}
                  active={guide?.id === entry.id}
                >
                  {entry.title}
                </Link>
              ))}
            </NavGroup>

            {byCategory(components).map(([category, members]) => (
              <NavGroup key={category} label={category}>
                {members.map((meta) => (
                  <Link
                    key={meta.name}
                    href={href(meta.name)}
                    active={meta.name === route.page}
                  >
                    {meta.name}
                  </Link>
                ))}
              </NavGroup>
            ))}

            {component === undefined ? null : (
              <NavGroup label="On this page">
                {docSections(component).map((section) => (
                  <Link
                    key={section.id}
                    href={href(`${component.name}/${section.id}`)}
                    active={route.section === section.id}
                  >
                    {section.title}
                  </Link>
                ))}
              </NavGroup>
            )}

            <NavGroup label="Reference">
              <Link href="index.html">Landing page</Link>
              <Link href="agent-manifest.json" external>
                agent-manifest.json
              </Link>
              <Link href="llms.txt" external>
                llms.txt
              </Link>
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
        <footer className="app-footer">
          <MetaLine
            entries={[
              { term: "Sprint", detail: `v${version}` },
              { term: "Components", detail: String(components.length) },
              { term: "View", detail: route.view },
              { term: "Theme", detail: theme },
            ]}
          />
          <div data-sprint-ornament="crosses" aria-hidden="true" />
        </footer>
      </Shell>
    </div>
  );
}
