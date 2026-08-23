import { useState } from "react";
import {
  type AgentComponentMeta,
  AgentRegion,
  agentSelector,
  COMPONENT_ATTRIBUTE,
  SprintProvider,
  type SprintView,
} from "../../src/index.ts";
import { specimensFor } from "../specimens/index.ts";
import { AgentPreview, ViewSwitch } from "../ui/AgentPreview.tsx";
import { CodeBlock } from "../ui/CodeBlock.tsx";

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

  return (
    <section className="pane">
      <h2>Props</h2>
      <table className="grid">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Kind</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, spec]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
                {spec.required ? <span className="req">required</span> : null}
              </td>
              <td>
                <span className="kind">{spec.kind}</span>
                {spec.values === undefined ? null : (
                  <span className="values">{spec.values.join(" | ")}</span>
                )}
              </td>
              <td>
                {spec.default === undefined ? (
                  <span className="muted">—</span>
                ) : (
                  <code>{JSON.stringify(spec.default)}</code>
                )}
              </td>
              <td>{spec.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function State(props: { meta: AgentComponentMeta }) {
  const entries = Object.entries(props.meta.state ?? {});
  if (entries.length === 0) return null;

  return (
    <section className="pane">
      <h2>State attributes</h2>
      <p className="note">
        Public API. Agents write selectors against these, and the agent view is
        projected from them.
      </p>
      <table className="grid">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Values</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, spec]) => (
            <tr key={name}>
              <td>
                <code>{spec.attribute}</code>
              </td>
              <td>
                {spec.values === undefined ? (
                  <span className="muted">present or absent</span>
                ) : (
                  <span className="values">{spec.values.join(" | ")}</span>
                )}
              </td>
              <td>{spec.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CodeBlock
        caption="selector"
        code={`document.querySelector(agentSelector("${props.meta.name}"));\n// ${agentSelector(
          props.meta.name,
        )}`}
      />
    </section>
  );
}

function Tools(props: { meta: AgentComponentMeta }) {
  const entries = Object.entries(props.meta.tools ?? {});
  if (entries.length === 0) return null;

  return (
    <section className="pane">
      <h2>WebMCP tools</h2>
      <p className="note">
        Registered with <code>document.modelContext</code> when available. The
        descriptor below is generated from the same spec the component registers at
        runtime, so it cannot drift.
      </p>
      <ul className="tools">
        {entries.map(([key, tool]) => (
          <li key={key}>
            <code className="tool-name">&lt;scope&gt;-{tool.verb}-&lt;label&gt;</code>
            <span className={tool.readOnly ? "chip chip-read" : "chip chip-write"}>
              {tool.readOnly ? "read only" : "changes state"}
            </span>
            <p>{tool.description}</p>
            <p className="note">
              <strong>Registered</strong> {tool.registeredWhen}
            </p>
            {tool.unregisteredWhen === undefined ? null : (
              <p className="note">
                <strong>Unregistered</strong> {tool.unregisteredWhen}
              </p>
            )}
          </li>
        ))}
      </ul>
      <CodeBlock caption="descriptor" code={schemaSnippet(props.meta)} />
    </section>
  );
}

export function ComponentDoc(props: { meta: AgentComponentMeta }) {
  const { meta } = props;
  const specimens = specimensFor(meta.name);
  const [pageView, setPageView] = useState<SprintView>("human");

  return (
    <article className="doc">
      <header className="doc-head">
        <div className="doc-title">
          <h1>{meta.name}</h1>
          <span className={`status status-${meta.status}`}>{meta.status}</span>
          <span className="chip">{meta.category}</span>
          <ViewSwitch view={pageView} onChange={setPageView} label="Whole page" />
        </div>
        <p className="lede">{meta.summary}</p>
      </header>

      {specimens.gallery === undefined ? null : (
        <section className="pane">
          <h2>Every variant</h2>
          <div className={pageView === "agent" ? "row as-text" : "row"}>
            <SprintProvider view={pageView} pageTools={false}>
              {specimens.gallery}
            </SprintProvider>
          </div>
        </section>
      )}

      <section className="pane">
        <h2>When to use</h2>
        <p>{meta.whenToUse}</p>
        {meta.whenNotToUse === undefined ? null : (
          <>
            <h3>When not to</h3>
            <p>{meta.whenNotToUse}</p>
          </>
        )}
      </section>

      <section className="pane">
        <h2>Install</h2>
        <CodeBlock code={importSnippet(meta.name)} />
      </section>

      <section className="pane">
        <h2>Examples</h2>
        <p className="note">
          Each snippet is the exact <code>examples[].code</code> string an agent
          receives from the manifest. Nothing here is written twice.
        </p>
        <p className="note">
          Every example below is scoped as <code>ex{"{n}"}</code> so specimens on this
          page do not claim the same tool name. In your own app the prefix would be
          whatever region the component sits in, or nothing at all.
        </p>
        {meta.examples.map((example, index) => {
          const live = specimens.byExample[example.title];
          return (
            <div className="example" key={example.title}>
              <h3>{example.title}</h3>
              {example.description === undefined ? null : (
                <p className="note">{example.description}</p>
              )}
              {live === undefined ? (
                <p className="warn">No live specimen registered for this example.</p>
              ) : (
                <AgentRegion label={`ex${index + 1}`}>
                  <AgentPreview pageView={pageView}>{live}</AgentPreview>
                </AgentRegion>
              )}
              <CodeBlock code={example.code} />
            </div>
          );
        })}
      </section>

      <Props meta={meta} />
      <State meta={meta} />
      <Tools meta={meta} />

      {meta.agentView === undefined ? null : (
        <section className="pane">
          <h2>Agent view</h2>
          <p className="note">
            The component renders this itself, from the same node that produces its{" "}
            <code>data-sprint*</code> attributes in the human view. Flip{" "}
            <strong>Whole page</strong> at the top to see every specimen above in it.
          </p>
          <p className="note">
            The snippet below is the copy carried in <code>agent-manifest.json</code>,
            for an agent reading the catalogue before it renders anything.
          </p>
          <CodeBlock caption="manifest" code={meta.agentView.example} />
        </section>
      )}

      {meta.a11y === undefined ? null : (
        <section className="pane">
          <h2>Accessibility</h2>
          <table className="grid">
            <tbody>
              {meta.a11y.role === undefined ? null : (
                <tr>
                  <th>Role</th>
                  <td>
                    <code>{meta.a11y.role}</code>
                  </td>
                </tr>
              )}
              {meta.a11y.keyboard === undefined ? null : (
                <tr>
                  <th>Keyboard</th>
                  <td>{meta.a11y.keyboard.join(", ")}</td>
                </tr>
              )}
              {meta.a11y.notes === undefined ? null : (
                <tr>
                  <th>Notes</th>
                  <td>{meta.a11y.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <section className="pane">
        <h2>Root attribute</h2>
        <CodeBlock
          caption="dom"
          code={`<button ${COMPONENT_ATTRIBUTE}="${meta.name}" data-sprint-tone="neutral" data-sprint-tool="press-save">`}
        />
      </section>
    </article>
  );
}
