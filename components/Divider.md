# Divider

> A horizontal rule that segments a page: the line between a header or a breadcrumb and the body under it, or between two runs of content. It draws in the active theme's own keyline or band, and can name the segment it opens.

- Category: layout
- Status: experimental

## When to use

Use it where a page changes subject and nothing else marks the change: under a PageHeader or a Breadcrumb before the body starts, or between groups of panels. Give it a label when the segment that follows has a name worth reading; an unlabelled Divider is invisible in agent view, because an agent does not care where a line is drawn, only what the line announces.

### When not to

Do not use it to space things out; that is the gap on Stack. Do not use it to frame a region with a header; that is Panel, which draws its own keylines. Do not stack two in a row, and do not use it inside a Panel to separate a list's items; the list draws its own.

## Install

```tsx
import { Divider } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### Separating the header from the body

The plainest break: a keyline under the page's chrome, before the content starts.

```tsx
<Stack>
  <Breadcrumb
    label="Docs"
    items={[{ label: "guides", children: [{ href: "#/guide/webmcp", label: "WebMCP", active: true }] }]}
  />
  <Divider />
  <Text>The body of the page starts here.</Text>
</Stack>
```

### A named segment

A label names what follows, on the rule itself and to an agent reading the page.

```tsx
<Divider label="Results" weight="heavy" />
```

### The page's main break

A band draws the theme's own ornament: hatching in the default register, pins in calorie, a barcode strip in trax, a row of dots in ambient. Use it once per page.

```tsx
<Divider label="Body" weight="band" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `label` | string | — | The name of the segment the divider opens, rendered small on the rule. |
| `weight` | enum hairline \\| heavy \\| band | `"hairline"` | How hard the break is. "hairline" is a keyline, "heavy" a thick strong keyline, "band" a strip of the theme's own ornament for the one break that matters most on a page. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-weight` | hairline \\| heavy \\| band | How hard the break is. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Divider** "Results" [weight=band]
```

## Accessibility

- Role: `separator`
- Notes: The rule is a native hr, so assistive technology announces a separator. A label is ordinary text read just before it, the way a person reads it on the rule.
