import { useState } from "react";
import {
  Alert,
  Card,
  CodeBlock,
  listAgentMeta,
  MetaLine,
  PageHeader,
  Panel,
  SegmentedControl,
  SprintProvider,
  Stack,
  Switch,
  Table,
  type TableRow,
  Tag,
  Text,
  version,
} from "../../src/index.ts";
import { THEME_OPTIONS, useTheme, VIEW_OPTIONS } from "../theme.ts";

const REPOSITORY = "https://github.com/westonkd/sprint";

const RENDER = `const node = buildAgentNode({
  component: buttonMeta.name,
  label: reactText(children),
  tool: tool?.name,
  state: { tone, loading },
});

if (useSprintView() === "agent") {
  return <AgentControl node={node} onClick={onClick} />;
}

return (
  <button {...rest} {...agentAttributesFor(node)}>
    {children}
  </button>
);`;

const TOOL = `export const PRESS_TOOL: AgentToolSpec = {
  verb: "press",
  description: "Press this button and return the state it lands in.",
  readOnly: false,
};`;

const INSTALL = `bun add sprint`;

const USE = `import { Button, SprintProvider } from "sprint";
import "sprint/styles.css";

export function App() {
  return (
    <SprintProvider label="billing">
      <Button tone="action" onClick={prepare}>
        Prepare launch
      </Button>
    </SprintProvider>
  );
}`;

const SURFACES: TableRow[] = [
  {
    id: "manifest",
    cells: {
      surface: <code>agent-manifest.json</code>,
      detail:
        "Every component, prop, state, and tool descriptor, as one JSON artifact.",
    },
  },
  {
    id: "llms",
    cells: {
      surface: <code>llms.txt</code>,
      detail:
        "The same catalogue as plain text, for a model reading the site directly.",
    },
  },
  {
    id: "component",
    cells: {
      surface: <code>components/Button.md</code>,
      detail: "One Markdown page per component, generated from the same metadata.",
    },
  },
  {
    id: "view",
    cells: {
      surface: <code>view=agent</code>,
      detail: "Any page in the workbench, rendered as the text an agent would read.",
    },
  },
];

export function Landing() {
  const [theme, setTheme] = useTheme();
  const [view, setView] = useState<"human" | "agent">("human");
  const [notify, setNotify] = useState(true);

  return (
    <SprintProvider
      label="sprint"
      theme={theme}
      view={view}
      onViewChange={(next) => setView(next)}
    >
      <div className="landing" data-view={view}>
        <PageHeader
          label="Sprint"
          tags={
            <>
              <Tag tone="action" filled>
                v{version}
              </Tag>
              <Tag>{listAgentMeta().length} components</Tag>
              <Tag tone="info">WebMCP</Tag>
            </>
          }
          actions={
            <Stack direction="row" gap="tight" wrap>
              <SegmentedControl
                label="View"
                options={VIEW_OPTIONS}
                value={view}
                agentTool={false}
                onChange={(next) => setView(next === "agent" ? "agent" : "human")}
              />
              <SegmentedControl
                label="Theme"
                options={THEME_OPTIONS}
                value={theme}
                agentTool={false}
                onChange={(next) => setTheme(next === "light" ? "light" : "dark")}
              />
            </Stack>
          }
        >
          <Text>
            An agent-forward React component library. Every component renders normally
            for people and projects a machine-readable view for agents, from one
            definition.
          </Text>
        </PageHeader>

        <div className="landing-rule" data-sprint-ornament="hatch" aria-hidden="true" />

        <Stack gap="loose">
          <Stack direction="grid" min="15rem" gap="tight">
            <Card label="Open the workbench" href="workbench.html#/">
              Documentation for every component, generated from the manifest.
            </Card>
            <Card label="Read the manifest" href="agent-manifest.json">
              The artifact an agent reads to learn what exists.
            </Card>
            <Card label="Source on GitHub" href={REPOSITORY}>
              MIT licensed. React 19, TypeScript, no runtime dependencies.
            </Card>
          </Stack>

          <Panel headingLevel={2} label="Flip the switch on this page">
            <Stack gap="tight">
              <Text>
                The view control above is not a preview pane. It re-renders this entire
                page as the text an agent reads, from the same components you are
                looking at now. Nothing is duplicated and nothing unmounts.
              </Text>
              <Stack direction="row" gap="tight" wrap align="center">
                <Switch label="Notify on launch" on={notify} onChange={setNotify} />
                <Tag tone="warning">staged</Tag>
              </Stack>
              <Alert tone="info" label="Two renderings, one node">
                Both come from a single AgentNode built during the same render, so they
                cannot disagree.
              </Alert>
            </Stack>
          </Panel>

          <Panel headingLevel={2} label="One node, two renderings">
            <Stack gap="tight">
              <CodeBlock code={RENDER} caption="Button.tsx" />
              <Text tone="muted" size="small">
                Attributes are generated from the node, so the DOM an agent scrapes and
                the text it reads agree by construction.
              </Text>
            </Stack>
          </Panel>

          <Panel headingLevel={2} label="Behaviour, not selectors">
            <Stack gap="tight">
              <Text>
                Components register their actions with{" "}
                <code>document.modelContext</code>, the WebMCP platform API in Chrome
                149. A tool is declared once and shared by the runtime descriptor and
                the manifest, so the two cannot drift.
              </Text>
              <CodeBlock code={TOOL} caption="Button/tool.ts" />
              <Text tone="muted" size="small">
                Registration is a no-op everywhere else, and every component works
                without it.
              </Text>
            </Stack>
          </Panel>

          <Panel headingLevel={2} label="What this site serves an agent" flush>
            <Table
              label="Agent surfaces"
              columns={[
                { key: "surface", header: "Surface", width: "16rem" },
                { key: "detail", header: "What it is" },
              ]}
              rows={SURFACES}
            />
          </Panel>

          <Panel headingLevel={2} label="Install">
            <Stack gap="tight">
              <CodeBlock code={INSTALL} language="bash" />
              <CodeBlock code={USE} />
            </Stack>
          </Panel>
        </Stack>

        <footer className="landing-footer">
          <MetaLine
            entries={[
              { term: "Sprint", detail: `v${version}` },
              { term: "License", detail: "MIT" },
              { term: "View", detail: view },
              { term: "Theme", detail: theme },
            ]}
          />
          <div data-sprint-ornament="crosses" aria-hidden="true" />
        </footer>
      </div>
    </SprintProvider>
  );
}
