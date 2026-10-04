import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { Kbd, keysOf } from "./Kbd.tsx";

describe("Kbd", () => {
  it("splits a combination into one cap per key", () => {
    render(<Kbd>Ctrl+Shift+Z</Kbd>);
    const root = document.querySelector(agentSelector("Kbd"));
    expect(root?.tagName).toBe("KBD");
    expect(
      [...(root?.querySelectorAll(":scope > kbd") ?? [])].map((key) => key.textContent),
    ).toEqual(["Ctrl", "Shift", "Z"]);
  });

  it("treats a plus sign as a key when it stands alone or comes last", () => {
    expect(keysOf("+")).toEqual(["+"]);
    expect(keysOf("Ctrl++")).toEqual(["Ctrl", "+"]);
  });

  it("renders the combination as one agent line", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Kbd>Ctrl+Z</Kbd>
      </SprintProvider>,
    );
    expect(container.textContent).toContain('- **Kbd** "Ctrl+Z"');
  });
});
