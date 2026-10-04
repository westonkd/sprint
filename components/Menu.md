# Menu

> A button that opens a short list of actions, links, or one-of-several choices. Registers one choose tool enumerating the items an agent can run.

- Category: action
- Status: experimental

## When to use

Use to gather secondary actions behind one control: a card's edit, duplicate and delete; an account menu; a share menu; a switcher between a few named views. Items hold data, not elements: each is { label, onSelect?, href?, checked?, tone?, disabled?, group?, icon? }. An item with checked becomes a radio choice with a visible mark, so a menu can also pick one value from a short list.

### When not to

Do not use for the primary action of a view; that is a Button. Do not use to pick a form value that is submitted with other fields; that is a Select or a SegmentedControl. Do not use for navigation that should stay visible; that is a Nav or a Breadcrumb. Items take plain text labels and an optional icon, never components.

## Install

```tsx
import { Menu } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Card actions

A three-dot trigger at the end of a card. The destructive item is marked, and an agent runs either item through the choose tool without opening anything.

```tsx
<Menu
  label="Card actions"
  icon={<MoreIcon />}
  hideLabel
  size="small"
  align="end"
  items={[
    { label: "Edit", onSelect: edit },
    { label: "Duplicate", onSelect: duplicate },
    { label: "Delete", tone: "danger", onSelect: remove },
  ]}
/>
```

### Links and actions together

An item with href is a real link and is left out of the tool, because a URL already reaches it. Groups gather related items under a heading.

```tsx
<Menu
  label="Account"
  items={[
    { label: "Profile", href: "#/profile", group: "Signed in as Nomad" },
    { label: "Settings", href: "#/settings", group: "Signed in as Nomad" },
    { label: "Sign out", onSelect: signOut },
  ]}
/>
```

### Choosing one of several

checked turns items into radio choices with a visible mark, so the menu doubles as a compact picker. It opens with focus on the checked item.

```tsx
<Menu
  label={plannerLabel}
  agentName="Planner"
  items={planners.map((name) => ({
    label: name,
    checked: name === planner,
    onSelect: () => setPlanner(name),
  }))}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the menu holds, such as "Card actions" or "Share". It is the trigger's text, names the menu for assistive technology, and derives the choose tool name. |
| `items` | array (required) | — | The items in order: { label, onSelect?, href?, external?, checked?, tone?, disabled?, group?, icon? }. onSelect runs the item; href makes it a link, which agents reach by URL rather than the tool. checked, true or false, makes the item a radio choice. tone="danger" marks a destructive item. Consecutive items sharing a group string are gathered under that heading. |
| `icon` | node | — | An icon drawn on the trigger before its label. |
| `hideLabel` | boolean | `false` | Show only the icon on a square trigger, such as a three-dot card menu. The label stays the accessible name and the tool name, and shows as a tooltip. Requires icon. |
| `size` | enum medium \\| small | `"medium"` | The trigger's size, matching Button. |
| `align` | enum start \\| center \\| end | `"start"` | Which edge of the trigger the list lines up with. Use end for a menu at the right of a card or a toolbar. |
| `side` | enum below \\| above | `"below"` | Where the list prefers to open. It flips to the other side when there is no room, so a menu low on the screen still opens fully in view. |
| `disabled` | boolean | `false` | Disable the trigger and unregister the choose tool. |
| `onOpenChange` | handler | — | Called with true when the list opens and false when it closes. |
| `agentName` | string | — | Override the label used to derive the tool name, such as when every card on a page has a menu called Actions. |
| `agentTool` | boolean | `true` | Set false to render the menu without registering the choose tool. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-open` | present or absent | Present while the list is open on screen. |
| `data-sprint-disabled` | present or absent | Present when the menu cannot be opened. |

## WebMCP tools

### `<scope>-choose-<label>`

Choose one item from this menu by its visible label, exactly as a person opening the menu and pressing the item would. The menu does not need to be open. Items that are links are not offered; reach them by their href. Returns the menu's state after the choice, so a follow-up read is usually unnecessary.

- Read-only: no
- Registered when: The menu is mounted and enabled, has at least one enabled item without an href, and no other component claims the same tool name. The registered schema enumerates those items' labels.
- Unregistered when: The menu unmounts, becomes disabled, or its last enabled item without an href is removed or disabled.

```json
{
  "name": "<scope>-choose-<label>",
  "description": "Choose one item from this menu by its visible label, exactly as a person opening the menu and pressing the item would. The menu does not need to be open. Items that are links are not offered; reach them by their href. Returns the menu's state after the choice, so a follow-up read is usually unnecessary.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "item": {
        "type": "string",
        "description": "The visible label of the item to choose."
      }
    },
    "required": [
      "item"
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
- **Menu** "Card actions" → tool `choose-card-actions`
  - part `item` "Edit"
  - part `item` "Delete" [tone=danger]
```

## Accessibility

- Role: `menu`
- Keyboard: Enter, Space or Down Arrow on the trigger opens the list on the first or checked item, Up Arrow on the trigger opens it on the last item, Arrow keys move between items and wrap, Home and End move to the first and last item, A letter moves to the next item starting with it, Escape closes the list and returns focus to the trigger, Tab closes the list and moves on
- Notes: The trigger has aria-haspopup=menu and aria-expanded. Items are menuitem buttons or links, or menuitemradio with aria-checked. The list is a popover in the top layer rendered inside the menu's own DOM, so it opens above a modal Dialog and is never clipped by an ancestor's overflow. Disabled items are skipped by the keyboard.
