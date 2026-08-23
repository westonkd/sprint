import { CodeBlock } from "../ui/CodeBlock.tsx";

const FREE = `<Button onClick={prepare}>Prepare launch</Button>
// registers: press-prepare-launch`;

const SCOPED = `<AgentRegion label="Billing">
  <Button>Save</Button>   {/* billing-press-save */}
</AgentRegion>
<AgentRegion label="Shipping">
  <Button>Save</Button>   {/* shipping-press-save */}
</AgentRegion>`;

const SPEC = `// Button/tool.ts — declared once
export const PRESS_TOOL: AgentToolSpec = {
  verb: "press",
  description: "Press this button, exactly as a person clicking it would...",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen: "The button is mounted, enabled, not loading...",
  unregisteredWhen: "The button unmounts, becomes disabled, or starts loading.",
};

// meta.ts embeds it   -> agent-manifest.json, and these docs
// useAgentTool reads it -> the live descriptor`;

const CLICK = `execute: async () => {
  element.click();          // a real event: bubbles, submits forms, respects disabled
  await afterCommit();      // wait for React to paint
  return \`Pressed. The button is now:\\n\${nodeLine(node)}\`;
}`;

const NODE = `const node = buildAgentNode({
  component: "Button",
  label,
  tool: toolName,
  state: { tone, block, loading, disabled: inert },
});

if (view === "agent") return <AgentControl node={node} onClick={onClick} />;
return <button {...agentAttributesFor(node)}>{children}</button>;`;

export function GuidePhilosophy() {
  return (
    <article className="doc">
      <header className="doc-head">
        <div className="doc-title">
          <h1>Integration philosophy</h1>
          <span className="chip">background</span>
        </div>
        <p className="lede">
          WebMCP gives you a registration API and no opinions. Sprint's opinions are
          below, along with what each one costs.
        </p>
      </header>

      <section className="pane">
        <h2>1. Agent-operability is not a feature you add</h2>
        <p>
          The stated goal is that adopting Sprint requires no agent-specific work. Using
          the component is what makes the app agent-operable.
        </p>
        <CodeBlock code={FREE} />
        <p className="note">
          No tool prop, no registration call, no schema. The name is derived from the
          button's own accessible label, so it means something to a model.
        </p>
        <p>
          <strong>The cost:</strong> a dense page could flood the tool list, and more
          tools means slower, less accurate selection. We accepted that with a tripwire:
          if a realistic page passes roughly 15 registered tools, Button's default flips
          to opt-in. Better to have written the threshold down than to discover it at
          component eight.
        </p>
      </section>

      <section className="pane">
        <h2>2. Instances are addressed by composition</h2>
        <p>
          Two identical buttons need distinguishable tools. The usual answers are a
          manual id per instance, or a generated one. Sprint takes neither: the
          surrounding region already has a label, and it is already on screen.
        </p>
        <CodeBlock code={SCOPED} />
        <p className="note">
          Names read as <code>&lt;scope&gt;-&lt;verb&gt;-&lt;label&gt;</code>. If a name
          overflows, outer scope segments are dropped before the action is ever cut, so
          a name stays meaningful rather than becoming <code>billing-pres</code>.
        </p>
      </section>

      <section className="pane">
        <h2>3. An ambiguous name registers nothing</h2>
        <p>
          When two components resolve to the same tool name,{" "}
          <strong>neither registers</strong> and both are named in a console warning.
        </p>
        <p>
          Numeric suffixing would reintroduce <code>button-3</code>. First-wins is
          worse: it depends on mount order and hands the agent a tool that presses an
          arbitrary one of two identical controls. Silently pressing the wrong button
          beats pressing nothing only if you never find out. If a name is ambiguous to a
          machine it is ambiguous to a human, so it fails loudly. Set{" "}
          <code>agentName</code> to fix it.
        </p>
      </section>

      <section className="pane">
        <h2>4. A tool that cannot work does not exist</h2>
        <p>
          A disabled or loading Button unregisters its tool and re-registers when it
          recovers. An agent cannot double-submit a form whose button has entered a
          loading state, because in that moment there is no tool to call.
        </p>
      </section>

      <section className="pane">
        <h2>5. Tools drive the real thing</h2>
        <p>
          <code>execute</code> does not call your <code>onClick</code> prop. It clicks
          the actual element.
        </p>
        <CodeBlock code={CLICK} />
        <p className="note">
          So a tool press bubbles to parent listeners, submits an enclosing form, and
          respects <code>disabled</code> — not because we maintained parity, but because
          it is the same event. Sprint cannot drift from itself here.
        </p>
        <p>
          The <code>afterCommit()</code> barrier is not optional. State updates are
          batched, so without it a tool reads pre-action DOM and reports it as the
          result: silently, plausibly, wrongly.
        </p>
      </section>

      <section className="pane">
        <h2>6. A result describes the new state</h2>
        <p>
          Returning <code>"ok"</code> forces the agent into another round trip to find
          out what happened. Sprint returns the component's own state after the action,
          so the loop closes in one call.
        </p>
        <p className="note">
          Work the press <em>starts</em> is not awaited. If the button entered a loading
          state, the result says so. That is honest and more useful than hanging.
        </p>
      </section>

      <section className="pane">
        <h2>7. One spec, two consumers</h2>
        <p>
          A hand-written tool block in metadata would be a design-time description of
          runtime behaviour, and it would drift. Instead the spec is declared once and
          read by both the runtime descriptor and the manifest.
        </p>
        <CodeBlock code={SPEC} />
        <p className="note">
          The descriptor shown on every component page is generated from this. So is the
          entry in <code>agent-manifest.json</code>. Drift is not discouraged, it is
          impossible.
        </p>
      </section>

      <section className="pane">
        <h2>8. Exactly one call site</h2>
        <p>
          Every <code>document.modelContext</code> call lives in one adapter module. It
          is the single place that enforces the 500 and 150 character description limits
          (throwing at registration, where the mistake is, not at call time), clamps
          output to 1,500, validates inputs against the schema, and converts a thrown
          error into a descriptive string the model can recover from.
        </p>
        <p className="note">
          Every tool inherits all of that without opting in. And when the origin trial
          changes shape, it is one file.
        </p>
      </section>

      <section className="pane">
        <h2>9. Imperative only, for now</h2>
        <p>
          Sprint uses the imperative API exclusively. Nothing uses <code>toolname</code>{" "}
          or the declarative form attributes.
        </p>
        <p>
          This was not really a choice yet. Button is not a form, its tool takes no
          inputs, and its registration is conditional on runtime state — none of which
          the declarative API expresses. It becomes a genuine decision when a Field or
          Form component exists.
        </p>
        <p>
          The pull will be real: the browser derives the entire schema from the markup,
          including <code>enum</code> values from <code>&lt;option&gt;</code> elements,
          with nothing to hand-maintain. The argument against is that a declaratively
          registered tool bypasses the adapter above, and is invisible to the naming and
          collision machinery. Point 8 would stop being true.
        </p>
      </section>

      <section className="pane">
        <h2>10. There are two kinds of agent</h2>
        <p>
          WebMCP needs no elements at all — <code>execute</code> is just a function. But
          WebMCP exists only in Chrome 149 with a flag. Every other agent — Playwright,
          vision-based, anything in Firefox or Safari — has to read and click a page.
        </p>
        <p>
          So agent view serves both. Components render as Markdown text, and an
          actionable component additionally renders exactly one bare control whose text{" "}
          <em>is</em> its Markdown line.
        </p>
        <CodeBlock code={NODE} />
        <p className="note">
          Both branches read one node built in the same render, so the DOM attributes
          and the agent text cannot disagree.
        </p>
        <p>
          We deliberately do not feature-detect <code>document.modelContext</code> to
          decide whether to render controls. The API being present does not mean the
          agent is using it, and a Playwright agent in Chrome 149 would find its
          affordances deleted. Sprint cannot tell how it is being driven, so it keeps
          the minimum affordance. Pass <code>agentControls="never"</code> if you know
          better.
        </p>
      </section>

      <section className="pane">
        <h2>11. It has to work with none of this</h2>
        <p>
          If <code>document.modelContext</code> is absent, registration is a no-op and
          every component behaves normally. No polyfill, no fallback library, no
          injected connection widget in someone else's app.
        </p>
        <p className="note">
          Which makes the agent view, not the tools, the browser-independent half of the
          product.
        </p>
      </section>

      <section className="pane">
        <h2>What is still unproven</h2>
        <p className="warn">
          Everything above is verified in jsdom and in a normal browser. No descriptor
          has been accepted by a real WebMCP implementation yet. The test double is our
          reading of the documentation, not the platform. The Chrome 149 spike is the
          gate before the catalog grows.
        </p>
      </section>
    </article>
  );
}
