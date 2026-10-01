import { type ReactNode, useState } from "react";
import { Disclosure, Text } from "../../src/index.ts";

function ControlledDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure label="Access breakdown" expanded={open} onExpandedChange={setOpen}>
      <Text>Admin through the Operators group.</Text>
    </Disclosure>
  );
}

export const disclosureSpecimens: Record<string, ReactNode> = {
  "Secondary detail on demand": (
    <Disclosure label="Access breakdown">
      <Text>Admin through the Operators group.</Text>
    </Disclosure>
  ),
  "A controlled disclosure": <ControlledDisclosure />,
  "Custom toggle text": (
    <Disclosure label="Audit trail" showLabel="Show 12 events" hideLabel="Hide events">
      <Text>Last change was a role grant by the on-call operator.</Text>
    </Disclosure>
  ),
};
