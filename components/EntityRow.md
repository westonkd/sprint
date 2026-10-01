# EntityRow

> One record in a list of records, as a single clickable row: a title, a few Tags, and one line of meta. Give it an href and the whole row is a link; give it onSelect and it is an action that registers an open tool.

- Category: display
- Status: experimental

## When to use

Use it for a list of people, projects, or anything else a person scans and picks one of, where each entry needs a name, a classification, and a line of context such as last activity. Stack several in a Stack with gap="none" and adjacent rows share their keylines. The title is the accessible name, so it is also what an agent selects on.

### When not to

Do not use it when the entries are compared column by column; that is a Table. Do not use it for a catalogue entry with a paragraph of body; that is a Card. Do not put controls in it: the whole row is already one link or button, so tags and meta are data, not components.

## Install

```tsx
import { EntityRow } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A person in a directory

A row that navigates. No tool, because the href is already public; tags and meta are data.

```tsx
<EntityRow
  title="Ada Lovelace"
  href="#/people/ada"
  tags={[{ label: "admin", tone: "info" }, { label: "billing" }]}
  meta={[{ term: "Last sign-in", detail: "3 days ago" }, "2 apps"]}
/>
```

### A row that acts

onSelect instead of href, so the row registers open-grace-hopper and an agent can pick it.

```tsx
<EntityRow
  title="Grace Hopper"
  onSelect={() => select("grace")}
  tags={[{ label: "owner", tone: "warning" }]}
  meta={["Invited yesterday"]}
/>
```

### A directory of rows

Rows stacked with no gap share their keylines, so the list reads as one ruled block.

```tsx
<Stack gap="none">
  {people.map((person) => (
    <EntityRow
      key={person.id}
      title={person.name}
      href={person.href}
      tags={person.roles.map((role) => ({ label: role }))}
      meta={[{ term: "Last sign-in", detail: person.lastSignIn }]}
    />
  ))}
</Stack>
```

### With a description

A sentence under the row, for a record that needs one.

```tsx
<EntityRow
  title="Payments service"
  href="#/projects/payments"
  tags={[{ label: "degraded", tone: "danger" }]}
  meta={["Updated 4 min ago"]}
  description="Card authorisations are timing out in eu-west."
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `title` | string (required) | — | The record's name, and the row's accessible name. Also derives the tool name when the row acts. |
| `href` | string | — | Destination, which makes the whole row a link. A row that navigates registers no tool by default, because an agent can follow the href itself. |
| `onSelect` | handler | — | What clicking does, called with the click event. Alone it makes the row a button that registers an open tool by default. Alongside href the row stays a link and the handler rides the click, so a router can call preventDefault. |
| `tags` | array | — | Classifications rendered as Tags after the title: { label, tone? }, where tone is one of the Tag tones. Carried as Tag lines under the row in the agent view. |
| `meta` | array | — | One line of context, each entry a string or { term?, detail }, joined with a middle dot. Truncates rather than wraps when the row is short of room. Carried as the meta part. |
| `description` | string | — | An optional sentence under the row, for a record that needs more than a line of meta. Carried as the description part. |
| `disabled` | boolean | `false` | Disable an acting row and unregister its tool. Has no effect on a row that navigates or does nothing. |
| `agentTool` | boolean | — | Override the default: on for a row that acts, off for a row that navigates. A row with neither href nor onSelect never registers one. |
| `agentName` | string | — | Override the title used to derive the tool name, when two rows share a title. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-href` | present or absent | Where the row goes, when it navigates. |
| `data-sprint-disabled` | present or absent | Present when an acting row cannot be opened. |

## WebMCP tools

### `<scope>-open-<label>`

Open this row, exactly as a person clicking it would. What opening does is the row's own business: it may select the record, reveal its detail, or start a flow. Returns the row's state after the click.

- Read-only: no
- Registered when: The row acts rather than navigates, is mounted, enabled, has a resolvable title, and no other component claims the same tool name.
- Unregistered when: The row unmounts, becomes disabled, or turns into a link by taking an href.

```json
{
  "name": "<scope>-open-<label>",
  "description": "Open this row, exactly as a person clicking it would. What opening does is the row's own business: it may select the record, reveal its detail, or start a flow. Returns the row's state after the click.",
  "inputSchema": {
    "type": "object",
    "properties": {}
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
- **EntityRow** "Ada Lovelace" [href=#/people/ada]
  - part `title` "Ada Lovelace"
  - part `meta` "Last sign-in: 3 days ago · 2 apps"
  - **Tag** "admin" [tone=info]
  - **Tag** "billing" [tone=neutral]
```

## Accessibility

- Notes: The whole row is one control: a link with an href, a button with onSelect, or a labelled group with neither. The title is the accessible name, and the tags, meta, and description are its accessible description, so a screen reader announces the name first and the context after.
