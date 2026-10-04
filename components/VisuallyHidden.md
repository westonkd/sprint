# VisuallyHidden

> Text that is off screen but still read by screen readers and agents. For context a sighted person gets from the layout.

- Category: typography
- Status: experimental

## When to use

Use to say in words what the layout says visually: "(opens in a new tab)" after a link, a count's unit, a heading for a region whose purpose is obvious on screen. With focusable, it wraps a skip link that appears only while it has focus.

### When not to

Do not use to hide a field's label; TextInput, Textarea, SearchField and Progress take hideLabel, and an icon-only Button takes hideLabel too. Do not hide content that a sighted person also needs.

## Install

```tsx
import { VisuallyHidden } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Extra words for a screen reader

The arrow says it to a sighted person; the hidden text says it to everyone else.

```tsx
<Link href="https://churchofjesuschrist.org" external>
  Gospel Library ↗<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
</Link>
```

### A skip link

Off screen until a keyboard user tabs to it.

```tsx
<VisuallyHidden focusable>
  <Link href="#main">Skip to the board</Link>
</VisuallyHidden>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `children` | node (required) | — | The hidden text, or a skip link when focusable is set. |
| `focusable` | boolean | `false` | Show the content while something inside it has keyboard focus, for a skip link. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-focusable` | present or absent | Present when the content appears while focused. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **VisuallyHidden** "opens in a new tab"
```

## Accessibility

- Notes: Hidden with a one-pixel clip rather than display or visibility, so screen readers still read it. The agent view renders its text as an ordinary line.
