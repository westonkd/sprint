import { type ReactNode, useState } from "react";
import { Select } from "../../src/index.ts";

const REGIONS = [
  { value: "na-1", label: "North Atlantic" },
  { value: "eu-1", label: "Northern Europe" },
  { value: "ap-1", label: "East Asia" },
];

const SITES = [
  { value: "ksc", label: "Cape Canaveral" },
  { value: "vsfb", label: "Vandenberg" },
];

const RELAYS = [
  { value: "r-1", label: "Relay one" },
  { value: "r-2", label: "Relay two" },
];

function Dropdown() {
  const [region, setRegion] = useState("");
  return (
    <Select
      label="Region"
      value={region}
      onChange={setRegion}
      placeholder="Choose a region"
      options={REGIONS}
    />
  );
}

function RequiredChoice() {
  const [site, setSite] = useState("");
  return (
    <Select
      label="Launch site"
      value={site}
      onChange={setSite}
      required
      error="Choose a site before continuing."
      options={SITES}
    />
  );
}

export const selectSpecimens: Record<string, ReactNode> = {
  "A dropdown": <Dropdown />,
  "A required choice with an error": <RequiredChoice />,
  "A disabled dropdown": (
    <Select label="Relay" disabled value="r-2" onChange={() => {}} options={RELAYS} />
  ),
};
