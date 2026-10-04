# Spinner

> A small inline busy mark for work with no measurable progress, sized to sit inside a field or beside a line of text.

- Category: feedback
- Status: experimental

## When to use

Use where a whole bar or region would be too much: beside a field that is checking a value, at the end of a line that is saving, inside a combobox while results load. The label says what is happening and is announced politely; showLabel prints it beside the mark.

### When not to

Do not use for a region whose data is loading; that is Pending or a component's loading prop. Do not use when the work can be counted; that is Progress. Do not use for a busy button; Button's loading prop marks the button itself.

## Install

```tsx
import { Spinner } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Saving beside a line

The mark sits in the line, and the label is printed beside it.

```tsx
<Spinner label="Saving note" showLabel />
```

### A silent mark in a field

A small mark with the label kept for assistive technology and agents.

```tsx
<Spinner label="Searching members" size="small" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is happening, such as "Checking availability". |
| `size` | enum small \\| medium | `"medium"` | medium matches body text; small fits inside a dense row or a field. |
| `showLabel` | boolean | `false` | Print the label beside the mark instead of keeping it for assistive technology only. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-loading` | present or absent | Always present: a spinner is only rendered while work is running. |
| `data-sprint-size` | small | Present as small on the compact mark. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Spinner** "Saving note" [loading]
```

## Accessibility

- Role: `status`
- Notes: A role=status element, so the label is announced politely when the spinner appears. Render it only while work runs, rather than toggling its visibility. The mark is a stepped four-cell pulse, still under reduced motion.
