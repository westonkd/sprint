import { type ReactNode, useState } from "react";
import { RadioGroup } from "../../src/index.ts";

function Roles() {
  const [role, setRole] = useState("viewer");
  return (
    <RadioGroup
      label="Role"
      value={role}
      onChange={setRole}
      options={[
        {
          value: "viewer",
          label: "Viewer",
          description: "Sees the board and the agenda.",
        },
        {
          value: "editor",
          label: "Editor",
          description: "Moves people between callings.",
        },
        {
          value: "admin",
          label: "Admin",
          description: "Also invites and removes people.",
        },
      ]}
    />
  );
}

function Delivery() {
  const [delivery, setDelivery] = useState("");
  return (
    <RadioGroup
      label="Delivery"
      required
      value={delivery}
      onChange={setDelivery}
      error={delivery === "" ? "Choose how to send the invite." : undefined}
      options={[
        { value: "email", label: "Email" },
        {
          value: "text",
          label: "Text message",
          disabled: true,
          description: "No phone number on file.",
        },
      ]}
    />
  );
}

export const radioGroupSpecimens: Record<string, ReactNode> = {
  "Options that need explaining": <Roles />,
  "A required choice with an unavailable option": <Delivery />,
};
