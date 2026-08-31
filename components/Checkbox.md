# Checkbox

> A single on/off choice recorded as form data. It registers one set tool that takes the end state rather than toggling.

- Category: input
- Status: experimental

## When to use

Use it for a boolean a form will submit: accepting terms, opting in, including something in a request. The set tool takes checked as true or false, so an agent states the end state and never has to read before writing.

### When not to

Do not use it for a setting that takes effect the moment it changes; that is a Switch. Do not use it for choosing one of several options, which is a SegmentedControl or a Select.

## Install

```tsx
import { Checkbox } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A consent box

In agent view the box renders as one control; pressing it toggles, while the set tool states the end state.

```tsx
<Checkbox
  label="Accept the terms"
  checked={accepted}
  onChange={setAccepted}
  required
/>
```

### An error on a required box

The error marks the box invalid on every surface until it clears.

```tsx
<Checkbox
  label="Confirm the manifest"
  checked={confirmed}
  onChange={setConfirmed}
  required
  error="Confirm before launch."
/>
```

### A disabled box

Disabled unregisters the tool, so an agent cannot change what a person could not.

```tsx
<Checkbox
  label="Telemetry"
  checked
  disabled
  onChange={setTelemetry}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What checking it means. Names the box for a screen reader and derives the tool name, so prefer a statement such as "Accept the terms". |
| `checked` | boolean (required) | — | Whether the box is checked. The box is fully controlled. |
| `onChange` | handler (required) | — | Called with the new checked state. The set tool drives a real click, so this runs for agent changes too. |
| `hint` | string | — | Guidance shown under the box and carried into the agent view. Replaced by error while one is set. |
| `error` | string | — | A validation message. Marks the box invalid for people, screen readers, and agents alike. |
| `name` | string | — | The native form name submitted with the surrounding form. |
| `disabled` | boolean | `false` | Disable the box and unregister its set tool. |
| `required` | boolean | `false` | Mark the box as one that must be checked. |
| `agentName` | string | — | Override the label used to derive the tool name, when two boxes on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the box without registering a set tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-checked` | present or absent | Present while the box is checked. |
| `data-sprint-disabled` | present or absent | Present when the box cannot be changed. |
| `data-sprint-required` | present or absent | Present when the box must be checked. |
| `data-sprint-invalid` | present or absent | Present while an error is set. |

## WebMCP tools

### `<scope>-set-<label>`

Check or uncheck this box by stating the end state, exactly as a person clicking it would. Setting the state it already has succeeds and changes nothing, so the call is safe to retry. Returns the box's state after the call, so a follow-up read is unnecessary.

- Read-only: no
- Registered when: The box is mounted, enabled, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The box unmounts or becomes disabled.

```json
{
  "name": "<scope>-set-<label>",
  "description": "Check or uncheck this box by stating the end state, exactly as a person clicking it would. Setting the state it already has succeeds and changes nothing, so the call is safe to retry. Returns the box's state after the call, so a follow-up read is unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "checked": {
        "type": "boolean",
        "description": "The end state: true leaves the box checked, false leaves it unchecked."
      }
    },
    "required": [
      "checked"
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
- **Checkbox** "Accept the terms" [required] → tool `set-accept-the-terms`
  - part `error` "Required before launch"
```

## Accessibility

- Role: `checkbox`
- Keyboard: Space toggles, Tab moves through the box
- Notes: A native checkbox input wrapped by its label, visually replaced by a keylined square. Focus draws an offset keyline around the square; errors set aria-invalid and link with aria-describedby.
