import { defineAgentMeta } from "@/agent/registry.ts";

export const tableMeta = defineAgentMeta({
  name: "Table",
  category: "display",
  summary:
    "A data grid built from columns and rows rather than from markup. In the agent stream it reads as a compact Markdown table; in the DOM each cell is addressable as a part carrying its column and row. On a narrow screen every row restacks into a labelled block instead of scrolling sideways.",
  whenToUse:
    "Use it for any set of records with the same shape: props, attributes, conventions, results. Passing data instead of children is what lets the agent view carry the cells and the human view restack them on a phone.",
  whenNotToUse:
    "Do not use it for page layout; that is Stack. Do not put components in cells: cells are flattened to text for the agent view, so a Button inside one would lose its tool.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What this table is a table of. Used as its accessible name and read back by the agent view.",
      required: true,
    },
    columns: {
      kind: "array",
      description:
        "Column definitions, in display order: { key, header, align?, width? }. The key addresses the cell in each row and appears on the cell as data-sprint-column.",
      required: true,
    },
    rows: {
      kind: "array",
      description:
        "Rows in display order: { id?, cells }, where cells maps a column key to inline content. id names the row for an agent and defaults to its 1-based position.",
      required: true,
    },
    emptyLabel: {
      kind: "string",
      description: "What the table says when it has no rows.",
      default: "No rows",
    },
  },
  state: {
    columns: {
      description: "How many columns the table has.",
      attribute: "data-sprint-columns",
    },
    rows: {
      description: "How many rows the table currently has.",
      attribute: "data-sprint-rows",
    },
    empty: {
      description: "Present when the table has no rows.",
      attribute: "data-sprint-empty",
    },
    column: {
      description: "On a cell: which column it belongs to.",
      attribute: "data-sprint-column",
    },
    row: {
      description: "On a cell: which row it belongs to.",
      attribute: "data-sprint-row",
    },
    align: {
      description: "On a cell: the alignment its column asked for, if any.",
      attribute: "data-sprint-align",
      values: ["start", "end"],
    },
  },
  agentView: {
    example:
      '- **Table** "Props" [columns=2, rows=1]\n  | row | prop | kind |\n  | --- | --- | --- |\n  | tone | tone | enum |',
  },
  examples: [
    {
      title: "A reference table",
      description:
        'Cells are addressable: [data-sprint-part="cell"][data-sprint-column="kind"] selects a column without knowing anything about the markup.',
      code: '<Table\n  label="Props"\n  columns={[\n    { key: "prop", header: "Prop" },\n    { key: "kind", header: "Kind" },\n  ]}\n  rows={[{ id: "tone", cells: { prop: <code>tone</code>, kind: "enum" } }]}\n/>',
    },
    {
      title: "A table with no rows",
      description:
        "An empty table keeps its header and says so, rather than rendering a bare keyline.",
      code: '<Table\n  label="Registered tools"\n  emptyLabel="No tools registered"\n  columns={[{ key: "name", header: "Name" }]}\n  rows={[]}\n/>',
    },
  ],
  a11y: {
    role: "table",
    notes:
      "Column headers keep scope=col in every layout. On narrow screens each cell repeats its column header visually, marked aria-hidden so the real header association is not announced twice.",
  },
});
