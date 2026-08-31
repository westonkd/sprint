# Card

> One entry in a catalogue: a title, a line or two of body, and the whole block clickable. Give it an href and it is a link; give it onClick and it is an action that registers an open tool.

- Category: navigation
- Status: experimental

## When to use

Use it in a grid of comparable things a person picks between: components in a catalogue, results in a list, templates to start from. The title is the accessible name, so it is also what an agent selects on.

### When not to

Do not use it for a static region with a header; that is Panel. Do not put separate controls inside one, because the whole card is already a single control and nesting buttons inside a link is invalid.

## Install

```tsx
import { Card } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A catalogue entry

A card that navigates. No tool, because the href is already public.

```tsx
<Card label="Button" href="#/Button">
  A single action a person or an agent can trigger.
</Card>
```

### A card that acts

onClick instead of href, so the card registers open-start-from-blank and an agent can take it.

```tsx
<Card label="Start from blank" onClick={create}>
  An empty page with the provider already wired up.
</Card>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The card's title, and its accessible name. Also derives the tool name when the card acts. |
| `children` | node | — | A line or two describing the entry. Carried in the agent view as the body part. |
| `href` | string | — | Destination, which makes the card a link. A card that navigates registers no tool by default. |
| `onClick` | handler | — | What clicking does. Alone it makes the card a button that registers an open tool by default. Alongside href the card stays a link and the handler rides the click, so a client-side router can intercept the navigation. |
| `disabled` | boolean | `false` | Disable an acting card and unregister its tool. Has no effect on a card that navigates. |
| `agentTool` | boolean | — | Override the default: on for a card that acts, off for a card that navigates, because an agent can reach an href on its own. |
| `agentName` | string | — | Override the label used to derive the tool name, when two cards share a title. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-href` | present or absent | Where the card goes, when it navigates. |
| `data-sprint-disabled` | present or absent | Present when the card cannot be opened. |

## WebMCP tools

### `<scope>-open-<label>`

Open this card, exactly as a person clicking it would. What opening does is the card's own business: it may reveal detail in place, select this item, or start a flow. Returns the card's state after the click.

- Read-only: no
- Registered when: The card acts rather than navigates, is mounted, enabled, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The card unmounts, becomes disabled, or turns into a link by taking an href.

```json
{
  "name": "<scope>-open-<label>",
  "description": "Open this card, exactly as a person clicking it would. What opening does is the card's own business: it may reveal detail in place, select this item, or start a flow. Returns the card's state after the click.",
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
- **Card** "Button" [href=#/Button]
  - part `title` "Button"
  - part `body` "A single action a person or an agent can trigger."
```

## Accessibility

- Notes: The whole block is one control: a link when it has an href, a button when it acts. The title names it, and the body is read as its content rather than as part of the name.
