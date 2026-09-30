import { defineAgentMeta } from "@/agent/registry.ts";

export const listMeta = defineAgentMeta({
  name: "List",
  category: "display",
  summary:
    "A bulleted or numbered list built from an array of items. Each item is an addressable part carrying its position, so an agent can cite item three without counting lines.",
  whenToUse:
    "Use it for a short sequence of related points: rules, steps, links, caveats. Passing items as data rather than as children is what lets the agent view carry each one as its own part.",
  whenNotToUse:
    "Do not use it for records with fields; that is Table. Do not use it as a layout for cards or controls; that is Stack.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What the list is a list of. Names it for a screen reader and for the agent view.",
      required: true,
    },
    items: {
      kind: "array",
      description:
        "The items in order. Inline content, not components: each is flattened to text for the agent view.",
      required: true,
    },
    ordered: {
      kind: "boolean",
      description:
        "Number the items instead of bulleting them. Use it when the order is the point.",
      default: false,
    },
    marker: {
      kind: "enum",
      description:
        'The bullet for an unordered list. "plus" for gains and plain points, "minus" for losses or removals, drawn in the danger ink, "dot" for a neutral bullet, "none" for no marker. Ignored when ordered.',
      values: ["plus", "minus", "dot", "none"],
      default: "plus",
    },
    emptyLabel: {
      kind: "string",
      description: "What the list says when it has no items.",
      default: "Empty",
    },
  },
  state: {
    items: {
      description: "How many items the list has.",
      attribute: "data-sprint-items",
    },
    ordered: {
      description: "Present when the items are numbered rather than bulleted.",
      attribute: "data-sprint-ordered",
    },
    marker: {
      description:
        "The bullet in use, when it is not the default plus. A minus marks every item as a loss.",
      attribute: "data-sprint-marker",
      values: ["minus", "dot", "none"],
    },
    empty: {
      description: "Present when the list has no items.",
      attribute: "data-sprint-empty",
    },
    index: {
      description: "On an item: its 1-based position in the list.",
      attribute: "data-sprint-index",
    },
  },
  agentView: {
    example:
      '- **List** "Tool rules" [items=1]\n  - part `item` "One tool, one action." [index=1]',
  },
  examples: [
    {
      title: "A list of rules",
      code: '<List\n  label="Tool rules"\n  items={[\n    <>\n      <strong>One tool, one action.</strong> Overlapping tools make selection\n      harder.\n    </>,\n  ]}\n/>',
    },
    {
      title: "A list of losses",
      description:
        "The minus marker says every item is being taken away, and the agent view carries it as marker=minus.",
      code: '<List\n  marker="minus"\n  label="Access removed"\n  items={["Delete the repository.", "Manage webhooks."]}\n/>',
    },
    {
      title: "A numbered sequence",
      code: '<List\n  ordered\n  label="Steps"\n  items={["Register the tool.", "Drive the DOM.", "Return the new state."]}\n/>',
    },
  ],
  a11y: {
    role: "list",
    notes:
      "A real ul or ol named by its label, with an explicit list role because the custom markers require list-style none and Safari would otherwise drop the list semantics. The item count is announced, and the markers are drawn as pseudo-elements.",
  },
});
