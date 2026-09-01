# An image's alt text is its agent rendering and load status stops at the human view

- **Status**: Accepted
- **Date**: 2026-09-01

## Context

Image is the first component whose content an agent cannot read. Every component so far has held
text, data, or an action, and the agent view has been a matter of choosing which of those to emit.
An image holds pixels, and the pixels are the point. Nothing in the DOM projection or the render
mode can recover them.

Two questions followed from that, neither of which the catalog had faced.

First, what does the component put in the stream? `alt` is the only description that exists, and in
ordinary web practice it is treated as an accessibility obligation that authors satisfy with a
filename or skip entirely. Sprint cannot treat it that way: for an agent, `alt` is not a fallback,
it is the component.

Second, what does the component say about loading? An image has three runtime states a person can
see: fetching, arrived, failed. R1.4 says a loading region must read as loading. But in agent view
no `<img>` is rendered, so nothing is fetched, and a node built with the same `status` the human
view holds would sit at `loading` forever. That is not a lossy rendering, it is a false one.

## Decision

**`alt` is required, and it is the whole agent rendering.** The component's node takes `alt` as its
label; there is no other description, and `whenToUse` tells the author to write it for a reader who
will never see the picture. The human view also carries it natively on the `<img>`, so the fallback
still reads when the file fails, and the failure band inside the frame shows the same text rather
than a generic error.

**An empty `alt` is a claim, not an omission.** `alt=""` with no caption sets `data-sprint-decorative`
and renders nothing at all in agent view, the way Stack does. The author is saying the picture
carries no meaning; the agent is told nothing because there is nothing to tell. An image that
neither describes itself nor declares itself meaningless is not expressible.

**The source URL is published as `data-sprint-src`.** This is the Link precedent: a URL is reachable
without a tool, so the component registers none and simply names the address. An agent that can see
fetches the file itself; an agent that cannot at least knows what it is being denied.

**Fetch status appears only where fetching happens.** `data-sprint-status` is `loading`, `ready`, or
`error` in the human rendering, and absent from the node in agent view. An agent reading a page in
human mode through `read-region` or `serializeElement` gets the real status off the real element,
which is the only place it is real.

Registration is skipped entirely, per the rule that tools go where an agent gains something. There
is nothing to do to a picture.

The slot itself holds its shape: `ratio` reserves the box, and while loading or after a failure the
frame keeps its keyline, takes a hatch, and states its condition rather than collapsing, which is
R4.5 applied to the one component that can be empty through no fault of the author.

## Consequences

An author cannot ship an undescribed image without saying, in the props, that it means nothing. That
is the intended pressure, and it is the same pressure `meta.ts` applies to component documentation.

The agent render and the DOM projection of the human render now legitimately differ in one field.
Every prior component has matched on every field, and the Image tests pin the difference rather than
paper over it. The rule generalises: a state that exists only because pixels are being produced does
not belong in a rendering that produces none. Nothing else in the catalog has such a state yet.

`data-sprint-src` puts a URL, and potentially a long data URI, into the agent stream on every image.
If a page of thumbnails ever makes that unreadable, the answer is a truncation rule in the
serializer, not dropping the address.
