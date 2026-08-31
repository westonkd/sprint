# List

> A bulleted or numbered list built from an array of items. Each item is an addressable part carrying its position, so an agent can cite item three without counting lines.

- Category: display
- Status: experimental

## When to use

Use it for a short sequence of related points: rules, steps, links, caveats. Passing items as data rather than as children is what lets the agent view carry each one as its own part.

### When not to

Do not use it for records with fields; that is Table. Do not use it as a layout for cards or controls; that is Stack.

## Install

```tsx
import { List } from "sprint";
import "sprint/styles.css";
```

## Examples

### A list of rules

```tsx
<List
  label="Tool rules"
  items={[
    <>
      <strong>One tool, one action.</strong> Overlapping tools make selection
      harder.
    </>,
  ]}
/>
```

### A numbered sequence

```tsx
<List
  ordered
  label="Steps"
  items={["Register the tool.", "Drive the DOM.", "Return the new state."]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the list is a list of. Names it for a screen reader and for the agent view. |
| `items` | array (required) | — | The items in order. Inline content, not components: each is flattened to text for the agent view. |
| `ordered` | boolean | `false` | Number the items instead of bulleting them. Use it when the order is the point. |
| `emptyLabel` | string | `"Empty"` | What the list says when it has no items. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-items` | present or absent | How many items the list has. |
| `data-sprint-ordered` | present or absent | Present when the items are numbered rather than bulleted. |
| `data-sprint-empty` | present or absent | Present when the list has no items. |
| `data-sprint-index` | present or absent | On an item: its 1-based position in the list. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **List** "Tool rules" [items=1]
  - part `item` "One tool, one action." [index=1]
```

## Accessibility

- Role: `list`
- Notes: A real ul or ol named by its label, with an explicit list role because the custom markers require list-style none and Safari would otherwise drop the list semantics. The item count is announced, and the markers are drawn as pseudo-elements.
