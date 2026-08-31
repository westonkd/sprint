# Table

> A data grid built from columns and rows rather than from markup. In the agent stream it reads as a compact Markdown table; in the DOM each cell is addressable as a part carrying its column and row. On a narrow screen every row restacks into a labelled block instead of scrolling sideways.

- Category: display
- Status: experimental

## When to use

Use it for any set of records with the same shape: props, attributes, conventions, results. Passing data instead of children is what lets the agent view carry the cells and the human view restack them on a phone.

### When not to

Do not use it for page layout; that is Stack. Do not put components in cells: cells are flattened to text for the agent view, so a Button inside one would lose its tool.

## Install

```tsx
import { Table } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A reference table

Cells are addressable: [data-sprint-part="cell"][data-sprint-column="kind"] selects a column without knowing anything about the markup.

```tsx
<Table
  label="Props"
  columns={[
    { key: "prop", header: "Prop" },
    { key: "kind", header: "Kind" },
  ]}
  rows={[{ id: "tone", cells: { prop: <code>tone</code>, kind: "enum" } }]}
/>
```

### A table with no rows

An empty table keeps its header and says so, rather than rendering a bare keyline.

```tsx
<Table
  label="Registered tools"
  emptyLabel="No tools registered"
  columns={[{ key: "name", header: "Name" }]}
  rows={[]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What this table is a table of. Used as its accessible name and read back by the agent view. |
| `columns` | array (required) | — | Column definitions, in display order: { key, header, align?, width? }. The key addresses the cell in each row and appears on the cell as data-sprint-column. |
| `rows` | array (required) | — | Rows in display order: { id?, cells }, where cells maps a column key to inline content. id names the row for an agent and defaults to its 1-based position. |
| `emptyLabel` | string | `"No rows"` | What the table says when it has no rows. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-columns` | present or absent | How many columns the table has. |
| `data-sprint-rows` | present or absent | How many rows the table currently has. |
| `data-sprint-empty` | present or absent | Present when the table has no rows. |
| `data-sprint-column` | present or absent | On a cell: which column it belongs to. |
| `data-sprint-row` | present or absent | On a cell: which row it belongs to. |
| `data-sprint-align` | start \\| end | On a cell: the alignment its column asked for, if any. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Table** "Props" [columns=2, rows=1]
  | row | prop | kind |
  | --- | --- | --- |
  | tone | tone | enum |
```

## Accessibility

- Role: `table`
- Notes: Column headers keep scope=col in every layout. On narrow screens each cell repeats its column header visually, marked aria-hidden so the real header association is not announced twice.
