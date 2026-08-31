# Select

> A dropdown of mutually exclusive options behind a native select, carrying its own label, hint, and error. It registers a single select tool whose schema enumerates the option labels currently on offer.

- Category: input
- Status: experimental

## When to use

Use it when one value is chosen from a list too long to lay out flat: a region, a squad, a category. Options are data ({ value, label }), the tool accepts the visible label, and in agent view every option renders as its own control, so an agent picks one without opening anything.

### When not to

Do not use it for two to four short options a person should compare at a glance; that is a SegmentedControl. Do not use it for an on/off state, which is a Checkbox or a Switch, and never for navigation.

## Install

```tsx
import { Select } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A dropdown

In agent view each option renders as its own control, so a DOM-driving agent chooses one directly.

```tsx
<Select
  label="Region"
  value={region}
  onChange={setRegion}
  placeholder="Choose a region"
  options={[
    { value: "na-1", label: "North Atlantic" },
    { value: "eu-1", label: "Northern Europe" },
    { value: "ap-1", label: "East Asia" },
  ]}
/>
```

### A required choice with an error

Empty plus required plus an error is how an unmade mandatory choice reads on every surface.

```tsx
<Select
  label="Launch site"
  value={site}
  onChange={setSite}
  required
  error="Choose a site before continuing."
  options={[
    { value: "ksc", label: "Cape Canaveral" },
    { value: "vsfb", label: "Vandenberg" },
  ]}
/>
```

### A disabled dropdown

Disabled unregisters the tool, so an agent cannot choose what a person could not.

```tsx
<Select
  label="Relay"
  disabled
  value="r-2"
  onChange={setRelay}
  options={[
    { value: "r-1", label: "Relay one" },
    { value: "r-2", label: "Relay two" },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is being chosen. Names the control for a screen reader and derives the tool name, so prefer a noun phrase such as "Region". |
| `options` | array (required) | — | The choices in display order: { value, label }. The label is what a person sees and what the select tool accepts, so an agent never has to know the value. |
| `value` | string (required) | — | The value of the chosen option, or "" while nothing is chosen yet. The control is fully controlled. |
| `onChange` | handler (required) | — | Called with the newly chosen value. The select tool drives a real change event, so this runs for agent selections too. |
| `placeholder` | string | — | Shown while value is "". Rendered as a disabled option, so a person cannot choose it back. |
| `hint` | string | — | Guidance shown under the control and carried into the agent view. Replaced by error while one is set. |
| `error` | string | — | A validation message. Marks the control invalid for people, screen readers, and agents alike. |
| `name` | string | — | The native form name submitted with the surrounding form. |
| `disabled` | boolean | `false` | Disable the control and unregister its select tool. |
| `required` | boolean | `false` | Mark the control required, visually and in the agent view. |
| `agentName` | string | — | Override the label used to derive the tool name, when two controls on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the control without registering a select tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The value of the option currently chosen. |
| `data-sprint-empty` | present or absent | Present while no option is chosen. |
| `data-sprint-disabled` | present or absent | Present when nothing can be chosen. |
| `data-sprint-required` | present or absent | Present when a choice must be made. |
| `data-sprint-invalid` | present or absent | Present while an error is set. |

## WebMCP tools

### `<scope>-select-<label>`

Choose one of this dropdown's options by its visible label, exactly as a person opening it and clicking one would. Only one option is chosen at a time, so this replaces the current choice. Returns the dropdown's state after the change, so a follow-up read is unnecessary.

- Read-only: no
- Registered when: The dropdown is mounted, enabled, has a resolvable label, and no other component claims the same tool name. The registered schema enumerates the current option labels.
- Unregistered when: The dropdown unmounts or becomes disabled.

```json
{
  "name": "<scope>-select-<label>",
  "description": "Choose one of this dropdown's options by its visible label, exactly as a person opening it and clicking one would. Only one option is chosen at a time, so this replaces the current choice. Returns the dropdown's state after the change, so a follow-up read is unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "option": {
        "type": "string",
        "description": "The visible label of the option to choose, as a person reads it in the list."
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
- **Select** "Region" [value=eu-1] → tool `select-region`
  - part `option` "North Atlantic"
  - part `option` "Northern Europe" [checked]
  - part `option` "East Asia"
```

## Accessibility

- Role: `combobox`
- Keyboard: Arrow keys move through the options, Enter or Space opens the list, Escape closes it
- Notes: A native select element, so the platform owns the listbox interaction. The label is associated via htmlFor; errors set aria-invalid and link with aria-describedby.
