# Textarea

> A multi-line text area carrying its own label, hint, and error. Fully controlled, and it registers one fill tool that replaces the whole content with an explicit value, line breaks included.

- Category: input
- Status: experimental

## When to use

Use it for free-form text that runs longer than a line: a description, a message body, a set of notes. In the agent view the current content is part of the component's state line, so an agent reads what is written without a separate query.

### When not to

Do not use it for a single-line value, which is a TextInput. Do not use it for code a person should read rather than write; that is a CodeBlock. Long values make long state lines, so keep it off surfaces where the agent view must stay terse.

## Install

```tsx
import { Textarea } from "sprint";
import "sprint/styles.css";
```

## Examples

### A notes area

Label, hint, and control are one component. In agent view it renders a live textarea an agent can type into.

```tsx
<Textarea
  label="Mission notes"
  value={notes}
  onChange={setNotes}
  hint="What the relief crew needs to know"
/>
```

### A required area with an error

The error replaces the hint and marks the area invalid on every surface.

```tsx
<Textarea
  label="Abort reason"
  value={reason}
  onChange={setReason}
  required
  rows={3}
  error="State the reason before aborting."
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the area holds. Names it for a screen reader and derives the tool name, so prefer a noun phrase such as "Mission notes". |
| `value` | string (required) | — | The area's current text. The area is fully controlled. |
| `onChange` | handler (required) | — | Called with the new text on every change. The fill tool drives a real input event, so this runs for agent fills too. |
| `rows` | number | `4` | The visible line count before scrolling. |
| `placeholder` | string | — | Ghost text shown while the area is empty. |
| `hint` | string | — | Guidance shown under the area and carried into the agent view. Replaced by error while one is set. |
| `error` | string | — | A validation message. Marks the area invalid for people, screen readers, and agents alike. |
| `name` | string | — | The native form name submitted with the surrounding form. |
| `disabled` | boolean | `false` | Disable the area and unregister its fill tool. |
| `required` | boolean | `false` | Mark the area required, visually and in the agent view. |
| `agentName` | string | — | Override the label used to derive the tool name, when two areas on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the area without registering a fill tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The area's current text. |
| `data-sprint-empty` | present or absent | Present while the area holds no text. |
| `data-sprint-disabled` | present or absent | Present when the area cannot be edited. |
| `data-sprint-required` | present or absent | Present when the area must be filled. |
| `data-sprint-invalid` | present or absent | Present while an error is set. |

## WebMCP tools

### `<scope>-fill-<label>`

Replace this text area's content with the value provided, exactly as a person typing it would. The value is the full text it ends up containing, line breaks included; pass an empty string to clear it. Returns the area's state after the change, so a follow-up read is unnecessary.

- Read-only: no
- Registered when: The area is mounted, enabled, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The area unmounts or becomes disabled.

```json
{
  "name": "<scope>-fill-<label>",
  "description": "Replace this text area's content with the value provided, exactly as a person typing it would. The value is the full text it ends up containing, line breaks included; pass an empty string to clear it. Returns the area's state after the change, so a follow-up read is unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "value": {
        "type": "string",
        "description": "The full text the area should contain afterwards, with real line breaks where line breaks belong. Replaces the current text."
      }
    },
    "required": [
      "value"
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
- **Textarea** "Mission notes" [empty] → tool `fill-mission-notes`
  - part `hint` "What the relief crew needs to know"
```

## Accessibility

- Role: `textbox`
- Keyboard: Standard text editing, Enter inserts a line break
- Notes: The label element is associated via htmlFor. An error sets aria-invalid and is linked with aria-describedby, as is the hint.
