import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import type { SprintView } from "@/agent/view/mode.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Tag } from "../Tag/Tag.tsx";
import { Pending } from "./Pending.tsx";

function root(): HTMLElement | null {
  return document.querySelector<HTMLElement>(agentSelector("Pending"));
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      {`count ${count}`}
    </button>
  );
}

describe("Pending rendering", () => {
  it("holds a labelled pending field while loading with no content", () => {
    render(<Pending loading label="Loading profile" />);
    const group = screen.getByRole("group", { name: "Loading profile" });
    expect(group).toBe(root());
    expect(group).toHaveAttribute("aria-busy", "true");
    expect(group).toHaveAttribute("data-sprint-loading", "");
    expect(group).toHaveAttribute("data-sprint-empty", "");
    expect(group).toHaveTextContent("Loading profile");
  });

  it("keeps stale content visible while refetching", () => {
    render(
      <Pending loading label="Refreshing pilot">
        <p>Nomad</p>
      </Pending>,
    );
    expect(root()).toHaveAttribute("data-sprint-loading", "");
    expect(root()).not.toHaveAttribute("data-sprint-empty");
    expect(root()).toHaveTextContent("Nomad");
    expect(root()).not.toHaveTextContent("Refreshing pilot");
  });

  it("is a plain element with no agent attributes or role when idle", () => {
    const { container } = render(
      <Pending loading={false} label="Refreshing pilot">
        <p>Nomad</p>
      </Pending>,
    );
    expect(root()).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
    expect(container.firstElementChild).not.toHaveAttribute("aria-busy");
    expect(container).toHaveTextContent("Nomad");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Pending ref={ref} loading label="Loading" id="profile" data-testid="spread" />,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "profile");
    expect(screen.getByTestId("spread")).toBe(root());
  });

  it.each(["human", "agent"] as const)(
    "keeps its children mounted when loading flips in %s view",
    (view: SprintView) => {
      const tree = (loading: boolean) => (
        <SprintProvider view={view} pageTools={false}>
          <Pending loading={loading} label="Refreshing">
            <Counter />
          </Pending>
        </SprintProvider>
      );

      const result = render(tree(false));
      fireEvent.click(screen.getByRole("button", { name: /count/ }));
      result.rerender(tree(true));
      result.rerender(tree(false));
      expect(screen.getByRole("button", { name: /count/ })).toHaveTextContent(
        "count 1",
      );
    },
  );
});

describe("Pending agent view", () => {
  it("renders one line while loading with no content", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Pending loading label="Loading profile" />
      </SprintProvider>,
    );
    expect(container.textContent).toBe(
      '- **Pending** "Loading profile" [empty, loading]\n',
    );
  });

  it("nests stale content under its line while refetching", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Pending loading label="Refreshing pilot">
          <Tag>cleared</Tag>
        </Pending>
      </SprintProvider>,
    );
    expect(container.textContent).toBe(
      '- **Pending** "Refreshing pilot" [loading]\n  - **Tag** "cleared" [tone=neutral]\n',
    );
  });

  it("adds no line and no depth when idle", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Pending loading={false} label="Refreshing pilot">
          <Tag>cleared</Tag>
        </Pending>
      </SprintProvider>,
    );
    expect(container.textContent).toBe('- **Tag** "cleared" [tone=neutral]\n');
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <Pending loading label="Refreshing pilot">
        <Tag>cleared</Tag>
      </Pending>,
    );
    const [node] = serializeWithin(container);
    expect(node?.component).toBe("Pending");
    expect(node?.label).toBe("Refreshing pilot");
    expect(node?.state).toEqual({ loading: true });
    expect(node?.children.map((child) => child.component)).toEqual(["Tag"]);
  });

  it("projects only its children when idle", () => {
    const { container } = render(
      <Pending loading={false} label="Refreshing pilot">
        <Tag>cleared</Tag>
      </Pending>,
    );
    expect(serializeWithin(container).map((node) => node.component)).toEqual(["Tag"]);
  });
});
