import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { SecretField } from "./SecretField.tsx";

const SECRET = "sk_live_9f2ab41c";

afterEach(() => {
  vi.restoreAllMocks();
});

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("SecretField"));
  if (element === null) throw new Error("no SecretField root found");
  return element;
}

function valueElement(): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    agentSelector("SecretField", "value"),
  );
  if (element === null) throw new Error("no value part found");
  return element;
}

describe("SecretField rendering", () => {
  it("masks the value with a fixed-length mask", () => {
    render(<SecretField label="API key" value={SECRET} />);
    expect(root()).toHaveAttribute("data-sprint-filled", "");
    expect(root()).not.toHaveAttribute("data-sprint-revealed");
    expect(valueElement().textContent).not.toContain(SECRET);
    expect(valueElement().textContent).toBe("••••••••••••");
  });

  it("reveals and hides through the toggle", () => {
    render(<SecretField label="API key" value={SECRET} />);
    const toggle = screen.getByRole("button", { name: "Reveal" });
    fireEvent.click(toggle);
    expect(root()).toHaveAttribute("data-sprint-revealed", "");
    expect(valueElement().textContent).toBe(SECRET);
    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(valueElement().textContent).not.toContain(SECRET);
  });

  it("starts revealed when asked", () => {
    render(<SecretField label="Recovery code" value={SECRET} defaultRevealed />);
    expect(valueElement().textContent).toBe(SECRET);
    expect(screen.getByRole("button", { name: "Hide" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("copies the value without revealing it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<SecretField label="API key" value={SECRET} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith(SECRET);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copied" })).toHaveAttribute(
        "data-sprint-copied",
        "",
      );
    });
    expect(valueElement().textContent).not.toContain(SECRET);
  });

  it("shows its hint", () => {
    render(<SecretField label="API key" value={SECRET} hint="Not shown again." />);
    expect(
      document.querySelector(agentSelector("SecretField", "hint")),
    ).toHaveTextContent("Not shown again.");
  });
});

describe("SecretField agent view", () => {
  it("renders text that never contains the value", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <SecretField label="API key" value={SECRET} hint="Not shown again." />
      </SprintProvider>,
    );
    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain('**SecretField** "API key"');
    expect(container.textContent).toContain("[filled]");
    expect(container.textContent).not.toContain(SECRET);
  });

  it("keeps the value out even while revealed", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <SecretField label="API key" value={SECRET} defaultRevealed />
      </SprintProvider>,
    );
    expect(container.textContent).toContain("revealed");
    expect(container.textContent).not.toContain(SECRET);
  });

  it("keeps the value out of agent attributes in human view", () => {
    render(<SecretField label="API key" value={SECRET} />);
    for (const attribute of Array.from(root().attributes)) {
      expect(attribute.value).not.toContain(SECRET);
    }
  });
});
