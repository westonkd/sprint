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

const MEMBERS = [
  { value: "all", label: "All", count: 48 },
  { value: "active", label: "Active", count: 18 },
  { value: "never", label: "Never signed in", count: 30 },
];

const ACCESS = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "admin", label: "Admin" },
];

const INTERVIEW = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted", disabled: true },
  { value: "declined", label: "Declined", disabled: true },
  { value: "deferred", label: "Deferred" },
];

function UnavailableExample() {
  const [status, setStatus] = useState("pending");
  return (
    <SegmentedControl
      label="Interview"
      value={status}
      onChange={setStatus}
      options={INTERVIEW}
    />
  );
}

const RANGES = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
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

function CountsExample() {
  const [filter, setFilter] = useState("all");
  return (
    <SegmentedControl
      label="Members"
      value={filter}
      onChange={setFilter}
      options={MEMBERS}
    />
  );
}

function StagedExample() {
  const [access, setAccess] = useState("write");
  return (
    <SegmentedControl
      label="Access"
      value={access}
      savedValue="read"
      onChange={setAccess}
      hint="Currently Read. Nothing changes until you confirm."
      options={ACCESS}
    />
  );
}

function BlockExample() {
  const [range, setRange] = useState("week");
  return (
    <SegmentedControl
      label="Range"
      block
      value={range}
      onChange={setRange}
      options={RANGES}
    />
  );
}

export const segmentedControlSpecimens: Record<string, ReactNode> = {
  "A view switch": <ViewExample />,
  "Options with counts": <CountsExample />,
  "A staged change": <StagedExample />,
  "A full-width control": <BlockExample />,
  "A disabled control": (
    <SegmentedControl
      label="Density"
      disabled
      value="dense"
      onChange={() => {}}
      options={DENSITY}
    />
  ),
  "One option unavailable": <UnavailableExample />,
};
