# Tag

> A small chip that classifies the thing next to it: a status, a category, a count, a build string.

- Category: display
- Status: experimental

## When to use

Use it for a short classification a person scans and an agent reads off the tone attribute, such as a release status, a read-only or write marker on a tool, or a version chip.

### When not to

Do not use it for anything clickable; a Tag is inert, and a chip that acts is a Button. Do not put a sentence in one.

## Install

```tsx
import { Tag } from "sprint";
import "sprint/styles.css";
```

## Examples

### A release status

```tsx
<Tag tone="warning" filled>experimental</Tag>
```

### A category chip

```tsx
<Tag>action</Tag>
```

### Read-only against changes-state

Two tones doing the work a legend would otherwise have to do in prose.

```tsx
<Tag tone={tool.readOnly ? "info" : "danger"}>
  {tool.readOnly ? "read only" : "changes state"}
</Tag>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The chip text. One or two words. |
| `tone` | enum neutral \\| action \\| danger \\| info \\| warning \\| inert | `"neutral"` | What class of thing this is. Acid is rationed, so reach for info or inert before action. |
| `filled` | boolean | `false` | Render as a solid field of the tone with inverted ink, instead of a keyline. Use for the one chip that must be read first. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-tone` | neutral \\| action \\| danger \\| info \\| warning \\| inert | The class of thing the chip marks. |
| `data-sprint-filled` | present or absent | Present when the chip is a solid field rather than a keyline. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Tag** "experimental" [filled, tone=warning]
```
