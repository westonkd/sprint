import { type ReactNode, useState } from "react";
import { EntityRow, Stack, Text } from "../../src/index.ts";

const people = [
  {
    id: "ada",
    href: "#/people/ada",
    name: "Ada Lovelace",
    roles: ["admin", "billing"],
    lastSignIn: "3 days ago",
  },
  {
    id: "grace",
    href: "#/people/grace",
    name: "Grace Hopper",
    roles: ["owner"],
    lastSignIn: "today",
  },
  {
    id: "katherine",
    href: "#/people/katherine",
    name: "Katherine Johnson",
    roles: ["analyst"],
    lastSignIn: "2 weeks ago",
  },
];

function ActingRow() {
  const [selected, setSelected] = useState(0);
  return (
    <Stack gap="tight">
      <EntityRow
        title="Grace Hopper"
        onSelect={() => setSelected(selected + 1)}
        tags={[{ label: "owner", tone: "warning" }]}
        meta={["Invited yesterday"]}
      />
      <Text tone="muted" size="small">
        Selected {selected} time(s).
      </Text>
    </Stack>
  );
}

export const entityRowSpecimens: Record<string, ReactNode> = {
  "A person in a directory": (
    <EntityRow
      title="Ada Lovelace"
      href="#/people/ada"
      tags={[{ label: "admin", tone: "info" }, { label: "billing" }]}
      meta={[{ term: "Last sign-in", detail: "3 days ago" }, "2 apps"]}
    />
  ),
  "A row that acts": <ActingRow />,
  "A directory of rows": (
    <Stack gap="none">
      {people.map((person) => (
        <EntityRow
          key={person.id}
          title={person.name}
          href={person.href}
          tags={person.roles.map((role) => ({ label: role }))}
          meta={[{ term: "Last sign-in", detail: person.lastSignIn }]}
        />
      ))}
    </Stack>
  ),
  "With a description": (
    <EntityRow
      title="Payments service"
      href="#/projects/payments"
      tags={[{ label: "degraded", tone: "danger" }]}
      meta={["Updated 4 min ago"]}
      description="Card authorisations are timing out in eu-west."
    />
  ),
};
