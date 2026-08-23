import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { CodeBlock } from "./CodeBlock.tsx";

const SNIPPET = 'import { Button } from "sprint";\nexport const go = true;';

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

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("CodeBlock"));
  if (element === null) throw new Error("no CodeBlock root found");
  return element;
}

describe("CodeBlock rendering", () => {
  it("names itself from its caption and counts its lines", () => {
    render(<CodeBlock caption="install" code={SNIPPET} />);
    expect(root()).toHaveAttribute("aria-label", "install");
    expect(root()).toHaveAttribute("data-sprint-lines", "2");
    expect(root()).toHaveAttribute("data-sprint-language", "tsx");
  });

  it("falls back to the language when there is no caption", () => {
    render(<CodeBlock language="bash" code="bun run manifest" />);
    expect(root()).toHaveAttribute("aria-label", "bash");
  });

  it("renders the snippet verbatim", () => {
    render(<CodeBlock code={SNIPPET} />);
    const code = root().querySelector('[data-sprint-part="code"]');
    expect(code?.textContent).toBe(SNIPPET);
  });

  it("registers no WebMCP tool, because copying is a human affordance", () => {
    render(<CodeBlock caption="install" code={SNIPPET} />);
    expect(root()).not.toHaveAttribute("data-sprint-tool");
  });

  it("copies the exact string and reports back", async () => {
    vi.useFakeTimers();
    render(<CodeBlock code={SNIPPET} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(written).toEqual([SNIPPET]);
    expect(root()).toHaveAttribute("data-sprint-copied", "");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root()).not.toHaveAttribute("data-sprint-copied");
  });

  it("forwards ref and spreads the rest onto the root", () => {
    const ref = createRef<HTMLElement>();
    render(<CodeBlock ref={ref} code={SNIPPET} id="snippet" data-testid="spread" />);
    expect(ref.current).toBe(root());
    expect(root()).toHaveAttribute("id", "snippet");
    expect(screen.getByTestId("spread")).toBe(root());
  });
});

describe("CodeBlock agent view", () => {
  it("carries the snippet verbatim and renders no element", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <CodeBlock caption="install" language="bash" code="bun run manifest" />
      </SprintProvider>,
    );

    expect(container.querySelector(agentSelector("CodeBlock"))).toBeNull();
    expect(container.textContent).toBe(
      [
        '- **CodeBlock** "install" [language=bash, lines=1]',
        '  - part `copy` "Copy"',
        '  - part `code` "bun run manifest"',
        "",
      ].join("\n"),
    );
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(
      <CodeBlock caption="install" language="bash" code="bun run manifest" />,
    );

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("install");
    expect(node?.state).toMatchObject({ language: "bash", lines: "1" });
    expect(node?.parts.map((part) => [part.part, part.label])).toEqual([
      ["copy", "Copy"],
      ["code", "bun run manifest"],
    ]);
  });
});
