# Stack

> The one-dimensional layout primitive: a row, a column, or an auto-filling grid, with spacing drawn from the space scale. It renders a plain box and nothing else.

- Category: layout
- Status: experimental

## When to use

Use it wherever two or more things sit next to each other. Prefer it over a bare div with inline styles so spacing stays on the scale. Stack is invisible in agent view: it emits no line, because an agent does not care how a region is arranged, only what is in it.

### When not to

Do not use it to draw a bordered region with a header; that is Panel. Do not nest three deep to fake a grid; use direction="grid".

## Install

```tsx
import { Stack } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A row of actions

Wrapping keeps a toolbar from overflowing on a narrow screen.

```tsx
<Stack direction="row" gap="tight" wrap>
  <Button>Cancel</Button>
  <Button tone="action">Confirm</Button>
</Stack>
```

### A responsive card grid

Tracks fill the container and never go below min, so this is one column on a phone and three on a desktop with no media query of your own.

```tsx
<Stack direction="grid" min="16rem">
  <Card label="Button" href="#/Button">One action.</Card>
  <Card label="Table" href="#/Table">Rows and columns.</Card>
</Stack>
```

### A header bar that stacks on a phone

```tsx
<Stack direction="row" justify="between" align="center" collapse>
  <Heading level={1}>Button</Heading>
  <Tag tone="warning">experimental</Tag>
</Stack>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The items to lay out. |
| `direction` | enum row \\| column \\| grid | `"column"` | Axis. "grid" fills as many equal columns as fit, each at least min wide. |
| `gap` | enum none \\| tight \\| normal \\| loose | `"normal"` | Space between items, from the space scale. |
| `align` | enum start \\| center \\| end \\| stretch \\| baseline | — | Cross-axis alignment. |
| `justify` | enum start \\| center \\| end \\| between | — | Main-axis distribution. |
| `wrap` | boolean | `false` | Let a row wrap onto more lines instead of overflowing. |
| `collapse` | boolean | `false` | Stack a row into a column on narrow viewports. This is how a toolbar survives a phone. |
| `min` | enum 10rem \\| 12rem \\| 14rem \\| 16rem \\| 18rem \\| 20rem \\| 22rem \\| 24rem \\| 28rem \\| 32rem | `"18rem"` | Minimum track width for direction="grid", from a fixed scale of rem lengths. Tracks never exceed the container. Scale values are mapped in the stylesheet through data-sprint-min, so they work under a strict Content Security Policy. Any other CSS length is still accepted as an escape hatch, but it is written to an inline style attribute, which a style-src policy without unsafe-inline blocks: under such a policy an off-scale grid falls back to one column. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-direction` | row \\| column \\| grid | The axis in use. |
| `data-sprint-gap` | none \\| tight \\| normal \\| loose | The spacing step in use. |
| `data-sprint-align` | start \\| center \\| end \\| stretch \\| baseline | Cross-axis alignment, when one was asked for. |
| `data-sprint-justify` | start \\| center \\| end \\| between | Main-axis distribution, when one was asked for. |
| `data-sprint-wrap` | present or absent | Present when a row is allowed to wrap. |
| `data-sprint-collapse` | present or absent | Present when the row stacks into a column on narrow viewports. |
| `data-sprint-min` | present or absent | The minimum track width in use, present only when direction="grid". A value off the scale is carried here too, with the length itself in an inline style. |
