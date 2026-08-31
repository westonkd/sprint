import { useState } from "react";
import {
  Button,
  Card,
  CodeBlock,
  listAgentMeta,
  MetaLine,
  PageHeader,
  Panel,
  SegmentedControl,
  SprintProvider,
  type SprintView,
  Stack,
  Switch,
  Tag,
  Text,
  version,
} from "../../src/index.ts";
import { THEME_OPTIONS, useTheme, VIEW_OPTIONS } from "../theme.ts";

const REPOSITORY = "https://github.com/westonkd/sprint";

export function Landing() {
  const [theme, setTheme] = useTheme();

  return (
    <SprintProvider label="sprint" theme={theme}>
      <div className="landing">
        <PageHeader
          label="Sprint"
          tags={
            <>
              <Tag tone="action" filled>
                v{version}
              </Tag>
              <Tag>{listAgentMeta().length} components</Tag>
              <Tag>MIT</Tag>
            </>
          }
          actions={
            <SegmentedControl
              label="Theme"
              options={THEME_OPTIONS}
              value={theme}
              agentTool={false}
              onChange={(next) => setTheme(next === "light" ? "light" : "dark")}
            />
          }
        >
          <Text>
            A React component library for products that people and AI agents both use.
            Sprint components look and behave like any other interface, and can describe
            themselves to an agent on request.
          </Text>
        </PageHeader>

        <div className="landing-rule" data-sprint-ornament="hatch" aria-hidden="true" />

        <Stack gap="loose">
          <Stack direction="grid" min="15rem" gap="tight">
            <Card label="Open the workbench" href="workbench.html#/">
              Live documentation for every component.
            </Card>
            <Card label="Source on GitHub" href={REPOSITORY}>
              React 19 and TypeScript. No runtime dependencies.
            </Card>
          </Stack>

          <Panel headingLevel={2} label="The problem">
            <Stack gap="tight">
              <Text>
                Agents drive applications by guessing. They read class names and
                positions that were never meant to be a contract, so a routine styling
                change quietly breaks the automation built on top of it.
              </Text>
              <Text>
                Teams answer that by maintaining a second thing: an API, a set of test
                identifiers, a written description of the interface. It drifts from the
                interface almost immediately, because nothing forces the two to agree.
              </Text>
            </Stack>
          </Panel>

          <Panel headingLevel={2} label="What Sprint does about it">
            <Stack gap="tight">
              <Text>
                A Sprint component describes itself. One definition produces the
                interface a person sees, the plain-text description an agent reads, and
                the actions an agent can call. There is no second copy to keep in sync,
                so the two cannot disagree.
              </Text>
              <Text tone="muted" size="small">
                For people, nothing changes. The components are ordinary, accessible
                React components, and everything works in browsers that have never heard
                of an agent.
              </Text>
            </Stack>
          </Panel>

          <Demo />

          <Panel headingLevel={2} label="If you are an agent">
            <Stack gap="tight">
              <Text>
                Everything on this site is published for you to read directly. Start
                with the manifest.
              </Text>
              <Stack direction="grid" min="15rem" gap="tight">
                <Card label="agent-manifest.json" href="agent-manifest.json">
                  Every component, what it is for, when not to use it, and the tools it
                  registers.
                </Card>
                <Card label="llms.txt" href="llms.txt">
                  The same catalogue as plain text, in one request.
                </Card>
                <Card label="components/Button.md" href="components/Button.md">
                  One Markdown page per component, if you only need one.
                </Card>
                <Card label="The workbench as text" href="workbench.html#/?view=agent">
                  Any documentation page, rendered as the text you would read.
                </Card>
              </Stack>
              <Text tone="muted" size="small">
                In Chrome 149 the components on this page also register their actions as
                WebMCP tools, so you can call them rather than click them.
              </Text>
            </Stack>
          </Panel>

          <Panel headingLevel={2} label="Get started">
            <Stack gap="tight">
              <CodeBlock code="bun add sprint" language="bash" />
              <Text tone="muted" size="small">
                The workbench has a page for every component, with live examples and the
                tools each one registers.
              </Text>
            </Stack>
          </Panel>
        </Stack>

        <footer className="landing-footer">
          <MetaLine
            entries={[
              { term: "Sprint", detail: `v${version}` },
              { term: "License", detail: "MIT" },
              { term: "Theme", detail: theme },
            ]}
          />
          <div data-sprint-ornament="crosses" aria-hidden="true" />
        </footer>
      </div>
    </SprintProvider>
  );
}

function Demo() {
  const [view, setView] = useState<SprintView>("human");
  const [notify, setNotify] = useState(true);

  return (
    <Panel
      headingLevel={2}
      label="The same components, either way"
      actions={
        <SegmentedControl
          label="This example"
          options={VIEW_OPTIONS}
          value={view}
          agentTool={false}
          onChange={(next) => setView(next === "agent" ? "agent" : "human")}
        />
      }
    >
      <Stack gap="tight">
        <Text>
          The switch above changes this example only. Nothing is re-implemented between
          the two, and nothing unmounts: the same components you see render themselves
          as text when something asks them to.
        </Text>
        <div className="landing-demo">
          <SprintProvider
            label="launch"
            view={view}
            onViewChange={setView}
            pageTools={false}
          >
            <Stack gap="tight">
              <Switch label="Notify on launch" on={notify} onChange={setNotify} />
              <Stack direction="row" gap="tight" wrap align="center">
                <Button tone="action" onClick={() => setNotify(true)}>
                  Prepare launch
                </Button>
                <Tag tone="warning">staged</Tag>
              </Stack>
            </Stack>
          </SprintProvider>
        </div>
      </Stack>
    </Panel>
  );
}
