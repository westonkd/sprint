# SearchField

> A search box inside its own search landmark: a labelled query field with a clear control, Escape to clear, Enter to submit, and an optional page-wide key that focuses it. It registers one search tool that sets the query and submits it.

- Category: input
- Status: experimental

## When to use

Use it to filter or search a collection on the page, such as narrowing a users list by name. The landmark lets screen reader users jump straight to it, and the optional shortcut gives keyboard users the familiar slash-to-search.

### When not to

Do not use it for any other single-line value; a name, an email address, or an identifier is a TextInput. Do not use it to choose from a short known set, which is a Select or a SegmentedControl. Do not give two fields on one page the same shortcut.

## Install

```tsx
import { SearchField } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Filtering a list

A live filter: onChange narrows the list as the person types, so there is no onSubmit. The label is hidden and the placeholder says what can be matched.

```tsx
<SearchField
  label="Users"
  hideLabel
  value={query}
  onChange={setQuery}
  placeholder="Name or email"
/>
```

### A slash shortcut

Pressing / anywhere on the page focuses the field unless focus is already in something editable. The key chip disappears once the field has focus or a query.

```tsx
<SearchField
  label="Users"
  value={query}
  onChange={setQuery}
  shortcut="/"
  placeholder="Name or email"
/>
```

### Submitting a query

For a search that is too costly to run on every keystroke, onSubmit receives the query on Enter and when the search tool runs.

```tsx
<SearchField
  label="Flight logs"
  value={query}
  onChange={setQuery}
  onSubmit={runSearch}
  placeholder="Callsign or tail number"
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is being searched, as a noun phrase such as "Users". Names the landmark and the field, and derives the tool name, so "Users" becomes search-users. |
| `value` | string (required) | — | The current query. The field is fully controlled. |
| `onChange` | handler (required) | — | Called with the new query on every change, including the clear control, Escape, and the search tool. |
| `onSubmit` | handler | — | Called with the query when Enter is pressed or the search tool runs. Leave it off for a live filter that reacts to onChange alone. |
| `placeholder` | string | — | Ghost text shown while the field is empty, e.g. "Name or email". |
| `hideLabel` | boolean | `false` | Hide the label visually while keeping it for screen readers and agents. Pair it with a placeholder so sighted people still know what the field searches. |
| `shortcut` | string | — | A single key that focuses the field from anywhere on the page, shown as a key chip while the field is empty and unfocused. Ignored while focus is in another editable element or a modifier is held. Pass "/" for the common convention; omit or pass false for none. |
| `name` | string | — | The native form name of the query input. |
| `disabled` | boolean | `false` | Disable the field, its shortcut, and its search tool. |
| `agentName` | string | — | Override the label used to derive the tool name, when two search fields on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the field without registering a search tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-value` | present or absent | The current query, absent while the field is empty. |
| `data-sprint-empty` | present or absent | Present while the field holds no query. |
| `data-sprint-shortcut` | present or absent | The key that focuses the field from anywhere on the page. |
| `data-sprint-disabled` | present or absent | Present when the field cannot be edited. |

## WebMCP tools

### `<scope>-search-<label>`

Search with this field: replace its text with the query, exactly as a person typing it would, then submit it as pressing Enter would. Pass an empty string to clear the search. Results usually render elsewhere on the page; this returns the field's state after the search, so read the results region next.

- Read-only: no
- Registered when: The field is mounted, enabled, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The field unmounts or becomes disabled.

```json
{
  "name": "<scope>-search-<label>",
  "description": "Search with this field: replace its text with the query, exactly as a person typing it would, then submit it as pressing Enter would. Pass an empty string to clear the search. Results usually render elsewhere on the page; this returns the field's state after the search, so read the results region next.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The full search text. Replaces the current query rather than appending to it; an empty string clears the search."
      }
    },
    "required": [
      "query"
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
- **SearchField** "Users" [empty, shortcut=/] → tool `search-users`
```

## Accessibility

- Role: `search`
- Keyboard: Enter submits the query, Escape clears a non-empty query and keeps focus; on an empty field it passes through, so an enclosing dialog can close, The shortcut key, when set, focuses the field from anywhere on the page
- Notes: The root is a form with role search, labelled by the field's label, so it is listed as a search landmark. The input is type search and announces its shortcut with aria-keyshortcuts; the key chip itself is hidden from assistive technology. The clear control appears only while there is a query, and returns focus to the field.
