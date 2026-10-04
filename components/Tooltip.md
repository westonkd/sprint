# Tooltip

> A short hint that appears beside one control on hover or keyboard focus. A human affordance only: it adds nothing to the agent view.

- Category: overlay
- Status: experimental

## When to use

Use to name an icon-only control for sighted mouse users, or to show the whole of a line that is truncated on screen. Wrap exactly one focusable element. The hint appears after a short hover or at once on keyboard focus, and Escape dismisses it.

### When not to

Never put information only in a tooltip: touch users never see it and agents never read it, so the text must repeat something the wrapped element already says through its label or its own content. Do not use it for anything interactive; that is a Menu or a Dialog. For an icon-only Button, pass hideLabel instead, which adds the tooltip itself.

## Install

```tsx
import { Tooltip } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Naming a truncated line

The line is cut short on screen, so the tooltip shows it whole. The element's own text already carries the full value for assistive technology and agents.

```tsx
<Tooltip label="Elder Kestrel, second counselor in the elders quorum presidency">
  <Link href="/callings/42">Elder Kestrel, second counselor…</Link>
</Tooltip>
```

### A hint below its control

side moves the hint below the control; it still flips when the control sits at the bottom of the screen.

```tsx
<Tooltip label="Opens in the planner" side="below">
  <Button>Plan Sunday</Button>
</Tooltip>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | The hint text. Keep it to a few words. |
| `children` | node (required) | — | Exactly one focusable element, such as a Button or a link. The tooltip is anchored to it and, unless describe is false, linked to it with aria-describedby. |
| `side` | enum above \\| below | `"above"` | Where the hint prefers to appear. It flips to the other side when there is no room. |
| `describe` | boolean | `true` | Link the hint to the element with aria-describedby. Set false when the hint repeats the element's accessible name, so a screen reader does not read it twice. |
| `disabled` | boolean | `false` | Stop the hint from appearing. |

## Accessibility

- Role: `tooltip`
- Keyboard: Focus shows the hint, Escape hides it
- Notes: The hint is a role=tooltip element linked to the wrapped element with aria-describedby. It appears after a hover delay or immediately on keyboard focus, never on touch, and is dismissed by Escape, blur, or moving the pointer away. It is a popover in the top layer, rendered inside the wrapped element's DOM, so it shows above a modal Dialog.
