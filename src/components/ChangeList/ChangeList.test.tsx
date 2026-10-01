import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { accessibleText } from "@/agent/view/text.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { type Change, ChangeList } from "./ChangeList.tsx";

const CHANGES: readonly Change[] = [
  { kind: "added", label: "Grace Hopper", detail: "Gets read access." },
  { kind: "removed", label: "Alan Turing" },
  { kind: "removed", label: "Edsger Dijkstra" },
  { kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("ChangeList"));
  if (element === null) throw new Error("no ChangeList root found");
  return element;
}

function rows(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(agentSelector("ChangeList", "change")),
  );
}

describe("ChangeList rendering", () => {
  it("is a list named by its label, one item per change", () => {
    render(<ChangeList label="Team changes" changes={CHANGES} />);
    expect(screen.getByRole("list", { name: "Team changes" })).toBe(root());
    expect(within(root()).getAllByRole("listitem")).toHaveLength(4);
  });

  it("counts each kind and omits a kind it has none of", () => {
    render(<ChangeList label="Team changes" changes={CHANGES.slice(0, 3)} />);
    expect(root()).toHaveAttribute("data-sprint-changes", "3");
    expect(root()).toHaveAttribute("data-sprint-added", "1");
    expect(root()).toHaveAttribute("data-sprint-removed", "2");
    expect(root()).not.toHaveAttribute("data-sprint-changed");
  });

  it("publishes kind, from and to on every row", () => {
    render(<ChangeList label="Team changes" changes={CHANGES} />);
    const changed = rows()[3];
    expect(changed).toHaveAttribute("data-sprint-kind", "changed");
    expect(changed).toHaveAttribute("data-sprint-from", "Write");
    expect(changed).toHaveAttribute("data-sprint-to", "Maintain");
    expect(rows()[1]).toHaveAttribute("data-sprint-kind", "removed");
    expect(rows()[1]).not.toHaveAttribute("data-sprint-from");
  });

  it("draws a glyph per kind that a screen reader skips", () => {
    render(<ChangeList label="Team changes" changes={CHANGES} />);
    const marks = rows().map((row) => row.firstElementChild);
    expect(marks.map((mark) => mark?.textContent)).toEqual(["+", "−", "−", "→"]);
    for (const mark of marks) expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("says the kind and the transition in words", () => {
    render(<ChangeList label="Team changes" changes={CHANGES} />);
    expect(rows().map((row) => accessibleText(row))).toEqual([
      "Added: Grace Hopper. Gets read access.",
      "Removed: Alan Turing",
      "Removed: Edsger Dijkstra",
      "Changed: Ada Lovelace, from Write to Maintain",
    ]);
  });

  it("marks the old value deleted and the new one inserted", () => {
    render(<ChangeList label="Team changes" changes={CHANGES} />);
    expect(rows()[3]?.querySelector("del")).toHaveTextContent("Write");
    expect(rows()[3]?.querySelector("ins")).toHaveTextContent("Maintain");
  });

  it("says it is empty rather than rendering nothing", () => {
    render(<ChangeList label="Role changes" changes={[]} />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveAttribute("data-sprint-changes", "0");
    expect(root()).toHaveTextContent("No changes");
    expect(rows()).toHaveLength(0);
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLUListElement>();
    render(<ChangeList ref={ref} id="review" label="Role changes" changes={CHANGES} />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "review");
  });
});

describe("ChangeList agent view", () => {
  it("carries every change as a part, and renders no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <ChangeList label="Team changes" changes={CHANGES} />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("ChangeList"))).toBeNull();
    expect(container.textContent).toBe(
      [
        '- **ChangeList** "Team changes" [added=1, changed=1, changes=4, removed=2]',
        '  - part `change` "Added: Grace Hopper. Gets read access." [kind=added]',
        '  - part `change` "Removed: Alan Turing" [kind=removed]',
        '  - part `change` "Removed: Edsger Dijkstra" [kind=removed]',
        '  - part `change` "Changed: Ada Lovelace, from Write to Maintain" [from=Write, kind=changed, to=Maintain]',
        "",
      ].join("\n"),
    );
  });

  it("says it is empty", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <ChangeList label="Role changes" changes={[]} />
      </SprintProvider>,
    );
    expect(container.textContent).toBe(
      '- **ChangeList** "Role changes" [changes=0, empty]\n',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<ChangeList label="Team changes" changes={CHANGES} />);
    const [node] = serializeWithin(container);
    expect(node?.component).toBe("ChangeList");
    expect(node?.label).toBe("Team changes");
    expect(node?.state).toEqual({
      changes: "4",
      added: "1",
      removed: "2",
      changed: "1",
    });
    expect(node?.parts).toEqual([
      {
        part: "change",
        label: "Added: Grace Hopper. Gets read access.",
        state: { kind: "added" },
      },
      { part: "change", label: "Removed: Alan Turing", state: { kind: "removed" } },
      { part: "change", label: "Removed: Edsger Dijkstra", state: { kind: "removed" } },
      {
        part: "change",
        label: "Changed: Ada Lovelace, from Write to Maintain",
        state: { kind: "changed", from: "Write", to: "Maintain" },
      },
    ]);
  });
});
