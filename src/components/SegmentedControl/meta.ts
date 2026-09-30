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
        "The choices in display order: { value, label }. The label is what a person sees and what the select tool accepts, so an agent never has to know the value.",
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
    saved: {
      kind: "string",
      description:
        "The value currently in effect, when value is a staged change that has not been confirmed. The saved option is marked, and the control reports changed while the two differ.",
    },
    hint: {
      kind: "string",
      description:
        "Helper text under the options, such as what happens on confirm. It describes the group for a screen reader and is carried as a hint part.",
    },
    block: {
      kind: "boolean",
      description:
        "Fill the container width, sharing it equally between the options. Without it the track is only as wide as its options, even inside a stretching column.",
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
    changed: {
      description:
        "Present when a saved value is given and the selection differs from it.",
      attribute: "data-sprint-changed",
    },
    block: {
      description: "Present when the track fills its container.",
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
      '- **SegmentedControl** "Page view" [value=human] → tool `select-page-view`\n  - part `option` "human" [checked]\n  - part `option` "agent"',
  },
  examples: [
    {
      title: "A view switch",
      description:
        "In agent view each option renders as its own control, so an agent driving the DOM can click one without WebMCP.",
      code: '<SegmentedControl\n  label="Page view"\n  value={view}\n  onChange={setView}\n  options={[\n    { value: "human", label: "human" },\n    { value: "agent", label: "agent" },\n  ]}\n/>',
    },
    {
      title: "A disabled control",
      description:
        "Disabled unregisters the tool, so an agent cannot select an option a person could not.",
      code: '<SegmentedControl\n  label="Density"\n  disabled\n  value="dense"\n  onChange={setDensity}\n  options={[\n    { value: "dense", label: "dense" },\n    { value: "roomy", label: "roomy" },\n  ]}\n/>',
    },
    {
      title: "A staged change",
      description:
        "saved keeps the value in effect visible while a new one is selected, and the hint says when it applies. The control reports changed until the two agree.",
      code: '<SegmentedControl\n  label="Access"\n  saved="write"\n  value={access}\n  onChange={setAccess}\n  hint="Nothing changes until you confirm."\n  options={[\n    { value: "read", label: "Read" },\n    { value: "write", label: "Write" },\n    { value: "maintain", label: "Maintain" },\n  ]}\n/>',
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
      "The radio group is the track inside the root, described by the hint when there is one. Roving tabindex: only the selected option is in the tab order. Selection follows focus, which is the expected behaviour for a radio group.",
  },
});
