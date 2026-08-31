# Panel

> A labelled region with a header band and an optional slot for the controls that act on it. Everything on a Sprint page lives inside one.

- Category: layout
- Status: experimental

## When to use

Use it for every distinct region of a page: a section of documentation, a form, a readout, a preview. The label is the region's accessible name, so a person, a screen reader, and an agent all address the region by the same words.

### When not to

Do not use it as a spacer or a plain box; that is Stack. Nesting reads clearly to about three deep, because each level alternates its ground and demotes its frame; past that, the depth cues repeat and the region wants a page of its own.

## Install

```tsx
import { Panel } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A section of a page

headingLevel puts the label in the page outline, so a screen reader finds the section by heading as well as by landmark.

```tsx
<Panel label="When to use" headingLevel={2}>
  <Text>Use it for any discrete action.</Text>
</Panel>
```

### A panel with a control in its header

The header slot is for controls that act on the region, not for navigation.

```tsx
<Panel
  label="Preview"
  actions={<Button agentName="Reset preview">Reset</Button>}
>
  <Button tone="action">Prepare launch</Button>
</Panel>
```

### A flush panel around a table

Content that draws its own keylines sits flush, so borders do not double up.

```tsx
<Panel label="Conventions" flush>
  <Table label="Conventions" columns={columns} rows={rows} />
</Panel>
```

### Nested panels

Depth styles itself: the outermost panel carries a doubled keyline, each nested level alternates its ground, and nested headers demote to a dashed rule, so a reader ranks the levels without counting borders.

```tsx
<Panel label="The shape" headingLevel={2}>
  <Panel label="Human view" headingLevel={3}>
    <Panel label="Crew" headingLevel={4}>
      <Text>Registration fields live here.</Text>
    </Panel>
  </Panel>
</Panel>
```

### An empty region

An empty panel keeps its border and states that it is empty, rather than vanishing and leaving a person or an agent unsure whether it failed to load.

```tsx
<Panel label="Registered tools" emptyLabel="No tools registered" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What this region is. Rendered in the header band and used as the region's accessible name. |
| `children` | node | — | The region's content. An empty panel says it is empty rather than collapsing. |
| `headingLevel` | enum 2 \\| 3 \\| 4 | — | Render the label as a real heading at this outline depth, so the section is reachable when a screen reader navigates by headings. Set it on every panelled section of a page; leave it unset only for chrome such as a preview frame. |
| `actions` | node | — | Controls that act on this region, rendered at the end of the header band. Keep it to one or two. |
| `flush` | boolean | `false` | Drop the body padding, for content that draws its own edges such as a Table or a CodeBlock. |
| `emptyLabel` | string | `"Empty"` | What the panel says when it has no content. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-flush` | present or absent | Present when the body carries no padding of its own. |
| `data-sprint-empty` | present or absent | Present when the panel has no content. The panel still renders its keyline and says it is empty. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Panel** "WebMCP tools"
```

## Accessibility

- Role: `region`
- Notes: The section is a named landmark either way: the label is its accessible name. With headingLevel the label is also a heading element, so the page outline includes the region; without it the region is reachable only by landmark navigation.
