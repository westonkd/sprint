# Progress

> A labelled loading indicator for work in progress. Indeterminate by default; pass value for a known fraction complete.

- Category: feedback
- Status: experimental

## When to use

Use while something the person is waiting on is still running: a page section fetching, an upload, an import, a long job. Omit value when the remaining work is unknown, and pass value with max when it can be counted. Keep the label a stable noun phrase for what is loading, not a percentage.

### When not to

Do not use for a busy action; Button's loading prop already marks the button itself. Do not use for the outcome of work that finished or failed; that is an Alert. Do not use for a quantity that is not progress, such as disk usage.

## Install

```tsx
import { Progress } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Indeterminate load

Nothing to count yet, so the indicator only says that work is running.

```tsx
<Progress label="Loading flight plan" />
```

### Counted progress

With value and max the agent reads a percentage instead of guessing.

```tsx
<Progress label="Importing manifest" value={imported} max={total} />
```

### Complete

At max the loading state clears, so the line reads as finished rather than stalled.

```tsx
<Progress label="Importing manifest" value={240} max={240} />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string (required) | — | What is loading, such as "Importing manifest". It is the indicator's accessible name and its agent label. |
| `value` | number | — | Work completed so far, in the same units as max. Omit for an indeterminate indicator. Clamped to the range 0 to max. |
| `max` | number | `100` | The value at which the work is complete. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-loading` | present or absent | Present until the work completes. An indeterminate indicator is always loading. |
| `data-sprint-value` | present or absent | The fraction complete as a whole percentage, such as 40%. Absent while indeterminate. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Progress** "Importing manifest" [loading, value=40%]
```

## Accessibility

- Role: `progressbar`
- Notes: Renders a native progress element named by the visible label. Omitting value leaves it indeterminate, which assistive technology announces as busy. The percentage readout is hidden from assistive technology because the progressbar already carries its value.
