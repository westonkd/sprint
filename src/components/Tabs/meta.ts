import { defineAgentMeta } from "@/agent/registry.ts";
import { SELECT_TAB_TOOL } from "./tool.ts";

export const tabsMeta = defineAgentMeta({
  name: "Tabs",
  category: "navigation",
  summary:
    "Sibling views of one subject, one shown at a time, with real tablist, tab and tabpanel semantics. Registers one select tool enumerating the tabs.",
  whenToUse:
    "Use to switch between a few views of the same thing without leaving the page: coming up, past and by member for one set of speakers; details and history for one record. Tabs hold data: each is { value, label, panel, count?, disabled? }, and only the selected tab's panel is mounted. An optional actions slot sits at the end of the tab row.",
  whenNotToUse:
    "Do not use to pick a value that filters or changes something else on the page; that is a SegmentedControl, a radio group. Do not use for navigation between pages with their own URLs; that is a Nav. Do not use when a person needs to compare the views side by side.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the tabs switch between, such as "Speakers". Names the tablist and derives the select tool name.',
      required: true,
    },
    tabs: {
      kind: "array",
      description:
        "The tabs in order: { value, label, panel, count?, disabled? }. panel is the content shown while the tab is selected and may hold any components. count renders as a chip beside the label and reaches the agent view as part state.",
      required: true,
    },
    value: {
      kind: "string",
      description:
        "The selected tab's value, when the page owns that state. Pair it with onChange. A disabled or unknown value falls back to the first enabled tab.",
    },
    defaultValue: {
      kind: "string",
      description: "The tab selected first when the Tabs keep their own state.",
    },
    onChange: {
      kind: "handler",
      description: "Called with the value of the tab a person or an agent selects.",
    },
    actions: {
      kind: "node",
      description:
        "Controls at the end of the tab row, such as an add Button that applies to every tab.",
    },
    agentName: {
      kind: "string",
      description: "Override the label used to derive the tool name.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the tabs without registering the select tool.",
      default: true,
    },
  },
  state: {
    value: {
      description: "The selected tab's label.",
      attribute: "data-sprint-value",
    },
  },
  tools: {
    select: SELECT_TAB_TOOL,
  },
  agentView: {
    example:
      '- **Tabs** "Speakers" [value=Coming up] → tool `select-speakers`\n  - part `tab` "Coming up" [count=4, selected]\n  - part `tab` "Past"',
  },
  examples: [
    {
      title: "Views of one subject",
      description:
        "Only the selected panel is on the page. An agent switches with the select tool or the tab controls in the agent view, then reads the new panel.",
      code: '<Tabs\n  label="Speakers"\n  tabs={[\n    { value: "upcoming", label: "Coming up", count: 4, panel: <UpcomingSpeakers /> },\n    { value: "past", label: "Past", panel: <PastSpeakers /> },\n    { value: "member", label: "By member", panel: <SpeakersByMember /> },\n  ]}\n/>',
    },
    {
      title: "Tabs with an action",
      description:
        "actions sits at the end of the tab row and stays put while the panels change. A disabled tab is visible but cannot be selected.",
      code: '<Tabs\n  label="Record"\n  value={view}\n  onChange={setView}\n  actions={<Button size="small">Export</Button>}\n  tabs={[\n    { value: "details", label: "Details", panel: <Details /> },\n    { value: "history", label: "History", panel: <History /> },\n    { value: "audit", label: "Audit", disabled: true, panel: null },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "tablist",
    keyboard: [
      "Left and Right Arrow move to the previous or next enabled tab and show it",
      "Home and End show the first and last enabled tab",
      "Tab moves from the selected tab into its panel",
    ],
    notes:
      "Roving tabindex across the tabs, with selection following focus. The panel is a focusable tabpanel labelled by its tab. A count chip is hidden from assistive technology, so the tab is named by its label alone.",
  },
});
