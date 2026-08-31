# Heading

> A section title, rendered as a real h element at the level you pick so it joins the document outline.

- Category: typography
- Status: experimental

## When to use

Use it for the title of a page or of a region inside one, and keep levels in document order so the outline an agent or a screen reader builds is the outline you meant.

### When not to

Do not use it for the label on a bordered region; Panel takes a label prop, draws its own header, and joins the outline through its headingLevel prop. Do not pick a level for its size, only for its place in the outline.

## Install

```tsx
import { Heading } from "sprint";
import "sprint/styles.css";
```

## Examples

### A page title

```tsx
<Heading level={1}>Button</Heading>
```

### A section title

The default level, for a region inside a page.

```tsx
<Heading>Every variant</Heading>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The title. Keep it short; long titles truncate in chrome. |
| `level` | enum 1 \\| 2 \\| 3 \\| 4 | `"2"` | Outline depth, rendered as the matching h element. 1 is the page title and there should be one per page. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-level` | 1 \\| 2 \\| 3 \\| 4 | The outline depth, and so the type voice in use. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Heading** "WebMCP tools" [level=2]
```
