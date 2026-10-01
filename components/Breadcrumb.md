# Breadcrumb

> A navigation landmark that renders as one line: the path to the current page, where every crumb opens the level it sits in. Every destination in the tree stays in the page as an addressable part; the crumbs decide which of them a person is shown.

- Category: navigation
- Status: experimental

## When to use

Use it as an application's primary navigation when the destinations form a tree, or when the catalogue is larger than a rail can hold. A crumb opens its siblings, a branch drills into its children, and typing in an open crumb searches the whole tree, so what a person chooses from is one level rather than the whole set. Put a page-level command or two in actions. It takes destinations as data because it counts, filters and orders them.

### When not to

Do not use it for a handful of links that fit in a sidebar; that is Nav with NavGroup, which keeps every destination visible at once. Do not use it for links inside prose, and do not pass components in items or actions: each destination is a label, an href and its children, not a node.

## Install

```tsx
import { Breadcrumb } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A path you can edit

One line of chrome over a tree. Each crumb opens the level it sits in and filters it as you type; a branch drills into its children.

```tsx
<Breadcrumb
  label="Workbench"
  items={[
    { label: "action", children: [{ href: "#/Button", label: "Button" }] },
    {
      label: "display",
      children: [{ href: "#/Table", label: "Table", active: true }],
    },
  ]}
/>
```

### A deep path that folds

Past maxCrumbs the middle of the path folds behind an ellipsis, which unfolds it again. A crumb that is open is never folded.

```tsx
<Breadcrumb
  label="Store"
  maxCrumbs={3}
  items={[
    {
      label: "Clothing",
      href: "#/clothing",
      children: [
        {
          label: "Outerwear",
          href: "#/clothing/outerwear",
          children: [
            {
              label: "Jackets",
              href: "#/clothing/outerwear/jackets",
              children: [{ label: "Rain shell", href: "#/rain-shell", active: true }],
            },
          ],
        },
      ],
    },
  ]}
/>
```

### Trailing actions

Commands for the whole page sit at the end of the bar. A link action publishes its href; one with onSelect registers a WebMCP tool, since an agent has no URL to reach it by.

```tsx
<Breadcrumb
  label="Docs"
  items={[{ label: "guides", children: [{ href: "#/guide/webmcp", label: "WebMCP", active: true }] }]}
  actions={[
    { label: "Copy link", onSelect: () => navigator.clipboard.writeText(location.href) },
    { label: "Source", href: "https://github.com/westonkd/sprint", external: true },
  ]}
/>
```

### A root that leads back

Give the root an href and it becomes a link back to the list the page belongs to, the way "People" leads from a person back to everyone.

```tsx
<Breadcrumb
  label="People"
  href="#/people"
  items={[
    {
      label: "Admin",
      href: "#/people?role=admin",
      children: [{ label: "Tess Ocampo", href: "#/people/tess", active: true }],
    },
  ]}
/>
```

### Recording where a person has been

The bar keeps a trail of the destinations chosen through it, reachable from the visited count at its head. Record visits through onNavigate and hand them back in defaultVisited, and the trail survives the bar remounting.

```tsx
<Breadcrumb
  label="Docs"
  items={[{ label: "guides", children: [{ href: "#/guide/webmcp", label: "WebMCP" }] }]}
  defaultVisited={["#/guide/webmcp"]}
  onNavigate={(item) => console.log(item.href)}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What this navigation is for. Rendered as the landmark's accessible name and as the root of the path. |
| `href` | string | — | Where the root of the path leads, such as the list a detail page belongs to. Without it the root is plain text. |
| `items` | array (required) | — | The destinations, as a tree of { label, href?, active?, external?, children? }. The item marked active is the current page, and the crumbs are the path to it. A branch without an href is a level, not a destination. |
| `actions` | array | — | Commands for the whole page, rendered at the end of the bar, as { label, href?, external?, onSelect? }. An action with an href is a link; one without runs onSelect. |
| `maxCrumbs` | number | `4` | How many crumbs the bar shows before it folds the middle of the path behind an ellipsis. On a narrow screen every crumb but the last folds regardless. |
| `emptyLabel` | string | `"No match"` | What the bar says when a filter matches no destination. |
| `trailEmptyLabel` | string | `"Nothing visited yet"` | What the bar says when nothing has been visited through it yet. |
| `open` | string | — | Which crumb is open, as its depth from 0, or 'trail', or 'closed'. Pass it to drive the bar from outside, such as from an application-level shortcut; leave it off and the bar keeps its own state. |
| `onOpenChange` | handler | — | Called with the crumb depth the bar wants open, 'trail', or 'closed'. Required when open is controlled, so the bar can still close itself. |
| `defaultVisited` | array | — | The hrefs already visited, oldest first, to seed the trail with. Use it to restore a trail recorded through onNavigate when the bar remounts. |
| `visited` | array | — | The trail as hrefs, oldest first, when the owner keeps it. Leave it off and the bar keeps its own trail for as long as it is mounted. |
| `onNavigate` | handler | — | Called with the item when a destination is chosen, before the browser follows the href. Use it to record the visit somewhere that outlives this component. |
| `agentName` | string | — | Overrides the label when deriving the action tool's name. |
| `agentTool` | boolean | `true` | Whether actions without an href register a WebMCP tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-href` | present or absent | On the root: where the root of the path leads. On a destination or an action: where it goes. |
| `data-sprint-recency` | present or absent | On a group of results while the trail is open: 1 for the group visited most recently, counting up. Orders the groups without a style attribute. |
| `data-sprint-path` | present or absent | The path to the current page, labels joined by ' / '. Absent when no item is active. |
| `data-sprint-destinations` | present or absent | How many destinations the tree holds. |
| `data-sprint-visited` | present or absent | How many destinations have been visited through this bar. |
| `data-sprint-open` | present or absent | Which crumb is open, as its depth, or trail. Absent when the bar is closed to its one line. |
| `data-sprint-matches` | present or absent | How many entries the open crumb is showing. |
| `data-sprint-shown` | present or absent | On a destination: present when the open crumb is currently showing it to a person. Every destination stays in the page either way. |
| `data-sprint-parent` | present or absent | On a destination: the labels of the levels above it, joined by ' / '. |
| `data-sprint-active` | present or absent | On a destination: present when it is the current page. |
| `data-sprint-ancestor` | present or absent | On a destination: present when it is on the path to the current page. |

## WebMCP tools

### `<scope>-act-<label>`

Run one of this breadcrumb's trailing actions by its visible label, exactly as a person pressing it would. Only actions that do something in the page are offered; an action that is a link is reachable by its href instead. Returns the breadcrumb's state after the action, so a follow-up read is usually unnecessary.

- Read-only: no
- Registered when: The breadcrumb is mounted, has at least one action without an href, and no other component claims the same tool name. The registered schema enumerates those actions' labels.
- Unregistered when: The breadcrumb unmounts, or its last action without an href is removed.

```json
{
  "name": "<scope>-act-<label>",
  "description": "Run one of this breadcrumb's trailing actions by its visible label, exactly as a person pressing it would. Only actions that do something in the page are offered; an action that is a link is reachable by its href instead. Returns the breadcrumb's state after the action, so a follow-up read is usually unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "description": "The visible label of the action to run, as shown at the end of the bar."
      }
    },
    "required": [
      "action"
    ]
  },
  "annotations": {
    "readOnlyHint": false,
    "untrustedContentHint": true
  }
}
```

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Breadcrumb** "Workbench" [destinations=2, path=display / Table, visited=0] → tool `act-workbench`
  - part `action` "Copy link"
  - part `destination` "Button" [href=#/Button, parent=action]
  - part `destination` "Table" [active, href=#/Table, parent=display]
```

## Accessibility

- Role: `navigation`
- Notes: The label is the landmark's accessible name and the crumbs are an ordered list, the current one carrying aria-current=page. Destinations the open crumb is not showing are hidden from the accessibility tree by CSS, so a screen reader travels one level at a time exactly as a sighted reader does, while the page itself keeps all of them. From the field, ArrowDown enters the results and ArrowUp at the top returns to it; typing anywhere in the results goes back to the field and keeps the character. Enter takes the first result. Escape closes the bar, as does a press outside it, and the match count is a polite live region. ArrowUp in an empty field recalls the trail, the way a console recalls history. The ellipsis that folds the middle of the path is a toggle with aria-expanded.
