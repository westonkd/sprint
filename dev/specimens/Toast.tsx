import { type ReactNode, useState } from "react";
import { Button, Stack, Toast } from "../../src/index.ts";

function UndoToast() {
  const [moved, setMoved] = useState<string | null>(null);
  return (
    <Stack direction="row" gap="tight" wrap>
      <Button onClick={() => setMoved("Sister Amaral")}>Move Sister Amaral</Button>
      <Toast
        open={moved !== null}
        message={`Moved ${moved ?? ""} to Primary.`}
        action={{ label: "Undo", onSelect: () => setMoved(null), shortcut: "Ctrl+Z" }}
        onDismiss={() => setMoved(null)}
      />
    </Stack>
  );
}

function StayingToast() {
  const [offline, setOffline] = useState(false);
  return (
    <Stack direction="row" gap="tight" wrap>
      <Button onClick={() => setOffline(true)}>Go offline</Button>
      <Toast
        open={offline}
        label="Offline"
        tone="warning"
        duration={null}
        message="Changes are saved on this device until the connection returns."
        onDismiss={() => setOffline(false)}
      />
    </Stack>
  );
}

export const toastSpecimens: Record<string, ReactNode> = {
  "An undo toast": <UndoToast />,
  "A toast that stays": <StayingToast />,
};
