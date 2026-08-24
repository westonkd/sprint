import {
  type AgentComponentMeta,
  AgentRegion,
  agentSelector,
  COMPONENT_ATTRIBUTE,
  CodeBlock,
  Heading,
  PageHeader,
  Panel,
  SprintProvider,
  Stack,
  Table,
  type TableRow,
  Tag,
  type TagTone,
  Text,
  useSprintViewControl,
} from "../../src/index.ts";
import { specimensFor } from "../specimens/index.ts";
import { AgentPreview, ViewSwitch } from "../ui/AgentPreview.tsx";

const STATUS_TONE: Record<string, TagTone> = {
  experimental: "warning",
  stable: "action",
  deprecated: "danger",
};

export interface DocSection {
  id: string;
  title: string;
}

export function docSections(meta: AgentComponentMeta): DocSection[] {
  const specimens = specimensFor(meta.name);
  const sections: DocSection[] = [];
  if (specimens.gallery !== undefined) {
    sections.push({ id: "variants", title: "Every variant" });
  }
  sections.push({ id: "when-to-use", title: "When to use" });
  sections.push({ id: "install", title: "Install" });
  sections.push({ id: "examples", title: "Examples" });
  if (Object.keys(meta.props).length > 0) {
    sections.push({ id: "props", title: "Props" });
  }
  if (Object.keys(meta.state ?? {}).length > 0) {
    sections.push({ id: "state", title: "State attributes" });
  }
  if (Object.keys(meta.tools ?? {}).length > 0) {
    sections.push({ id: "tools", title: "WebMCP tools" });
  }
  if (meta.agentView !== undefined) {
    sections.push({ id: "agent-view", title: "Agent view" });
  }
  if (meta.a11y !== undefined) {
    sections.push({ id: "accessibility", title: "Accessibility" });
  }
  sections.push({ id: "root-attribute", title: "Root attribute" });
  return sections;
}

function importSnippet(name: string): string {
  return `import { ${name} } from "sprint";\nimport "sprint/styles.css";`;
}

function schemaSnippet(meta: AgentComponentMeta): string {
  return Object.entries(meta.tools ?? {})
    .map(([key, tool]) =>
      JSON.stringify(
        {
          name: `<scope>-${tool.verb}-<label>`,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: {
            readOnlyHint: tool.readOnly,
            untrustedContentHint: tool.untrustedContent,
          },
          registeredWhen: tool.registeredWhen,
          ...(tool.unregisteredWhen === undefined
            ? {}
            : { unregisteredWhen: tool.unregisteredWhen }),
          _key: key,
        },
        null,
        2,
      ),
    )
    .join("\n\n");
}

function Props(props: { meta: AgentComponentMeta }) {
  const entries = Object.entries(props.meta.props);
  if (entries.length === 0) return null;

  const rows: TableRow[] = entries.map(([name, spec]) => ({
    id: name,
    cells: {
      prop: <code>{name}</code>,
      kind: (
        <>
          {spec.kind}
          {spec.required === true ? " · required" : ""}
          {spec.values === undefined ? null : <div>{spec.values.join(" | ")}</div>}
        </>
      ),
      default:
        spec.default === undefined ? "—" : <code>{JSON.stringify(spec.default)}</code>,
      description: spec.description,
    },
  }));

  return (
    <Panel headingLevel={2} label="Props" flush id="props">
      <Table
        label={`${props.meta.name} props`}
        columns={[
          { key: "prop", header: "Prop", width: "9rem" },
          { key: "kind", header: "Kind", width: "9rem" },
          { key: "default", header: "Default", width: "7rem" },
          { key: "description", header: "Description" },
        ]}
        rows={rows}
      />
    </Panel>
  );
}

function State(props: { meta: AgentComponentMeta }) {
  const entries = Object.entries(props.meta.state ?? {});
  if (entries.length === 0) return null;

  const rows: TableRow[] = entries.map(([name, spec]) => ({
    id: name,
    cells: {
      attribute: <code>{spec.attribute}</code>,
      values: spec.values === undefined ? "present or absent" : spec.values.join(" | "),
      description: spec.description,
    },
  }));

  return (
    <Panel headingLevel={2} label="State attributes" id="state">
      <Stack gap="tight">
        <Text tone="muted" size="small">
          Public API. Agents write selectors against these, and the agent view is
          projected from them.
        </Text>
        <Table
          label={`${props.meta.name} state attributes`}
          columns={[
            { key: "attribute", header: "Attribute", width: "14rem" },
            { key: "values", header: "Values", width: "12rem" },
            { key: "description", header: "Description" },
          ]}
          rows={rows}
        />
        <CodeBlock
          caption="selector"
          code={`document.querySelector(agentSelector("${props.meta.name}"));\n// ${agentSelector(
            props.meta.name,
          )}`}
        />
      </Stack>
    </Panel>
  );
}

function Tools(props: { meta: AgentComponentMeta }) {
  const entries = Object.entries(props.meta.tools ?? {});
  if (entries.length === 0) return null;

  return (
    <Panel headingLevel={2} label="WebMCP tools" id="tools">
      <Stack gap="tight">
        <Text tone="muted" size="small">
          Registered with <code>document.modelContext</code> when available. The
          descriptor below is generated from the same spec the component registers at
          runtime, so it cannot drift.
        </Text>

        {entries.map(([key, tool]) => (
          <Panel key={key} headingLevel={3} label={`<scope>-${tool.verb}-<label>`}>
            <Stack gap="tight">
              <Tag tone={tool.readOnly ? "info" : "danger"}>
                {tool.readOnly ? "read only" : "changes state"}
              </Tag>
              <Text>{tool.description}</Text>
              <Text tone="muted" size="small">
                <strong>Registered</strong> {tool.registeredWhen}
              </Text>
              {tool.unregisteredWhen === undefined ? null : (
                <Text tone="muted" size="small">
                  <strong>Unregistered</strong> {tool.unregisteredWhen}
                </Text>
              )}
            </Stack>
          </Panel>
        ))}

        <CodeBlock
          caption="descriptor"
          language="json"
          code={schemaSnippet(props.meta)}
        />
      </Stack>
    </Panel>
  );
}

function Accessibility(props: { meta: AgentComponentMeta }) {
  const { a11y } = props.meta;
  if (a11y === undefined) return null;

  const rows: TableRow[] = [
    ...(a11y.role === undefined
      ? []
      : [{ id: "role", cells: { field: "Role", value: <code>{a11y.role}</code> } }]),
    ...(a11y.keyboard === undefined
      ? []
      : [
          {
            id: "keyboard",
            cells: { field: "Keyboard", value: a11y.keyboard.join(", ") },
          },
        ]),
    ...(a11y.notes === undefined
      ? []
      : [{ id: "notes", cells: { field: "Notes", value: a11y.notes } }]),
  ];

  return (
    <Panel headingLevel={2} label="Accessibility" flush id="accessibility">
      <Table
        label={`${props.meta.name} accessibility`}
        columns={[
          { key: "field", header: "Field", width: "8rem" },
          { key: "value", header: "Value" },
        ]}
        rows={rows}
      />
    </Panel>
  );
}

export function ComponentDoc(props: { meta: AgentComponentMeta }) {
  const { meta } = props;
  const specimens = specimensFor(meta.name);
  const { view: pageView, setView: setPageView } = useSprintViewControl();

  return (
    <article className="doc">
      <Stack gap="loose">
        <PageHeader
          label={meta.name}
          tags={
            <>
              <Tag tone={STATUS_TONE[meta.status] ?? "neutral"} filled>
                {meta.status}
              </Tag>
              <Tag>{meta.category}</Tag>
            </>
          }
          actions={
            <ViewSwitch view={pageView} onChange={setPageView} label="Whole page" />
          }
        >
          <Text>{meta.summary}</Text>
        </PageHeader>

        {specimens.gallery === undefined ? null : (
          <Panel headingLevel={2} label="Every variant" id="variants">
            <div className={pageView === "agent" ? "stage as-text" : "stage"}>
              <SprintProvider view={pageView} pageTools={false}>
                {specimens.gallery}
              </SprintProvider>
            </div>
          </Panel>
        )}

        <Panel headingLevel={2} label="When to use" id="when-to-use">
          <Stack gap="tight">
            <Text>{meta.whenToUse}</Text>
            {meta.whenNotToUse === undefined ? null : (
              <>
                <Heading level={3}>When not to</Heading>
                <Text>{meta.whenNotToUse}</Text>
              </>
            )}
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Install" id="install">
          <CodeBlock code={importSnippet(meta.name)} />
        </Panel>

        <Panel headingLevel={2} label="Examples" id="examples">
          <Stack>
            <Stack gap="tight">
              <Text tone="muted" size="small">
                Each snippet is the exact <code>examples[].code</code> string an agent
                receives from the manifest. Nothing here is written twice.
              </Text>
              <Text tone="muted" size="small">
                Every example below is scoped as <code>ex{"{n}"}</code> so specimens on
                this page do not claim the same tool name. In your own app the prefix
                would be whatever region the component sits in, or nothing at all.
              </Text>
            </Stack>

            {meta.examples.map((example, index) => {
              const live = specimens.byExample[example.title];
              return (
                <Stack gap="tight" key={example.title}>
                  <Heading level={3}>{example.title}</Heading>
                  {example.description === undefined ? null : (
                    <Text tone="muted" size="small">
                      {example.description}
                    </Text>
                  )}
                  {live === undefined ? (
                    <Text tone="warning" size="small">
                      No live specimen registered for this example.
                    </Text>
                  ) : (
                    <AgentRegion label={`ex${index + 1}`}>
                      <AgentPreview pageView={pageView}>{live}</AgentPreview>
                    </AgentRegion>
                  )}
                  <CodeBlock code={example.code} />
                </Stack>
              );
            })}
          </Stack>
        </Panel>

        <Props meta={meta} />
        <State meta={meta} />
        <Tools meta={meta} />

        {meta.agentView === undefined ? null : (
          <Panel headingLevel={2} label="Agent view" id="agent-view">
            <Stack gap="tight">
              <Text tone="muted" size="small">
                The component renders this itself, from the same node that produces its{" "}
                <code>data-sprint*</code> attributes in the human view. Flip{" "}
                <strong>Whole page</strong> at the top to see every specimen above in
                it.
              </Text>
              <Text tone="muted" size="small">
                The snippet below is the copy carried in{" "}
                <code>agent-manifest.json</code>, for an agent reading the catalogue
                before it renders anything.
              </Text>
              <CodeBlock
                caption="manifest"
                language="text"
                code={meta.agentView.example}
              />
            </Stack>
          </Panel>
        )}

        <Accessibility meta={meta} />

        <Panel headingLevel={2} label="Root attribute" id="root-attribute">
          <CodeBlock
            caption="dom"
            language="text"
            code={`<button ${COMPONENT_ATTRIBUTE}="${meta.name}" data-sprint-tone="neutral" data-sprint-tool="press-save">`}
          />
        </Panel>
      </Stack>
    </article>
  );
}
