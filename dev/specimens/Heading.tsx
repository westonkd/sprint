import type { ReactNode } from "react";
import { Heading, Stack } from "../../src/index.ts";

export const headingSpecimens: Record<string, ReactNode> = {
  "A page title": <Heading level={1}>Button</Heading>,
  "A section title": <Heading>Every variant</Heading>,
  "A deep heading in a small voice": (
    <Heading level={3} size={4}>
      Sunday speakers
    </Heading>
  ),
};

export const headingGallery: ReactNode = (
  <Stack gap="tight">
    <Heading level={1}>Level one</Heading>
    <Heading level={2}>Level two</Heading>
    <Heading level={3}>Level three</Heading>
    <Heading level={4}>Level four</Heading>
    <Heading level={5}>Level five</Heading>
    <Heading level={6}>Level six</Heading>
    <Heading level={2} size={1}>
      Level two at size one
    </Heading>
  </Stack>
);
