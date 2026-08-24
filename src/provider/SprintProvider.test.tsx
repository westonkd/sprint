import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_ATTRIBUTE, VIEW_ATTRIBUTE } from "@/agent/attributes.ts";
import { TOOL_OUTPUT_LIMIT } from "@/agent/webmcp/adapter.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { Button } from "@/components/Button/index.ts";
import { Panel } from "@/components/Panel/index.ts";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { AgentRegion, SprintProvider } from "./SprintProvider.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

async function call(
  name: string,
  inputs?: Record<string, unknown>,
): Promise<string | null> {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result;
}

describe("SprintProvider", () => {
  it("renders a layout-neutral container marked with the current view", () => {
    const view = render(
      <SprintProvider>
        <span data-testid="child">hi</span>
      </SprintProvider>,
    );
    const container = view.container.firstElementChild;
    expect(container).toHaveAttribute(VIEW_ATTRIBUTE, "human");
    expect(container?.firstElementChild).toBe(view.getByTestId("child"));
  });

  it("marks the container as the agent text surface in agent view", () => {
    const view = render(
      <SprintProvider view="agent" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    const container = view.container.querySelector(`[${VIEW_ATTRIBUTE}]`);
    expect(container).toHaveAttribute(VIEW_ATTRIBUTE, "agent");
  });

  it("stamps the theme on its container only when one is chosen", () => {
    const themed = render(
      <SprintProvider theme="light" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(themed.container.firstElementChild).toHaveAttribute(
      THEME_ATTRIBUTE,
      "light",
    );

    const unthemed = render(
      <SprintProvider pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(unthemed.container.firstElementChild).not.toHaveAttribute(THEME_ATTRIBUTE);
  });

  it("does not remount its subtree when the view flips", () => {
    const mounts = vi.fn();

    function Probe() {
      useEffect(() => {
        mounts();
      }, []);
      return <Button>Save</Button>;
    }

    const view = render(
      <SprintProvider view="human" pageTools={false}>
        <Probe />
      </SprintProvider>,
    );
    view.rerender(
      <SprintProvider view="agent" pageTools={false}>
        <Probe />
      </SprintProvider>,
    );
    view.rerender(
      <SprintProvider view="human" pageTools={false}>
        <Probe />
      </SprintProvider>,
    );
    expect(mounts).toHaveBeenCalledTimes(1);
  });

  it("registers both page tools", () => {
    render(
      <SprintProvider>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(mock.names()).toContain("list-page-regions");
    expect(mock.names()).toContain("read-region");
  });

  it("registers no page tools when the platform is absent", () => {
    mock.uninstall();
    render(
      <SprintProvider>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(mock.history).toHaveLength(0);
  });

  it("can be turned off", () => {
    render(
      <SprintProvider pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(mock.names()).toEqual(["press-save"]);
  });

  it("leaves components working when it is absent from the tree", () => {
    render(<Button>Save</Button>);
    expect(mock.names()).toEqual(["press-save"]);
  });

  it("marks both page tools read-only and untrusted", () => {
    render(
      <SprintProvider>
        <span />
      </SprintProvider>,
    );
    for (const name of ["list-page-regions", "read-region"]) {
      expect(mock.find(name)?.descriptor.annotations).toEqual({
        readOnlyHint: true,
        untrustedContentHint: true,
      });
    }
  });

  it("does not register page tools twice when nested", () => {
    render(
      <SprintProvider label="Outer">
        <SprintProvider label="Inner">
          <span />
        </SprintProvider>
      </SprintProvider>,
    );
    expect(mock.names().filter((name) => name === "read-region")).toHaveLength(1);
  });
});

describe("the copy control", () => {
  let written: string[];

  beforeEach(() => {
    written = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          written.push(text);
          return Promise.resolve();
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function copyControl(): HTMLElement {
    return screen.getByRole("button", { name: "Copy agent view" });
  }

  it("renders beside the agent text surface, before it, with no text of its own", () => {
    const view = render(
      <SprintProvider view="agent" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    const control = copyControl();
    const container = view.container.querySelector(`[${VIEW_ATTRIBUTE}]`);
    expect(control.textContent).toBe("");
    expect(control.nextElementSibling).toBe(container);
    expect(control.closest(`[${VIEW_ATTRIBUTE}]`)).toBeNull();
  });

  it("does not render in human view", () => {
    render(
      <SprintProvider view="human" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(screen.queryByRole("button", { name: "Copy agent view" })).toBeNull();
  });

  it("copies the agent text stream, not markup", async () => {
    const view = render(
      <SprintProvider view="agent" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    fireEvent.click(copyControl());
    await act(async () => {});

    const container = view.container.querySelector(`[${VIEW_ATTRIBUTE}]`);
    expect(written).toEqual([(container?.textContent ?? "").trim()]);
    expect(written[0]).toContain("**Button**");
    expect(written[0]).not.toContain("<");
    expect(written[0]).not.toContain("Copy agent view");
  });

  it("reports back through its label and resets", async () => {
    vi.useFakeTimers();
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    fireEvent.click(copyControl());
    await act(async () => {
      await Promise.resolve();
    });

    const control = screen.getByRole("button", { name: "Copied" });
    expect(control).toHaveAttribute("data-sprint-copied");

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(copyControl()).not.toHaveAttribute("data-sprint-copied");
  });

  it("renders once when a nested provider inherits the view", () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <SprintProvider>
          <Button>Save</Button>
        </SprintProvider>
      </SprintProvider>,
    );
    expect(screen.getAllByRole("button", { name: "Copy agent view" })).toHaveLength(1);
  });

  it("respects agentControls never", () => {
    render(
      <SprintProvider view="agent" agentControls="never" pageTools={false}>
        <Button>Save</Button>
      </SprintProvider>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("scoping", () => {
  it("distinguishes identical labels in sibling regions", () => {
    render(
      <SprintProvider pageTools={false}>
        <AgentRegion label="Billing">
          <Button>Save</Button>
        </AgentRegion>
        <AgentRegion label="Shipping">
          <Button>Save</Button>
        </AgentRegion>
      </SprintProvider>,
    );
    expect(mock.names().sort()).toEqual(["billing-press-save", "shipping-press-save"]);
  });

  it("nests region labels", () => {
    render(
      <SprintProvider label="App" pageTools={false}>
        <AgentRegion label="Vault">
          <Button>Purge</Button>
        </AgentRegion>
      </SprintProvider>,
    );
    expect(mock.names()).toEqual(["app-vault-press-purge"]);
  });
});

describe("list-page-regions", () => {
  it("lists each top-level region with a key", async () => {
    render(
      <SprintProvider>
        <Button tone="action">Prepare launch</Button>
      </SprintProvider>,
    );
    const result = await call("list-page-regions");
    expect(result).toContain("button-prepare-launch");
    expect(result).toContain("tone=action");
  });

  it("says so when the page has no components", async () => {
    render(
      <SprintProvider>
        <span />
      </SprintProvider>,
    );
    await expect(call("list-page-regions")).resolves.toContain("no Sprint components");
  });

  it("lists labelled landmarks nested inside a top-level root as regions", async () => {
    render(
      <SprintProvider>
        <Panel label="Frame">
          <Panel label="Props">
            <Button>Save</Button>
          </Panel>
          <Panel label="Tools">
            <Button>Purge</Button>
          </Panel>
        </Panel>
      </SprintProvider>,
    );
    const result = await call("list-page-regions");
    expect(result).toContain("panel-frame");
    expect(result).toContain("panel-props");
    expect(result).toContain("panel-tools");
  });

  it("suffixes identically-labelled nested regions", async () => {
    render(
      <SprintProvider>
        <Panel label="Frame">
          <Panel label="Details">
            <Button>One</Button>
          </Panel>
          <Panel label="Details">
            <Button agentName="Two">Two</Button>
          </Panel>
        </Panel>
      </SprintProvider>,
    );
    const result = await call("list-page-regions");
    expect(result).toContain("panel-details");
    expect(result).toContain("panel-details-2");
  });

  it("takes no parameters", () => {
    render(
      <SprintProvider>
        <span />
      </SprintProvider>,
    );
    expect(mock.find("list-page-regions")?.descriptor.inputSchema.properties).toEqual(
      {},
    );
  });
});

describe("read-region", () => {
  it("reads a region as Markdown", async () => {
    render(
      <SprintProvider>
        <Button>Prepare launch</Button>
      </SprintProvider>,
    );
    const result = await call("read-region", { region: "button-prepare-launch" });
    expect(result).toContain("**Button**");
    expect(result).toContain("press-prepare-launch");
    expect(result).toContain("page 1 of 1");
  });

  it("reads one nested landmark without the rest of the page", async () => {
    render(
      <SprintProvider>
        <Panel label="Frame">
          <Panel label="Props">
            <Button>Save</Button>
          </Panel>
          <Panel label="Tools">
            <Button>Purge</Button>
          </Panel>
        </Panel>
      </SprintProvider>,
    );
    const result = await call("read-region", { region: "panel-props" });
    expect(result).toContain("press-save");
    expect(result).not.toContain("press-purge");
  });

  it("names the valid regions when asked for an unknown one", async () => {
    render(
      <SprintProvider>
        <Button>Prepare launch</Button>
      </SprintProvider>,
    );
    const result = await call("read-region", { region: "nope" });
    expect(result).toContain('No region named "nope"');
    expect(result).toContain("button-prepare-launch");
  });

  it("does not use a static enum for the region parameter", () => {
    render(
      <SprintProvider>
        <Button>Save</Button>
      </SprintProvider>,
    );
    const schema = mock.find("read-region")?.descriptor.inputSchema;
    expect(schema?.properties.region?.type).toBe("string");
    expect(schema?.properties.region?.enum).toBeUndefined();
    expect(schema?.required).toEqual(["region"]);
  });

  it("rejects a missing region with a self-correcting message", async () => {
    render(
      <SprintProvider>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(call("read-region", {})).resolves.toContain("Missing required");
  });

  it("paginates a region larger than the output cap", async () => {
    render(
      <SprintProvider>
        <div data-sprint="Panel">
          {Array.from({ length: 120 }, (_, index) => (
            <Button key={index} agentName={`Slot ${index}`}>
              Slot {index}
            </Button>
          ))}
        </div>
      </SprintProvider>,
    );

    const firstPage = await call("read-region", { region: "panel" });
    expect(firstPage).toContain("page 1 of ");
    expect(firstPage?.length).toBeLessThanOrEqual(TOOL_OUTPUT_LIMIT);

    const secondPage = await call("read-region", { region: "panel", page: 2 });
    expect(secondPage).toContain("page 2 of ");
    expect(secondPage?.length).toBeLessThanOrEqual(TOOL_OUTPUT_LIMIT);
    expect(secondPage).not.toBe(firstPage);
  });

  it("reports a page number that does not exist", async () => {
    render(
      <SprintProvider>
        <Button>Save</Button>
      </SprintProvider>,
    );
    await expect(
      call("read-region", { region: "button-save", page: 99 }),
    ).resolves.toContain("does not exist");
  });
});
