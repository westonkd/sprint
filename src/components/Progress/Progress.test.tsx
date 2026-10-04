import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Progress } from "./Progress.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Progress"));
  if (element === null) throw new Error("no Progress root found");
  return element;
}

describe("Progress rendering", () => {
  it("keeps a hidden label as the accessible name and drops the percentage", () => {
    render(<Progress label="Notes this week" value={3} max={5} hideLabel />);
    expect(
      screen.getByRole("progressbar", { name: "Notes this week" }),
    ).toHaveAttribute("value", "60");
    expect(screen.getByText("Notes this week")).toHaveAttribute(
      "data-sprint-visually-hidden",
    );
    expect(screen.queryByText("60%")).toBeNull();
    expect(root()).toHaveAttribute("data-sprint-value", "60%");
  });

  it("publishes a tone other than info", () => {
    const view = render(<Progress label="Fuel" value={30} tone="warning" />);
    expect(root()).toHaveAttribute("data-sprint-tone", "warning");
    view.rerender(<Progress label="Fuel" value={30} />);
    expect(root()).not.toHaveAttribute("data-sprint-tone");
  });

  it("is indeterminate and loading without a value", () => {
    render(<Progress label="Loading flight plan" />);
    const bar = screen.getByRole("progressbar", { name: "Loading flight plan" });
    expect(bar).not.toHaveAttribute("value");
    expect(root()).toHaveAttribute("data-sprint-loading", "");
    expect(root()).not.toHaveAttribute("data-sprint-value");
  });

  it("publishes a whole percentage of max when given a value", () => {
    render(<Progress label="Importing manifest" value={96} max={240} />);
    const bar = screen.getByRole("progressbar", { name: "Importing manifest" });
    expect(bar).toHaveAttribute("value", "40");
    expect(bar).toHaveAttribute("max", "100");
    expect(root()).toHaveAttribute("data-sprint-value", "40%");
    expect(root()).toHaveAttribute("data-sprint-loading", "");
  });

  it("clears loading once the value reaches max", () => {
    render(<Progress label="Importing manifest" value={240} max={240} />);
    expect(root()).toHaveAttribute("data-sprint-value", "100%");
    expect(root()).not.toHaveAttribute("data-sprint-loading");
  });

  it("clamps a value outside the range", () => {
    const view = render(<Progress label="Upload" value={-5} />);
    expect(root()).toHaveAttribute("data-sprint-value", "0%");
    view.rerender(<Progress label="Upload" value={180} />);
    expect(root()).toHaveAttribute("data-sprint-value", "100%");
  });

  it("treats a non-finite value as indeterminate", () => {
    render(<Progress label="Upload" value={Number.NaN} />);
    expect(root()).not.toHaveAttribute("data-sprint-value");
    expect(root()).toHaveAttribute("data-sprint-loading", "");
  });

  it("registers no tool, because there is nothing to act on", () => {
    render(<Progress label="Upload" value={10} />);
    expect(mock.history).toHaveLength(0);
    expect(root()).not.toHaveAttribute("data-sprint-tool");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} label="Upload" id="upload" data-testid="spread" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "upload");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("Progress agent view", () => {
  it("renders one line and no element while indeterminate", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Progress label="Loading flight plan" />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("Progress"))).toBeNull();
    expect(container.querySelector("progress")).toBeNull();
    expect(container.textContent).toBe(
      '- **Progress** "Loading flight plan" [loading]\n',
    );
  });

  it("carries the percentage while counted", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Progress label="Importing manifest" value={96} max={240} />
      </SprintProvider>,
    );

    expect(container.textContent).toBe(
      '- **Progress** "Importing manifest" [loading, value=40%]\n',
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Progress label="Importing manifest" value={96} max={240} />,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Importing manifest");
    expect(node?.parts).toEqual([]);
    expect(node?.state).toEqual({ loading: true, value: "40%" });
  });
});
