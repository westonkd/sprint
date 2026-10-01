# MetaLine

> A slash-separated manifest line of term–detail pairs: serials, build strings, issue dates. It is chrome, not content, and in the agent view it reads as the same single line of text a person sees.

- Category: display
- Status: experimental

## When to use

Use it for the compact strip of identifying metadata that belongs to a page, panel, or footer: version and build identifiers, timestamps, serial numbers, owners. Values are short. By default the line truncates with an ellipsis rather than wrapping; set wrap where it sits in a narrow container and every entry has to stay visible.

### When not to

Do not use it for the details of a record a person is meant to study; that is a DescriptionList. Do not put anything interactive in it, and do not use it for prose.

## Install

```tsx
import { MetaLine } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A build strip

The manifest voice: uppercase mono, slash-separated, terms muted and details in ink.

```tsx
<MetaLine
  entries={[
    { term: "Serial", detail: "NU-TYPE-CORE-A1" },
    { term: "Issued", detail: "2744.07.22" },
  ]}
/>
```

### Version chrome for a footer

The line an app pins under its content or into a Shell rail.

```tsx
<MetaLine
  entries={[
    { term: "Sprint", detail: "v0.0.0" },
    { term: "Channel", detail: "dev" },
    { term: "WebMCP", detail: "chrome 149" },
  ]}
/>
```

### Wrapping in a narrow rail

With wrap, a sidebar shows every entry on as many lines as it needs instead of cutting the later ones off.

```tsx
<MetaLine
  wrap
  entries={[
    { term: "Sprint", detail: "v0.0.0" },
    { term: "Channel", detail: "dev" },
    { term: "WebMCP", detail: "chrome 149" },
    { term: "Build", detail: "2744.07.22-a1" },
  ]}
/>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `entries` | array (required) | — | Term–detail pairs in display order: { term, detail }, both strings. Rendered as TERM: DETAIL, slash-separated, and carried as one line in the agent view. An empty array renders nothing. |
| `wrap` | boolean | `false` | Let entries flow onto further lines instead of truncating the line. Each entry stays whole on one line, and a separator stays at the end of the line it closes, so no line starts with a slash. An entry wider than the container is the only thing that still truncates. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-entries` | present or absent | How many term–detail pairs the line carries. |
| `data-sprint-wrap` | present or absent | Present when entries may flow onto further lines. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **MetaLine** "SERIAL: NU-TYPE-CORE-A1 / ISSUED: 2744.07.22" [entries=2]
```

## Accessibility

- Role: `paragraph`
- Notes: The separators are real text, so the accessible name is the same line the agent view carries. Nothing in the line is interactive.
