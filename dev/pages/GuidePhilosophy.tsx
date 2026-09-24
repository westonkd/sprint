import { CodeBlock, PageHeader, Panel, Stack, Tag, Text } from "../../src/index.ts";

const FREE = `<Button onClick={prepare}>Prepare launch</Button>
// registers: press-prepare-launch`;

const SCOPED = `<AgentRegion label="Billing">
  <Button>Save</Button>   {/* billing-press-save */}
</AgentRegion>
<AgentRegion label="Shipping">
  <Button>Save</Button>   {/* shipping-press-save */}
</AgentRegion>`;

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

const THEME = `<SprintProvider theme="calorie">   {/* or data-sprint-theme on any element */}

/* the whole of the calorie register, in semantic.css */
--sprint-surface: var(--sprint-color-bone);
--sprint-action: var(--sprint-color-flare);
--sprint-action-mark: var(--sprint-color-flare-deep);
--sprint-radius-surface: 20px;
--sprint-font-display: var(--sprint-font-grotesk);
--sprint-cast-ink: rgb(20 20 15 / 0.16);
--sprint-easing: cubic-bezier(0.2, 0, 0, 1);`;

const NO_TOOL = `<Link href="#/Button">Button</Link>
// registers: nothing. The href is already public, and a nav
// list of twenty links would cost twenty tools for no new power.

<Link href="#/checkout" agentTool>Go to checkout</Link>
// registers: open-go-to-checkout`;

export function GuidePhilosophy() {
  return (
    <article className="doc">
      <Stack gap="loose">
        <PageHeader label="Integration philosophy" tags={<Tag>background</Tag>}>
          <Text>
            WebMCP gives you a registration API and no opinions. Sprint's opinions are
            below, along with what each one costs.
          </Text>
        </PageHeader>

        <Panel headingLevel={2} label="1. Agent-operability is not a feature you add">
          <Stack gap="tight">
            <Text>
              Adopting Sprint requires no agent-specific work. Using the component is
              what makes the app agent-operable.
            </Text>
            <CodeBlock code={FREE} />
            <Text tone="muted" size="small">
              No tool prop, no registration call, no schema. The name is derived from
              the button's own accessible label, so it means something to a model.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="2. Names compose from what is on screen">
          <Stack gap="tight">
            <Text>
              Two identical buttons need distinguishable tools. Instead of manual or
              generated ids, the surrounding region's label — already on screen —
              becomes the scope.
            </Text>
            <CodeBlock code={SCOPED} />
            <Text tone="muted" size="small">
              Names read as <code>&lt;scope&gt;-&lt;verb&gt;-&lt;label&gt;</code>. If a
              name overflows, outer scope segments are dropped before the action is ever
              cut, so a name stays meaningful rather than becoming{" "}
              <code>billing-pres</code>.
            </Text>
            <Text>
              When two components still resolve to the same name,{" "}
              <strong>neither registers</strong> and both are named in a console
              warning. If a name is ambiguous to a machine it is ambiguous to a human,
              so it fails loudly. Set <code>agentName</code> to fix it.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="3. A tool that cannot work does not exist">
          <Text>
            A disabled or loading Button unregisters its tool and re-registers when it
            recovers. An agent cannot double-submit a form whose button has entered a
            loading state, because in that moment there is no tool to call.
          </Text>
        </Panel>

        <Panel
          headingLevel={2}
          label="4. A tool exists only where an agent gains something"
        >
          <Stack gap="tight">
            <Text>
              Registration is not free, so it is not automatic. A Button acts and
              registers by default. A Link navigates and registers nothing, because an
              agent can already reach a URL, and the destination is published as state
              so it does not have to click to discover it.
            </Text>
            <CodeBlock code={NO_TOOL} />
            <Text tone="muted" size="small">
              Ask what an agent can do with the tool that it could not do without it. If
              the answer is nothing, the tool is cost.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="5. Tools drive the real thing and report back">
          <Stack gap="tight">
            <Text>
              <code>execute</code> does not call your <code>onClick</code> prop. It
              clicks the actual element.
            </Text>
            <CodeBlock code={CLICK} />
            <Text tone="muted" size="small">
              So a tool press bubbles to parent listeners, submits an enclosing form,
              and respects <code>disabled</code>, because it is the same event. It is
              also why a client-side router needs no adapter: intercept the click with{" "}
              <code>onClick</code> and <code>preventDefault</code>, keep the real{" "}
              <code>href</code>, and human clicks, agent-view clicks, and tool calls all
              take the same path.
            </Text>
            <Text>
              The result is the component's own state after the action, read after the{" "}
              <code>afterCommit()</code> barrier, so the loop closes in one call instead
              of forcing another round trip. Work the press <em>starts</em> is not
              awaited: if the button entered a loading state, the result says so.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="6. One spec, one adapter">
          <Stack gap="tight">
            <Text>
              Each tool's prose is declared once, in <code>tool.ts</code>, and read by
              both the runtime descriptor and the manifest. The descriptor on every
              component page and the entry in <code>agent-manifest.json</code> are
              generated from the same object, so they cannot drift.
            </Text>
            <Text>
              Every <code>document.modelContext</code> call lives in one adapter module.
              It enforces the description limits at registration time, clamps output,
              validates inputs against the schema, and converts a thrown error into a
              descriptive string the model can recover from. Every tool inherits all of
              that, and when the platform API changes shape, it is one file.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="7. The agent view serves agents without WebMCP">
          <Stack gap="tight">
            <Text>
              WebMCP needs no elements at all, but most agents — Playwright,
              vision-based, anything without the API — have to read and click a page. In
              agent view components render as Markdown text, and an actionable component
              additionally renders one bare control per addressable part whose text{" "}
              <em>is</em> its Markdown line.
            </Text>
            <CodeBlock code={NODE} />
            <Text tone="muted" size="small">
              Both branches read one node built in the same render, so the DOM
              attributes and the agent text cannot disagree. Control count and tool
              count are independent: a SegmentedControl renders one button per option
              but registers one <code>select</code> tool with an enum. Text entry
              renders a live field, because a button cannot receive typed text.
            </Text>
            <Text>
              Layout renders nothing: Stack emits no line and no element, because an
              agent does not care that two buttons are in a row. Panel does render a
              line, because a labelled region tells an agent what the things inside it
              have to do with each other. The test is whether removing the component
              would lose an agent anything.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="8. The look is a theme, not the library">
          <Stack gap="tight">
            <Text>
              Sprint's default register is loud on purpose: square corners, uppercase
              monospace chrome, acid on near-black, stepped motion. That is a house
              style, and it is not what the library is for. Everything that makes it
              polarizing is a token.
            </Text>
            <CodeBlock code={THEME} />
            <Text tone="muted" size="small">
              A theme remaps the semantic layer, and that layer carries shape, type, and
              motion as well as color — <code>--sprint-radius-surface</code>,{" "}
              <code>--sprint-font-display</code>, <code>--sprint-label-transform</code>,{" "}
              <code>--sprint-easing</code>. Component CSS never writes a literal{" "}
              <code>0</code> radius or <code>uppercase</code>, which is why{" "}
              <code>calorie</code> is a stylesheet block rather than a fork.
            </Text>
            <Text>
              <code>calorie</code> is the second register, and it is a statement rather
              than a concession: bone and carbon grounds, one hot magenta, heavy grotesk
              display, and objects that are lit rather than flat. Depth there is three
              ideas and not a scale — <code>--sprint-mold</code> for a thing standing
              out of the surface, <code>--sprint-well</code> for a thing pressed into
              it, <code>--sprint-cast</code> for what it throws on the ground. The
              geometry is declared once for the whole library and only the inks are
              themed, so the default register is flat because every ink in it is{" "}
              <code>transparent</code>, not because its components opt out.
            </Text>
            <Text>
              <code>trax</code> is the third, and it is the cheap kind of register: it
              adds no geometry at all. Depth there is a two-pass screenprint, and all
              three of its ideas were roles the library already had.{" "}
              <code>--sprint-keyline-halo</code> is the whole trick, inverted — calorie
              makes Panel's offset second outline transparent because it reads as a
              misprint, and trax turns it up in the other ink for exactly that reason.{" "}
              <code>trax</code> is also the one chromatic ground: a full-bleed hazard
              orange on which nothing bright can clear AA, so every semantic role is a
              near-black and the muted ink is darker than the body ink rather than
              lighter.
            </Text>
            <Text>
              Three things make a theme a Sprint theme: the ornament vocabulary still
              marks empty states, chrome still speaks a grade below body in tracked
              micro-labels, and one hue is rationed to the action and never spent on
              focus. The last of those is enforced in the contrast test. Acid appears
              nowhere in calorie; it is 1.24:1 on bone and there is no field to rescue
              it.
            </Text>
            <Text tone="muted" size="small">
              A theme value names a cell in a register-by-ground grid —{" "}
              <code>dark</code> and <code>light</code> for the loud register,{" "}
              <code>calorie</code> and <code>calorie-dark</code> for the molded one,{" "}
              <code>trax</code> and <code>trax-dark</code> for the freight one — and
              never one axis of it. No value reads <code>prefers-color-scheme</code>,
              because a theme you can drop on any element has to resolve to one palette
              wherever it lands. Your app picks, the way this page's switch does.
            </Text>
            <Text tone="muted" size="small">
              None of this reaches an agent. Flip the view switch in any theme and the
              text stream is byte-identical, because the agent surface is projected from
              the node, not the pixels.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="9. It has to work with none of this">
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
      </Stack>
    </article>
  );
}
