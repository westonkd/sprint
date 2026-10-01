import { type ReactNode, useEffect, useState } from "react";
import { Heading, Pending, Stack, Text } from "../../src/index.ts";

function useFetchCycle(): boolean {
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setFetching((current) => !current), 2400);
    return () => window.clearInterval(timer);
  }, []);

  return fetching;
}

function FirstLoad() {
  const fetching = useFetchCycle();
  return (
    <Pending loading={fetching} label="Loading profile">
      {fetching ? null : (
        <Stack gap="tight">
          <Heading level={3}>Nomad</Heading>
          <Text tone="muted">Cleared for launch</Text>
        </Stack>
      )}
    </Pending>
  );
}

function Refetching() {
  const fetching = useFetchCycle();
  return (
    <Pending loading={fetching} label="Refreshing pilot">
      <Stack gap="tight">
        <Heading level={3}>Nomad</Heading>
        <Text tone="muted">Cleared for launch</Text>
      </Stack>
    </Pending>
  );
}

export const pendingSpecimens: Record<string, ReactNode> = {
  "First load": <FirstLoad />,
  "Refetching stale content": <Refetching />,
};
