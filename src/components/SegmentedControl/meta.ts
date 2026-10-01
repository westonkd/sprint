import { defineAgentMeta } from "@/agent/registry.ts";
import { SELECT_TOOL } from "./tool.ts";

export const segmentedControlMeta = defineAgentMeta({
  name: "SegmentedControl",
  category: "input",
  summary:
    "A short row of mutually exclusive options, all visible at once: a radio group that registers a single select tool whose schema enumerates the options currently on screen.",
  whenToUse:
    "Use it for two to four exclusive choices a person should be able to compare without opening anything: a view switch, a density setting, a filter. One tool with an enum beats one tool per option, and it keeps a page's tool count flat as options are added.",
  whenNotToUse:
    "Do not use it for more than about four options or for long labels; that is a select. Do not use it for an on/off setting, which is a switch, and never for navigation.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What is being chosen. Names the group for a screen reader and derives the tool name, so prefer a noun phrase such as "Page view".',
      required: true,
    },
    options: {
      kind: "array",
      description:
        "The choices in display order: { value, label, count? }. The label is what a person sees and what the select tool accepts, so an agent never has to know the value. count renders as a muted chip beside the label and reaches the agent view as part state, so never fold a count into the label.",
      required: true,
    },
    value: {
      kind: "string",
      description: "The value of the selected option. The control is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the newly selected value. The select tool drives a real click, so this runs for agent selections too.",
      required: true,
    },
    savedValue: {
      kind: "string",
      description:
        "The value currently in effect, for a control that stages a change until something confirms it. While it differs from value the saved option keeps a marker and the control reports itself dirty, so both the saved and the proposed choice stay readable.",
    },
    hint: {
      kind: "string",
      description:
        "Guidance shown under the options, linked with aria-describedby and carried into the agent view. Say what a staged change does, such as when it takes effect.",
    },
    block: {
      kind: "boolean",
      description:
        "Fill the container's width, with every option taking an equal share. Without it the control stays as wide as its options, even inside a stretching column.",
      default: false,
    },
    disabled: {
      kind: "boolean",
      description: "Disable every option and unregister the select tool.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two controls on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the control without registering a select tool.",
      default: true,
    },
  },
  state: {
    value: {
      description: "The value of the option currently selected.",
      attribute: "data-sprint-value",
    },
    dirty: {
      description:
        "Present while savedValue is set and differs from value. The saved option carries data-sprint-saved.",
      attribute: "data-sprint-dirty",
    },
    block: {
      description: "Present when the control fills its container.",
      attribute: "data-sprint-block",
    },
    disabled: {
      description: "Present when no option can be chosen.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    select: SELECT_TOOL,
  },
  agentView: {
    example:
      '- **SegmentedControl** "Access" [dirty, value=write] → tool `select-access`\n  - part `option` "Read" [count=17, saved]\n  - part `option` "Write" [checked, count=4]\n  - part `hint` "Currently Read. Nothing changes until you confirm."',
  },
  examples: [
    {
      title: "A view switch",
      description:
        "In agent view each option renders as its own control, so an agent driving the DOM can click one without WebMCP.",
      code: '<SegmentedControl\n  label="Page view"\n  value={view}\n  onChange={setView}\n  options={[\n    { value: "human", label: "human" },\n    { value: "agent", label: "agent" },\n  ]}\n/>',
    },
    {
      title: "Options with counts",
      description:
        "A count is data, not label text: it renders as a chip, joins the accessible name, and reaches agents as part state while the select tool still takes the plain label.",
      code: '<SegmentedControl\n  label="Members"\n  value={filter}\n  onChange={setFilter}\n  options={[\n    { value: "all", label: "All", count: 48 },\n    { value: "active", label: "Active", count: 18 },\n    { value: "never", label: "Never signed in", count: 30 },\n  ]}\n/>',
    },
    {
      title: "A staged change",
      description:
        "savedValue keeps the value in effect visible while another is selected, and hint says what confirming will do. The control reports itself dirty until the two agree.",
      code: '<SegmentedControl\n  label="Access"\n  value={access}\n  savedValue="read"\n  onChange={setAccess}\n  hint="Currently Read. Nothing changes until you confirm."\n  options={[\n    { value: "read", label: "Read" },\n    { value: "write", label: "Write" },\n    { value: "admin", label: "Admin" },\n  ]}\n/>',
    },
    {
      title: "A full-width control",
      description:
        "block fills the container and shares the width equally between options. Without it the control keeps its own width inside a stretching Stack.",
      code: '<SegmentedControl\n  label="Range"\n  block\n  value={range}\n  onChange={setRange}\n  options={[\n    { value: "day", label: "Day" },\n    { value: "week", label: "Week" },\n    { value: "month", label: "Month" },\n  ]}\n/>',
    },
    {
      title: "A disabled control",
      description:
        "Disabled unregisters the tool, so an agent cannot select an option a person could not.",
      code: '<SegmentedControl\n  label="Density"\n  disabled\n  value="dense"\n  onChange={setDensity}\n  options={[\n    { value: "dense", label: "dense" },\n    { value: "roomy", label: "roomy" },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "radiogroup",
    keyboard: [
      "Arrow keys move to the next or previous option and select it",
      "Home selects the first option",
      "End selects the last option",
      "Tab enters and leaves the group once",
    ],
    notes:
      "Roving tabindex: only the selected option is in the tab order. Selection follows focus, which is the expected behaviour for a radio group. An option with a count is named by its label and its count together; the hint is linked to the group with aria-describedby.",
  },
});
