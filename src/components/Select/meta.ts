import { defineAgentMeta } from "@/agent/registry.ts";
import { SELECT_OPTION_TOOL } from "./tool.ts";

export const selectMeta = defineAgentMeta({
  name: "Select",
  category: "input",
  summary:
    "A dropdown of mutually exclusive options: a select-only combobox that opens a listbox on click or keyboard, carrying its own label, hint, and error. It registers a single select tool whose schema enumerates the option labels currently on offer.",
  whenToUse:
    "Use it when one value is chosen from a list too long to lay out flat: a region, a squad, a category. Options are data ({ value, label }), the tool accepts the visible label, and in agent view every option renders as its own control, so an agent picks one without opening anything.",
  whenNotToUse:
    "Do not use it for two to four short options a person should compare at a glance; that is a SegmentedControl. Do not use it for an on/off state, which is a Checkbox or a Switch, and never for navigation.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What is being chosen. Names the control for a screen reader and derives the tool name, so prefer a noun phrase such as "Region".',
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
      description:
        'The value of the chosen option, or "" while nothing is chosen yet. The control is fully controlled.',
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the newly chosen value. The select tool clicks the real option, so this runs for agent selections too.",
      required: true,
    },
    placeholder: {
      kind: "string",
      description:
        'Shown in the closed control while value is "". It is not an option, so a person cannot choose it back.',
    },
    hint: {
      kind: "string",
      description:
        "Guidance shown under the control and carried into the agent view. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description:
        "A validation message. Marks the control invalid for people, screen readers, and agents alike.",
    },
    name: {
      kind: "string",
      description:
        "The form name submitted with the surrounding form, through a hidden input carrying the value.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the control and unregister its select tool.",
      default: false,
    },
    required: {
      kind: "boolean",
      description: "Mark the control required, visually and in the agent view.",
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
      description: "The value of the option currently chosen.",
      attribute: "data-sprint-value",
    },
    empty: {
      description: "Present while no option is chosen.",
      attribute: "data-sprint-empty",
    },
    disabled: {
      description: "Present when nothing can be chosen.",
      attribute: "data-sprint-disabled",
    },
    required: {
      description: "Present when a choice must be made.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
    active: {
      description:
        "On an option part, present while the list is open and that option is highlighted by the keyboard or pointer.",
      attribute: "data-sprint-active",
    },
  },
  tools: {
    select: SELECT_OPTION_TOOL,
  },
  agentView: {
    example:
      '- **Select** "Region" [value=eu-1] → tool `select-region`\n  - part `option` "North Atlantic" [count=12]\n  - part `option` "Northern Europe" [checked, count=30]\n  - part `option` "East Asia" [count=7]',
  },
  examples: [
    {
      title: "A dropdown",
      description:
        "In agent view each option renders as its own control, so a DOM-driving agent chooses one directly.",
      code: '<Select\n  label="Region"\n  value={region}\n  onChange={setRegion}\n  placeholder="Choose a region"\n  options={[\n    { value: "na-1", label: "North Atlantic" },\n    { value: "eu-1", label: "Northern Europe" },\n    { value: "ap-1", label: "East Asia" },\n  ]}\n/>',
    },
    {
      title: "Options with counts",
      description:
        "A count is data, not label text: it renders as a chip in the list and the closed control, joins the accessible name, and reaches agents as part state while the select tool still takes the plain label.",
      code: '<Select\n  label="Region"\n  value={region}\n  onChange={setRegion}\n  placeholder="Choose a region"\n  options={[\n    { value: "na-1", label: "North Atlantic", count: 12 },\n    { value: "eu-1", label: "Northern Europe", count: 30 },\n    { value: "ap-1", label: "East Asia", count: 7 },\n  ]}\n/>',
    },
    {
      title: "A required choice with an error",
      description:
        "Empty plus required plus an error is how an unmade mandatory choice reads on every surface.",
      code: '<Select\n  label="Launch site"\n  value={site}\n  onChange={setSite}\n  required\n  error="Choose a site before continuing."\n  options={[\n    { value: "ksc", label: "Cape Canaveral" },\n    { value: "vsfb", label: "Vandenberg" },\n  ]}\n/>',
    },
    {
      title: "A disabled dropdown",
      description:
        "Disabled unregisters the tool, so an agent cannot choose what a person could not.",
      code: '<Select\n  label="Relay"\n  disabled\n  value="r-2"\n  onChange={setRelay}\n  options={[\n    { value: "r-1", label: "Relay one" },\n    { value: "r-2", label: "Relay two" },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "combobox",
    keyboard: [
      "Enter, Space, or an arrow key opens the list",
      "Arrow keys, Home, and End move through the options; typing a letter jumps to the next match",
      "Enter or Space chooses the highlighted option",
      "Escape or Tab closes the list without choosing",
    ],
    notes:
      "A select-only combobox: a button with role combobox that opens a listbox on a plain click, so a synthetic element.click() opens it as reliably as a pointer does, and the list renders in the page rather than in browser chrome an automated session cannot see. Focus stays on the button and aria-activedescendant tracks the highlighted option. The label is linked with aria-labelledby; errors set aria-invalid and link with aria-describedby. An option with a count is named by its label and count together.",
  },
});
