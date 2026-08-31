# Switch

> An on/off setting that takes effect the moment it changes. It registers one set tool that takes the end state rather than toggling.

- Category: input
- Status: experimental

## When to use

Use it for a live setting: enabling telemetry, muting alerts, switching a feed. The set tool takes on as true or false, so an agent states the end state and never has to read before writing.

### When not to

Do not use it for a boolean a form will submit later; that is a Checkbox, and the distinction is when the change takes effect. Do not use it to choose between two named modes a person should see side by side, which is a SegmentedControl.

## Install

```tsx
import { Switch } from "sprint";
import "sprint/styles.css";
```

## Examples

### A live setting

In agent view the switch renders as one control; pressing it toggles, while the set tool states the end state.

```tsx
<Switch label="Live telemetry" on={telemetry} onChange={setTelemetry} />
```

### A disabled switch

Disabled unregisters the tool, so an agent cannot change what a person could not.

```tsx
<Switch label="Ground link" on disabled onChange={setLink} />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the setting controls. Names the switch for a screen reader and derives the tool name, so prefer a noun phrase such as "Live telemetry". |
| `on` | boolean (required) | — | Whether the setting is on. The switch is fully controlled. |
| `onChange` | handler (required) | — | Called with the new state. The set tool drives a real click, so this runs for agent changes too. |
| `disabled` | boolean | `false` | Disable the switch and unregister its set tool. |
| `agentName` | string | — | Override the label used to derive the tool name, when two switches on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the switch without registering a set tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-on` | present or absent | Present while the setting is on. |
| `data-sprint-disabled` | present or absent | Present when the switch cannot be changed. |

## WebMCP tools

### `<scope>-set-<label>`

Switch this setting on or off by stating the end state, exactly as a person clicking it would. The change takes effect immediately. Setting the state it already has succeeds and changes nothing, so the call is safe to retry. Returns the switch's state after the call.

- Read-only: no
- Registered when: The switch is mounted, enabled, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The switch unmounts or becomes disabled.

```json
{
  "name": "<scope>-set-<label>",
  "description": "Switch this setting on or off by stating the end state, exactly as a person clicking it would. The change takes effect immediately. Setting the state it already has succeeds and changes nothing, so the call is safe to retry. Returns the switch's state after the call.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "on": {
        "type": "boolean",
        "description": "The end state: true leaves the switch on, false leaves it off."
      }
    },
    "required": [
      "on"
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
- **Switch** "Live telemetry" [on] → tool `set-live-telemetry`
```

## Accessibility

- Role: `switch`
- Keyboard: Space toggles, Enter toggles
- Notes: A button with role switch and aria-checked, so the label and state read together. The thumb moves by a single-axis stepped translation and respects prefers-reduced-motion.
