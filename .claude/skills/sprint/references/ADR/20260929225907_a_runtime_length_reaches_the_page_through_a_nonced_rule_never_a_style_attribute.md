# A runtime length reaches the page through a nonced rule, never a style attribute

- **Status**: Accepted
- **Date**: 2026-09-29

## Context

Three components carried a caller-supplied value into the page through a `style` attribute:
`Stack`'s grid track minimum (`min`), `Table`'s column `width`, and `NavBar`'s trail ordering.
A consumer server-rendering an authorization page with `renderToString` under
`style-src 'self' 'nonce-…'` found the grid collapsed to one column, because a strict policy
drops every inline `style` attribute in parsed markup.

Only parsed markup is affected. A client render sets styles through the CSSOM, which
`style-src` does not govern, so a hydrated or client-only app never saw the bug. Hydration does
not repair it either: React finds the blocked attribute already present and leaves it alone.

The options were a fixed scale of lengths selected by data attribute, a hoisted `<style>` with
React 19's `precedence`, or a nonced `<style>` rendered in place. A fixed scale would turn `min`
from a CSS length into an enum, a breaking change for a value that is legitimately arbitrary.
React only nonces hoisted styles when the nonce is a render option, and `renderToString` accepts
none, so the hoisted rule would be blocked as well.

## Decision

`SprintProvider` takes a `nonce` and passes it to its subtree, with nested providers inheriting it.
When a nonce is present, a component that needs a runtime length publishes the value as state
(`data-sprint-min`, `data-sprint-width`) and renders a `<style nonce>` scoped to that attribute
value, and no `style` attribute at all. Without a nonce it keeps the inline style, so nothing
changes for a consumer with no policy.

`StyleRule` and `cssValue` in `src/provider/styleRule.tsx` are the only way to do this. `cssValue`
rejects any value that could close the declaration or the element (`;`, braces, angle brackets,
quotes, backslashes), and a rejected value is dropped rather than escaped.

A value that exists only after interaction, like `NavBar`'s trail order, is omitted until it is
non-zero. The server never renders it, and the client sets it through the CSSOM.

## Consequences

A strict CSP consumer passes the same nonce to `SprintProvider` as to their policy and needs nothing
else. The `<style>` elements sit inside the component so they cannot disturb a parent's
sibling selectors, and text gathering skips `style`, `script` and `template` elements so they
never reach an accessible name or the DOM projection.

Every rule is scoped by the value, not the instance, so two Stacks with the same `min` emit
identical rules. That duplication is harmless and is cheaper than collecting the rules centrally.

A new component that wants a caller-supplied length must go through `StyleRule`. A `style`
attribute in server-rendered markup is a bug.
