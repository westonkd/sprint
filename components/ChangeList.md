# ChangeList

> A review of what will change or has changed: each row is marked added, removed or changed, and a changed row reads from → to. The kind of every row is a glyph, a tone and spoken text at once, and an agent reads it as state rather than from the glyph.

- Category: display
- Status: experimental

## When to use

Use it to show a diff before someone confirms it: a role change from Write to Maintain, members added to a team, settings a migration will drop. Pass the changes as data so each row is an addressable part carrying its kind, from and to. It registers no tool, because it only reports: the action is the Button that confirms the change, and the rows are already fully readable in the agent view.

### When not to

Do not use it for a list whose marks carry no meaning; that is List. Do not use it for a full record of fields; that is DescriptionList or Table. Do not put components in a change; label, from, to and detail are text.

## Install

```tsx
import { ChangeList } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A role change

The one row a permission review is about: what it was, and what it becomes.

```tsx
<ChangeList
  label="Role changes"
  changes={[{ kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" }]}
/>
```

### A review before confirming

Additions, removals and changes together, each with a line of consequence where one matters.

```tsx
<ChangeList
  label="Team changes"
  changes={[
    { kind: "added", label: "Grace Hopper", detail: "Gets read access to every repository." },
    { kind: "removed", label: "Alan Turing" },
    { kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" },
  ]}
/>
```

### Nothing to change

An empty review says so rather than rendering nothing.

```tsx
<ChangeList label="Role changes" changes={[]} emptyLabel="No role changes" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is changing. Names the list for a screen reader and for the agent view. |
| `changes` | array (required) | — | The rows in order, each { kind, label, from?, to?, detail? }. kind is "added", "removed" or "changed"; label is the thing that changed; from and to are its old and new values, usually on a changed row; detail is one short line of consequence beneath it. |
| `emptyLabel` | string | `"No changes"` | What the list says when there is nothing to change. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-changes` | present or absent | How many rows the list has. |
| `data-sprint-added` | present or absent | How many rows are additions. Absent when there are none. |
| `data-sprint-removed` | present or absent | How many rows are removals. Absent when there are none. |
| `data-sprint-changed` | present or absent | How many rows are changes of value. Absent when there are none. |
| `data-sprint-empty` | present or absent | Present when there is nothing to change. |
| `data-sprint-kind` | added \\| removed \\| changed | On a change: whether the row was added, removed or changed. |
| `data-sprint-from` | present or absent | On a change: the old value, when it has one. |
| `data-sprint-to` | present or absent | On a change: the new value, when it has one. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **ChangeList** "Role changes" [changed=1, changes=1]
  - part `change` "Changed: Ada Lovelace, from Write to Maintain" [from=Write, kind=changed, to=Maintain]
```

## Accessibility

- Role: `list`
- Notes: A ul named by its label, with an explicit list role. The +, − and → glyphs are aria-hidden; each row instead starts with visually hidden text naming its kind, and a changed row says from and to in words, so the kind never rests on the glyph or its color alone. Old values are a del and new values an ins.
