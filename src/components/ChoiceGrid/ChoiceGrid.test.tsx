import { act, fireEvent, render, screen } from "@testing-library/react";
import { type FormEvent, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { ChoiceGrid, type ChoiceGridProps } from "./ChoiceGrid.tsx";

const EMOJI = [
  { value: "fox", label: "Fox", glyph: "🦊" },
  { value: "rocket", label: "Rocket", glyph: "🚀" },
  { value: "cactus", label: "Cactus", glyph: "🌵" },
];

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function SelectHarness(props: Partial<ChoiceGridProps>) {
  const [value, setValue] = useState("fox");
  return (
    <ChoiceGrid
      label="Pick an emoji"
      options={EMOJI}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

function FormHarness(props: {
  onSubmitted: (entries: [string, string][]) => void;
  grid?: Partial<ChoiceGridProps>;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const native = event.nativeEvent as SubmitEvent;
    const submitter = native.submitter instanceof HTMLElement ? native.submitter : null;
    const data = new FormData(event.currentTarget, submitter);
    props.onSubmitted(
      Array.from(data.entries()).map(([key, entry]) => [key, String(entry)]),
    );
  };
  return (
    <form onSubmit={submit}>
      <ChoiceGrid
        label="Which emoji were you sent?"
        name="emoji"
        options={EMOJI}
        {...props.grid}
      />
    </form>
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("ChoiceGrid"));
  if (element === null) throw new Error("no ChoiceGrid root found");
  return element;
}

function choices(): HTMLElement[] {
  return Array.from(
    root().querySelectorAll<HTMLElement>('[data-sprint-part="choice"]'),
  );
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("ChoiceGrid rendering", () => {
  it("is a group named by its legend", () => {
    render(<FormHarness onSubmitted={() => {}} />);
    expect(screen.getByRole("group", { name: "Which emoji were you sent?" })).toBe(
      root(),
    );
    expect(root().querySelector("legend")).toHaveTextContent(
      "Which emoji were you sent?",
    );
  });

  it("names each tile by its label, never its glyph", () => {
    render(<FormHarness onSubmitted={() => {}} />);
    expect(screen.getByRole("button", { name: "Fox" })).toBeInTheDocument();
    expect(screen.getByText("🦊")).toHaveAttribute("aria-hidden", "true");
  });

  it("publishes its column count and defaults to three", () => {
    const { rerender } = render(<SelectHarness />);
    expect(root()).toHaveAttribute("data-sprint-columns", "3");
    rerender(<SelectHarness columns={4} />);
    expect(root()).toHaveAttribute("data-sprint-columns", "4");
    rerender(<SelectHarness columns={2} />);
    expect(root()).toHaveAttribute("data-sprint-columns", "2");
  });

  it("disables every tile", () => {
    render(<SelectHarness disabled />);
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
    for (const tile of choices()) expect(tile).toBeDisabled();
  });
});

describe("ChoiceGrid submit mode", () => {
  it("renders each tile as a submit button carrying the field name and its value", () => {
    render(<FormHarness onSubmitted={() => {}} />);
    expect(root()).toHaveAttribute("data-sprint-mode", "submit");
    const fox = screen.getByRole("button", { name: "Fox" });
    expect(fox).toHaveAttribute("type", "submit");
    expect(fox).toHaveAttribute("name", "emoji");
    expect(fox).toHaveAttribute("value", "fox");
  });

  it("submits the pressed tile's value with its form", () => {
    const submitted = vi.fn();
    render(<FormHarness onSubmitted={submitted} />);
    fireEvent.click(screen.getByRole("button", { name: "Rocket" }));
    expect(submitted).toHaveBeenCalledWith([["emoji", "rocket"]]);
  });

  it("keeps every tile in the tab order and moves focus without submitting", () => {
    const submitted = vi.fn();
    render(<FormHarness onSubmitted={submitted} />);
    for (const tile of choices()) expect(tile).not.toHaveAttribute("tabindex", "-1");

    const fox = screen.getByRole("button", { name: "Fox" });
    fox.focus();
    fireEvent.keyDown(fox, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Rocket" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: "End" });
    expect(screen.getByRole("button", { name: "Cactus" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowRight" });
    expect(fox).toHaveFocus();
    expect(submitted).not.toHaveBeenCalled();
  });
});

describe("ChoiceGrid select mode", () => {
  it("is a radio group that marks and reflects the selection", () => {
    render(<SelectHarness />);
    expect(screen.getByRole("radiogroup", { name: "Pick an emoji" })).toBe(root());
    expect(root()).toHaveAttribute("data-sprint-mode", "select");
    expect(root()).toHaveAttribute("data-sprint-value", "fox");
    expect(screen.getByRole("radio", { name: "Fox" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Rocket" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Fox" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("calls onChange on click", () => {
    render(<SelectHarness />);
    fireEvent.click(screen.getByRole("radio", { name: "Cactus" }));
    expect(root()).toHaveAttribute("data-sprint-value", "cactus");
  });

  it("keeps only the selected tile in the tab order and selects with the arrow keys", () => {
    render(<SelectHarness />);
    const fox = screen.getByRole("radio", { name: "Fox" });
    expect(fox).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Rocket" })).toHaveAttribute(
      "tabindex",
      "-1",
    );

    fox.focus();
    fireEvent.keyDown(fox, { key: "ArrowDown" });
    expect(root()).toHaveAttribute("data-sprint-value", "rocket");
    expect(screen.getByRole("radio", { name: "Rocket" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: "Home" });
    expect(root()).toHaveAttribute("data-sprint-value", "fox");
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowLeft" });
    expect(root()).toHaveAttribute("data-sprint-value", "cactus");
  });

  it("carries the selection in a hidden field when named", () => {
    const submitted = vi.fn();
    function Named() {
      const [value, setValue] = useState("fox");
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitted(Object.fromEntries(new FormData(event.currentTarget)));
          }}
        >
          <ChoiceGrid
            label="Pick an emoji"
            name="emoji"
            options={EMOJI}
            value={value}
            onChange={setValue}
          />
          <button type="submit">Send</button>
        </form>
      );
    }
    render(<Named />);
    fireEvent.click(screen.getByRole("radio", { name: "Cactus" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(submitted).toHaveBeenCalledWith({ emoji: "cactus" });
  });
});

describe("ChoiceGrid agent tool", () => {
  it("registers one choose tool named from its label, enumerating the labels", () => {
    render(<SelectHarness />);
    expect(mock.names()).toEqual(["choose-pick-an-emoji"]);
    const descriptor = mock.find("choose-pick-an-emoji")?.descriptor;
    expect(descriptor?.inputSchema.properties.option?.enum).toEqual([
      "Fox",
      "Rocket",
      "Cactus",
    ]);
  });

  it("takes its name from agentName", () => {
    render(<SelectHarness agentName="Emoji" />);
    expect(mock.names()).toEqual(["choose-emoji"]);
  });

  it("selects by visible label and reports the new state", async () => {
    render(<SelectHarness />);
    const result = await call("choose-pick-an-emoji", { option: "Rocket" });
    expect(root()).toHaveAttribute("data-sprint-value", "rocket");
    expect(result).toContain('Chose "Rocket".');
    expect(result).toContain("value=rocket");
  });

  it("submits the form through the real button in submit mode", async () => {
    const submitted = vi.fn();
    render(<FormHarness onSubmitted={submitted} />);
    const result = await call("choose-which-emoji-were-you-sent", { option: "Cactus" });
    expect(submitted).toHaveBeenCalledWith([["emoji", "cactus"]]);
    expect(result).toContain('Chose "Cactus" and submitted the form.');
  });

  it("says so when there is no form to submit", async () => {
    render(<ChoiceGrid label="Orphan" name="orphan" options={EMOJI} />);
    const result = await call("choose-orphan", { option: "Fox" });
    expect(result).toBe(
      'No form surrounds this grid, so choosing "Fox" had nothing to submit.',
    );
  });

  it("rejects a label it does not offer", async () => {
    render(<SelectHarness />);
    const result = await call("choose-pick-an-emoji", { option: "Robot" });
    expect(result).toBe('Parameter "option" must be one of: Fox, Rocket, Cactus.');
    expect(root()).toHaveAttribute("data-sprint-value", "fox");
  });

  it("unregisters while disabled and returns when enabled", () => {
    const { rerender } = render(<SelectHarness disabled />);
    expect(mock.names()).toEqual([]);
    rerender(<SelectHarness />);
    expect(mock.names()).toEqual(["choose-pick-an-emoji"]);
  });

  it("registers nothing for a challenge meant for a human", () => {
    render(<FormHarness onSubmitted={() => {}} grid={{ agentTool: false }} />);
    expect(mock.names()).toEqual([]);
  });

  it("unregisters on unmount", () => {
    const { unmount } = render(<SelectHarness />);
    unmount();
    expect(mock.names()).toEqual([]);
  });
});

describe("ChoiceGrid agent view", () => {
  it("renders one control per tile, each carrying its own line", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <SelectHarness columns={4} />
      </SprintProvider>,
    );

    expect(container.querySelectorAll('[data-sprint-part="choice"]')).toHaveLength(3);
    expect(container.textContent).toContain(
      '- **ChoiceGrid** "Pick an emoji" [columns=4, mode=select, value=fox] → tool `choose-pick-an-emoji`',
    );
    expect(container.textContent).toContain(
      '- part `choice` "Fox" [checked, value=fox]',
    );
    expect(container.textContent).toContain('- part `choice` "Rocket" [value=rocket]');
  });

  it("selects when one of those controls is clicked", () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <SelectHarness />
      </SprintProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /"Rocket"/ }));
    expect(
      screen.getByRole("button", { name: /"Rocket" \[checked, value=rocket\]/ }),
    ).toBeInTheDocument();
  });

  it("submits the same field a person's press would in submit mode", () => {
    const submitted = vi.fn();
    render(
      <SprintProvider view="agent" pageTools={false}>
        <FormHarness onSubmitted={submitted} />
      </SprintProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /"Cactus"/ }));
    expect(submitted).toHaveBeenCalledWith([["emoji", "cactus"]]);
  });

  it("submits through the tool in agent view too", async () => {
    const submitted = vi.fn();
    render(
      <SprintProvider view="agent" pageTools={false}>
        <FormHarness onSubmitted={submitted} />
      </SprintProvider>,
    );

    const result = await call("choose-which-emoji-were-you-sent", { option: "Fox" });
    expect(submitted).toHaveBeenCalledWith([["emoji", "fox"]]);
    expect(result).toContain("submitted the form");
  });

  it("renders text only when nothing can be chosen", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <SelectHarness disabled />
      </SprintProvider>,
    );

    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain(
      "[columns=3, disabled, mode=select, value=fox]",
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<SelectHarness />);

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Pick an emoji");
    expect(node?.tool).toBe("choose-pick-an-emoji");
    expect(node?.state).toEqual({ mode: "select", value: "fox", columns: "3" });
    expect(node?.parts).toEqual([
      { part: "choice", label: "Fox", state: { value: "fox", checked: true } },
      { part: "choice", label: "Rocket", state: { value: "rocket" } },
      { part: "choice", label: "Cactus", state: { value: "cactus" } },
    ]);
  });

  it("projects submit mode the same way it renders it", () => {
    const { container } = render(<FormHarness onSubmitted={() => {}} />);

    const [node] = serializeWithin(container);
    expect(node?.state).toEqual({ mode: "submit", columns: "3" });
    expect(node?.parts.map((part) => [part.label, part.state])).toEqual([
      ["Fox", { value: "fox" }],
      ["Rocket", { value: "rocket" }],
      ["Cactus", { value: "cactus" }],
    ]);
  });
});
