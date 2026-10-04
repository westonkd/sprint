# TextInput

> A single-line text field carrying its own label, hint, and error. Fully controlled, and it registers one fill tool that replaces the field's text with an explicit value.

- Category: input
- Status: experimental

## When to use

Use it for any free-form single-line value: a name, an email address, a search term. The label is part of the component, so a form never needs a separate label element, and the error prop is how validation reaches both a person and an agent.

### When not to

Do not use it for multi-line text, which is a Textarea. Do not use it to pick from a known set of values; that is a Select or a SegmentedControl. Do not use it for an on/off state, which is a Checkbox or a Switch. Do not use a read-only TextInput to hand someone a value to paste elsewhere; that is a CopyField.

## Install

```tsx
import { TextInput } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A labelled field

Label, hint, and control are one component. In agent view the hint becomes a part line and the field renders a live input an agent can type into.

```tsx
<TextInput
  label="Callsign"
  value={callsign}
  onChange={setCallsign}
  hint="Uppercase, three to eight letters"
  placeholder="NOMAD"
/>
```

### A validation error

The error replaces the hint, marks the field invalid on every surface, and reads back through the fill tool's result.

```tsx
<TextInput
  label="Frequency"
  value={frequency}
  onChange={setFrequency}
  required
  error="Out of band. Use 118.000 to 136.975."
/>
```

### A password

The value stays off every agent surface: state reflects filled or empty, and tool results never echo the text.

```tsx
<TextInput
  label="Access code"
  type="password"
  value={code}
  onChange={setCode}
  autoComplete="current-password"
/>
```

### A read-only value

A value shown in the shape of a form field that nobody may edit. It stays focusable and selectable, reads as text in the agent view, and registers no fill tool. To hand someone a value to paste elsewhere, a CopyField adds the copy control.

```tsx
<TextInput
  label="Station ID"
  value="KX-2209-ALPHA"
  onChange={() => {}}
  readOnly
  hint="Assigned at registration"
/>
```

### A number with field attributes

type="number" keeps value a string. Native attributes for the input itself, such as min, max and autoFocus, go through inputProps, and inputRef reaches the input for focusing it later.

```tsx
<TextInput
  label="Link expiry in days"
  type="number"
  value={days}
  onChange={setDays}
  inputRef={daysField}
  inputProps={{ min: 1, max: 90, step: 1 }}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the field holds. Names the field for a screen reader and derives the tool name, so prefer a noun phrase such as "Callsign". |
| `value` | string (required) | — | The field's current text. The field is fully controlled. |
| `onChange` | handler (required) | — | Called with the new text on every change. The fill tool drives a real input event, so this runs for agent fills too. |
| `type` | enum text \\| email \\| url \\| search \\| password \\| number \\| tel | `"text"` | The input type. "password" masks the field everywhere: the value never appears in agent attributes, the agent view, or tool results. "number" keeps value a string, so the page parses it; pass min, max and step through inputProps. |
| `placeholder` | string | — | Ghost text shown while the field is empty. |
| `hint` | string | — | Guidance shown under the field and carried into the agent view. Replaced by error while one is set. |
| `error` | string | — | A validation message. Marks the field invalid for people, screen readers, and agents alike. |
| `name` | string | — | The native form name submitted with the surrounding form. |
| `autoComplete` | string | — | The native autocomplete hint, forwarded to the input. |
| `disabled` | boolean | `false` | Disable the field and unregister its fill tool. |
| `readOnly` | boolean | `false` | Show the value without letting anyone change it. The field stays focusable and selectable, renders as plain text in the agent view, and registers no fill tool, because nothing can change it. |
| `required` | boolean | `false` | Mark the field required, visually and in the agent view. |
| `hideLabel` | boolean | `false` | Hide the label visually while keeping it as the field's accessible name and agent label. Pair it with a placeholder or a nearby heading so sighted people still know what the field is for. |
| `inputRef` | object | — | A ref to the underlying <input>, for focusing or measuring it. The component's own ref points at the wrapper. |
| `inputProps` | object | — | Extra native attributes and handlers for the <input> itself, such as autoFocus, maxLength, inputMode, onKeyDown, or onBlur. Props spread on the component land on the wrapper; these land on the field. Anything the component manages (value, onChange, disabled, the error wiring) cannot be overridden here. |
| `agentName` | string | — | Override the label used to derive the tool name, when two fields on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the field without registering a fill tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The field's current text. Never present on a password field, which reflects filled instead. |
| `data-sprint-filled` | present or absent | Present when a password field holds text. |
| `data-sprint-empty` | present or absent | Present while the field holds no text. |
| `data-sprint-disabled` | present or absent | Present when the field cannot be edited. |
| `data-sprint-readonly` | present or absent | Present when the field shows a value that cannot be changed. No fill tool is registered while it is set. |
| `data-sprint-required` | present or absent | Present when the field must be filled. |
| `data-sprint-invalid` | present or absent | Present while an error is set. |

## WebMCP tools

### `<scope>-fill-<label>`

Replace this field's text with the value provided, exactly as a person typing it would. The value is the full text the field ends up containing; pass an empty string to clear it. Returns the field's state after the change, so a follow-up read is unnecessary.

- Read-only: no
- Registered when: The field is mounted, enabled, editable rather than read-only, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The field unmounts, becomes disabled, or becomes read-only.

```json
{
  "name": "<scope>-fill-<label>",
  "description": "Replace this field's text with the value provided, exactly as a person typing it would. The value is the full text the field ends up containing; pass an empty string to clear it. Returns the field's state after the change, so a follow-up read is unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "value": {
        "type": "string",
        "description": "The full text the field should contain afterwards. Replaces the current text rather than appending to it."
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
- **TextInput** "Callsign" [empty, required] → tool `fill-callsign`
  - part `hint` "Uppercase, three to eight letters"
```

## Accessibility

- Role: `textbox`
- Keyboard: Standard text editing, Tab moves through the field
- Notes: The label element is associated via htmlFor. An error sets aria-invalid and is linked with aria-describedby, as is the hint. Focus is an offset keyline, never a rounded ring.
