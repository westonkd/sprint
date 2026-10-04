# Select

> A dropdown of mutually exclusive options: a select-only combobox that opens a listbox on click or keyboard, carrying its own label, hint, and error. It registers a single select tool whose schema enumerates the option labels currently on offer.

- Category: input
- Status: experimental

## When to use

Use it when one value is chosen from a list too long to lay out flat: a region, a squad, a category. Options are data ({ value, label }), the tool accepts the visible label, and in agent view every option renders as its own control, so an agent picks one without opening anything.

### When not to

Do not use it for two to four short options a person should compare at a glance; that is a SegmentedControl. Do not use it for a list long enough to need searching, grouping or custom option rendering; that is a Combobox. Do not use it for an on/off state, which is a Checkbox or a Switch, and never for navigation.

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

### Options with counts

A count is data, not label text: it renders as a chip in the list and the closed control, joins the accessible name, and reaches agents as part state while the select tool still takes the plain label.

```tsx
<Select
  label="Region"
  value={region}
  onChange={setRegion}
  placeholder="Choose a region"
  options={[
    { value: "na-1", label: "North Atlantic", count: 12 },
    { value: "eu-1", label: "Northern Europe", count: 30 },
    { value: "ap-1", label: "East Asia", count: 7 },
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
| `options` | array (required) | — | The choices in display order: { value, label, count? }. The label is what a person sees and what the select tool accepts, so an agent never has to know the value. count renders as a muted chip beside the label and reaches the agent view as part state, so never fold a count into the label. |
| `value` | string (required) | — | The value of the chosen option, or "" while nothing is chosen yet. The control is fully controlled. |
| `onChange` | handler (required) | — | Called with the newly chosen value. The select tool clicks the real option, so this runs for agent selections too. |
| `placeholder` | string | — | Shown in the closed control while value is "". It is not an option, so a person cannot choose it back. |
| `hint` | string | — | Guidance shown under the control and carried into the agent view. Replaced by error while one is set. |
| `error` | string | — | A validation message. Marks the control invalid for people, screen readers, and agents alike. |
| `name` | string | — | The form name submitted with the surrounding form, through a hidden input carrying the value. |
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
| `data-sprint-active` | present or absent | On an option part, present while the list is open and that option is highlighted by the keyboard or pointer. |

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
  - part `option` "North Atlantic" [count=12]
  - part `option` "Northern Europe" [checked, count=30]
  - part `option` "East Asia" [count=7]
```

## Accessibility

- Role: `combobox`
- Keyboard: Enter, Space, or an arrow key opens the list, Arrow keys, Home, and End move through the options; typing a letter jumps to the next match, Enter or Space chooses the highlighted option, Escape or Tab closes the list without choosing
- Notes: A select-only combobox: a button with role combobox that opens a listbox on a plain click, so a synthetic element.click() opens it as reliably as a pointer does, and the list renders in the page rather than in browser chrome an automated session cannot see. Focus stays on the button and aria-activedescendant tracks the highlighted option. The label is linked with aria-labelledby; errors set aria-invalid and link with aria-describedby. An option with a count is named by its label and count together.
