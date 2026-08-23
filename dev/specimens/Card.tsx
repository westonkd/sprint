import { type ReactNode, useState } from "react";
import { Card, Stack, Text } from "../../src/index.ts";

function ActingCard() {
  const [started, setStarted] = useState(0);
  return (
    <Stack gap="tight">
      <Card label="Start from blank" onClick={() => setStarted(started + 1)}>
        An empty page with the provider already wired up.
      </Card>
      <Text tone="muted" size="small">
        Started {started} time(s).
      </Text>
    </Stack>
  );
}

export const cardSpecimens: Record<string, ReactNode> = {
  "A catalogue entry": (
    <Card label="Button" href="#/Button">
      A single action a person or an agent can trigger.
    </Card>
  ),
  "A card that acts": <ActingCard />,
};
