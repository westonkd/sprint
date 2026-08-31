# Link

> A navigation link. It publishes its destination as state, so an agent reading the page in text learns the URL rather than having to click to find out, and it renders a real anchor in both views.

- Category: navigation
- Status: experimental

## When to use

Use it for anything that changes the address: a nav item, a cross-reference, a link out to a specification. Set active on the item matching the current route so the agent view and the human view agree about where you are. Under a client-side router, pass an onClick that prevents default and navigates; the handler rides the anchor in both views, so agent clicks and open tools go through the router too.

### When not to

Do not use it for an action that stays on the page; that is a Button. Do not register a tool on ordinary navigation: an agent can already reach a URL, and a page of links would flood its tool list for no gain.

## Install

```tsx
import { Link } from "@westonkd/sprint";
import "@westonkd/sprint/styles.css";
```

## Examples

### A nav item

```tsx
<Link href="#/Button" active={route === "Button"}>Button</Link>
```

### A link out

```tsx
<Link href="https://developer.chrome.com/docs/ai/webmcp" external>
  Chrome docs
</Link>
```

### A link an agent may follow itself

Opting in is for the one link that completes a task, not for a nav list.

```tsx
<Link href="#/checkout" agentTool>Go to checkout</Link>
```

## Props

| Prop | Kind | Default | Description |
| --- | --- | --- | --- |
| `href` | string (required) | — | The destination. Published as data-sprint-href and carried in the agent view, so the URL is readable without a click. |
| `children` | node (required) | — | The link text. It names the destination, so prefer the page's name over here or read more. |
| `active` | boolean | `false` | Mark the link as the current location. Sets aria-current so a screen reader and an agent learn it the same way. |
| `external` | boolean | `false` | Mark a destination outside this app. Opens in a new context and adds the usual rel protections. |
| `agentTool` | boolean | `false` | Set true to register an open tool for this link. Off by default: navigation is reachable by URL, so a tool per link is cost without benefit. |
| `agentName` | string | — | Override the label used to derive the tool name, for icon-only links or two links with the same text. |

## State attributes

Public API: agents write selectors against these.

| Attribute | Values | Description |
| --- | --- | --- |
| `data-sprint-href` | present or absent | Where this link goes. |
| `data-sprint-active` | present or absent | Present when this link is the current location. |
| `data-sprint-external` | present or absent | Present when the destination is outside this app. |

## WebMCP tools

### `<scope>-open-<label>`

Follow this link and load its destination, exactly as a person clicking it would. The current page is replaced, so anything unsaved on it is lost and any tool registered by this page stops existing.

- Read-only: no
- Registered when: The link opts in with agentTool, is mounted, has a resolvable label, and no other component claims the same tool name. Links register nothing by default.
- Unregistered when: The link unmounts or opts back out.

```json
{
  "name": "<scope>-open-<label>",
  "description": "Follow this link and load its destination, exactly as a person clicking it would. The current page is replaced, so anything unsaved on it is lost and any tool registered by this page stops existing.",
  "inputSchema": {
    "type": "object",
    "properties": {}
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
- **Link** "Button" [active, href=#/Button]
```

## Accessibility

- Role: `link`
- Keyboard: Enter follows the link
- Notes: active sets aria-current=page. External links open in a new context with rel=noreferrer noopener, and carry their outward mark as a pseudo-element with empty alternative text so it never reaches the accessible name or the tool name. Inside Text a link is underlined all the time, so colour is never the only thing distinguishing it from the prose around it.
