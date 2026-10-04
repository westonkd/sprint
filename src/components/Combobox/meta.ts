import { defineAgentMeta } from "@/agent/registry.ts";
import { CHOOSE_COMBOBOX_TOOL } from "./tool.ts";

export const comboboxMeta = defineAgentMeta({
  name: "Combobox",
  category: "input",
  summary:
    "A searchable single-choice field for long lists: type to filter, arrow to an option, Enter to pick. Options can be grouped, described, limited per group and rendered your own way. Registers one choose tool that takes a label or a search.",
  whenToUse:
    "Use when there are too many options to scan: a member picker over hundreds of people, a calling picker grouped by organization, a board filter. Options hold data: { value, label, group?, description?, keywords?, disabled? }. The default filter matches every word of the query against the label, description and keywords, ignoring case and accents. For a server-side search, pass filter={false}, update options from onQueryChange, and set loading while results arrive.",
  whenNotToUse:
    "Do not use for a short list a person can scan at once; that is a Select, or a SegmentedControl for two to four options. Do not use for free text that only suggests; this field only accepts its options. Do not use for choosing several values.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What is being chosen, such as "Member". Names the field and derives the tool name.',
      required: true,
    },
    options: {
      kind: "array",
      description:
        "The options: { value, label, group?, description?, keywords?, disabled? }. Consecutive and non-consecutive options sharing a group are gathered under one heading, in the order groups first appear. keywords are extra search terms that are never shown.",
      required: true,
    },
    value: {
      kind: "string",
      description:
        "The chosen option's value, or an empty string for none. Fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description: "Called with the chosen value, or an empty string when cleared.",
      required: true,
    },
    placeholder: {
      kind: "string",
      description: "Ghost text while nothing is chosen or while searching.",
    },
    hint: {
      kind: "string",
      description: "Guidance under the field. Replaced by error while one is set.",
    },
    error: {
      kind: "string",
      description: "A validation message that marks the field invalid.",
    },
    name: {
      kind: "string",
      description: "The native form name the chosen value submits under.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the field and unregister the choose tool.",
      default: false,
    },
    required: {
      kind: "boolean",
      description:
        "Mark the field required. A required field is not clearable by default.",
      default: false,
    },
    hideLabel: {
      kind: "boolean",
      description:
        "Hide the label visually while keeping it for screen readers and agents. Pair it with a placeholder.",
      default: false,
    },
    clearable: {
      kind: "boolean",
      description:
        "Show a clear control while something is chosen. Defaults to not required.",
    },
    clearLabel: {
      kind: "string",
      description: "Accessible name of the clear control.",
      default: "Clear",
    },
    loading: {
      kind: "boolean",
      description: "Show a small spinner in the field while options are being fetched.",
      default: false,
    },
    filter: {
      kind: "handler",
      description:
        "(option, query) => boolean, replacing the built-in word match. Pass false when the options are already the results of a search the page ran.",
    },
    onQueryChange: {
      kind: "handler",
      description:
        "Called with the search text as it changes, and with an empty string on close.",
    },
    groupLimit: {
      kind: "number",
      description:
        'Show at most this many options per group, with a "more; keep typing" note for the rest, so one large group cannot bury the others.',
    },
    limit: {
      kind: "number",
      description: "Show at most this many options in total.",
      default: 200,
    },
    emptyLabel: {
      kind: "string",
      description: "What the list says when nothing matches.",
      default: "No matches",
    },
    renderOption: {
      kind: "handler",
      description:
        "(option) => ReactNode, drawing an option your own way, such as with an Avatar. It is the human rendering only: the label is still what is searched, announced and offered to agents.",
    },
    inputRef: {
      kind: "object",
      description: "A ref to the underlying input, for focusing it.",
    },
    agentName: {
      kind: "string",
      description: "Override the label used to derive the tool name.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the field without registering the choose tool.",
      default: true,
    },
  },
  state: {
    value: {
      description: "The chosen option's label.",
      attribute: "data-sprint-value",
    },
    empty: {
      description: "Present while nothing is chosen.",
      attribute: "data-sprint-empty",
    },
    options: {
      description: "How many options the field holds.",
      attribute: "data-sprint-options",
    },
    loading: {
      description: "Present while options are being fetched.",
      attribute: "data-sprint-loading",
    },
    disabled: {
      description: "Present when the field cannot be changed.",
      attribute: "data-sprint-disabled",
    },
    required: {
      description: "Present when a choice is needed.",
      attribute: "data-sprint-required",
    },
    invalid: {
      description: "Present while an error is set.",
      attribute: "data-sprint-invalid",
    },
  },
  tools: {
    choose: CHOOSE_COMBOBOX_TOOL,
  },
  agentView: {
    example:
      '- **Combobox** "Member" [empty, options=312, listed=50] → tool `choose-member`\n  - part `option` "Ada Okafor" [group=Elders quorum]',
  },
  examples: [
    {
      title: "A grouped member picker",
      description:
        "Hundreds of members grouped by organization, at most five per group until the person types. An agent passes a name, or part of one, to the choose tool.",
      code: '<Combobox\n  label="Member"\n  placeholder="Search members"\n  value={memberId}\n  onChange={setMemberId}\n  groupLimit={5}\n  options={members.map((member) => ({\n    value: member.id,\n    label: member.name,\n    group: member.organization,\n    keywords: [member.preferredName],\n  }))}\n/>',
    },
    {
      title: "Options drawn your own way",
      description:
        "renderOption draws each option with an avatar; the label still drives search, announcement and the agent view.",
      code: '<Combobox\n  label="Speaker"\n  value={speaker}\n  onChange={setSpeaker}\n  options={members}\n  renderOption={(option) => (\n    <Stack direction="row" gap="snug" align="center">\n      <Avatar name={option.label} size="small" decorative />\n      <Text as="span">{option.label}</Text>\n    </Stack>\n  )}\n/>',
    },
    {
      title: "A server-side search",
      description:
        "filter={false} trusts the options as given; the page searches on each onQueryChange and shows the spinner meanwhile.",
      code: '<Combobox\n  label="Calling"\n  value={calling}\n  onChange={setCalling}\n  filter={false}\n  onQueryChange={search}\n  loading={searching}\n  options={results}\n  error={calling === "" ? "Choose a calling." : undefined}\n  required\n/>',
    },
  ],
  a11y: {
    role: "combobox",
    keyboard: [
      "Typing filters and opens the list",
      "Down and Up Arrow open the list and move between enabled options",
      "Ctrl+Home and Ctrl+End jump to the first and last option",
      "Enter chooses the highlighted option",
      "Escape closes the list and restores the chosen label",
    ],
    notes:
      "An editable combobox with list autocomplete. Focus stays in the input and aria-activedescendant follows the highlighted option. Groups are labelled role=group sections. The list is a popover in the top layer, rendered in place, so it opens above a modal Dialog and flips above the field when there is no room below.",
  },
});
