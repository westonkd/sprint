# ChoiceGrid

> A question answered by pressing one of several large, equal-sized tiles, each a glyph such as an emoji over a text label. It works in two modes: submit mode, where every tile is a real submit button carrying its value, and select mode, where the tiles are a radio group driven by value and onChange.

- Category: input
- Status: experimental

## When to use

Use it when one tap should answer a question and the options are few enough to show at once, ideally six to twelve: an emoji verification step at sign-in ("pick the emoji you were sent"), a reaction, a mood, or a category picked by icon. Submit mode needs no client state, so it suits a server-rendered form page: give it a name and no onChange, and the pressed tile submits its form with name=value. Use select mode, by passing value and onChange, when the answer is one field among several and the form is submitted by something else. A verification challenge meant for a human, such as the emoji check, should pass agentTool={false} so the page does not offer an agent a one-call way through it.

### When not to

Do not use it for two to four short text options, which is a SegmentedControl, for long lists, which are a Select, or for choosing several at once, which is a set of Checkboxes. Do not put components in an option: label and glyph are strings, and the label is the tile's accessible name because an emoji on its own is not one.

## Install

```tsx
import { ChoiceGrid } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### An emoji verification check

Submit mode in a plain form: each tile is a submit button named emoji, so the form posts emoji=fox with no client state. agentTool is false because the check exists to prove a person is present.

```tsx
<form method="post" action="verify">
  <ChoiceGrid
    label="Which emoji were you sent?"
    name="emoji"
    agentTool={false}
    options={[
      { value: "fox", label: "Fox", glyph: "🦊" },
      { value: "rocket", label: "Rocket", glyph: "🚀" },
      { value: "cactus", label: "Cactus", glyph: "🌵" },
      { value: "anchor", label: "Anchor", glyph: "⚓" },
      { value: "pizza", label: "Pizza", glyph: "🍕" },
      { value: "comet", label: "Comet", glyph: "☄️" },
    ]}
  />
</form>
```

### Picking one with state

Select mode with four columns: the tiles are a radio group, and in agent view each one renders as its own control so an agent can choose without WebMCP.

```tsx
<ChoiceGrid
  label="Pick a reaction"
  columns={4}
  name="reaction"
  value={reaction}
  onChange={setReaction}
  options={[
    { value: "up", label: "Thumbs up", glyph: "👍" },
    { value: "fire", label: "Fire", glyph: "🔥" },
    { value: "laugh", label: "Laughing", glyph: "😂" },
    { value: "sad", label: "Sad", glyph: "😢" },
  ]}
/>
```

### A disabled grid

Disabled unregisters the tool and renders the agent view as text only, so an agent cannot press a tile a person could not.

```tsx
<ChoiceGrid
  label="Delivery window"
  columns={2}
  disabled
  value="morning"
  onChange={setWindow}
  options={[
    { value: "morning", label: "Morning", glyph: "☀" },
    { value: "evening", label: "Evening", glyph: "☾" },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The question the tiles answer. Rendered as the legend of the grid's fieldset and used to derive the tool name, so write it as a person would read it, such as "Which emoji were you sent?". |
| `options` | array (required) | — | The tiles in display order: { value, label, glyph? }. value is what the form receives, label is what a person reads and what the choose tool accepts, and glyph is a short string such as an emoji drawn large above the label and hidden from assistive technology. |
| `columns` | enum 2 \\| 3 \\| 4 | `3` | How many columns the grid has at 40rem and wider. Narrower screens always get two, so every tile stays large enough to press. |
| `name` | string | — | The form field name. In submit mode each tile is a submit button with this name and its option's value; in select mode a hidden input carries the selected value under this name. |
| `value` | string | — | Select mode only: the value of the selected option. Ignored in submit mode, where nothing stays selected. |
| `onChange` | handler | — | Passing it switches the grid to select mode. Called with the chosen value; the choose tool drives a real click, so it runs for agent choices too. |
| `disabled` | boolean | `false` | Disable every tile and unregister the choose tool. |
| `agentName` | string | — | Override the label used to derive the tool name, when the question is long or two grids on a page would collide. |
| `agentTool` | boolean | `true` | Set false to render the grid without registering a choose tool. Pass false for any challenge that exists to prove a human is present. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-mode` | submit \\| select | submit when pressing a tile submits the form, select when it changes a selection. |
| `data-sprint-value` | present or absent | Select mode: the value of the option currently selected. |
| `data-sprint-columns` | 2 \\| 3 \\| 4 | The column count at 40rem and wider. |
| `data-sprint-disabled` | present or absent | Present when no tile can be pressed. |

## WebMCP tools

### `<scope>-choose-<label>`

Choose one of this grid's options by its visible label, exactly as a person pressing it would. In submit mode the choice submits the surrounding form with the option's value, so it can navigate away; in select mode it replaces the current selection. Returns the grid's state after the choice.

- Read-only: no
- Registered when: The grid is mounted, enabled, has a resolvable label, agentTool is not false, and no other component claims the same tool name. The registered schema enumerates the current option labels.
- Unregistered when: The grid unmounts, becomes disabled, or agentTool turns false.

```json
{
  "name": "<scope>-choose-<label>",
  "description": "Choose one of this grid's options by its visible label, exactly as a person pressing it would. In submit mode the choice submits the surrounding form with the option's value, so it can navigate away; in select mode it replaces the current selection. Returns the grid's state after the choice.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "option": {
        "type": "string",
        "description": "The visible label of the option to choose, as shown under its glyph."
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
- **ChoiceGrid** "Pick a reaction" [columns=4, mode=select, value=fire] → tool `choose-pick-a-reaction`
  - part `choice` "Thumbs up" [value=up]
  - part `choice` "Fire" [checked, value=fire]
  - part `choice` "Laughing" [value=laugh]
  - part `choice` "Sad" [value=sad]
```

## Accessibility

- Role: `group, or radiogroup in select mode`
- Keyboard: Tab reaches every tile in submit mode, and the group once in select mode, Arrow keys move to the next or previous tile; in select mode they also select it, Home and End move to the first and last tile, Enter or Space presses the focused tile
- Notes: The root is a fieldset labelled by its legend. A glyph is aria-hidden and the label is always visible text, so each tile's accessible name is its label. In select mode, selection follows focus with a roving tabindex. In agent view a hidden input stays in the form so a choice made there submits the same field a person's would.
