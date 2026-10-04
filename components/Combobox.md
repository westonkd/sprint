# Combobox

> A searchable single-choice field for long lists: type to filter, arrow to an option, Enter to pick. Options can be grouped, described, limited per group and rendered your own way. Registers one choose tool that takes a label or a search.

- Category: input
- Status: experimental

## When to use

Use when there are too many options to scan: a member picker over hundreds of people, a calling picker grouped by organization, a board filter. Options hold data: { value, label, group?, description?, keywords?, disabled? }. The default filter matches every word of the query against the label, description and keywords, ignoring case and accents. For a server-side search, pass filter={false}, update options from onQueryChange, and set loading while results arrive.

### When not to

Do not use for a short list a person can scan at once; that is a Select, or a SegmentedControl for two to four options. Do not use for free text that only suggests; this field only accepts its options. Do not use for choosing several values.

## Install

```tsx
import { Combobox } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A grouped member picker

Hundreds of members grouped by organization, at most five per group until the person types. An agent passes a name, or part of one, to the choose tool.

```tsx
<Combobox
  label="Member"
  placeholder="Search members"
  value={memberId}
  onChange={setMemberId}
  groupLimit={5}
  options={members.map((member) => ({
    value: member.id,
    label: member.name,
    group: member.organization,
    keywords: [member.preferredName],
  }))}
/>
```

### Options drawn your own way

renderOption draws each option with an avatar; the label still drives search, announcement and the agent view.

```tsx
<Combobox
  label="Speaker"
  value={speaker}
  onChange={setSpeaker}
  options={members}
  renderOption={(option) => (
    <Stack direction="row" gap="snug" align="center">
      <Avatar name={option.label} size="small" decorative />
      <Text as="span">{option.label}</Text>
    </Stack>
  )}
/>
```

### A server-side search

filter={false} trusts the options as given; the page searches on each onQueryChange and shows the spinner meanwhile.

```tsx
<Combobox
  label="Calling"
  value={calling}
  onChange={setCalling}
  filter={false}
  onQueryChange={search}
  loading={searching}
  options={results}
  error={calling === "" ? "Choose a calling." : undefined}
  required
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is being chosen, such as "Member". Names the field and derives the tool name. |
| `options` | array (required) | — | The options: { value, label, group?, description?, keywords?, disabled? }. Consecutive and non-consecutive options sharing a group are gathered under one heading, in the order groups first appear. keywords are extra search terms that are never shown. |
| `value` | string (required) | — | The chosen option's value, or an empty string for none. Fully controlled. |
| `onChange` | handler (required) | — | Called with the chosen value, or an empty string when cleared. |
| `placeholder` | string | — | Ghost text while nothing is chosen or while searching. |
| `hint` | string | — | Guidance under the field. Replaced by error while one is set. |
| `error` | string | — | A validation message that marks the field invalid. |
| `name` | string | — | The native form name the chosen value submits under. |
| `disabled` | boolean | `false` | Disable the field and unregister the choose tool. |
| `required` | boolean | `false` | Mark the field required. A required field is not clearable by default. |
| `hideLabel` | boolean | `false` | Hide the label visually while keeping it for screen readers and agents. Pair it with a placeholder. |
| `clearable` | boolean | — | Show a clear control while something is chosen. Defaults to not required. |
| `clearLabel` | string | `"Clear"` | Accessible name of the clear control. |
| `loading` | boolean | `false` | Show a small spinner in the field while options are being fetched. |
| `filter` | handler | — | (option, query) => boolean, replacing the built-in word match. Pass false when the options are already the results of a search the page ran. |
| `onQueryChange` | handler | — | Called with the search text as it changes, and with an empty string on close. |
| `groupLimit` | number | — | Show at most this many options per group, with a "more; keep typing" note for the rest, so one large group cannot bury the others. |
| `limit` | number | `200` | Show at most this many options in total. |
| `emptyLabel` | string | `"No matches"` | What the list says when nothing matches. |
| `renderOption` | handler | — | (option) => ReactNode, drawing an option your own way, such as with an Avatar. It is the human rendering only: the label is still what is searched, announced and offered to agents. |
| `inputRef` | object | — | A ref to the underlying input, for focusing it. |
| `agentName` | string | — | Override the label used to derive the tool name. |
| `agentTool` | boolean | `true` | Set false to render the field without registering the choose tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The chosen option's label. |
| `data-sprint-empty` | present or absent | Present while nothing is chosen. |
| `data-sprint-options` | present or absent | How many options the field holds. |
| `data-sprint-loading` | present or absent | Present while options are being fetched. |
| `data-sprint-disabled` | present or absent | Present when the field cannot be changed. |
| `data-sprint-required` | present or absent | Present when a choice is needed. |
| `data-sprint-invalid` | present or absent | Present while an error is set. |

## WebMCP tools

### `<scope>-choose-<label>`

Choose an option in this searchable field. Pass an option's exact label to select it. Pass part of a label to search: one match is selected, several are listed back so you can call again with the exact label. Pass an empty string to clear a field that allows clearing. Returns the field's state after the change.

- Read-only: no
- Registered when: The field is mounted and enabled, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The field unmounts or becomes disabled.

```json
{
  "name": "<scope>-choose-<label>",
  "description": "Choose an option in this searchable field. Pass an option's exact label to select it. Pass part of a label to search: one match is selected, several are listed back so you can call again with the exact label. Pass an empty string to clear a field that allows clearing. Returns the field's state after the change.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "option": {
        "type": "string",
        "description": "An exact option label, a search for one, or an empty string to clear the field."
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
- **Combobox** "Member" [empty, options=312, listed=50] → tool `choose-member`
  - part `option` "Ada Okafor" [group=Elders quorum]
```

## Accessibility

- Role: `combobox`
- Keyboard: Typing filters and opens the list, Down and Up Arrow open the list and move between enabled options, Ctrl+Home and Ctrl+End jump to the first and last option, Enter chooses the highlighted option, Escape closes the list and restores the chosen label
- Notes: An editable combobox with list autocomplete. Focus stays in the input and aria-activedescendant follows the highlighted option. Groups are labelled role=group sections. The list is a popover in the top layer, rendered in place, so it opens above a modal Dialog and flips above the field when there is no room below.
