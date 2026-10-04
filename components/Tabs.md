# Tabs

> Sibling views of one subject, one shown at a time, with real tablist, tab and tabpanel semantics. Registers one select tool enumerating the tabs.

- Category: navigation
- Status: experimental

## When to use

Use to switch between a few views of the same thing without leaving the page: coming up, past and by member for one set of speakers; details and history for one record. Tabs hold data: each is { value, label, panel, count?, disabled? }, and only the selected tab's panel is mounted. An optional actions slot sits at the end of the tab row.

### When not to

Do not use to pick a value that filters or changes something else on the page; that is a SegmentedControl, a radio group. Do not use for navigation between pages with their own URLs; that is a Nav. Do not use when a person needs to compare the views side by side.

## Install

```tsx
import { Tabs } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Views of one subject

Only the selected panel is on the page. An agent switches with the select tool or the tab controls in the agent view, then reads the new panel.

```tsx
<Tabs
  label="Speakers"
  tabs={[
    { value: "upcoming", label: "Coming up", count: 4, panel: <UpcomingSpeakers /> },
    { value: "past", label: "Past", panel: <PastSpeakers /> },
    { value: "member", label: "By member", panel: <SpeakersByMember /> },
  ]}
/>
```

### Tabs with an action

actions sits at the end of the tab row and stays put while the panels change. A disabled tab is visible but cannot be selected.

```tsx
<Tabs
  label="Record"
  value={view}
  onChange={setView}
  actions={<Button size="small">Export</Button>}
  tabs={[
    { value: "details", label: "Details", panel: <Details /> },
    { value: "history", label: "History", panel: <History /> },
    { value: "audit", label: "Audit", disabled: true, panel: null },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the tabs switch between, such as "Speakers". Names the tablist and derives the select tool name. |
| `tabs` | array (required) | — | The tabs in order: { value, label, panel, count?, disabled? }. panel is the content shown while the tab is selected and may hold any components. count renders as a chip beside the label and reaches the agent view as part state. |
| `value` | string | — | The selected tab's value, when the page owns that state. Pair it with onChange. A disabled or unknown value falls back to the first enabled tab. |
| `defaultValue` | string | — | The tab selected first when the Tabs keep their own state. |
| `onChange` | handler | — | Called with the value of the tab a person or an agent selects. |
| `actions` | node | — | Controls at the end of the tab row, such as an add Button that applies to every tab. |
| `agentName` | string | — | Override the label used to derive the tool name. |
| `agentTool` | boolean | `true` | Set false to render the tabs without registering the select tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The selected tab's label. |

## WebMCP tools

### `<scope>-select-<label>`

Show one of these tabs by its visible label, exactly as a person clicking the tab would. Only the selected tab's panel is on the page, so read the page again after switching to see its contents. Returns the tabs' state after the change.

- Read-only: no
- Registered when: The tabs are mounted, at least one tab is enabled, and no other component claims the same tool name. The registered schema enumerates the enabled tabs' labels.
- Unregistered when: The tabs unmount or every tab is disabled.

```json
{
  "name": "<scope>-select-<label>",
  "description": "Show one of these tabs by its visible label, exactly as a person clicking the tab would. Only the selected tab's panel is on the page, so read the page again after switching to see its contents. Returns the tabs' state after the change.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tab": {
        "type": "string",
        "description": "The visible label of the tab to show."
      }
    },
    "required": [
      "tab"
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
- **Tabs** "Speakers" [value=Coming up] → tool `select-speakers`
  - part `tab` "Coming up" [count=4, selected]
  - part `tab` "Past"
```

## Accessibility

- Role: `tablist`
- Keyboard: Left and Right Arrow move to the previous or next enabled tab and show it, Home and End show the first and last enabled tab, Tab moves from the selected tab into its panel
- Notes: Roving tabindex across the tabs, with selection following focus. The panel is a focusable tabpanel labelled by its tab. A count chip is hidden from assistive technology, so the tab is named by its label alone.
