# Avatar

> A person's photo in a circle, falling back to their initials when there is no photo or it fails to load.

- Category: display
- Status: experimental

## When to use

Use beside a person's name in a row, a card, or an account menu trigger. Pass the full name; it is the accessible name and the source of the initials. Set decorative when the name is already printed right beside it, so it is not read twice.

### When not to

Do not use for a logo or an illustration; that is an Image. Do not use as a button on its own; put it inside a Button or a Menu trigger that carries the label.

## Install

```tsx
import { Avatar } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A photo

```tsx
<Avatar name="Ada Okafor" src="media/portrait.svg" />
```

### Initials when there is no photo

The first and last initials, on the inset surface.

```tsx
<Avatar name="Brother Lind" size="large" />
```

### Beside a printed name

decorative keeps a screen reader and an agent from hearing the name twice.

```tsx
<Stack direction="row" gap="snug" align="center">
  <Avatar name="Sister Amaral" size="small" decorative />
  <Text as="span">Sister Amaral</Text>
</Stack>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `name` | string (required) | — | The person's name. Names the avatar and supplies the initials. |
| `src` | string | — | The photo's URL. Without it, or if it fails to load, the initials show instead. |
| `size` | enum small \\| medium \\| large | `"medium"` | small for dense rows, medium beside body text, large in a profile header. |
| `decorative` | boolean | `false` | Hide the avatar from assistive technology and the agent view, for when the name is printed beside it. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-photo` | present or absent | Present while a photo is showing rather than initials. |
| `data-sprint-size` | small \\| large | The size, when it is not medium. |

## Agent view

In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:

```
- **Avatar** "Ada Okafor" [photo]
```

## Accessibility

- Role: `img`
- Notes: A role=img element named by the person's name, with the photo's own alt left empty so the name is read once. decorative switches it to aria-hidden.
