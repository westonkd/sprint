import {
  type AgentComponentMeta,
  buildAgentManifest,
  Card,
  CodeBlock,
  Heading,
  isModelContextAvailable,
  Panel,
  Stack,
  Table,
  type TableRow,
  Tag,
  Text,
  version,
} from "../../src/index.ts";

const INSTALL = `import { Button, SprintProvider } from "sprint";
import "sprint/styles.css";

export function App() {
  return (
    <SprintProvider>
      <Button tone="action" block onClick={prepare}>
        Prepare launch
      </Button>
    </SprintProvider>
  );
}`;

const READ = `import manifest from "sprint/agent-manifest.json" with { type: "json" };

for (const component of manifest.components) {
  console.log(component.name, component.whenToUse);
}`;

export function Overview(props: { components: readonly AgentComponentMeta[] }) {
  const { components } = props;
  const manifest = buildAgentManifest(version);
  const webmcp = isModelContextAvailable();

  const conventions: TableRow[] = Object.entries(manifest.conventions).map(
    ([key, value]) => ({
      id: key,
      cells: { name: key, value: <code>{String(value)}</code> },
    }),
  );

  return (
    <article className="doc">
      <Stack gap="loose">
        <header className="doc-head">
          <Stack gap="tight">
            <Stack direction="row" gap="tight" align="center" wrap>
              <Heading level={1}>Sprint</Heading>
              <Tag>v{version}</Tag>
            </Stack>
            <Text>
              An agent-forward React component library. Every component renders normally
              for people and projects a machine-readable view for agents, from one
              definition.
            </Text>
          </Stack>
        </header>

        <Panel headingLevel={2} label="These docs are the manifest">
          <Stack gap="tight">
            <Text>
              Every page in this workbench is generated from{" "}
              <code>agent-manifest.json</code>, the same artifact an agent reads to
              learn what exists. There is no hand-written documentation to fall out of
              date, and writing good agent metadata is what produces good human docs.
            </Text>
            <Text tone="muted" size="small">
              The pages are also built out of the library itself. Every panel, table,
              chip, and snippet below is a Sprint component, so a bug in the catalogue
              is a bug in the documentation and you cannot ship one without seeing the
              other.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Two views, one definition">
          <Stack gap="tight">
            <Text>
              A containing <code>SprintProvider</code> holds the current view. In{" "}
              <strong>human</strong> view components render as DOM. In{" "}
              <strong>agent</strong> view the same components render as plain Markdown
              text, so an agent can read the page directly instead of walking a DOM.
              Both renderings come from one node built during the same render, so they
              cannot disagree.
            </Text>
            <Text tone="muted" size="small">
              WebMCP tools stay registered across the switch. Flipping the view
              re-renders the components, it does not unmount them. Toggle any example on
              a component page to see it.
            </Text>
            <Text tone="muted" size="small">
              Agent view is not inert. An actionable component still renders one bare
              control whose text is its own Markdown line, so an agent driving the DOM
              has something to click. WebMCP needs no elements, but agents outside
              Chrome 149 have no WebMCP. Pass <code>agentControls="never"</code> for
              zero markup.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Getting started">
          <Stack gap="tight">
            <CodeBlock code={INSTALL} />
            <Text tone="muted" size="small">
              <code>SprintProvider</code> registers the page-level read tools and
              supplies tool-name scoping. Components work without it.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Components">
          <Stack direction="grid" min="16rem" gap="tight">
            {components.map((meta) => (
              <Card key={meta.name} label={meta.name} href={`#/${meta.name}`}>
                {meta.summary}
              </Card>
            ))}
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Reading the manifest">
          <CodeBlock code={READ} />
        </Panel>

        <Panel headingLevel={2} label="Conventions" flush>
          <Table
            label="Manifest conventions"
            columns={[
              { key: "name", header: "Convention", width: "14rem" },
              { key: "value", header: "Value" },
            ]}
            rows={conventions}
          />
        </Panel>

        <Panel headingLevel={2} label="WebMCP">
          <Stack gap="tight">
            <Text>
              Tools register with <code>document.modelContext</code>, the web platform
              API shipping in Chrome 149 behind an origin trial or{" "}
              <code>chrome://flags/#enable-webmcp-testing</code>. Everywhere else
              registration is a no-op and the components work normally; the agent view
              does not depend on it.
            </Text>
            <Text tone={webmcp ? "action" : "warning"} size="small">
              {webmcp
                ? "Available in this browser. Tools on these pages are live."
                : "Unavailable in this browser. Tool names are still shown, but nothing is registered."}
            </Text>
          </Stack>
        </Panel>
      </Stack>
    </article>
  );
}
