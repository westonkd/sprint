# NavGroup

> A labelled cluster of links inside a Nav. The label names the group for screen readers and agents alike.

- Category: navigation
- Status: experimental

## When to use

Use it when a Nav holds more than one kind of destination: guides versus components, product versus account. The label tells every reader, including an agent scanning for the right link, what the links below it have in common.

### When not to

Do not use it outside a Nav; on its own it is just a heading over links, which Panel does better. Do not nest groups; one level of grouping is all a sidebar can carry.

## Install

```tsx
import { NavGroup } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A labelled group of links

```tsx
<NavGroup label="Reference">
  <Link href="https://developer.chrome.com/docs/ai/webmcp" external>
    Chrome docs
  </Link>
  <Link href="https://github.com/webmachinelearning/webmcp" external>
    Specification
  </Link>
</NavGroup>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What the links in this group have in common. Rendered as the rubric and as the group's accessible name. |
| `children` | node (required) | — | The Link components this group collects. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **NavGroup** "Components"
```

## Accessibility

- Role: `group`
- Notes: The group carries its label as an accessible name, so screen readers announce the rubric when entering the cluster rather than reading an unlabelled run of links.
