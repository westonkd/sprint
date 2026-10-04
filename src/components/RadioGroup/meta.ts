import { defineAgentMeta } from "@/agent/registry.ts";
import { SELECT_RADIO_TOOL } from "./tool.ts";

export const radioGroupMeta = defineAgentMeta({
  name: "RadioGroup",
  category: "input",
  summary:
    "One choice from a short list of options, each a native radio button with a label and an optional line of description. Registers one select tool enumerating the options.",
  whenToUse:
    "Use when the options need explaining: a role with what it can do, a plan with what it includes, a delivery speed with its cost. Options hold data: { value, label, description?, disabled? }. The group is a fieldset whose legend is the label, so it submits under one name inside a form.",
  whenNotToUse:
    "Do not use for two to four short labels that need no description; that is a SegmentedControl. Do not use for a long list; that is a Select. Do not use for choosing several; that is a set of Checkboxes. Descriptions are plain strings, not components.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'The question the options answer, such as "Role". Rendered as the legend and used to derive the tool name.',
      required: true,
    },
    options: {
      kind: "array",
      description:
        "The options in order: { value, label, description?, disabled? }. label is what a person reads and what the select tool accepts. description is a sentence under the label, linked to its radio with aria-describedby and carried into the agent view as part state.",
      required: true,
    },
    value: {
      kind: "string",
      description:
        "The selected option's value, or an empty string for none. Fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description: "Called with the value a person or an agent selects.",
      required: true,
    },
    hint: {
      kind: "string",
      description: "Guidance under the group. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description: "A validation message that marks the group invalid.",
    },
    name: {
      kind: "string",
      description: "The native form name the selected value submits under.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable every option and unregister the select tool.",
      default: false,
    },
    required: {
      kind: "boolean",
      description: "Mark the group as needing an answer.",
      default: false,
    },
    agentName: {
      kind: "string",
      description: "Override the label used to derive the tool name.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the group without registering the select tool.",
      default: true,
    },
  },
  state: {
    value: {
      description: "The selected option's label.",
      attribute: "data-sprint-value",
    },
    empty: {
      description: "Present while nothing is selected.",
      attribute: "data-sprint-empty",
    },
    disabled: {
      description: "Present when the group cannot be changed.",
      attribute: "data-sprint-disabled",
    },
    required: {
      description: "Present when an answer is needed.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
  },
  tools: {
    select: SELECT_RADIO_TOOL,
  },
  agentView: {
    example:
      '- **RadioGroup** "Role" [value=Viewer] → tool `select-role`\n  - part `option` "Viewer" [checked, description=Sees the board]\n  - part `option` "Editor" [description=Changes callings]',
  },
  examples: [
    {
      title: "Options that need explaining",
      description:
        "Each role says what it allows. The descriptions reach screen readers through aria-describedby and agents through part state.",
      code: '<RadioGroup\n  label="Role"\n  value={role}\n  onChange={setRole}\n  options={[\n    { value: "viewer", label: "Viewer", description: "Sees the board and the agenda." },\n    { value: "editor", label: "Editor", description: "Moves people between callings." },\n    { value: "admin", label: "Admin", description: "Also invites and removes people." },\n  ]}\n/>',
    },
    {
      title: "A required choice with an unavailable option",
      code: '<RadioGroup\n  label="Delivery"\n  required\n  value={delivery}\n  onChange={setDelivery}\n  error={delivery === "" ? "Choose how to send the invite." : undefined}\n  options={[\n    { value: "email", label: "Email" },\n    { value: "text", label: "Text message", disabled: true, description: "No phone number on file." },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "radiogroup",
    keyboard: [
      "Arrow keys move between options and select",
      "Tab enters and leaves the group",
    ],
    notes:
      "A fieldset of native radio inputs sharing one name, so the browser supplies arrow-key movement and form submission. The legend names the group; a description is linked to its own radio.",
  },
});
