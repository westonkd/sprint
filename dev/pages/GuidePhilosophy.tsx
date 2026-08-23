import { CodeBlock, Heading, Panel, Stack, Tag, Text } from "../../src/index.ts";

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
  return \`Pressed. The button is now:\\n\${format([node])}\`;
}`;

const NODE = `const node = buildAgentNode({
  component: "Button",
  label,
  tool: toolName,
  state: { tone, block, loading, disabled: inert },
});

if (view === "agent") return <AgentControl node={node} onClick={onClick} />;
return <button {...agentAttributesFor(node)}>{children}</button>;`;

const NO_TOOL = `<Link href="#/Button">Button</Link>
// registers: nothing. The href is already public, and a nav
// list of twenty links would cost twenty tools for no new power.

<Link href="#/checkout" agentTool>Go to checkout</Link>
// registers: open-go-to-checkout`;

const TRANSPARENT = `<Stack direction="row" gap="tight">
  <Button>Cancel</Button>
  <Button tone="action">Confirm</Button>
</Stack>

// agent view:
// - **Button** "Cancel" [tone=neutral] → tool \`press-cancel\`
// - **Button** "Confirm" [tone=action] → tool \`press-confirm\``;

const PARTS = `- **SegmentedControl** "Page view" [value=human] → tool \`select-page-view\`
  - part \`option\` "human" [checked]     <- a real <button>
  - part \`option\` "agent"                <- a real <button>`;

export function GuidePhilosophy() {
  return (
    <article className="doc">
      <Stack gap="loose">
        <header className="doc-head">
          <Stack gap="tight">
            <Stack direction="row" gap="tight" align="center" wrap>
              <Heading level={1}>Integration philosophy</Heading>
              <Tag>background</Tag>
            </Stack>
            <Text>
              WebMCP gives you a registration API and no opinions. Sprint's opinions are
              below, along with what each one costs.
            </Text>
          </Stack>
        </header>

        <Panel label="1. Agent-operability is not a feature you add">
          <Stack gap="tight">
            <Text>
              The stated goal is that adopting Sprint requires no agent-specific work.
              Using the component is what makes the app agent-operable.
            </Text>
            <CodeBlock code={FREE} />
            <Text tone="muted" size="small">
              No tool prop, no registration call, no schema. The name is derived from
              the button's own accessible label, so it means something to a model.
            </Text>
            <Text>
              <strong>The cost:</strong> a dense page could flood the tool list, and
              more tools means slower, less accurate selection. We accepted that with a
              tripwire: if a realistic page passes roughly 15 registered tools, Button's
              default flips to opt-in. Better to have written the threshold down than to
              discover it at component eight.
            </Text>
          </Stack>
        </Panel>

        <Panel label="2. Instances are addressed by composition">
          <Stack gap="tight">
            <Text>
              Two identical buttons need distinguishable tools. The usual answers are a
              manual id per instance, or a generated one. Sprint takes neither: the
              surrounding region already has a label, and it is already on screen.
            </Text>
            <CodeBlock code={SCOPED} />
            <Text tone="muted" size="small">
              Names read as <code>&lt;scope&gt;-&lt;verb&gt;-&lt;label&gt;</code>. If a
              name overflows, outer scope segments are dropped before the action is ever
              cut, so a name stays meaningful rather than becoming{" "}
              <code>billing-pres</code>.
            </Text>
          </Stack>
        </Panel>

        <Panel label="3. An ambiguous name registers nothing">
          <Stack gap="tight">
            <Text>
              When two components resolve to the same tool name,{" "}
              <strong>neither registers</strong> and both are named in a console
              warning.
            </Text>
            <Text>
              Numeric suffixing would reintroduce <code>button-3</code>. First-wins is
              worse: it depends on mount order and hands the agent a tool that presses
              an arbitrary one of two identical controls. Silently pressing the wrong
              button beats pressing nothing only if you never find out. If a name is
              ambiguous to a machine it is ambiguous to a human, so it fails loudly. Set{" "}
              <code>agentName</code> to fix it.
            </Text>
          </Stack>
        </Panel>

        <Panel label="4. A tool that cannot work does not exist">
          <Text>
            A disabled or loading Button unregisters its tool and re-registers when it
            recovers. An agent cannot double-submit a form whose button has entered a
            loading state, because in that moment there is no tool to call.
          </Text>
        </Panel>

        <Panel label="5. A tool exists only where an agent gains something">
          <Stack gap="tight">
            <Text>
              Registration is not free, so it is not automatic. A Button acts and
              registers by default. A Link navigates and registers nothing, because an
              agent can already reach a URL, and the destination is published as state
              so it does not have to click to discover it. A CodeBlock's copy control
              never registers at all: putting text on a person's clipboard does nothing
              for a model that can already read the snippet.
            </Text>
            <CodeBlock code={NO_TOOL} />
            <Text tone="muted" size="small">
              The rule is the same one behind the tripwire in point 1. Ask what an agent
              can do with the tool that it could not do without it. If the answer is
              nothing, the tool is cost.
            </Text>
          </Stack>
        </Panel>

        <Panel label="6. Tools drive the real thing">
          <Stack gap="tight">
            <Text>
              <code>execute</code> does not call your <code>onClick</code> prop. It
              clicks the actual element.
            </Text>
            <CodeBlock code={CLICK} />
            <Text tone="muted" size="small">
              So a tool press bubbles to parent listeners, submits an enclosing form,
              and respects <code>disabled</code>, not because we maintained parity, but
              because it is the same event. Sprint cannot drift from itself here.
            </Text>
            <Text>
              The <code>afterCommit()</code> barrier is not optional. State updates are
              batched, so without it a tool reads pre-action DOM and reports it as the
              result: silently, plausibly, wrongly.
            </Text>
          </Stack>
        </Panel>

        <Panel label="7. A result describes the new state">
          <Stack gap="tight">
            <Text>
              Returning <code>"ok"</code> forces the agent into another round trip to
              find out what happened. Sprint returns the component's own state after the
              action, so the loop closes in one call.
            </Text>
            <Text tone="muted" size="small">
              Work the press <em>starts</em> is not awaited. If the button entered a
              loading state, the result says so. That is honest and more useful than
              hanging.
            </Text>
          </Stack>
        </Panel>

        <Panel label="8. One spec, two consumers">
          <Stack gap="tight">
            <Text>
              A hand-written tool block in metadata would be a design-time description
              of runtime behaviour, and it would drift. Instead the spec is declared
              once and read by both the runtime descriptor and the manifest.
            </Text>
            <CodeBlock code={SPEC} />
            <Text tone="muted" size="small">
              The descriptor shown on every component page is generated from this. So is
              the entry in <code>agent-manifest.json</code>. Drift is not discouraged,
              it is impossible.
            </Text>
            <Text tone="muted" size="small">
              A component whose options are only known at runtime, such as
              SegmentedControl, registers the shared spec with a per-instance{" "}
              <code>inputSchema</code> carrying the current labels as an{" "}
              <code>enum</code>. The prose stays declared once; only the value set is
              live.
            </Text>
          </Stack>
        </Panel>

        <Panel label="9. Exactly one call site">
          <Stack gap="tight">
            <Text>
              Every <code>document.modelContext</code> call lives in one adapter module.
              It is the single place that enforces the 500 and 150 character description
              limits (throwing at registration, where the mistake is, not at call time),
              clamps output to 1,500, validates inputs against the schema, and converts
              a thrown error into a descriptive string the model can recover from.
            </Text>
            <Text tone="muted" size="small">
              Every tool inherits all of that without opting in. And when the origin
              trial changes shape, it is one file.
            </Text>
          </Stack>
        </Panel>

        <Panel label="10. Imperative only, for now">
          <Stack gap="tight">
            <Text>
              Sprint uses the imperative API exclusively. Nothing uses{" "}
              <code>toolname</code> or the declarative form attributes.
            </Text>
            <Text>
              This was not really a choice yet. Button is not a form, its tool takes no
              inputs, and its registration is conditional on runtime state, none of
              which the declarative API expresses. It becomes a genuine decision when a
              Field or Form component exists.
            </Text>
            <Text>
              The pull will be real: the browser derives the entire schema from the
              markup, including <code>enum</code> values from{" "}
              <code>&lt;option&gt;</code> elements, with nothing to hand-maintain. The
              argument against is that a declaratively registered tool bypasses the
              adapter above, and is invisible to the naming and collision machinery.
              Point 9 would stop being true.
            </Text>
          </Stack>
        </Panel>

        <Panel label="11. There are two kinds of agent">
          <Stack gap="tight">
            <Text>
              WebMCP needs no elements at all, since <code>execute</code> is just a
              function. But WebMCP exists only in Chrome 149 with a flag. Every other
              agent, whether Playwright, vision-based, or anything in Firefox or Safari,
              has to read and click a page.
            </Text>
            <Text>
              So agent view serves both. Components render as Markdown text, and an
              actionable component additionally renders exactly one bare control whose
              text <em>is</em> its Markdown line.
            </Text>
            <CodeBlock code={NODE} />
            <Text tone="muted" size="small">
              Both branches read one node built in the same render, so the DOM
              attributes and the agent text cannot disagree.
            </Text>
            <Text>
              We deliberately do not feature-detect <code>document.modelContext</code>{" "}
              to decide whether to render controls. The API being present does not mean
              the agent is using it, and a Playwright agent in Chrome 149 would find its
              affordances deleted. Sprint cannot tell how it is being driven, so it
              keeps the minimum affordance. Pass <code>agentControls="never"</code> if
              you know better.
            </Text>
          </Stack>
        </Panel>

        <Panel label="12. One control per actionable part">
          <Stack gap="tight">
            <Text>
              "Exactly one control" was written with Button in mind, and a control with
              several distinct actions breaks it. A SegmentedControl cannot express
              choosing an option through one button. So the rule generalises: a
              component renders one control per addressable part that can be acted on
              right now, and the group itself stays text.
            </Text>
            <CodeBlock language="text" code={PARTS} />
            <Text tone="muted" size="small">
              The tool count does not follow the control count. Two option buttons,
              still one <code>select</code> tool with an enum. Elements are for agents
              without WebMCP; tools are for agents with it, and they are sized by
              different pressures.
            </Text>
          </Stack>
        </Panel>

        <Panel label="13. Layout is not meaning">
          <Stack gap="tight">
            <Text>
              Stack renders nothing in agent view: no line, no element, no indentation.
              An agent does not care that two buttons are in a row rather than a column,
              and every layout wrapper that announced itself would push the content it
              contains a level deeper for no information.
            </Text>
            <CodeBlock code={TRANSPARENT} />
            <Text tone="muted" size="small">
              Panel does render a line, because a labelled region is meaning: it tells
              an agent what the things inside it have to do with each other. The test is
              whether removing the component would lose an agent anything.
            </Text>
          </Stack>
        </Panel>

        <Panel label="14. It has to work with none of this">
          <Stack gap="tight">
            <Text>
              If <code>document.modelContext</code> is absent, registration is a no-op
              and every component behaves normally. No polyfill, no fallback library, no
              injected connection widget in someone else's app.
            </Text>
            <Text tone="muted" size="small">
              Which makes the agent view, not the tools, the browser-independent half of
              the product.
            </Text>
          </Stack>
        </Panel>

        <Panel label="What is still unproven">
          <Stack gap="tight">
            <Text tone="warning">
              Everything above is verified in jsdom and in a normal browser. No
              descriptor has been accepted by a real WebMCP implementation yet. The test
              double is our reading of the documentation, not the platform.
            </Text>
            <Text tone="muted" size="small">
              The catalogue grew ahead of that spike on purpose, so that these pages
              could be built out of the library instead of out of hand-written markup.
              The bet is that a documentation page is a demanding enough application to
              find the design's holes, and it did: points 5, 12, and 13 are all things
              this page forced. The bet's cost is that eleven more components now depend
              on a descriptor shape no browser has accepted.
            </Text>
          </Stack>
        </Panel>
      </Stack>
    </article>
  );
}
