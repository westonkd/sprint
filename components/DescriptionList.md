# DescriptionList

> Labelled term–description pairs for the details of one thing: metadata, settings, profile fields.

- Category: display
- Status: experimental

## When to use

Use for the properties of a single entity: a token's created date and scopes, a session's device and last activity, a profile's fields. Each item pairs one term with one description.

### When not to

Do not use for many entities with the same fields; that is a Table. Do not put components inside term or description; both are flattened to text for the agent view, so only inline content survives. Do not use for prose sequences; that is a List.

## Install

```tsx
import { DescriptionList } from "sprint";
import "sprint/styles.css";
```

## Examples

### Token metadata

```tsx
<DescriptionList
  label="Key sk-prod"
  items={[
    { term: "Created", description: "2026-08-01" },
    { term: "Last used", description: "2 hours ago" },
    { term: "Scopes", description: "read, write" },
  ]}
/>
```

### An empty list

The region keeps its frame and states its emptiness.

```tsx
<DescriptionList label="Recovery codes" items={[]} emptyLabel="None generated" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The accessible name for the list, describing what entity it details. |
| `items` | array (required) | — | The pairs, in order. Each item is { term, description }; both are inline content flattened to text for the agent view. |
| `emptyLabel` | string | `"Empty"` | Text shown when items is empty. The region keeps its frame. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-items` | present or absent | The number of pairs. |
| `data-sprint-empty` | present or absent | Present when there are no pairs. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **DescriptionList** "Key sk-prod" [items=2]
```

## Accessibility

- Role: `definition list`
- Notes: Renders a native dl with an aria-label. Terms are dt elements and descriptions dd, so structure survives without styling.
