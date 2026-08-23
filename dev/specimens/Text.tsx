import type { ReactNode } from "react";
import { Stack, Text } from "../../src/index.ts";

export const textSpecimens: Record<string, ReactNode> = {
  "A lede": (
    <Text>Every component renders normally for people and as text for agents.</Text>
  ),
  "A note under a heading": (
    <Text tone="muted" size="small">
      Registered while the button is enabled.
    </Text>
  ),
  "A live status line": (
    <Text tone="action" size="small">
      WebMCP is available in this browser.
    </Text>
  ),
};

export const textGallery: ReactNode = (
  <Stack gap="tight">
    <Text>Default</Text>
    <Text tone="muted">Muted</Text>
    <Text tone="action">Action</Text>
    <Text tone="info">Info</Text>
    <Text tone="warning">Warning</Text>
    <Text tone="danger">Danger</Text>
    <Text size="small">Small</Text>
  </Stack>
);
