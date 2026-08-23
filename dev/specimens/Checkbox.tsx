import { type ReactNode, useState } from "react";
import { Checkbox } from "../../src/index.ts";

function ConsentBox() {
  const [accepted, setAccepted] = useState(false);
  return (
    <Checkbox
      label="Accept the terms"
      checked={accepted}
      onChange={setAccepted}
      required
    />
  );
}

function RequiredError() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Checkbox
      label="Confirm the manifest"
      checked={confirmed}
      onChange={setConfirmed}
      required
      error="Confirm before launch."
    />
  );
}

export const checkboxSpecimens: Record<string, ReactNode> = {
  "A consent box": <ConsentBox />,
  "An error on a required box": <RequiredError />,
  "A disabled box": <Checkbox label="Telemetry" checked disabled onChange={() => {}} />,
};
