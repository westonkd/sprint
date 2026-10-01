# A component never writes a style attribute for a documented value

- **Status**: Accepted
- **Date**: 2026-09-30

## Context

A consumer serving Sprint under `style-src 'self' 'nonce-…'` with no `'unsafe-inline'` found
`Stack direction="grid"` falling back to one column: the minimum track width arrived as an inline
`style`, and the policy dropped it. `Table` set column widths the same way, and Breadcrumb ordered
its trail rows through an inline custom property. A style attribute in server-rendered or static
markup is blocked by such a policy; one set through the CSSOM after hydration is not, which is why
the bug appeared in some pages and not others.

## Decision

A component expresses every documented value through a data attribute and a stylesheet rule, never
through a `style` attribute. Where a prop used to take an arbitrary length, it now takes a fixed
scale published as an attribute (`data-sprint-min`, `data-sprint-width`), and the stylesheet maps
each step. Ordering and other per-instance values use a bounded ladder of attribute values
(`data-sprint-recency="1"` to `"12"`) rather than a custom property.

An off-scale value is still accepted, as an inline style, and is documented as unsafe under a
strict CSP. Positioning that has to follow the page at runtime, such as Select's listbox, goes
through `element.style.setProperty`, which a CSP allows.

`src/components/csp.test.tsx` renders the affected components in their documented configurations
and asserts that no element carries a `style` attribute.

## Consequences

The scales are a constraint: a consumer who wants a 15rem grid track gets 14rem or 16rem, or opts
into the unsafe path. New components inherit the rule, and review should treat a `style=` in
`src/components` as a bug unless it is the documented off-scale escape hatch.
