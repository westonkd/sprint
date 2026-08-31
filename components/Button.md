# Button

> A single action a person or an agent can trigger. Registers one press tool named from its own label.

- Category: action
- Status: experimental

## When to use

Use for any discrete action: submitting, confirming, dismissing, advancing a step. tone="action" with block marks the one primary action in a view; tone="danger" marks destructive actions.

### When not to

Do not use for navigation between pages; use a link. Do not use for toggling a persistent on/off state; that needs a switch or a checkbox.

## Install

```tsx
import { Button } from "sprint";
import "sprint/styles.css";
```

## Examples

### Primary action

The one rationed acid action bar for a view.

```tsx
<Button tone="action" block onClick={prepare}>Prepare launch</Button>
```

### Destructive action

```tsx
<Button tone="danger" onClick={purge}>Purge vault</Button>
```

### Busy state

While loading the press tool is unregistered, so an agent cannot double-submit.

```tsx
<Button loading={saving} onClick={save}>Save loadout</Button>
```

### Disambiguating two identical labels

Without agentName both buttons would claim press-save and neither would register a tool.

```tsx
<Button agentName="Save billing">Save</Button>
```

### Keeping the tool name stable under a changing label

A label carrying a value would otherwise rename the tool on every change, churning registration and staling any name an agent already holds.

```tsx
<Button agentName="Increment">Increment ({count})</Button>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The button label. Its text also derives the WebMCP tool name, so prefer a verb phrase like "Prepare launch" over "OK". |
| `tone` | enum neutral \\| action \\| danger | `"neutral"` | Visual and semantic weight. Acid is rationed to one primary action per view. |
| `block` | boolean | `false` | Render as a full-width bar. Combine with tone="action" for the primary action of a region. |
| `loading` | boolean | `false` | Mark work in progress. Sets aria-busy, disables the control, and unregisters the press tool until it clears. |
| `disabled` | boolean | `false` | Disable the control and unregister its press tool. |
| `agentName` | string | — | Override the label used to derive the tool name. Set this on icon-only buttons, when two buttons would otherwise collide, and whenever the visible label contains changing values such as a count. |
| `agentTool` | boolean | `true` | Set false to render the button without registering any WebMCP tool. |
| `onClick` | handler | — | Standard click handler. The press tool dispatches a real click, so this runs for agent presses too. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-tone` | neutral \\| action \\| danger | The button's current tone. |
| `data-sprint-block` | present or absent | Present when the button renders as a full-width bar. |
| `data-sprint-loading` | present or absent | Present while the button is busy. |
| `data-sprint-disabled` | present or absent | Present when the button cannot be pressed. |

## WebMCP tools

### `<scope>-press-<label>`

Press this button, exactly as a person clicking it would. Returns the button's state after the press, so a follow-up read is usually unnecessary. Any work the press starts is not waited for; if the button enters a loading state the result says so.

- Read-only: no
- Registered when: The button is mounted, enabled, not loading, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The button unmounts, becomes disabled, or starts loading.

```json
{
  "name": "<scope>-press-<label>",
  "description": "Press this button, exactly as a person clicking it would. Returns the button's state after the press, so a follow-up read is usually unnecessary. Any work the press starts is not waited for; if the button enters a loading state the result says so.",
  "inputSchema": {
    "type": "object",
    "properties": {}
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
- **Button** "Prepare launch" [tone=action] → tool `press-prepare-launch`
```

## Accessibility

- Role: `button`
- Keyboard: Enter activates, Space activates
- Notes: Loading sets aria-busy and disables the control. Focus is an offset keyline, never a rounded ring.
