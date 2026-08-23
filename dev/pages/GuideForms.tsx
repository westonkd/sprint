import { useState } from "react";
import {
  AgentRegion,
  Button,
  Checkbox,
  CodeBlock,
  PageHeader,
  Panel,
  Select,
  Stack,
  Tag,
  Text,
  TextInput,
  useSprintViewControl,
} from "../../src/index.ts";
import { AgentPreview, ViewSwitch } from "../ui/AgentPreview.tsx";

const FORM = `<AgentRegion label="Crew">
  <Panel label="Crew" headingLevel={2}>
    <Stack gap="normal">
      <TextInput
        label="Callsign"
        value={callsign}
        onChange={setCallsign}
        hint="Uppercase, three to eight letters"
        placeholder="NOMAD"
      />
      <Select
        label="Region"
        value={region}
        onChange={setRegion}
        placeholder="Choose a region"
        options={[
          { value: "na-1", label: "North Atlantic" },
          { value: "eu-1", label: "Northern Europe" },
          { value: "ap-1", label: "East Asia" },
        ]}
      />
      <Checkbox
        label="Accept the terms"
        checked={accepted}
        onChange={setAccepted}
        required
      />
      <Button tone="action" block loading={saving} onClick={register}>
        Register
      </Button>
    </Stack>
  </Panel>
</AgentRegion>

// registers: crew-fill-callsign, crew-select-region,
//            crew-set-accept-the-terms, crew-press-register`;

const ANATOMY = `crew-fill-callsign
│    │    └─ the label on screen, slugged
│    └─ the component's verb
└─ the enclosing AgentRegion's label`;

const COLLIDE = `<Panel label="Billing">
  <Button>Save</Button>
</Panel>
<Panel label="Shipping">
  <Button>Save</Button>
</Panel>

// both resolve press-save: neither registers, and the console names them`;

const SCOPED = `<AgentRegion label="Billing">
  <Panel label="Billing" headingLevel={2}>
    <Button>Save</Button>   {/* billing-press-save */}
  </Panel>
</AgentRegion>
<AgentRegion label="Shipping">
  <Panel label="Shipping" headingLevel={2}>
    <Button>Save</Button>   {/* shipping-press-save */}
  </Panel>
</AgentRegion>`;

const SHAPES = `fill-callsign         { value: "NOMAD" }             // the full text; "" clears
select-region         { option: "Northern Europe" }  // the visible label, from an enum
set-accept-the-terms  { checked: true }              // the end state, not a toggle`;

const ERROR = `<TextInput
  label="Frequency"
  value={frequency}
  onChange={setFrequency}
  required
  error="Out of band. Use 118.000 to 136.975."
/>`;

const PASSWORD = `<TextInput
  label="Access code"
  type="password"
  value={code}
  onChange={setCode}
  autoComplete="current-password"
/>`;

const LIFECYCLE = `<Button tone="action" block loading={saving} onClick={register}>
  Register
</Button>

// idle     -> tool \`crew-press-register\` is registered
// saving   -> the tool is unregistered; a double submit is impossible
// finished -> the press returned the button's new state to the agent`;

const AGENT = `- **Panel** "Crew"
  - **TextInput** "Callsign" [empty] → tool \`crew-fill-callsign\`
    - part \`hint\` "Uppercase, three to eight letters"
  - **Select** "Region" [empty] → tool \`crew-select-region\`
    - part \`option\` "North Atlantic"
    - part \`option\` "Northern Europe"
    - part \`option\` "East Asia"
  - **Checkbox** "Accept the terms" [required] → tool \`crew-set-accept-the-terms\`
  - **Button** "Register" [block, tone=action] → tool \`crew-press-register\``;

const REGIONS = [
  { value: "na-1", label: "North Atlantic" },
  { value: "eu-1", label: "Northern Europe" },
  { value: "ap-1", label: "East Asia" },
];

function CrewForm() {
  const [callsign, setCallsign] = useState("");
  const [region, setRegion] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const register = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <AgentRegion label="Crew">
      <Panel label="Crew" headingLevel={2}>
        <Stack gap="normal">
          <TextInput
            label="Callsign"
            value={callsign}
            onChange={setCallsign}
            hint="Uppercase, three to eight letters"
            placeholder="NOMAD"
          />
          <Select
            label="Region"
            value={region}
            onChange={setRegion}
            placeholder="Choose a region"
            options={REGIONS}
          />
          <Checkbox
            label="Accept the terms"
            checked={accepted}
            onChange={setAccepted}
            required
          />
          <Button tone="action" block loading={saving} onClick={register}>
            Register
          </Button>
        </Stack>
      </Panel>
    </AgentRegion>
  );
}

function ScopedForms() {
  return (
    <Stack gap="normal">
      <AgentRegion label="Billing">
        <Panel label="Billing" headingLevel={2}>
          <Button>Save</Button>
        </Panel>
      </AgentRegion>
      <AgentRegion label="Shipping">
        <Panel label="Shipping" headingLevel={2}>
          <Button>Save</Button>
        </Panel>
      </AgentRegion>
    </Stack>
  );
}

function ErrorField() {
  const [frequency, setFrequency] = useState("212.550");
  return (
    <TextInput
      label="Frequency"
      value={frequency}
      onChange={setFrequency}
      required
      error="Out of band. Use 118.000 to 136.975."
    />
  );
}

function PasswordField() {
  const [code, setCode] = useState("");
  return (
    <TextInput
      label="Access code"
      type="password"
      value={code}
      onChange={setCode}
      autoComplete="current-password"
    />
  );
}

export function GuideForms() {
  const { view: pageView, setView: setPageView } = useSprintViewControl();

  return (
    <article className="doc">
      <Stack gap="loose">
        <PageHeader
          label="Composing a form"
          tags={<Tag>composition</Tag>}
          actions={
            <ViewSwitch view={pageView} onChange={setPageView} label="Whole page" />
          }
        >
          <Text>
            A Sprint form is a labelled Panel holding fields and one primary action.
            Each field brings its own label, hint, and error, so composing the form is
            mostly naming: the region, the tools inside it, and the values they accept
            all read in the user's own words.
          </Text>
        </PageHeader>

        <Panel headingLevel={2} label="The shape">
          <Stack gap="tight">
            <AgentPreview pageView={pageView}>
              <CrewForm />
            </AgentPreview>
            <CodeBlock code={FORM} />
            <Text>
              The Panel names the region. The AgentRegion around it prefixes every tool
              inside with the same name, so the tools land in the agent's list already
              sorted by what they belong to. The fields need no label elements of their
              own, and the Stack, like all layout, disappears in agent view.
            </Text>
            <Text tone="muted" size="small">
              The preview is live. Type a callsign, pick a region, press Register and
              watch the button go busy. Flip the preview to agent view first and the
              form still works: the field is a real input there too.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Where tool names come from">
          <Stack gap="tight">
            <Text>Every tool name above has the same three parts:</Text>
            <CodeBlock language="text" code={ANATOMY} />
            <Text>
              The verb is fixed by the component and the label is already on screen, so
              the scope is the only part you write, and only AgentRegion writes it. The
              Panel contributes nothing: its label names the region for a person and a
              screen reader, but tool names never read it.
            </Text>
            <Text>
              One form on a page can skip the scope. Two cannot, because their Save
              buttons both derive <code>press-save</code>:
            </Text>
            <CodeBlock code={COLLIDE} />
            <Text>
              A collision registers nothing, on purpose: a tool that presses an
              arbitrary one of two Save buttons is worse than no tool. So give each form
              its own AgentRegion, reusing the word its Panel already shows:
            </Text>
            <AgentPreview pageView={pageView}>
              <ScopedForms />
            </AgentPreview>
            <CodeBlock code={SCOPED} />
            <Text tone="muted" size="small">
              For a one-off collision, <code>agentName</code> is the lighter fix. Note
              that Checkbox and Switch share the <code>set</code> verb, so a box and a
              switch with the same label collide too, even across kinds.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Every tool takes the end state">
          <Stack gap="tight">
            <Text>
              No form tool mutates. Each one takes the explicit end state and replaces,
              so an agent never has to read, compute, and write back:
            </Text>
            <CodeBlock language="text" code={SHAPES} />
            <Text>
              Calls are idempotent: filling the same text twice, or checking a box that
              is already checked, succeeds and changes nothing. And every result
              describes the component's state after the change, so a drive of the whole
              form is writes with no reads between them.
            </Text>
            <Text tone="muted" size="small">
              The values are the words on screen. <code>select</code> takes the visible
              option label from an enum of what is currently on offer, never the value
              behind it. Checkbox and Switch split by when the change takes effect: a
              box is form data submitted later, a switch acts the moment it flips and
              takes <code>{"{ on }"}</code> instead of <code>{"{ checked }"}</code>.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Typing needs no WebMCP">
          <Stack gap="tight">
            <Text>
              In agent view an actionable component renders a control. For a text field
              that control cannot be a button, because there is nothing to type into, so
              a field renders its Markdown lines followed by one live input, labelled
              and synced to the component's value. A DOM-driving agent targets{" "}
              <code>[data-sprint-tool="crew-fill-callsign"]</code> and types.
            </Text>
            <Text tone="muted" size="small">
              An input's value is not part of the page's text content, so the copyable
              agent stream stays exactly the node's own lines. And typing does not churn
              registration: a keystroke updates the value attribute and the agent line,
              but the fill tool's name, spec, and schema carry no value, so nothing
              re-registers.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Validation reaches every surface">
          <Stack gap="tight">
            <Text>
              The <code>error</code> prop is how a form says something is wrong. It
              replaces the hint, marks the field invalid for people and screen readers,
              surfaces in the agent line, and reads back through the fill tool's result,
              so an agent that submits bad input finds out in the same call.
            </Text>
            <AgentPreview pageView={pageView}>
              <ErrorField />
            </AgentPreview>
            <CodeBlock code={ERROR} />
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Secrets stay off the agent surface">
          <Stack gap="tight">
            <Text>
              A password field never reflects its value anywhere an agent reads: not in
              the state attributes, not in the agent line, not in tool results. State
              says <code>filled</code> or <code>empty</code> and nothing else. The fill
              tool still works; it is write-only.
            </Text>
            <AgentPreview pageView={pageView}>
              <PasswordField />
            </AgentPreview>
            <CodeBlock code={PASSWORD} />
            <Text tone="muted" size="small">
              Flip the preview to agent view and type into the field: the line tracks
              filled and empty, and the text itself appears nowhere. There is no prop
              that opts a password back into reflection.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="The submit button carries the lifecycle">
          <Stack gap="tight">
            <Text>
              One primary action per form: <code>tone="action"</code> with{" "}
              <code>block</code>, the view's single acid bar. Its label is a verb phrase
              because the label derives the tool name. While the request is in flight,
              set <code>loading</code>; the press tool unregisters, so an agent cannot
              double-submit for the same reason a person cannot press a disabled button.
            </Text>
            <CodeBlock code={LIFECYCLE} />
            <Text tone="muted" size="small">
              The same holds for a form that is not yet valid: a disabled submit has no
              tool, which beats a tool that exists and fails.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="What the form reads as">
          <CodeBlock language="text" code={AGENT} />
        </Panel>
      </Stack>
    </article>
  );
}
