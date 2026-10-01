import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { searchFieldMeta } from "./meta.ts";
import { SearchField, type SearchFieldProps } from "./SearchField.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<SearchFieldProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return <SearchField label="Users" onChange={setValue} {...props} value={value} />;
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("SearchField"));
  if (element === null) throw new Error("no SearchField root found");
  return element;
}

function field(): HTMLInputElement {
  return screen.getByRole("searchbox", { name: "Users" }) as HTMLInputElement;
}

function clearButton(): HTMLElement | null {
  return document.querySelector<HTMLElement>(agentSelector("SearchField", "clear"));
}

function chip(): HTMLElement | null {
  return document.querySelector<HTMLElement>(agentSelector("SearchField", "shortcut"));
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("SearchField rendering", () => {
  it("is a labelled search landmark holding a search input", () => {
    render(<Harness />);
    const landmark = screen.getByRole("search", { name: "Users" });
    expect(landmark).toBe(root());
    expect(field()).toHaveAttribute("type", "search");
    expect(field()).toHaveAttribute("data-sprint-part", "input");
  });

  it("keeps a hidden label for assistive technology", () => {
    render(<Harness hideLabel placeholder="Name or email" />);
    const label = document.querySelector(agentSelector("SearchField", "label"));
    expect(label).toHaveAttribute("data-sprint-visually-hidden", "");
    expect(field()).toHaveAccessibleName("Users");
    expect(field()).toHaveAttribute("placeholder", "Name or email");
  });

  it("reflects the query as it is typed", () => {
    render(<Harness />);
    expect(root()).toHaveAttribute("data-sprint-empty", "");
    expect(root()).not.toHaveAttribute("data-sprint-value");
    fireEvent.change(field(), { target: { value: "ada" } });
    expect(field()).toHaveValue("ada");
    expect(root()).not.toHaveAttribute("data-sprint-empty");
    expect(root()).toHaveAttribute("data-sprint-value", "ada");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLFormElement>();
    render(<Harness ref={ref} data-testid="spread" />);
    expect(ref.current).toBe(root());
    expect(screen.getByTestId("spread")).toBe(root());
  });

  it("disables the input and drops the clear control", () => {
    render(<Harness value="ada" disabled />);
    expect(field()).toBeDisabled();
    expect(root()).toHaveAttribute("data-sprint-disabled", "");
    expect(clearButton()).toBeNull();
  });
});

describe("SearchField clearing", () => {
  it("shows the clear control only while there is a query", () => {
    render(<Harness />);
    expect(clearButton()).toBeNull();
    fireEvent.change(field(), { target: { value: "ada" } });
    expect(clearButton()).toHaveAccessibleName("Clear Users search");
  });

  it("clears and refocuses the field", () => {
    const onChange = vi.fn();
    function Spy() {
      const [value, setValue] = useState("ada");
      return (
        <SearchField
          label="Users"
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Spy />);
    const button = clearButton();
    if (button === null) throw new Error("no clear control");
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith("");
    expect(field()).toHaveValue("");
    expect(field()).toHaveFocus();
    expect(clearButton()).toBeNull();
  });

  it("clears on Escape without letting the key escape", () => {
    const outer = vi.fn();
    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: a listener that records propagation
      <div onKeyDown={outer}>
        <Harness value="ada" />
      </div>,
    );
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(field()).toHaveValue("");
    expect(outer).not.toHaveBeenCalled();
  });

  it("lets Escape through on an empty field", () => {
    const outer = vi.fn();
    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: a listener that records propagation
      <div onKeyDown={outer}>
        <Harness />
      </div>,
    );
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
  });
});

describe("SearchField submitting", () => {
  it("calls onSubmit with the query on Enter", () => {
    const onSubmit = vi.fn();
    render(<Harness value="ada" onSubmit={onSubmit} />);
    fireEvent.submit(root());
    expect(onSubmit).toHaveBeenCalledWith("ada");
  });

  it("never navigates, even without onSubmit", () => {
    render(<Harness value="ada" />);
    const event = new Event("submit", { bubbles: true, cancelable: true });
    root().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe("SearchField shortcut", () => {
  it("focuses the field from anywhere on the page", () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        <Harness shortcut="/" />
      </>,
    );
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.focus();
    const event = new KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
      cancelable: true,
    });
    elsewhere.dispatchEvent(event);
    expect(field()).toHaveFocus();
    expect(event.defaultPrevented).toBe(true);
  });

  it("publishes the shortcut on the root, the input, and a chip", () => {
    render(<Harness shortcut="/" />);
    expect(root()).toHaveAttribute("data-sprint-shortcut", "/");
    expect(field()).toHaveAttribute("aria-keyshortcuts", "/");
    expect(chip()).toHaveTextContent("/");
    expect(chip()).toHaveAttribute("aria-hidden", "true");
  });

  it("hides the chip once there is a query", () => {
    render(<Harness shortcut="/" />);
    fireEvent.change(field(), { target: { value: "ada" } });
    expect(chip()).toBeNull();
  });

  it("does nothing when no shortcut is set", () => {
    render(<Harness />);
    fireEvent.keyDown(document.body, { key: "/" });
    expect(field()).not.toHaveFocus();
    expect(root()).not.toHaveAttribute("data-sprint-shortcut");
    expect(chip()).toBeNull();
  });

  it.each([
    ["an input", <input key="i" aria-label="Other" />],
    ["a textarea", <textarea key="t" aria-label="Other" />],
    ["a select", <select key="s" aria-label="Other" />],
    [
      "a contenteditable region",
      // biome-ignore lint/a11y/useSemanticElements: a rich-text editor stand-in
      <div key="c" role="textbox" tabIndex={0} aria-label="Other" contentEditable />,
    ],
  ])("does not steal the key from %s", (_name, other) => {
    render(
      <>
        {other}
        <Harness shortcut="/" />
      </>,
    );
    const target = screen.getByLabelText("Other");
    target.focus();
    const event = new KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    expect(field()).not.toHaveFocus();
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores the key with a modifier held", () => {
    render(<Harness shortcut="/" />);
    fireEvent.keyDown(document.body, { key: "/", ctrlKey: true });
    fireEvent.keyDown(document.body, { key: "/", metaKey: true });
    expect(field()).not.toHaveFocus();
  });

  it("is ignored while disabled", () => {
    render(<Harness shortcut="/" disabled />);
    fireEvent.keyDown(document.body, { key: "/" });
    expect(field()).not.toHaveFocus();
    expect(root()).not.toHaveAttribute("data-sprint-shortcut");
  });

  it("removes its listener on unmount", () => {
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Harness shortcut="/" />);
    unmount();
    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function));
    const event = new KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("SearchField agent tool", () => {
  it("registers one search tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["search-users"]);
    expect(root()).toHaveAttribute("data-sprint-tool", "search-users");
  });

  it("sets the query through the real input and reports the state", async () => {
    render(<Harness />);
    const result = await call("search-users", { query: "ada" });
    expect(field()).toHaveValue("ada");
    expect(result).toContain("Filtered");
    expect(result).toContain("value=ada");
  });

  it("submits the query when onSubmit is set", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const result = await call("search-users", { query: "ada" });
    expect(onSubmit).toHaveBeenCalledWith("ada");
    expect(result).toContain("Searched");
  });

  it("clears with an empty query", async () => {
    render(<Harness value="ada" />);
    await call("search-users", { query: "" });
    expect(field()).toHaveValue("");
    expect(root()).toHaveAttribute("data-sprint-empty", "");
  });

  it("rejects a non-string query with a correctable message", async () => {
    render(<Harness />);
    const result = await call("search-users", { query: 7 });
    expect(result).toContain("string");
    expect(field()).toHaveValue("");
  });

  it("does not re-register while a person types", () => {
    render(<Harness />);
    const before = mock.history.length;
    for (const value of ["a", "ad", "ada"]) {
      fireEvent.change(field(), { target: { value } });
    }
    expect(mock.history.length).toBe(before);
  });

  it("honours agentName, and unregisters when disabled or opted out", () => {
    const { rerender, unmount } = render(<Harness key="a" agentName="Crew" />);
    expect(mock.names()).toEqual(["search-crew"]);
    rerender(<Harness key="a" agentName="Crew" disabled />);
    expect(mock.names()).toEqual([]);
    unmount();

    render(<Harness key="b" agentTool={false} />);
    expect(mock.names()).toEqual([]);
  });

  it("unregisters on unmount", () => {
    const { unmount } = render(<Harness />);
    unmount();
    expect(mock.names()).toEqual([]);
  });
});

describe("SearchField agent view", () => {
  it("renders its line and a live input", () => {
    render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Harness shortcut="/" />
      </SprintProvider>,
    );
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain('**SearchField** "Users"');
    expect(surface?.textContent).toContain("shortcut=/");
    expect(surface?.textContent).toContain("`search-users`");
    expect(document.querySelector('[data-sprint-view="agent"] form')).toBeNull();

    const control = screen.getByLabelText("Users");
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("data-sprint-tool", "search-users");
  });

  it("produces the line its metadata documents", () => {
    render(
      <SprintProvider defaultView="agent" agentControls="never" pageTools={false}>
        <Harness shortcut="/" />
      </SprintProvider>,
    );
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent?.trim()).toBe(searchFieldMeta.agentView?.example);
  });

  it("writes through the live control", () => {
    render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    fireEvent.change(screen.getByLabelText("Users"), { target: { value: "ada" } });
    const surface = document.querySelector('[data-sprint-view="agent"]');
    expect(surface?.textContent).toContain("value=ada");
  });

  it("renders text only when disabled or when controls are off", () => {
    const { unmount } = render(
      <SprintProvider defaultView="agent" pageTools={false}>
        <Harness disabled />
      </SprintProvider>,
    );
    expect(screen.queryByLabelText("Users")).not.toBeInTheDocument();
    unmount();

    render(
      <SprintProvider defaultView="agent" agentControls="never" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    expect(screen.queryByLabelText("Users")).not.toBeInTheDocument();
  });

  it("still searches through the tool when no element renders", async () => {
    render(
      <SprintProvider defaultView="agent" agentControls="never" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );
    const result = await call("search-users", { query: "ada" });
    expect(result).toContain("value=ada");
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Harness value="ada" shortcut="/" />);
    const [node] = serializeWithin(container);
    expect(node?.component).toBe("SearchField");
    expect(node?.label).toBe("Users");
    expect(node?.tool).toBe("search-users");
    expect(node?.state).toEqual({ value: "ada", shortcut: "/" });
    expect(node?.parts.map((part) => part.part)).toEqual([
      "label",
      "control",
      "input",
      "clear",
    ]);
  });
});
