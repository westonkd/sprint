# Image

> A framed picture in a slot that holds its shape. It is the one component whose content an agent cannot read, so alt is not decoration: it is the whole of what the agent gets, and the source URL is published beside it for an agent that can fetch pixels of its own.

- Category: display
- Status: experimental

## When to use

Use it for any picture that carries meaning: a screenshot, a diagram, a photograph, a logo in running content. Describe it in alt as if to someone on the phone. Pass alt="" only for a picture that adds nothing, which then disappears from the agent view entirely.

### When not to

Do not use it for a decorative texture; that is the ornament vocabulary, which costs no request and no description. Do not use it for an icon whose meaning is already in adjacent text.

## Install

```tsx
import { Image } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A described picture

The alt text is the agent rendering. It registers no WebMCP tool: there is nothing to do to a picture, and the source URL is already on the element.

```tsx
<Image
  src="media/pad-39b.svg"
  alt="Launch pad 39B under floodlights, gantry retracted"
  ratio="16:9"
/>
```

### A captioned figure

The caption is read as well as seen, and arrives as its own part, so it can say what alt should not repeat.

```tsx
<Image
  src="media/telemetry.svg"
  alt="Line chart of chamber pressure holding flat for nine minutes, then dropping"
  caption="Static fire 04, chamber pressure"
  ratio="3:2"
  fit="contain"
/>
```

### A picture that means nothing

An empty alt is a claim, not an omission: it says this picture carries no meaning. The component then renders nothing in agent view, the way Stack does.

```tsx
<Image src="media/grain.svg" alt="" ratio="1:1" />
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `src` | string (required) | — | Where the pixels are. Published as data-sprint-src so an agent that can see can fetch the file itself. |
| `alt` | string (required) | — | What the picture shows, in a sentence. This is the entire agent rendering of the image, so write it for a reader who will never see it. Empty means "this picture carries no meaning", and the component then renders nothing in agent view. |
| `caption` | string | — | A visible line under the frame, for a credit, a date, or a figure number. It is read as well as seen, so it does not repeat alt. |
| `ratio` | enum 1:1 \\| 4:3 \\| 3:2 \\| 16:9 \\| auto | `"auto"` | The shape the slot holds while the picture loads and if it fails. auto lets the file decide its own height once it arrives. |
| `fit` | enum cover \\| contain | `"cover"` | How the picture fills a slot of a fixed ratio. cover crops it, contain letterboxes it. Ignored when ratio is auto. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-src` | present or absent | The image source, so an agent can fetch the file without the DOM. |
| `data-sprint-status` | loading \\| ready \\| error | Whether the pixels have arrived. Present only in the human rendering, because in agent view nothing is fetched and any value would be a guess. |
| `data-sprint-ratio` | 1:1 \\| 4:3 \\| 3:2 \\| 16:9 \\| auto | The shape the slot holds. |
| `data-sprint-fit` | cover \\| contain | Whether a fixed-ratio slot crops the picture or letterboxes it. |
| `data-sprint-decorative` | present or absent | Present when the image was declared meaningless with an empty alt and no caption. It renders nothing at all in agent view. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Image** "Launch pad 39B under floodlights, gantry retracted" [fit=cover, ratio=16:9, src=media/pad-39b.svg]
  - part `caption` "Pad 39B, T-minus 4h"
```

## Accessibility

- Notes: The frame is a figure named by its alt text, and the picture inside carries the same alt natively, so a fallback still reads when the file fails. A caption is a figcaption. While the picture is loading or after it has failed, the slot keeps its border and states its condition rather than collapsing; that band is aria-hidden, because on failure it shows the alt text a screen reader has already been given.
