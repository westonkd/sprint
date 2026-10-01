import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { type Step, Steps } from "./Steps.tsx";

const TESS: readonly Step[] = [
  { title: "Copy the link" },
  { title: "Pass on the emoji" },
];

const PARTWAY: readonly Step[] = [
  { title: "Register the tool", body: "Give it a name.", state: "done" },
  { title: "Drive the DOM", body: "Click the real element.", state: "current" },
  { title: "Return the new state" },
];

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Steps"));
  if (element === null) throw new Error("no Steps root found");
  return element;
}

function steps(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(agentSelector("Steps", "step")),
  );
}

describe("Steps rendering", () => {
  it("is an ordered list named by its label", () => {
    render(<Steps label="Send Tess two things" steps={TESS} />);
    expect(screen.getByRole("list", { name: "Send Tess two things" })).toBe(root());
    expect(root().tagName).toBe("OL");
    expect(within(root()).getAllByRole("listitem")).toHaveLength(2);
    expect(root()).toHaveAttribute("data-sprint-steps", "2");
  });

  it("numbers every step in a badge hidden from assistive technology", () => {
    render(<Steps label="Send Tess two things" steps={TESS} />);
    const badges = steps().map((step) => step.querySelector("[aria-hidden]"));
    expect(badges.map((badge) => badge?.textContent)).toEqual(["1", "2"]);
    expect(steps().map((step) => step.getAttribute("data-sprint-index"))).toEqual([
      "1",
      "2",
    ]);
  });

  it("renders a title and an optional body", () => {
    render(<Steps label="Connect a tool" steps={PARTWAY} />);
    const [first, , last] = steps();
    expect(first?.querySelector("strong")).toHaveTextContent("Register the tool");
    expect(first?.querySelector("p")).toHaveTextContent("Give it a name.");
    expect(last?.querySelector("p")).toBeNull();
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLOListElement>();
    render(<Steps ref={ref} id="tess" label="Send Tess two things" steps={TESS} />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "tess");
  });

  it("says it is empty rather than rendering nothing", () => {
    render(<Steps label="Nothing yet" steps={[]} emptyLabel="Nothing to do" />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).toHaveTextContent("Nothing to do");
    expect(steps()).toHaveLength(0);
  });
});

describe("Steps state", () => {
  it("publishes done and current on each step and leaves upcoming bare", () => {
    render(<Steps label="Connect a tool" steps={PARTWAY} />);
    const [done, current, upcoming] = steps();
    expect(done).toHaveAttribute("data-sprint-done", "");
    expect(done).not.toHaveAttribute("data-sprint-current");
    expect(current).toHaveAttribute("data-sprint-current", "");
    expect(upcoming).not.toHaveAttribute("data-sprint-done");
    expect(upcoming).not.toHaveAttribute("data-sprint-current");
    expect(root()).not.toHaveAttribute("data-sprint-complete");
  });

  it("is complete only when every step is done", () => {
    render(
      <Steps
        label="Send Tess two things"
        steps={TESS.map((step) => ({ ...step, state: "done" as const }))}
      />,
    );
    expect(root()).toHaveAttribute("data-sprint-complete", "");
  });
});

describe("Steps accessibility", () => {
  it("marks the current step with aria-current", () => {
    render(<Steps label="Connect a tool" steps={PARTWAY} />);
    const current = screen.getByRole("listitem", { current: "step" });
    expect(current).toHaveAttribute("data-sprint-index", "2");
    expect(steps().filter((step) => step.hasAttribute("aria-current"))).toHaveLength(1);
  });

  it("describes a done step in words", () => {
    render(<Steps label="Connect a tool" steps={PARTWAY} doneLabel="Finished" />);
    const [done, current] = steps();
    expect(done).toHaveAccessibleDescription("Finished");
    expect(current).not.toHaveAttribute("aria-describedby");
  });

  it("reads title and body as one item", () => {
    render(<Steps label="Connect a tool" steps={PARTWAY} />);
    const [first] = steps();
    expect(first?.textContent).toContain("Register the tool: Give it a name.");
  });
});

describe("Steps agent surface", () => {
  it("renders one line per step and no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Steps label="Send Tess two things" steps={TESS} />
      </SprintProvider>,
    );
    expect(container.querySelector(agentSelector("Steps"))).toBeNull();
    expect(
      container.querySelector("button:not([data-sprint-view-copy]), a, input"),
    ).toBeNull();
    expect(container.textContent).toBe(
      [
        '- **Steps** "Send Tess two things" [steps=2]',
        '  - part `step` "Copy the link" [index=1]',
        '  - part `step` "Pass on the emoji" [index=2]',
        "",
      ].join("\n"),
    );
  });

  it("carries body and state on each part", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Steps label="Connect a tool" steps={PARTWAY} />
      </SprintProvider>,
    );
    expect(container.textContent).toBe(
      [
        '- **Steps** "Connect a tool" [steps=3]',
        '  - part `step` "Register the tool: Give it a name." [done, index=1]',
        '  - part `step` "Drive the DOM: Click the real element." [current, index=2]',
        '  - part `step` "Return the new state" [index=3]',
        "",
      ].join("\n"),
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Steps label="Connect a tool" steps={PARTWAY} />);
    const [node] = serializeWithin(container);
    expect(node?.component).toBe("Steps");
    expect(node?.label).toBe("Connect a tool");
    expect(node?.state).toEqual({ steps: "3" });
    expect(node?.parts).toEqual([
      {
        part: "step",
        label: "Register the tool: Give it a name.",
        state: { index: "1", done: true },
      },
      {
        part: "step",
        label: "Drive the DOM: Click the real element.",
        state: { index: "2", current: true },
      },
      { part: "step", label: "Return the new state", state: { index: "3" } },
    ]);
  });
});
