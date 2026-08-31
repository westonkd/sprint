import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  CodeBlock,
  List,
  listAgentMeta,
  MetaLine,
  PageHeader,
  Panel,
  SegmentedControl,
  Select,
  SprintProvider,
  type SprintView,
  Stack,
  Tag,
  Text,
  TextInput,
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

          <Stack direction="grid" min="22rem" gap="tight">
            <Panel headingLevel={2} label="How it works">
              <Stack gap="tight">
                <List
                  label="What a Sprint component does"
                  items={[
                    <>
                      <strong>Two views, one component.</strong> A person sees the
                      rendered interface. An agent asks the same component to describe
                      itself and gets plain text back. There is no second implementation
                      behind the second view, so the two cannot disagree, and switching
                      between them re-renders the component rather than replacing it.
                    </>,
                    <>
                      <strong>Names you can rely on.</strong> Every component names
                      itself, its parts, and its current state in the markup, and those
                      names are part of the public API rather than a styling detail that
                      moves.
                    </>,
                    <>
                      <strong>Actions, not clicks.</strong> In Chrome 149 a component
                      registers what it can do with the browser, so an agent calls the
                      action instead of aiming a click at it.
                    </>,
                  ]}
                />
              </Stack>
            </Panel>
            <Demo />
          </Stack>

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
  const [callsign, setCallsign] = useState("");
  const [slot, setSlot] = useState("");
  const [notify, setNotify] = useState(false);
  const [requested, setRequested] = useState(false);

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
          A small form, and the same form as an agent reads it. The switch above changes
          this example only. Nothing is re-implemented between the two, and nothing
          unmounts.
        </Text>
        <div className="landing-demo">
          <SprintProvider
            label="launch"
            view={view}
            onViewChange={setView}
            pageTools={false}
          >
            <Stack gap="normal">
              <TextInput
                label="Callsign"
                value={callsign}
                onChange={setCallsign}
                placeholder="NOMAD"
                hint="Three to eight letters."
              />
              <Select
                label="Launch window"
                value={slot}
                onChange={setSlot}
                placeholder="Choose a window"
                options={[
                  { value: "0600", label: "06:00, clear" },
                  { value: "1400", label: "14:00, crosswind" },
                  { value: "2200", label: "22:00, clear" },
                ]}
              />
              <Checkbox
                label="Notify me when it is confirmed"
                checked={notify}
                onChange={setNotify}
              />
              <Button tone="action" block onClick={() => setRequested(true)}>
                Request window
              </Button>
              {requested ? <Tag tone="info">Requested</Tag> : null}
            </Stack>
          </SprintProvider>
        </div>
      </Stack>
    </Panel>
  );
}
