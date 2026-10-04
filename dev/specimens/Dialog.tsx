import { type ReactNode, useRef, useState } from "react";
import { Button, Dialog, Stack, Text, TextInput } from "../../src/index.ts";

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

function FocusedForm() {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("Kestrel Relay");
  const nameField = useRef<HTMLInputElement>(null);
  return (
    <Stack gap="tight">
      <Button onClick={() => setRenaming(true)}>Rename station</Button>
      <Dialog
        label="Rename station"
        size="medium"
        open={renaming}
        initialFocus={nameField}
        onClose={() => setRenaming(false)}
      >
        <Stack gap="tight">
          <TextInput
            label="Station name"
            value={name}
            onChange={setName}
            inputRef={nameField}
          />
          <Button tone="action" onClick={() => setRenaming(false)}>
            Save name
          </Button>
        </Stack>
      </Dialog>
    </Stack>
  );
}

export const dialogSpecimens: Record<string, ReactNode> = {
  "A destructive confirmation": <DestructiveConfirmation />,
  "Owned by its opener": <OwnedByOpener />,
  "A form that focuses its first field": <FocusedForm />,
};
