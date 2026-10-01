# Disclosure

> A labelled region a person can show or hide with a toggle that carries its expanded state. Collapsing conceals the content from a person only: it stays in the page, and the agent view always renders it.

- Category: layout
- Status: experimental

## When to use

Use it for secondary detail a person reads on demand beside the primary content, such as an access breakdown on a user page behind "Show access breakdown". It replaces a Button that swaps its own label, because the toggle publishes aria-expanded and the region it controls, and the content stays readable to an agent without a click.

### When not to

Do not use it to hide content an agent should not read; collapsing is a human affordance and the agent view carries the content regardless. Do not use it for a region that is always visible, which is a Panel, or for content that must interrupt the page, which is a Dialog. Do not use it to switch between alternative views of the same data, which is a SegmentedControl.

## Install

```tsx
import { Disclosure } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Secondary detail on demand

Uncontrolled: the disclosure keeps its own state. In agent view the content renders beneath the line whether or not a person has opened it, and the toggle is one control.

```tsx
<Disclosure label="Access breakdown">
  <Text>Admin through the Operators group.</Text>
</Disclosure>
```

### A controlled disclosure

Pass expanded and onExpandedChange when something else on the page needs to know or set whether the region is open. The expand tool drives the same toggle.

```tsx
<Disclosure
  label="Access breakdown"
  expanded={open}
  onExpandedChange={setOpen}
>
  <Text>Admin through the Operators group.</Text>
</Disclosure>
```

### Custom toggle text

showLabel and hideLabel replace the derived toggle text when the noun phrase does not read naturally after Show and Hide.

```tsx
<Disclosure label="Audit trail" showLabel="Show 12 events" hideLabel="Hide events">
  <Text>Last change was a role grant by the on-call operator.</Text>
</Disclosure>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the region is, as a noun phrase such as "Access breakdown". It names the region for a screen reader, derives the toggle text and the tool name. |
| `children` | node | — | The region's content. It is always mounted: collapsing hides it from a person with CSS, so components inside keep their tools and stay in the page projection. |
| `expanded` | boolean | — | Whether the region is revealed. Pass it with onExpandedChange to control the disclosure; leave it unset to let the disclosure keep its own state. |
| `defaultExpanded` | boolean | `false` | The initial state when the disclosure is uncontrolled. |
| `onExpandedChange` | handler | — | Called with the new state whenever the toggle is pressed, by a person, a DOM-driving agent, or the expand tool. |
| `showLabel` | string | `"\"Show \" followed by the label"` | The toggle text while collapsed. |
| `hideLabel` | string | `"\"Hide \" followed by the label"` | The toggle text while expanded. |
| `agentName` | string | — | Override the label used to derive the tool name, when two disclosures on a page would otherwise collide. |
| `agentTool` | boolean | `true` | Set false to render the disclosure without registering an expand tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-expanded` | present or absent | Present while the region is revealed to a person. Absent means collapsed: the content is still in the page, concealed by CSS rather than unmounted or marked hidden. |

## WebMCP tools

### `<scope>-expand-<label>`

Expand or collapse this region for the person viewing the page, by stating the end state, exactly as a person pressing its toggle would. The content is already readable in the agent view either way, so call this only to change what a person sees. Setting the state it already has succeeds and changes nothing. Returns the region's state after the call.

- Read-only: no
- Registered when: The disclosure is mounted, has a resolvable label, and no other component claims the same tool name.
- Unregistered when: The disclosure unmounts or agentTool is set false.

```json
{
  "name": "<scope>-expand-<label>",
  "description": "Expand or collapse this region for the person viewing the page, by stating the end state, exactly as a person pressing its toggle would. The content is already readable in the agent view either way, so call this only to change what a person sees. Setting the state it already has succeeds and changes nothing. Returns the region's state after the call.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "expanded": {
        "type": "boolean",
        "description": "The end state: true reveals the region, false conceals it."
      }
    },
    "required": [
      "expanded"
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
- **Disclosure** "Access breakdown" → tool `expand-access-breakdown`
  - part `toggle` "Show access breakdown"
  - **Text** "Admin through the Operators group."
```

## Accessibility

- Role: `region`
- Keyboard: Enter toggles, Space toggles
- Notes: The root is a section named by the label. The toggle is a real button with aria-expanded and aria-controls pointing at the content. Collapsed content is display: none, which removes it from the accessibility tree for a person and a screen reader while leaving it in the DOM for the agent projection.
