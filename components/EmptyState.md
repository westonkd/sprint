# EmptyState

> A region that says there is nothing here, and why: a headline, an optional sentence, and an optional way out such as clearing filters or creating the first record. It marks the empty field with the register's own empty ornament.

- Category: feedback
- Status: experimental

## When to use

Use it in place of a list, grid, or set of results that has nothing to show, so the space says it is empty rather than rendering nothing. Set reason="filtered" when records exist but none match, so an agent knows to relax the filters rather than conclude there is no data.

### When not to

Do not use it for an empty Table, List, or Panel; those already carry their own emptyLabel. Do not use it for a failure; that is an Alert. Do not use it while data is still loading; that is Pending.

## Install

```tsx
import { EmptyState } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Nothing matches

Records exist but the filters exclude them all. The action is a Button, so it registers press-clear-filters.

```tsx
<EmptyState
  reason="filtered"
  label="No one matches these filters"
  description="Try a different role or clear the search."
  action={{ label: "Clear filters", onSelect: clearFilters }}
/>
```

### Nothing yet

The first-run case, with a link to where records are made.

```tsx
<EmptyState
  label="No projects yet"
  description="Projects you create or are invited to appear here."
  action={{ label: "Create a project", href: "#/projects/new" }}
/>
```

### Just the headline

```tsx
<EmptyState label="No notifications" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The headline, saying what is empty in a few words: "No one matches these filters". The region's accessible name. |
| `description` | string | — | One sentence of explanation or next step. Carried as the description part. |
| `action` | object | — | The one way out, as data: { label, onSelect?, href? }. An href renders a Link, otherwise a Button that registers its own press tool, so the action is a single control in the agent view. |
| `reason` | enum empty \\| filtered | `"empty"` | Why it is empty: nothing exists yet, or nothing matches the current filters. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-empty` | present or absent | Always present, so one selector finds every empty region. |
| `data-sprint-reason` | empty \\| filtered | Why the region is empty. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **EmptyState** "No one matches these filters" [empty, reason=filtered]
  - part `description` "Try a different role or clear the search."
```

## Accessibility

- Role: `group`
- Notes: The headline names the group and the description describes it. The action is an ordinary Button or Link inside it, reached in normal tab order.
