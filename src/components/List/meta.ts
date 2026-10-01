import { defineAgentMeta } from "@/agent/registry.ts";

export const listMeta = defineAgentMeta({
  name: "List",
  category: "display",
  summary:
    "A bulleted or numbered list built from an array of items. Each item is an addressable part carrying its position, so an agent can cite item three without counting lines.",
  whenToUse:
    "Use it for a short sequence of related points: rules, steps, links, caveats. Passing items as data rather than as children is what lets the agent view carry each one as its own part.",
  whenNotToUse:
    "Do not use it for a diff or a review of what will change, where each mark means added or removed; that is ChangeList. Do not use it for records with fields; that is Table. Do not use it as a layout for cards or controls; that is Stack.",
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
        'The mark before each item. "plus" is the house bullet, "bullet" a plain dot for quieter prose, "number" counts the items and makes the list ordered, "none" drops the marker column for a list whose items already lead with their own mark. Defaults to "number" when ordered is set and "plus" otherwise. The marker is drawn, not read: an item whose mark means something, such as added or removed, belongs in a ChangeList.',
      values: ["plus", "bullet", "number", "none"],
      default: "plus",
    },
    emptyLabel: {
      kind: "string",
      description: "What the list says when it has no items.",
      default: "Empty",
    },
    loading: {
      kind: "boolean",
      description:
        "Set while the items are being fetched. Sets aria-busy and sweeps a bar along the top edge. Existing items stay visible; with none yet, the empty slot says loadingLabel instead of emptyLabel.",
      default: false,
    },
    loadingLabel: {
      kind: "string",
      description: "What the empty slot says while loading.",
      default: "Loading",
    },
  },
  state: {
    items: {
      description: "How many items the list has.",
      attribute: "data-sprint-items",
    },
    ordered: {
      description:
        "Present when the list is a real ol: ordered is set, or the marker is number.",
      attribute: "data-sprint-ordered",
    },
    marker: {
      description: "The mark drawn before each item.",
      attribute: "data-sprint-marker",
      values: ["plus", "bullet", "number", "none"],
    },
    empty: {
      description: "Present when the list has no items.",
      attribute: "data-sprint-empty",
    },
    loading: {
      description:
        "Present while the items are being fetched. Alongside empty it means nothing has arrived yet, not that there is nothing.",
      attribute: "data-sprint-loading",
    },
    index: {
      description: "On an item: its 1-based position in the list.",
      attribute: "data-sprint-index",
    },
  },
  agentView: {
    example:
      '- **List** "Tool rules" [items=1, marker=plus]\n  - part `item` "One tool, one action." [index=1]',
  },
  examples: [
    {
      title: "A list of rules",
      code: '<List\n  label="Tool rules"\n  items={[\n    <>\n      <strong>One tool, one action.</strong> Overlapping tools make selection\n      harder.\n    </>,\n  ]}\n/>',
    },
    {
      title: "A numbered sequence",
      code: '<List\n  ordered\n  label="Steps"\n  items={["Register the tool.", "Drive the DOM.", "Return the new state."]}\n/>',
    },
    {
      title: "Plain bullets",
      description: "A quieter dot for running prose, where the house plus would shout.",
      code: '<List\n  marker="bullet"\n  label="Caveats"\n  items={["Chrome 149 only.", "Tools are a no-op without WebMCP."]}\n/>',
    },
    {
      title: "No marker",
      description:
        "For items that already lead with their own mark, such as a link or a chip.",
      code: '<List\n  marker="none"\n  label="Related"\n  items={["Table for records.", "Stack for layout."]}\n/>',
    },
  ],
  a11y: {
    role: "list",
    notes:
      "A real ul or ol named by its label, with an explicit list role because the custom markers require list-style none and Safari would otherwise drop the list semantics. The item count is announced, and the markers are drawn as pseudo-elements, so a marker never carries meaning a screen reader would miss.",
  },
});
