import { type ReactNode, useState } from "react";
import { Menu, Stack, Text } from "../../src/index.ts";
import { MoreIcon } from "./icons.tsx";

function CardActions() {
  const [last, setLast] = useState("nothing yet");
  return (
    <Stack direction="row" gap="tight" align="center">
      <Text tone="muted" size="small">
        Last action: {last}
      </Text>
      <Menu
        label="Card actions"
        icon={<MoreIcon />}
        hideLabel
        size="small"
        align="end"
        items={[
          { label: "Edit", onSelect: () => setLast("Edit") },
          { label: "Duplicate", onSelect: () => setLast("Duplicate") },
          { label: "Delete", tone: "danger", onSelect: () => setLast("Delete") },
        ]}
      />
    </Stack>
  );
}

function AccountMenu() {
  const [signedIn, setSignedIn] = useState(true);
  return (
    <Menu
      label={signedIn ? "Account" : "Signed out"}
      agentName="Account"
      items={[
        { label: "Profile", href: "#/Menu", group: "Signed in as Nomad" },
        { label: "Settings", href: "#/Menu", group: "Signed in as Nomad" },
        { label: "Sign out", disabled: !signedIn, onSelect: () => setSignedIn(false) },
      ]}
    />
  );
}

const PLANNERS = ["Bishop Okafor", "Brother Lind", "Sister Amaral", "Unassigned"];

function PlannerPicker() {
  const [planner, setPlanner] = useState("Unassigned");
  return (
    <Menu
      label={`Planner: ${planner}`}
      agentName="Planner"
      items={PLANNERS.map((name) => ({
        label: name,
        checked: name === planner,
        onSelect: () => setPlanner(name),
      }))}
    />
  );
}

export const menuSpecimens: Record<string, ReactNode> = {
  "Card actions": <CardActions />,
  "Links and actions together": <AccountMenu />,
  "Choosing one of several": <PlannerPicker />,
};
