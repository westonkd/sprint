# SegmentedControl

> A short row of mutually exclusive options, all visible at once: a radio group that registers a single select tool whose schema enumerates the options currently on screen.

- Category: input
- Status: experimental

## When to use

Use it for two to four exclusive choices a person should be able to compare without opening anything: a view switch, a density setting, a filter. One tool with an enum beats one tool per option, and it keeps a page's tool count flat as options are added.

### When not to

Do not use it for more than about four options or for long labels; that is a select. Do not use it for an on/off setting, which is a switch, and never for navigation.

## Install

```tsx
import { SegmentedControl } from "sprint";
import "sprint/styles.css";
```

## Examples

### A view switch

In agent view each option renders as its own control, so an agent driving the DOM can click one without WebMCP.

```tsx
<SegmentedControl
  label="Page view"
  value={view}
  onChange={setView}
  options={[
    { value: "human", label: "human" },
    { value: "agent", label: "agent" },
  ]}
/>
```

### A disabled control

Disabled unregisters the tool, so an agent cannot select an option a person could not.

```tsx
<SegmentedControl
  label="Density"
  disabled
  value="dense"
  onChange={setDensity}
  options={[
    { value: "dense", label: "dense" },
    { value: "roomy", label: "roomy" },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is being chosen. Names the group for a screen reader and derives the tool name, so prefer a noun phrase such as "Page view". |
| `options` | array (required) | — | The choices in display order: { value, label }. The label is what a person sees and what the select tool accepts, so an agent never has to know the value. |
| `value` | string (required) | — | The value of the selected option. The control is fully controlled. |
| `onChange` | handler (required) | — | Called with the newly selected value. The select tool drives a real click, so this runs for agent selections too. |
| `disabled` | boolean | `false` | Disable every option and unregister the select tool. |
| `agentName` | string | — | Override the label used to derive the tool name, when two controls on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the control without registering a select tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The value of the option currently selected. |
| `data-sprint-disabled` | present or absent | Present when no option can be chosen. |

## WebMCP tools

### `<scope>-select-<label>`

Select one of this control's options by its visible label, exactly as a person clicking it would. Only one option is selected at a time, so this replaces the current one. Returns the control's state after the change, so a follow-up read is unnecessary.

- Read-only: no
- Registered when: The control is mounted, enabled, has a resolvable label, and no other component claims the same tool name. The registered schema enumerates the current option labels.
- Unregistered when: The control unmounts or becomes disabled.

```json
{
  "name": "<scope>-select-<label>",
  "description": "Select one of this control's options by its visible label, exactly as a person clicking it would. Only one option is selected at a time, so this replaces the current one. Returns the control's state after the change, so a follow-up read is unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "option": {
        "type": "string",
        "description": "The visible label of the option to select, as shown on the control."
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
- **SegmentedControl** "Page view" [value=human] → tool `select-page-view`
  - part `option` "human" [checked]
  - part `option` "agent"
```

## Accessibility

- Role: `radiogroup`
- Keyboard: Arrow keys move to the next or previous option and select it, Home selects the first option, End selects the last option, Tab enters and leaves the group once
- Notes: Roving tabindex: only the selected option is in the tab order. Selection follows focus, which is the expected behaviour for a radio group.
