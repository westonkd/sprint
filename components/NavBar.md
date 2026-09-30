# NavBar

> A navigation landmark that renders as one line: where you are, written as a coordinate you can edit. Every destination stays in the page as an addressable part; the coordinate decides which of them a person is shown.

- Category: navigation
- Status: experimental

## When to use

Use it as an application's primary navigation when the catalogue is larger than a rail can hold, or when the layout needs its full width. Each segment of the coordinate opens its own level and filters as you type, so what a person chooses from is one level rather than the whole set. It takes destinations as data because it counts, filters and orders them.

### When not to

Do not use it for a handful of links that fit in a sidebar; that is Nav with NavGroup, which keeps every destination visible at once. Do not use it for links inside prose, and do not pass components in groups: each destination is a label and an href, not a node.

## Install

```tsx
import { NavBar } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A coordinate bar

One line of chrome over a grouped catalogue. Clicking a segment opens that level and filters it as you type.

```tsx
<NavBar
  label="Workbench"
  groups={[
    { label: "action", items: [{ href: "#/Button", label: "Button" }] },
    { label: "display", items: [{ href: "#/Table", label: "Table", active: true }] },
  ]}
/>
```

### Recording where a person has been

The bar keeps a trail of the destinations chosen through it, reachable from the depth count at its head. onNavigate is how that outlives the component.

```tsx
<NavBar
  label="Docs"
  groups={[{ label: "guides", items: [{ href: "#/guide/webmcp", label: "WebMCP" }] }]}
  onNavigate={(destination) => console.log(destination.href)}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What this navigation is for. Rendered as the landmark's accessible name and as the root of the coordinate. |
| `groups` | array (required) | — | The destinations, as groups of { label, items }, each item { href, label, active?, external? }. Order is the order a person travels them. |
| `emptyLabel` | string | `"No match"` | What the bar says when a filter matches no destination. |
| `trailEmptyLabel` | string | `"Nothing visited yet"` | What the bar says when nothing has been visited through it yet. |
| `open` | enum trail \\| group \\| leaf \\| closed | — | Which segment is open, or 'closed'. Pass it to drive the bar from outside, such as from an application-level shortcut; leave it off and the bar keeps its own state. |
| `onOpenChange` | handler | — | Called with the segment the bar wants open, or 'closed'. Required when open is controlled, so the bar can still close itself. |
| `onNavigate` | handler | — | Called with the destination when one is chosen, before the browser follows the href. Use it to record the visit somewhere that outlives this component. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-destinations` | present or absent | How many destinations the bar holds. |
| `data-sprint-open` | present or absent | Which segment of the coordinate is open: trail, group, or leaf. Absent when the bar is closed to its one line. |
| `data-sprint-depth` | present or absent | How many destinations have been visited through this bar. |
| `data-sprint-matches` | present or absent | How many destinations the open segment is showing. |
| `data-sprint-shown` | present or absent | On a destination: present when the open segment is currently showing it to a person. Every destination stays in the page either way. |
| `data-sprint-group` | present or absent | On a destination: the group it belongs to. |
| `data-sprint-href` | present or absent | On a destination: where it goes. |
| `data-sprint-active` | present or absent | On a destination: present when it is the current page. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **NavBar** "Workbench" [destinations=2, depth=0]
  - part `destination` "Button" [group=action, href=#/Button]
  - part `destination` "Table" [group=display, href=#/Table, active, shown]
```

## Accessibility

- Role: `navigation`
- Notes: The label is the landmark's accessible name. The current destination carries aria-current=page. Destinations the coordinate is not showing are hidden from the accessibility tree by CSS, so a screen reader travels one level at a time exactly as a sighted reader does, while the page itself keeps all of them. From the field, ArrowDown enters the results and ArrowUp at the top returns to it; typing anywhere in the results goes back to the field and keeps the character. Escape closes the bar, as does a press outside it, and the match count is a polite live region. ArrowUp in an empty field recalls the trail, the way a console recalls history.
