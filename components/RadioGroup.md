# RadioGroup

> One choice from a short list of options, each a native radio button with a label and an optional line of description. Registers one select tool enumerating the options.

- Category: input
- Status: experimental

## When to use

Use when the options need explaining: a role with what it can do, a plan with what it includes, a delivery speed with its cost. Options hold data: { value, label, description?, disabled? }. The group is a fieldset whose legend is the label, so it submits under one name inside a form.

### When not to

Do not use for two to four short labels that need no description; that is a SegmentedControl. Do not use for a long list; that is a Select. Do not use for choosing several; that is a set of Checkboxes. Descriptions are plain strings, not components.

## Install

```tsx
import { RadioGroup } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Options that need explaining

Each role says what it allows. The descriptions reach screen readers through aria-describedby and agents through part state.

```tsx
<RadioGroup
  label="Role"
  value={role}
  onChange={setRole}
  options={[
    { value: "viewer", label: "Viewer", description: "Sees the board and the agenda." },
    { value: "editor", label: "Editor", description: "Moves people between callings." },
    { value: "admin", label: "Admin", description: "Also invites and removes people." },
  ]}
/>
```

### A required choice with an unavailable option

```tsx
<RadioGroup
  label="Delivery"
  required
  value={delivery}
  onChange={setDelivery}
  error={delivery === "" ? "Choose how to send the invite." : undefined}
  options={[
    { value: "email", label: "Email" },
    { value: "text", label: "Text message", disabled: true, description: "No phone number on file." },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The question the options answer, such as "Role". Rendered as the legend and used to derive the tool name. |
| `options` | array (required) | — | The options in order: { value, label, description?, disabled? }. label is what a person reads and what the select tool accepts. description is a sentence under the label, linked to its radio with aria-describedby and carried into the agent view as part state. |
| `value` | string (required) | — | The selected option's value, or an empty string for none. Fully controlled. |
| `onChange` | handler (required) | — | Called with the value a person or an agent selects. |
| `hint` | string | — | Guidance under the group. Replaced by error while one is set. |
| `error` | string | — | A validation message that marks the group invalid. |
| `name` | string | — | The native form name the selected value submits under. |
| `disabled` | boolean | `false` | Disable every option and unregister the select tool. |
| `required` | boolean | `false` | Mark the group as needing an answer. |
| `agentName` | string | — | Override the label used to derive the tool name. |
| `agentTool` | boolean | `true` | Set false to render the group without registering the select tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The selected option's label. |
| `data-sprint-empty` | present or absent | Present while nothing is selected. |
| `data-sprint-disabled` | present or absent | Present when the group cannot be changed. |
| `data-sprint-required` | present or absent | Present when an answer is needed. |
| `data-sprint-invalid` | present or absent | Present while an error is set. |

## WebMCP tools

### `<scope>-select-<label>`

Select one of this group's options by its visible label, exactly as a person clicking its radio button would. Only one option is selected at a time, so this replaces the current one. Returns the group's state after the change.

- Read-only: no
- Registered when: The group is mounted and enabled, has at least one enabled option, and no other component claims the same tool name. The registered schema enumerates the enabled options' labels.
- Unregistered when: The group unmounts, becomes disabled, or loses its last enabled option.

```json
{
  "name": "<scope>-select-<label>",
  "description": "Select one of this group's options by its visible label, exactly as a person clicking its radio button would. Only one option is selected at a time, so this replaces the current one. Returns the group's state after the change.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "option": {
        "type": "string",
        "description": "The visible label of the option to select."
      }
    },
    "required": [
      "option"
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
- **RadioGroup** "Role" [value=Viewer] → tool `select-role`
  - part `option` "Viewer" [checked, description=Sees the board]
  - part `option` "Editor" [description=Changes callings]
```

## Accessibility

- Role: `radiogroup`
- Keyboard: Arrow keys move between options and select, Tab enters and leaves the group
- Notes: A fieldset of native radio inputs sharing one name, so the browser supplies arrow-key movement and form submission. The legend names the group; a description is linked to its own radio.
