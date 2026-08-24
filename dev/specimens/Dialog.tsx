import { type ReactNode, useState } from "react";
import { Button, Dialog, Stack, Text } from "../../src/index.ts";

function DestructiveConfirmation() {
  const [confirming, setConfirming] = useState(false);
  const [revoked, setRevoked] = useState(false);
  return (
    <Stack gap="tight">
      <Button tone="danger" onClick={() => setConfirming(true)}>
        Revoke key
      </Button>
      {revoked ? (
        <Text tone="muted" size="small">
          sk-prod revoked.
        </Text>
      ) : null}
      <Dialog label="Revoke key" open={confirming} onClose={() => setConfirming(false)}>
        <Stack gap="tight">
          <Text>The key stops authenticating immediately. This cannot be undone.</Text>
          <Button
            tone="danger"
            onClick={() => {
              setRevoked(true);
              setConfirming(false);
            }}
          >
            Revoke sk-prod
          </Button>
        </Stack>
      </Dialog>
    </Stack>
  );
}

function OwnedByOpener() {
  const [rotating, setRotating] = useState(false);
  return (
    <Stack gap="tight">
      <Button agentName="Rotate secret" onClick={() => setRotating(true)}>
        Rotate secret
      </Button>
      <Dialog
        label="Rotate secret"
        open={rotating}
        owner="press-rotate-secret"
        onClose={() => setRotating(false)}
      >
        <Text>The current secret keeps working for one hour.</Text>
      </Dialog>
    </Stack>
  );
}

export const dialogSpecimens: Record<string, ReactNode> = {
  "A destructive confirmation": <DestructiveConfirmation />,
  "Owned by its opener": <OwnedByOpener />,
};
