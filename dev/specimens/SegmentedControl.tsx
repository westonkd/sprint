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

const ACCESS = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "maintain", label: "Maintain" },
];

function StagedExample() {
  const [access, setAccess] = useState("maintain");
  return (
    <SegmentedControl
      label="Access"
      saved="write"
      value={access}
      onChange={setAccess}
      hint="Nothing changes until you confirm."
      options={ACCESS}
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
  "A staged change": <StagedExample />,
};
