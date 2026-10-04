import { type ReactNode, useState } from "react";
import { Button, List, Tabs, Text } from "../../src/index.ts";

const UPCOMING = [
  "Sister Amaral, Oct 12",
  "Brother Lind, Oct 12",
  "Elder Okafor, Oct 19",
  "Sister Chen, Oct 26",
];

export const tabsSpecimens: Record<string, ReactNode> = {
  "Views of one subject": (
    <Tabs
      label="Speakers"
      tabs={[
        {
          value: "upcoming",
          label: "Coming up",
          count: 4,
          panel: <List label="Coming up" items={UPCOMING} />,
        },
        {
          value: "past",
          label: "Past",
          panel: <Text>Thirty-one talks since January.</Text>,
        },
        {
          value: "member",
          label: "By member",
          panel: <Text tone="muted">Pick a member to see when they last spoke.</Text>,
        },
      ]}
    />
  ),
  "Tabs with an action": <RecordTabs />,
};

function RecordTabs() {
  const [view, setView] = useState("details");
  return (
    <Tabs
      label="Record"
      value={view}
      onChange={setView}
      actions={<Button size="small">Export</Button>}
      tabs={[
        { value: "details", label: "Details", panel: <Text>Called on March 3.</Text> },
        { value: "history", label: "History", panel: <Text>Two prior callings.</Text> },
        { value: "audit", label: "Audit", disabled: true, panel: null },
      ]}
    />
  );
}
