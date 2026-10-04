import { defineAgentMeta } from "@/agent/registry.ts";
import { FILL_TOOL } from "./tool.ts";

export const textInputMeta = defineAgentMeta({
  name: "TextInput",
  category: "input",
  summary:
    "A single-line text field carrying its own label, hint, and error. Fully controlled, and it registers one fill tool that replaces the field's text with an explicit value.",
  whenToUse:
    "Use it for any free-form single-line value: a name, an email address, a search term. The label is part of the component, so a form never needs a separate label element, and the error prop is how validation reaches both a person and an agent.",
  whenNotToUse:
    "Do not use it for multi-line text, which is a Textarea. Do not use it to pick from a known set of values; that is a Select or a SegmentedControl. Do not use it for an on/off state, which is a Checkbox or a Switch. Do not use a read-only TextInput to hand someone a value to paste elsewhere; that is a CopyField.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the field holds. Names the field for a screen reader and derives the tool name, so prefer a noun phrase such as "Callsign".',
      required: true,
    },
    value: {
      kind: "string",
      description: "The field's current text. The field is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the new text on every change. The fill tool drives a real input event, so this runs for agent fills too.",
      required: true,
    },
    type: {
      kind: "enum",
      description:
        'The input type. "password" masks the field everywhere: the value never appears in agent attributes, the agent view, or tool results. "number" keeps value a string, so the page parses it; pass min, max and step through inputProps.',
      values: ["text", "email", "url", "search", "password", "number", "tel"],
      default: "text",
    },
    placeholder: {
      kind: "string",
      description: "Ghost text shown while the field is empty.",
    },
    hint: {
      kind: "string",
      description:
        "Guidance shown under the field and carried into the agent view. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description:
        "A validation message. Marks the field invalid for people, screen readers, and agents alike.",
    },
    name: {
      kind: "string",
      description: "The native form name submitted with the surrounding form.",
    },
    autoComplete: {
      kind: "string",
      description: "The native autocomplete hint, forwarded to the input.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the field and unregister its fill tool.",
      default: false,
    },
    readOnly: {
      kind: "boolean",
      description:
        "Show the value without letting anyone change it. The field stays focusable and selectable, renders as plain text in the agent view, and registers no fill tool, because nothing can change it.",
      default: false,
    },
    required: {
      kind: "boolean",
      description: "Mark the field required, visually and in the agent view.",
      default: false,
    },
    hideLabel: {
      kind: "boolean",
      description:
        "Hide the label visually while keeping it as the field's accessible name and agent label. Pair it with a placeholder or a nearby heading so sighted people still know what the field is for.",
      default: false,
    },
    icon: {
      kind: "node",
      description:
        "A decorative icon drawn inside the start of the field, such as a magnifier on a search box. Hidden from assistive technology.",
    },
    trailing: {
      kind: "node",
      description:
        'Controls drawn inside the end of the field, such as a clear Button with hideLabel and size="small". It renders only in the human view; give an agent the same action some other way, or rely on the fill tool, which can set the field to empty.',
    },
    inputRef: {
      kind: "object",
      description:
        "A ref to the underlying <input>, for focusing or measuring it. The component's own ref points at the wrapper.",
    },
    inputProps: {
      kind: "object",
      description:
        "Extra native attributes and handlers for the <input> itself, such as autoFocus, maxLength, inputMode, onKeyDown, or onBlur. Props spread on the component land on the wrapper; these land on the field. Anything the component manages (value, onChange, disabled, the error wiring) cannot be overridden here.",
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two fields on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the field without registering a fill tool.",
      default: true,
    },
  },
  state: {
    value: {
      description:
        "The field's current text. Never present on a password field, which reflects filled instead.",
      attribute: "data-sprint-value",
    },
    filled: {
      description: "Present when a password field holds text.",
      attribute: "data-sprint-filled",
    },
    empty: {
      description: "Present while the field holds no text.",
      attribute: "data-sprint-empty",
    },
    disabled: {
      description: "Present when the field cannot be edited.",
      attribute: "data-sprint-disabled",
    },
    readonly: {
      description:
        "Present when the field shows a value that cannot be changed. No fill tool is registered while it is set.",
      attribute: "data-sprint-readonly",
    },
    required: {
      description: "Present when the field must be filled.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
  },
  tools: {
    fill: FILL_TOOL,
  },
  agentView: {
    example:
      '- **TextInput** "Callsign" [empty, required] → tool `fill-callsign`\n  - part `hint` "Uppercase, three to eight letters"',
  },
  examples: [
    {
      title: "A labelled field",
      description:
        "Label, hint, and control are one component. In agent view the hint becomes a part line and the field renders a live input an agent can type into.",
      code: '<TextInput\n  label="Callsign"\n  value={callsign}\n  onChange={setCallsign}\n  hint="Uppercase, three to eight letters"\n  placeholder="NOMAD"\n/>',
    },
    {
      title: "A validation error",
      description:
        "The error replaces the hint, marks the field invalid on every surface, and reads back through the fill tool's result.",
      code: '<TextInput\n  label="Frequency"\n  value={frequency}\n  onChange={setFrequency}\n  required\n  error="Out of band. Use 118.000 to 136.975."\n/>',
    },
    {
      title: "A password",
      description:
        "The value stays off every agent surface: state reflects filled or empty, and tool results never echo the text.",
      code: '<TextInput\n  label="Access code"\n  type="password"\n  value={code}\n  onChange={setCode}\n  autoComplete="current-password"\n/>',
    },
    {
      title: "A read-only value",
      description:
        "A value shown in the shape of a form field that nobody may edit. It stays focusable and selectable, reads as text in the agent view, and registers no fill tool. To hand someone a value to paste elsewhere, a CopyField adds the copy control.",
      code: '<TextInput\n  label="Station ID"\n  value="KX-2209-ALPHA"\n  onChange={() => {}}\n  readOnly\n  hint="Assigned at registration"\n/>',
    },
    {
      title: "A number with field attributes",
      description:
        'type="number" keeps value a string. Native attributes for the input itself, such as min, max and autoFocus, go through inputProps, and inputRef reaches the input for focusing it later.',
      code: '<TextInput\n  label="Link expiry in days"\n  type="number"\n  value={days}\n  onChange={setDays}\n  inputRef={daysField}\n  inputProps={{ min: 1, max: 90, step: 1 }}\n/>',
    },
    {
      title: "A search field with a clear control",
      description:
        "The icon sits inside the start of the field and a small icon-only Button clears it from the end. An agent clears it by filling an empty string.",
      code: '<TextInput\n  label="Filter the board"\n  hideLabel\n  placeholder="Filter by name or calling"\n  icon={<SearchIcon />}\n  value={query}\n  onChange={setQuery}\n  trailing={\n    query === "" ? null : (\n      <Button size="small" icon={<CloseIcon />} hideLabel onClick={() => setQuery("")}>\n        Clear filter\n      </Button>\n    )\n  }\n/>',
    },
  ],
  a11y: {
    role: "textbox",
    keyboard: ["Standard text editing", "Tab moves through the field"],
    notes:
      "The label element is associated via htmlFor. An error sets aria-invalid and is linked with aria-describedby, as is the hint. Focus is an offset keyline, never a rounded ring.",
  },
});
