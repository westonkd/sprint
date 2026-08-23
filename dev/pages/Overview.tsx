import {
  type AgentComponentMeta,
  buildAgentManifest,
  isModelContextAvailable,
  version,
} from "../../src/index.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";

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

export function Overview(props: {
  components: readonly AgentComponentMeta[];
  onOpen: (name: string) => void;
}) {
  const { components, onOpen } = props;
  const manifest = buildAgentManifest(version);
  const webmcp = isModelContextAvailable();

  return (
    <article className="doc">
      <header className="doc-head">
        <div className="doc-title">
          <h1>Sprint</h1>
          <span className="chip">v{version}</span>
        </div>
        <p className="lede">
          An agent-forward React component library. Every component renders normally for
          people and projects a machine-readable view for agents, from one definition.
        </p>
      </header>

      <section className="pane">
        <h2>These docs are the manifest</h2>
        <p>
          Every page in this workbench is generated from{" "}
          <code>agent-manifest.json</code>, the same artifact an agent reads to learn
          what exists. There is no hand-written documentation to fall out of date, and
          writing good agent metadata is what produces good human docs.
        </p>
      </section>

      <section className="pane">
        <h2>Two views, one definition</h2>
        <p>
          A containing <code>SprintProvider</code> holds the current view. In{" "}
          <strong>human</strong> view components render as DOM. In{" "}
          <strong>agent</strong> view the same components render as plain Markdown text,
          so an agent can read the page directly instead of walking a DOM. Both
          renderings come from one node built during the same render, so they cannot
          disagree.
        </p>
        <p className="note">
          WebMCP tools stay registered across the switch. Flipping the view re-renders
          the components, it does not unmount them. Toggle any example on a component
          page to see it.
        </p>
        <p className="note">
          Agent view is not inert. An actionable component still renders one bare
          control whose text is its own Markdown line, so an agent driving the DOM has
          something to click. WebMCP needs no elements, but agents outside Chrome 149
          have no WebMCP. Pass <code>agentControls=&quot;never&quot;</code> for zero
          markup.
        </p>
      </section>

      <section className="pane">
        <h2>Getting started</h2>
        <CodeBlock code={INSTALL} />
        <p className="note">
          <code>SprintProvider</code> registers the page-level read tools and supplies
          tool-name scoping. Components work without it.
        </p>
      </section>

      <section className="pane">
        <h2>Components</h2>
        <ul className="catalog">
          {components.map((meta) => (
            <li key={meta.name}>
              <button type="button" className="card" onClick={() => onOpen(meta.name)}>
                <span className="card-title">{meta.name}</span>
                <span className="note">{meta.summary}</span>
                <span className={`status status-${meta.status}`}>{meta.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="pane">
        <h2>Reading the manifest</h2>
        <CodeBlock code={READ} />
      </section>

      <section className="pane">
        <h2>Conventions</h2>
        <table className="grid">
          <tbody>
            {Object.entries(manifest.conventions).map(([key, value]) => (
              <tr key={key}>
                <th>{key}</th>
                <td>
                  <code>{String(value)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pane">
        <h2>WebMCP</h2>
        <p>
          Tools register with <code>document.modelContext</code>, the web platform API
          shipping in Chrome 149 behind an origin trial or{" "}
          <code>chrome://flags/#enable-webmcp-testing</code>. Everywhere else
          registration is a no-op and the components work normally; the agent view does
          not depend on it.
        </p>
        <p className={webmcp ? "ok" : "warn"}>
          {webmcp
            ? "Available in this browser. Tools on these pages are live."
            : "Unavailable in this browser. Tool names are still shown, but nothing is registered."}
        </p>
      </section>
    </article>
  );
}
