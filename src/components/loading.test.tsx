import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { DescriptionList } from "./DescriptionList/DescriptionList.tsx";
import { List } from "./List/List.tsx";
import { Panel } from "./Panel/Panel.tsx";
import { Table } from "./Table/Table.tsx";

interface Case {
  name: string;
  empty: (loading: boolean) => ReactElement;
  filled: (loading: boolean) => ReactElement;
}

const cases: Case[] = [
  {
    name: "Table",
    empty: (loading) => (
      <Table
        label="Loadouts"
        loading={loading}
        emptyLabel="No loadouts"
        columns={[{ key: "name", header: "Name" }]}
        rows={[]}
      />
    ),
    filled: (loading) => (
      <Table
        label="Loadouts"
        loading={loading}
        columns={[{ key: "name", header: "Name" }]}
        rows={[{ cells: { name: "Raider" } }]}
      />
    ),
  },
  {
    name: "List",
    empty: (loading) => (
      <List label="Loadouts" loading={loading} emptyLabel="No loadouts" items={[]} />
    ),
    filled: (loading) => <List label="Loadouts" loading={loading} items={["Raider"]} />,
  },
  {
    name: "DescriptionList",
    empty: (loading) => (
      <DescriptionList
        label="Loadouts"
        loading={loading}
        emptyLabel="No loadouts"
        items={[]}
      />
    ),
    filled: (loading) => (
      <DescriptionList
        label="Loadouts"
        loading={loading}
        items={[{ term: "Shell", description: "Raider" }]}
      />
    ),
  },
  {
    name: "Panel",
    empty: (loading) => (
      <Panel label="Loadouts" loading={loading} emptyLabel="No loadouts" />
    ),
    filled: (loading) => (
      <Panel label="Loadouts" loading={loading}>
        Raider
      </Panel>
    ),
  },
];

function root(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector(name));
  if (element === null) throw new Error(`no ${name} root found`);
  return element;
}

describe.each(cases)("$name loading", ({ name, empty, filled }) => {
  it("publishes nothing extra while idle", () => {
    render(filled(false));
    expect(root(name)).not.toHaveAttribute("data-sprint-loading");
    expect(root(name)).not.toHaveAttribute("aria-busy");
  });

  it("marks itself busy and keeps its content while refetching", () => {
    render(filled(true));
    expect(root(name)).toHaveAttribute("data-sprint-loading", "");
    expect(root(name)).toHaveAttribute("aria-busy", "true");
    expect(root(name)).not.toHaveAttribute("data-sprint-empty");
    expect(root(name)).toHaveTextContent("Raider");
  });

  it("says it is loading, not that it is empty, before anything arrives", () => {
    render(empty(true));
    expect(root(name)).toHaveAttribute("data-sprint-empty", "");
    expect(root(name)).toHaveAttribute("data-sprint-loading", "");
    expect(root(name)).toHaveTextContent("Loading");
    expect(root(name)).not.toHaveTextContent("No loadouts");
  });

  it("reads as both empty and loading in the agent view", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        {empty(true)}
      </SprintProvider>,
    );
    const line = container.textContent?.split("\n")[0] ?? "";
    expect(line).toContain(`**${name}**`);
    expect(line).toMatch(/\bempty\b/);
    expect(line).toMatch(/\bloading\b/);
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(empty(true));
    const [node] = serializeWithin(container);
    expect(node?.state).toMatchObject({ empty: true, loading: true });
  });
});
