import { type ReactNode, useState } from "react";
import { List, SearchField, Stack, Text } from "../../src/index.ts";

const USERS = [
  "Ada Okafor · ada@relay.test",
  "Bram Kessel · bram@relay.test",
  "Cleo Varga · cleo@relay.test",
  "Dmitri Hale · dmitri@relay.test",
];

function matching(query: string): string[] {
  const needle = query.trim().toLowerCase();
  return USERS.filter((user) => user.toLowerCase().includes(needle));
}

function FilteringAList() {
  const [query, setQuery] = useState("");
  return (
    <Stack gap="normal">
      <SearchField
        label="Users"
        hideLabel
        value={query}
        onChange={setQuery}
        placeholder="Name or email"
      />
      <List label="Users" items={matching(query)} emptyLabel="No users match" />
    </Stack>
  );
}

function SlashShortcut() {
  const [query, setQuery] = useState("");
  return (
    <SearchField
      label="Users"
      agentName="Specimen users"
      value={query}
      onChange={setQuery}
      shortcut="/"
      placeholder="Name or email"
    />
  );
}

function SubmittingAQuery() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <Stack gap="normal">
      <SearchField
        label="Flight logs"
        value={query}
        onChange={setQuery}
        onSubmit={setSubmitted}
        placeholder="Callsign or tail number"
      />
      <Text tone="muted" size="small">
        {submitted === null
          ? "Press Enter to search."
          : submitted === ""
            ? "Showing every log."
            : `Searched for ${submitted}.`}
      </Text>
    </Stack>
  );
}

export const searchFieldSpecimens: Record<string, ReactNode> = {
  "Filtering a list": <FilteringAList />,
  "A slash shortcut": <SlashShortcut />,
  "Submitting a query": <SubmittingAQuery />,
};
