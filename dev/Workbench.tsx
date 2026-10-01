import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbOpening,
  Divider,
  Link,
  listAgentMeta,
  MetaLine,
  Nav,
  NavGroup,
  Select,
  Shell,
  SprintProvider,
  type SprintTheme,
  type SprintView,
  Stack,
  version,
} from "../src/index.ts";
import { byCategory, type NavModel } from "./navModel.ts";
import { ComponentDoc, docSections } from "./pages/ComponentDoc.tsx";
import { Everything } from "./pages/Everything.tsx";
import { GuideForms } from "./pages/GuideForms.tsx";
import { GuideLayout } from "./pages/GuideLayout.tsx";
import { GuidePhilosophy } from "./pages/GuidePhilosophy.tsx";
import { GuideWebMCP } from "./pages/GuideWebMCP.tsx";
import { Overview } from "./pages/Overview.tsx";
import { asTheme, THEME_OPTIONS, useNavCollapsed, useTheme } from "./theme.ts";

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
  const [opening, setOpening] = useState<BreadcrumbOpening>("closed");
  const [navCollapsed, setNavCollapsed] = useNavCollapsed();

  useEffect(() => {
    const summon = (event: KeyboardEvent) => {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpening(0);
    };
    window.addEventListener("keydown", summon);
    return () => window.removeEventListener("keydown", summon);
  }, []);

  const guide = route.page.startsWith("guide/")
    ? GUIDES.find((entry) => `guide/${entry.id}` === route.page)
    : undefined;
  const component = components.find((meta) => meta.name === route.page);

  const href = (path: string) =>
    `#/${path}${route.view === "agent" ? "?view=agent" : ""}`;

  const model: NavModel = [
    {
      label: "Guides",
      children: GUIDES.map((entry) => ({
        href: href(`guide/${entry.id}`),
        label: entry.title,
        ...(guide?.id === entry.id ? { active: true } : {}),
      })),
    },
    ...byCategory(components).map(([category, members]) => ({
      label: category,
      children: members.map((meta) => {
        const here = meta.name === route.page;
        return {
          href: href(meta.name),
          label: meta.name,
          ...(here && route.section === undefined ? { active: true } : {}),
          ...(here
            ? {
                children: docSections(meta).map((section) => ({
                  href: href(`${meta.name}/${section.id}`),
                  label: section.title,
                  ...(route.section === section.id ? { active: true } : {}),
                })),
              }
            : {}),
        };
      }),
    })),
    {
      label: "Reference",
      children: [
        { href: "index.html", label: "Landing page" },
        { href: "agent-manifest.json", label: "agent-manifest.json", external: true },
        { href: "llms.txt", label: "llms.txt", external: true },
        {
          href: "https://developer.chrome.com/docs/ai/webmcp",
          label: "Chrome docs",
          external: true,
        },
        {
          href: "https://github.com/webmachinelearning/webmcp",
          label: "Specification",
          external: true,
        },
      ],
    },
  ];

  return (
    <div className="app" data-view={route.view}>
      <Shell
        sideLabel="Workbench sidebar"
        collapsible
        collapsed={navCollapsed}
        onCollapsedChange={setNavCollapsed}
        bar={
          <Link className="brand" href={href("")}>
            SPRINT <span className="brand-version">v{version}</span>
          </Link>
        }
        side={
          <Stack gap="loose">
            <Select
              label="Theme"
              options={THEME_OPTIONS}
              value={theme}
              agentTool={false}
              onChange={(next) => onThemeChange(asTheme(next))}
            />
            <WorkbenchNav model={model} />
          </Stack>
        }
      >
        <Stack gap="loose">
          <Breadcrumb
            label="Workbench"
            href={href("")}
            items={model}
            open={opening}
            onOpenChange={setOpening}
          />
          <Divider />
        </Stack>
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

function WorkbenchNav(props: { model: NavModel }) {
  const { model } = props;
  const inner = model
    .flatMap((group) => group.children ?? [])
    .find((item) => (item.children?.length ?? 0) > 0);

  return (
    <Nav label="Workbench">
      {model.map((group) => (
        <NavGroup key={group.label} label={group.label}>
          {(group.children ?? []).map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </NavGroup>
      ))}
      {inner === undefined ? null : (
        <NavGroup label="On this page">
          {(inner.children ?? []).map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </NavGroup>
      )}
    </Nav>
  );
}

function NavLink(props: { item: BreadcrumbItem }) {
  const { item } = props;
  if (item.href === undefined) return null;
  return (
    <Link
      href={item.href}
      active={
        item.active === true ||
        (item.children ?? []).some((child) => child.active === true)
      }
      external={item.external === true}
    >
      {item.label}
    </Link>
  );
}
