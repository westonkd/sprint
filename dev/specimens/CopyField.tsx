import { type ReactNode, useState } from "react";
import { CopyField } from "../../src/index.ts";

function CustomLabels() {
  const [shared, setShared] = useState(false);
  return (
    <CopyField
      label={shared ? "Invite code (shared)" : "Invite code"}
      value="NOMAD-0042"
      copyLabel="Copy code"
      copiedLabel="Code copied"
      onCopy={() => setShared(true)}
    />
  );
}

export const copyFieldSpecimens: Record<string, ReactNode> = {
  "Copy the link": (
    <CopyField
      label="Setup link"
      value="https://sprint.example/setup/7HW4-XK92-QQ1D?station=KX-2209&expires=2026-10-01"
    />
  ),
  "Custom control labels": <CustomLabels />,
};
