import { type ReactNode, useState } from "react";
import { SegmentedControl } from "../../src/index.ts";

const VIEWS = [
  { value: "human", label: "human" },
  { value: "agent", label: "agent" },
];

const DENSITY = [
  { value: "dense", label: "dense" },
  { value: "roomy", label: "roomy" },
];

function ViewExample() {
  const [view, setView] = useState("human");
  return (
    <SegmentedControl
      label="Page view"
      value={view}
      onChange={setView}
      options={VIEWS}
    />
  );
}

export const segmentedControlSpecimens: Record<string, ReactNode> = {
  "A view switch": <ViewExample />,
  "A disabled control": (
    <SegmentedControl
      label="Density"
      disabled
      value="dense"
      onChange={() => {}}
      options={DENSITY}
    />
  ),
};
