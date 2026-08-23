import { fireEvent, render } from "@testing-library/react";
import { StrictMode, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  installMockModelContext,
  type MockModelContext,
} from "../../test/modelContext.ts";
import type { AgentToolSpec } from "../types.ts";
import { __resetToolNames, AgentScopeProvider } from "./scope.ts";
import { useAgentTool } from "./useAgentTool.ts";

const spec: AgentToolSpec = {
  verb: "press",
  description: "Press the button.",
  inputSchema: { type: "object", properties: {} },
  readOnly: false,
  untrustedContent: true,
  registeredWhen: "The button is mounted and enabled.",
};

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Probe(props: {
  label?: string | undefined;
  enabled?: boolean;
  execute?: () => string;
}) {
  const name = useAgentTool({
    spec,
    label: props.label ?? "Launch",
    enabled: props.enabled ?? true,
    execute: props.execute ?? (() => "pressed"),
  });
  return <span data-testid="name">{name ?? "none"}</span>;
}

describe("useAgentTool", () => {
  it("registers on mount using the label-derived name", () => {
    const view = render(<Probe />);
    expect(mock.names()).toEqual(["press-launch"]);
    expect(view.getByTestId("name")).toHaveTextContent("press-launch");
  });

  it("prefixes the name with the surrounding scope", () => {
    render(
      <AgentScopeProvider value={{ path: ["Billing"] }}>
        <Probe label="Save" />
      </AgentScopeProvider>,
    );
    expect(mock.names()).toEqual(["billing-press-save"]);
  });

  it("registers nothing when disabled", () => {
    render(<Probe enabled={false} />);
    expect(mock.history).toHaveLength(0);
  });

  it("registers nothing without a usable label", () => {
    render(<Probe label="×" />);
    expect(mock.history).toHaveLength(0);
  });

  it("unregisters when it becomes disabled", () => {
    const view = render(<Probe enabled />);
    expect(mock.names()).toEqual(["press-launch"]);
    view.rerender(<Probe enabled={false} />);
    expect(mock.names()).toEqual([]);
  });

  it("unregisters on unmount", () => {
    const view = render(<Probe />);
    view.unmount();
    expect(mock.names()).toEqual([]);
  });

  it("does not re-register when the execute identity changes", () => {
    const view = render(<Probe execute={() => "a"} />);
    view.rerender(<Probe execute={() => "b"} />);
    view.rerender(<Probe execute={() => "c"} />);
    expect(mock.history).toHaveLength(1);
  });

  it("calls the latest execute after a re-render", async () => {
    const view = render(<Probe execute={() => "first"} />);
    view.rerender(<Probe execute={() => "second"} />);
    await expect(mock.call("press-launch")).resolves.toBe("second");
  });

  it("yields exactly one live registration under StrictMode", () => {
    render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );
    expect(mock.names()).toEqual(["press-launch"]);
  });

  it("registers neither component on a name collision, and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Probe label="Save" />
        <Probe label="Save" />
      </>,
    );
    expect(mock.names()).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("press-save"));
  });

  it("restores the survivor's tool when a colliding sibling unmounts", () => {
    function Pair() {
      const [both, setBoth] = useState(true);
      return (
        <>
          <Probe label="Save" />
          {both ? <Probe label="Save" /> : null}
          <button type="button" onClick={() => setBoth(false)}>
            drop
          </button>
        </>
      );
    }

    vi.spyOn(console, "warn").mockImplementation(() => {});
    const view = render(<Pair />);
    expect(mock.names()).toEqual([]);
    fireEvent.click(view.getByText("drop"));
    expect(mock.names()).toEqual(["press-save"]);
  });

  it("carries the spec annotations onto the descriptor", () => {
    render(<Probe />);
    expect(mock.find("press-launch")?.descriptor.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: true,
    });
  });

  it("reports no name when the platform is absent but still holds the claim", () => {
    mock.uninstall();
    const view = render(<Probe />);
    expect(view.getByTestId("name")).toHaveTextContent("press-launch");
  });
});
