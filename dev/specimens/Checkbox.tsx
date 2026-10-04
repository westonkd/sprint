import { type ReactNode, useState } from "react";
import { Checkbox, Stack } from "../../src/index.ts";

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

const CREW = ["Pilot", "Navigator", "Engineer"];

function PartlyPicked() {
  const [picked, setPicked] = useState<string[]>(["Pilot"]);
  const toggle = (member: string, next: boolean) =>
    setPicked((current) =>
      next ? [...current, member] : current.filter((entry) => entry !== member),
    );
  return (
    <Stack gap="tight">
      <Checkbox
        label="Whole crew"
        checked={picked.length === CREW.length}
        indeterminate={picked.length > 0 && picked.length < CREW.length}
        onChange={(next) => setPicked(next ? CREW : [])}
      />
      {CREW.map((member) => (
        <Checkbox
          key={member}
          label={member}
          checked={picked.includes(member)}
          onChange={(next) => toggle(member, next)}
        />
      ))}
    </Stack>
  );
}

export const checkboxSpecimens: Record<string, ReactNode> = {
  "A consent box": <ConsentBox />,
  "An error on a required box": <RequiredError />,
  "A disabled box": <Checkbox label="Telemetry" checked disabled onChange={() => {}} />,
  "A partly picked group": <PartlyPicked />,
};
