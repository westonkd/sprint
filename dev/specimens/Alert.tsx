import { type ReactNode, useState } from "react";
import { Alert, Button, Stack } from "../../src/index.ts";

function DismissibleConfirmation() {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return <Button onClick={() => setVisible(true)}>Bring the alert back</Button>;
  }
  return (
    <Alert tone="neutral" label="Key revoked" onDismiss={() => setVisible(false)}>
      The key can no longer authenticate.
    </Alert>
  );
}

export const alertGallery: ReactNode = (
  <Stack gap="tight">
    <Alert tone="neutral" label="Session ended">
      You signed out on this device.
    </Alert>
    <Alert label="Check your inbox">
      We sent a sign-in link to nomad@escadrille.test.
    </Alert>
    <Alert tone="warning" label="Key expires soon">
      sk-prod stops working in 14 days.
    </Alert>
    <Alert tone="danger" label="Sign-in failed">
      Wrong callsign or access code.
    </Alert>
  </Stack>
);

export const alertSpecimens: Record<string, ReactNode> = {
  "A sign-in notice": (
    <Alert label="Check your inbox">
      We sent a sign-in link to nomad@escadrille.test.
    </Alert>
  ),
  "A dismissible confirmation": <DismissibleConfirmation />,
  "A failure": (
    <Alert tone="danger" label="Sign-in failed">
      Wrong callsign or access code.
    </Alert>
  ),
};
