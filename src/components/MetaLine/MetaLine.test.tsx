import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { MetaLine, type MetaLineEntry } from "./MetaLine.tsx";

const ENTRIES: readonly MetaLineEntry[] = [
  { term: "Serial", detail: "NU-TYPE-CORE-A1" },
  { term: "Issued", detail: "2744.07.22" },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("MetaLine"));
  if (element === null) throw new Error("no MetaLine root found");
  return element;
}

describe("MetaLine rendering", () => {
  it("renders the entries as one slash-separated line", () => {
    render(<MetaLine entries={ENTRIES} />);
    expect(root()).toHaveTextContent("Serial: NU-TYPE-CORE-A1 / Issued: 2744.07.22");
    expect(root()).toHaveAttribute("data-sprint-entries", "2");
  });

  it("renders nothing at all for an empty entry list", () => {
    const { container } = render(<MetaLine entries={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<MetaLine ref={ref} entries={ENTRIES} data-testid="spread" />);
    expect(ref.current).toBe(root());
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("MetaLine agent view", () => {
  it("renders the line as text and no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <MetaLine entries={ENTRIES} />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("MetaLine"))).toBeNull();
    expect(container.textContent).toBe(
      '- **MetaLine** "Serial: NU-TYPE-CORE-A1 / Issued: 2744.07.22" [entries=2]\n',
    );
  });

  it("renders nothing in agent view for an empty entry list", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <MetaLine entries={[]} />
      </SprintProvider>,
    );
    expect(container.textContent).toBe("");
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<MetaLine entries={ENTRIES} />);
    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Serial: NU-TYPE-CORE-A1 / Issued: 2744.07.22");
    expect(node?.state).toMatchObject({ entries: "2" });
    expect(node?.parts).toEqual([]);
  });
});
