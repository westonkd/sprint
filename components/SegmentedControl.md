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
import { SegmentedControl } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
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

### Options with counts

A count is data, not label text: it renders as a chip, joins the accessible name, and reaches agents as part state while the select tool still takes the plain label.

```tsx
<SegmentedControl
  label="Members"
  value={filter}
  onChange={setFilter}
  options={[
    { value: "all", label: "All", count: 48 },
    { value: "active", label: "Active", count: 18 },
    { value: "never", label: "Never signed in", count: 30 },
  ]}
/>
```

### A staged change

savedValue keeps the value in effect visible while another is selected, and hint says what confirming will do. The control reports itself dirty until the two agree.

```tsx
<SegmentedControl
  label="Access"
  value={access}
  savedValue="read"
  onChange={setAccess}
  hint="Currently Read. Nothing changes until you confirm."
  options={[
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
    { value: "admin", label: "Admin" },
  ]}
/>
```

### A full-width control

block fills the container and shares the width equally between options. Without it the control keeps its own width inside a stretching Stack.

```tsx
<SegmentedControl
  label="Range"
  block
  value={range}
  onChange={setRange}
  options={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
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
| `options` | array (required) | — | The choices in display order: { value, label, count? }. The label is what a person sees and what the select tool accepts, so an agent never has to know the value. count renders as a muted chip beside the label and reaches the agent view as part state, so never fold a count into the label. |
| `value` | string (required) | — | The value of the selected option. The control is fully controlled. |
| `onChange` | handler (required) | — | Called with the newly selected value. The select tool drives a real click, so this runs for agent selections too. |
| `savedValue` | string | — | The value currently in effect, for a control that stages a change until something confirms it. While it differs from value the saved option keeps a marker and the control reports itself dirty, so both the saved and the proposed choice stay readable. |
| `hint` | string | — | Guidance shown under the options, linked with aria-describedby and carried into the agent view. Say what a staged change does, such as when it takes effect. |
| `block` | boolean | `false` | Fill the container's width, with every option taking an equal share. Without it the control stays as wide as its options, even inside a stretching column. |
| `disabled` | boolean | `false` | Disable every option and unregister the select tool. |
| `agentName` | string | — | Override the label used to derive the tool name, when two controls on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the control without registering a select tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The value of the option currently selected. |
| `data-sprint-dirty` | present or absent | Present while savedValue is set and differs from value. The saved option carries data-sprint-saved. |
| `data-sprint-block` | present or absent | Present when the control fills its container. |
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
- **SegmentedControl** "Access" [dirty, value=write] → tool `select-access`
  - part `option` "Read" [count=17, saved]
  - part `option` "Write" [checked, count=4]
  - part `hint` "Currently Read. Nothing changes until you confirm."
```

## Accessibility

- Role: `radiogroup`
- Keyboard: Arrow keys move to the next or previous option and select it, Home selects the first option, End selects the last option, Tab enters and leaves the group once
- Notes: Roving tabindex: only the selected option is in the tab order. Selection follows focus, which is the expected behaviour for a radio group. An option with a count is named by its label and its count together; the hint is linked to the group with aria-describedby.
