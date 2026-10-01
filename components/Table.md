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

### A table while fetching

Before the first rows arrive the table reads [empty, loading], so an agent waits rather than concluding there is nothing.

```tsx
<Table
  label="Loadouts"
  loading={isFetching}
  columns={[{ key: "name", header: "Name" }]}
  rows={loadouts ?? []}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What this table is a table of. Used as its accessible name and read back by the agent view. |
| `columns` | array (required) | — | Column definitions, in display order: { key, header, align?, width? }. The key addresses the cell in each row and appears on the cell as data-sprint-column. width is one of 4rem, 5rem, 6rem, 7rem, 8rem, 9rem, 10rem, 12rem, 14rem, 16rem, 20rem, or 24rem, mapped in the stylesheet through data-sprint-width on the header cell so it works under a strict Content Security Policy; any other CSS length is still accepted but is written to an inline style attribute, which a style-src policy without unsafe-inline blocks. |
| `rows` | array (required) | — | Rows in display order: { id?, cells }, where cells maps a column key to inline content. id names the row for an agent and defaults to its 1-based position. |
| `emptyLabel` | string | `"No rows"` | What the table says when it has no rows. |
| `loading` | boolean | `false` | Set while the rows are being fetched. Sets aria-busy and sweeps a bar along the top edge. Existing rows stay visible; with none yet, the empty slot says loadingLabel instead of emptyLabel. |
| `loadingLabel` | string | `"Loading"` | What the empty slot says while loading. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-columns` | present or absent | How many columns the table has. |
| `data-sprint-rows` | present or absent | How many rows the table currently has. |
| `data-sprint-empty` | present or absent | Present when the table has no rows. |
| `data-sprint-loading` | present or absent | Present while the rows are being fetched. Alongside empty it means nothing has arrived yet, not that there is nothing. |
| `data-sprint-column` | present or absent | On a cell: which column it belongs to. |
| `data-sprint-row` | present or absent | On a cell: which row it belongs to. |
| `data-sprint-width` | present or absent | On a column header: the width its column asked for, if any. A value off the scale is carried here too, with the length itself in an inline style. |
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
