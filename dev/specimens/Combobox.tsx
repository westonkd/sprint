import { type ReactNode, useMemo, useState } from "react";
import { Avatar, Combobox, type ComboboxOption, Stack, Text } from "../../src/index.ts";

const FIRST = [
  "Ada",
  "Ben",
  "Chen",
  "Dina",
  "Eli",
  "Femi",
  "Gus",
  "Hana",
  "Ivo",
  "June",
];
const LAST = ["Okafor", "Lind", "Amaral", "Novak", "Reyes", "Sato", "Quist", "Moreau"];
const GROUPS = [
  "Elders quorum",
  "Relief Society",
  "Primary",
  "Young women",
  "Sunday school",
];

const MEMBERS: ComboboxOption[] = FIRST.flatMap((first, i) =>
  LAST.map((last, j) => ({
    value: `${first}-${last}`.toLowerCase(),
    label: `${first} ${last}`,
    group: GROUPS[(i + j) % GROUPS.length],
  })),
);

function MemberPicker() {
  const [memberId, setMemberId] = useState("");
  return (
    <Combobox
      label="Member"
      placeholder="Search members"
      value={memberId}
      onChange={setMemberId}
      groupLimit={5}
      options={MEMBERS}
    />
  );
}

function SpeakerPicker() {
  const [speaker, setSpeaker] = useState("ada-okafor");
  return (
    <Combobox
      label="Speaker"
      value={speaker}
      onChange={setSpeaker}
      options={MEMBERS}
      renderOption={(option) => (
        <Stack direction="row" gap="snug" align="center">
          <Avatar name={option.label} size="small" decorative />
          <Text as="span">{option.label}</Text>
        </Stack>
      )}
    />
  );
}

const CALLINGS = [
  "Bishop",
  "Elders quorum president",
  "Relief Society president",
  "Primary president",
  "Sunday school teacher",
  "Ward clerk",
  "Executive secretary",
  "Organist",
  "Chorister",
  "Ward mission leader",
];

function CallingSearch() {
  const [calling, setCalling] = useState("");
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      CALLINGS.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map(
        (name) => ({ value: name, label: name }),
      ),
    [query],
  );
  return (
    <Combobox
      label="Calling"
      value={calling}
      onChange={setCalling}
      filter={false}
      onQueryChange={setQuery}
      options={
        calling === "" || query !== "" ? results : [{ value: calling, label: calling }]
      }
      error={calling === "" ? "Choose a calling." : undefined}
      required
    />
  );
}

export const comboboxSpecimens: Record<string, ReactNode> = {
  "A grouped member picker": <MemberPicker />,
  "Options drawn your own way": <SpeakerPicker />,
  "A server-side search": <CallingSearch />,
};
